import { firstValueFrom, take, toArray } from 'rxjs';
import * as request from 'supertest';
import { DeviceFlowController } from '../../src/auth/device-flow/device-flow.controller';
import { DeviceFlowService } from '../../src/auth/device-flow/device-flow.service';
import { DeviceFlowRole } from '../../src/auth/device-flow/dto/device-flow-role.enum';
import { createTestApp } from '../utils/bootstrap';

describe('DeviceFlowController (writes)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;
  let deviceFlowService: DeviceFlowService;
  let deviceFlowController: DeviceFlowController;

  beforeAll(async () => {
    bootstrap = await createTestApp();
    deviceFlowService = bootstrap.module.get(DeviceFlowService);
    deviceFlowController = bootstrap.module.get(DeviceFlowController);
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('SSE auth/device-flow/messages', () => {
    it('streams message from the requester to the approver', async () => {
      // Given
      const { token, user } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const approverStream$ = addApproverDevice(user.id);

      const approvalRequest = { type: 'auth-request', from: 'requester-device-id' };

      const approvalRequestPromise = firstValueFrom(approverStream$);

      // When
      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/send-message')
        .query({ role: 'requester' })
        .send({ deviceId: 'approver-device-id', message: approvalRequest })
        .set('authorization', `Bearer ${token}`);

      // Then
      const receivedRequest = await approvalRequestPromise;
      expect(receivedRequest.data).toEqual(approvalRequest);
    });

    it('streams initial approvers devices list to the requester', async () => {
      // Given
      const { user } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      addApproverDevice(user.id);

      const requesterStream$ = deviceFlowController.streamMessages(
        user.id,
        'requester-device-id',
        DeviceFlowRole.Requester,
        'Requester Device',
      );

      const devicesListPromise = firstValueFrom(requesterStream$);

      // When
      const receivedData = await devicesListPromise;

      // Then
      expect(receivedData.data.type).toEqual('approvers-list');
      expect(receivedData.data.approvers).toHaveLength(1);
      expect(receivedData.data.approvers[0].deviceId).toEqual('approver-device-id');
      expect(receivedData.data.approvers[0].deviceName).toEqual('Approver Device');
    });

    it('streams approver device added to the requester', async () => {
      // Given
      const { user } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const requesterStream$ = deviceFlowController.streamMessages(
        user.id,
        'requester-device-id',
        DeviceFlowRole.Requester,
        'Requester Device',
      );

      const devicesListPromise = firstValueFrom(requesterStream$.pipe(take(2), toArray()));

      // When
      addApproverDevice(user.id);

      // Then
      const receivedData = await devicesListPromise;
      expect(receivedData[0].data).toEqual({ type: 'approvers-list', approvers: [] });
      expect(receivedData[1].data).toEqual({
        type: 'approvers-list',
        approvers: [
          {
            deviceId: 'approver-device-id',
            deviceName: 'Approver Device',
            lastActivityDate: expect.any(Date),
          },
        ],
      });
    });

    it('streams device removed from the requester', async () => {
      // Given
      const { user } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      addApproverDevice(user.id);

      const requesterStream$ = deviceFlowController.streamMessages(
        user.id,
        'requester-device-id',
        DeviceFlowRole.Requester,
        'Requester Device',
      );

      const devicesListPromise = firstValueFrom(requesterStream$.pipe(take(2), toArray()));

      // When
      deviceFlowService.disconnectApprover(user.id, 'approver-device-id');

      // Then
      const receivedData = await devicesListPromise;
      expect(receivedData[0].data.approvers).toHaveLength(1);
      expect(receivedData[1].data.approvers).toHaveLength(0);
    });

    it('streams message from the approver to the requester', async () => {
      // Given
      const { token, user } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      addApproverDevice(user.id);

      const requesterStream$ = deviceFlowController.streamMessages(
        user.id,
        'requester-device-id',
        DeviceFlowRole.Requester,
        'Requester Device',
      );

      const approvalMessage = { type: 'auth-approved' };
      const approvalPromise = firstValueFrom(requesterStream$.pipe(take(2), toArray()));

      // When
      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/send-message')
        .query({ role: 'approver' })
        .send({ deviceId: 'requester-device-id', message: approvalMessage })
        .set('authorization', `Bearer ${token}`);

      // Then
      const allValues = await approvalPromise;
      expect(allValues).toHaveLength(2);
      expect(allValues[0].data.type).toEqual('approvers-list');
      expect(allValues[1].data).toEqual(approvalMessage);
    });

    it('returns 401 when not logged in', async () => {
      // When
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/auth/device-flow/messages',
      );

      // Then
      expect(response.status).toBe(401);
    });
  });

  describe('POST auth/device-flow/send-message', () => {
    it('returns 401 when not logged in', async () => {
      // When
      const response = await request(bootstrap.app.getHttpServer()).post(
        '/auth/device-flow/send-message',
      );

      // Then
      expect(response.status).toBe(401);
    });
  });

  function addApproverDevice(userId: string) {
    return deviceFlowController.streamMessages(
      userId,
      'approver-device-id',
      DeviceFlowRole.Approver,
      'Approver Device',
    );
  }
});
