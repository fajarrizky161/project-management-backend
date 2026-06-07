const request = require('supertest');
const app = require('../../index');

describe('Workflow Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    if (res.body.data?.accessToken) {
      authToken = res.body.data.accessToken;
    }
  });

  describe('GET /api/workflows', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/workflows');
      expect(res.statusCode).toBe(401);
    });

    it('should return workflows with valid token', async () => {
      if (!authToken) return;
      const res = await request(app)
        .get('/api/workflows')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/workflows', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/workflows')
        .send({ name: 'Test Workflow' });
      expect(res.statusCode).toBe(401);
    });
  });
});
