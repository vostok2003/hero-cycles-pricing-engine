/**
 * Tests: Authentication
 * Covers login success, login failure, and token validation.
 */

require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { connectTestDB, clearTestDB, closeTestDB } = require('./helpers/testDb');
const { adminUser, salespersonUser } = require('./helpers/testData');

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  // Pre-register users so login tests have someone to authenticate
  await request(app).post('/api/auth/register').send(adminUser);
  await request(app).post('/api/auth/register').send(salespersonUser);
});

afterAll(async () => {
  await closeTestDB();
});

// ─── Registration ───────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'new@test.com',
      password: 'password123',
      role: 'salesperson',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.email).toBe('new@test.com');
  });

  it('should reject registration with a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(adminUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('should login with correct credentials and return JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.role).toBe('admin');
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fail login with non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fail login with missing password field', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: adminUser.email,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Protected route ─────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('should return the current user when token is valid', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: salespersonUser.email, password: salespersonUser.password });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(salespersonUser.email);
  });

  it('should reject requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should reject requests with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.statusCode).toBe(401);
  });
});
