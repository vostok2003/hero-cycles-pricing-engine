/**
 * Tests: Pricing Engine
 * Covers breakdown generation and correct total price calculation.
 */

require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const Component = require('../models/Component');
const { connectTestDB, clearTestDB, closeTestDB } = require('./helpers/testDb');
const { salespersonUser, sampleComponents } = require('./helpers/testData');

let salesToken;
let componentIds = {};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  const regRes = await request(app).post('/api/auth/register').send(salespersonUser);
  salesToken = regRes.body.data.token;

  const docs = await Component.insertMany(sampleComponents);
  docs.forEach((d) => { componentIds[d.category] = d._id.toString(); });
});

afterAll(async () => {
  await closeTestDB();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildConfig = (components) =>
  request(app)
    .post('/api/configurations')
    .set('Authorization', `Bearer ${salesToken}`)
    .send({
      configurationName: 'Pricing Test Build',
      description: 'For pricing tests',
      components,
    });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/pricing/:configurationId', () => {
  it('should return a pricing breakdown with correct total (mandatory only)', async () => {
    // Frame=3500, Tyre=800 x1, GearSet=2200 → total = 6500
    const components = [
      { componentId: componentIds['Frame'],    quantity: 1 },
      { componentId: componentIds['Tyre'],     quantity: 1 },
      { componentId: componentIds['Gear Set'], quantity: 1 },
    ];

    const configRes = await buildConfig(components);
    expect(configRes.statusCode).toBe(201);
    const configId = configRes.body.data._id;

    const res = await request(app)
      .get(`/api/pricing/${configId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const { totalPrice, components: breakdown } = res.body.data;
    expect(totalPrice).toBe(3500 + 800 + 2200); // 6500
    expect(breakdown).toHaveLength(3);
  });

  it('should correctly multiply unit price by quantity', async () => {
    // Tyre=800 x2 → subtotal 1600; Frame=3500 x1; GearSet=2200 x1 → total 7300
    const components = [
      { componentId: componentIds['Frame'],    quantity: 1 },
      { componentId: componentIds['Tyre'],     quantity: 2 },
      { componentId: componentIds['Gear Set'], quantity: 1 },
    ];

    const configRes = await buildConfig(components);
    const configId = configRes.body.data._id;

    const res = await request(app)
      .get(`/api/pricing/${configId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.statusCode).toBe(200);

    const tyreLine = res.body.data.components.find((c) => c.category === 'Tyre');
    expect(tyreLine.subtotal).toBe(800 * 2);
    expect(res.body.data.totalPrice).toBe(3500 + 800 * 2 + 2200);
  });

  it('should include optional components in the total when present', async () => {
    // Seat=600, Brake=950 added on top of mandatory
    const components = [
      { componentId: componentIds['Frame'],    quantity: 1 },
      { componentId: componentIds['Tyre'],     quantity: 1 },
      { componentId: componentIds['Gear Set'], quantity: 1 },
      { componentId: componentIds['Seat'],     quantity: 1 },
      { componentId: componentIds['Brake'],    quantity: 1 },
    ];

    const configRes = await buildConfig(components);
    const configId = configRes.body.data._id;

    const res = await request(app)
      .get(`/api/pricing/${configId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalPrice).toBe(3500 + 800 + 2200 + 600 + 950); // 8050
    expect(res.body.data.components).toHaveLength(5);
  });

  it('should return 404 for a non-existent configuration ID', async () => {
    const fakeId = '64a0000000000000000000ff';
    const res = await request(app)
      .get(`/api/pricing/${fakeId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('should require authentication', async () => {
    const configRes = await buildConfig([
      { componentId: componentIds['Frame'],    quantity: 1 },
      { componentId: componentIds['Tyre'],     quantity: 1 },
      { componentId: componentIds['Gear Set'], quantity: 1 },
    ]);
    const configId = configRes.body.data._id;

    const res = await request(app).get(`/api/pricing/${configId}`);
    expect(res.statusCode).toBe(401);
  });
});
