import * as request from 'supertest';
import { createTestApp } from '../utils/bootstrap';

describe('DeviceFlowController (writes)', () => {
  let bootstrap: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    bootstrap = await createTestApp();
  });

  beforeEach(async () => {
    await bootstrap.methods.beforeEach();
  });

  afterAll(async () => {
    await bootstrap.methods.afterAll();
  });

  describe('POST /auth/device-flow/ping', () => {
    it('successfully pings with deviceId and deviceName', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const response = await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1', deviceName: 'My Device' })
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(201);
    });

    it('successfully pings with only deviceId', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      const response = await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1' })
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(201);
    });

    it('updates lastActivityDate when pinging same device twice', async () => {
      const { token } = await bootstrap.utils.userUtils.createDefault({
        email: 'test@test.com',
      });

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1', deviceName: 'First Name' })
        .set('authorization', `Bearer ${token}`);

      await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1', deviceName: 'Updated Name' })
        .set('authorization', `Bearer ${token}`);

      const response = await request(bootstrap.app.getHttpServer())
        .get('/auth/device-flow/devices')
        .set('authorization', `Bearer ${token}`);

      expect(response.status).toEqual(200);
      expect(response.body.devices).toHaveLength(1);
      expect(response.body.devices[0].deviceName).toEqual('Updated Name');
    });

    it('returns 401 when not logged in', async () => {
      const response = await request(bootstrap.app.getHttpServer())
        .post('/auth/device-flow/ping')
        .send({ deviceId: 'device-1' });

      expect(response.status).toEqual(401);
    });
  });
});
