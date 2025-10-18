import * as request from 'supertest';
import { createTestApp } from '../utils/bootstrap';
import { advanceTo, clear } from 'jest-date-mock';
import { DeviceFlowService } from '../../src/auth/device-flow/device-flow.service';

describe('DeviceFlowController (reads)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;
  let deviceFlowService: DeviceFlowService;

  beforeAll(async () => {
    bootstrap = await createTestApp();
    deviceFlowService = bootstrap.module.get(DeviceFlowService);
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('GET /auth/device-flow/devices', () => {
    it('returns empty array when no devices are connected', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/device-flow/devices')
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ devices: [] });
    });

    it('returns devices after ping', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1', deviceName: 'My Device' })
        .set('authorization', `Bearer ${token}`);

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-2' })
        .set('authorization', `Bearer ${token}`);

      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/device-flow/devices')
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.devices).toHaveLength(2);
      expect(response.body.devices).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ deviceId: 'device-1', deviceName: 'My Device' }),
          expect.objectContaining({ deviceId: 'device-2' }),
        ]),
      );
    });

    it('returns only devices for current user', async () => {
      const { token: token1 } = await bootstrap.utils.userUtils.createDefault({
        email: 'test1@test.com',
      });
      const { token: token2 } = await bootstrap.utils.userUtils.createDefault({
        email: 'test2@test.com',
      });

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1' })
        .set('authorization', `Bearer ${token1}`);

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-2' })
        .set('authorization', `Bearer ${token2}`);

      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/device-flow/devices')
        .set('authorization', `Bearer ${token1}`);

      expect(response.status).toEqual(200);
      expect(response.body.devices).toHaveLength(1);
      expect(response.body.devices[0].deviceId).toEqual('device-1');
    });

    it('returns 401 when not logged in', async () => {
      const response = await request(bootstrap.app.getHttpServer()).get(
        '/auth/device-flow/devices',
      );

      expect(response.status).toEqual(401);
    });
  });

  describe('Stale device removal', () => {
    it('removes devices that did not ping in last 10 seconds', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      advanceTo(new Date('2024-01-01T00:00:00.000Z'));

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1' })
        .set('authorization', `Bearer ${token}`);

      advanceTo(new Date('2024-01-01T00:00:05.000Z'));

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-2' })
        .set('authorization', `Bearer ${token}`);

      advanceTo(new Date('2024-01-01T00:00:11.000Z'));

      deviceFlowService.removeStaleDevices();

      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/device-flow/devices')
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.devices).toHaveLength(1);
      expect(response.body.devices[0].deviceId).toEqual('device-2');

      clear();
    });

    it('removes all devices if none pinged in last 10 seconds', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      advanceTo(new Date('2024-01-01T00:00:00.000Z'));

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1' })
        .set('authorization', `Bearer ${token}`);

      advanceTo(new Date('2024-01-01T00:00:15.000Z'));

      deviceFlowService.removeStaleDevices();

      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/device-flow/devices')
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.devices).toHaveLength(0);

      clear();
    });

    it('keeps devices that recently pinged', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      advanceTo(new Date('2024-01-01T00:00:00.000Z'));

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1' })
        .set('authorization', `Bearer ${token}`);

      advanceTo(new Date('2024-01-01T00:00:09.000Z'));

      deviceFlowService.removeStaleDevices();

      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/device-flow/devices')
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.devices).toHaveLength(1);
      expect(response.body.devices[0].deviceId).toEqual('device-1');

      clear();
    });
  });
});
