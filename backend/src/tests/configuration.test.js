/**
 * Tests: Configuration CRUD + ownership + mandatory category validation
 */

require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const Component = require('../models/Component');
const { connectTestDB, clearTestDB, closeTestDB } = require('./helpers/testDb');
const {
  salespersonUser,
  anotherSalespersonUser,
  adminUser,
  sampleComponents,
} = require('./helpers/testData');

let salesToken;
let otherSalesToken;
let adminToken;
let componentIds = {};   // { Frame, Tyre, 'Gear Set', Seat, Brake }

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Register users
  const [salesRes, otherRes, adminRes] = await Promise.all([
    request(app).post('/api/auth/register').send(salespersonUser),
    request(app).post('/api/auth/register').send(anotherSalespersonUser),
    request(app).post('/api/auth/register').send(adminUser),
  ]);

  salesToken = salesRes.body.data.token;
  otherSalesToken = otherRes.body.data.token;
  adminToken = adminRes.body.data.token;

  // Seed components directly (bypasses role restriction in test context)
  const docs = await Component.insertMany(sampleComponents);
  docs.forEach((d) => { componentIds[d.category] = d._id.toString(); });
});

afterAll(async () => {
  await closeTestDB();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildValidComponents = () => [
  { componentId: componentIds['Frame'],    quantity: 1 },
  { componentId: componentIds['Tyre'],     quantity: 2 },
  { componentId: componentIds['Gear Set'], quantity: 1 },
];

const createConfig = (token, overrides = {}) =>
  request(app)
    .post('/api/configurations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      configurationName: 'Mountain Bike',
      description: 'Test build',
      components: buildValidComponents(),
      ...overrides,
    });

// ─── Creation ────────────────────────────────────────────────────────────────

describe('POST /api/configurations', () => {
  it('should create a configuration with all mandatory categories', async () => {
    const res = await createConfig(salesToken);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.configurationName).toBe('Mountain Bike');
    expect(res.body.data.components).toHaveLength(3);
  });

  it('should reject creation when a mandatory category (Frame) is missing', async () => {
    const res = await request(app)
      .post('/api/configurations')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        configurationName: 'Bad Build',
        components: [
          { componentId: componentIds['Tyre'],     quantity: 1 },
          { componentId: componentIds['Gear Set'], quantity: 1 },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Frame/);
  });

  it('should reject creation when ALL mandatory categories are missing', async () => {
    const res = await request(app)
      .post('/api/configurations')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        configurationName: 'Empty Build',
        components: [{ componentId: componentIds['Seat'], quantity: 1 }],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/mandatory/i);
  });

  it('should reject creation without authentication', async () => {
    const res = await request(app)
      .post('/api/configurations')
      .send({ configurationName: 'Ghost Build', components: buildValidComponents() });

    expect(res.statusCode).toBe(401);
  });
});

// ─── Update ──────────────────────────────────────────────────────────────────

describe('PUT /api/configurations/:id', () => {
  it('should allow owner salesperson to update their own configuration', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .put(`/api/configurations/${configId}`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        configurationName: 'Updated Mountain Bike',
        components: buildValidComponents(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.configurationName).toBe('Updated Mountain Bike');
  });

  it('should return 403 when a salesperson edits another salesperson\'s configuration', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .put(`/api/configurations/${configId}`)
      .set('Authorization', `Bearer ${otherSalesToken}`)
      .send({
        configurationName: 'Hijacked Build',
        components: buildValidComponents(),
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to update any configuration', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .put(`/api/configurations/${configId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        configurationName: 'Admin Updated Build',
        components: buildValidComponents(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.configurationName).toBe('Admin Updated Build');
  });

  it('should reject update that removes a mandatory category', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .put(`/api/configurations/${configId}`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        configurationName: 'No Tyre Build',
        components: [
          { componentId: componentIds['Frame'],    quantity: 1 },
          { componentId: componentIds['Gear Set'], quantity: 1 },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Tyre/);
  });
});

// ─── Delete ──────────────────────────────────────────────────────────────────

describe('DELETE /api/configurations/:id', () => {
  it('should allow owner to delete their own configuration', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/configurations/${configId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 403 when a salesperson deletes another\'s configuration', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/configurations/${configId}`)
      .set('Authorization', `Bearer ${otherSalesToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should allow admin to delete any configuration', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/configurations/${configId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});

// ─── Component replacement ───────────────────────────────────────────────────

describe('POST /api/configurations/:id/components', () => {
  it('should block removing a mandatory category via component replacement', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .post(`/api/configurations/${configId}/components`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        components: [
          { componentId: componentIds['Tyre'],     quantity: 1 },
          { componentId: componentIds['Gear Set'], quantity: 1 },
          // Frame intentionally missing
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Frame/);
  });

  it('should return 403 for non-owner salesperson on component replacement', async () => {
    const created = await createConfig(salesToken);
    const configId = created.body.data._id;

    const res = await request(app)
      .post(`/api/configurations/${configId}/components`)
      .set('Authorization', `Bearer ${otherSalesToken}`)
      .send({ components: buildValidComponents() });

    expect(res.statusCode).toBe(403);
  });
});
