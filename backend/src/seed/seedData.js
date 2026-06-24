/**
 * Seed Script
 * Populates the database with initial users, components, and sample configurations.
 *
 * Usage:  npm run seed
 *
 * WARNING: This will clear existing Users, Components, Configurations,
 *          ConfigurationComponents, and PriceHistory before seeding.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Component = require('../models/Component');
const Configuration = require('../models/Configuration');
const ConfigurationComponent = require('../models/ConfigurationComponent');
const PriceHistory = require('../models/PriceHistory');

// ─── Seed Data ───────────────────────────────────────────────────────────────

const users = [
  { name: 'Admin User',       email: 'admin@herocycles.com',      password: 'admin123',  role: 'admin' },
  { name: 'Sales Person',     email: 'sales@herocycles.com',      password: 'sales123',  role: 'salesperson' },
];

const components = [
  // Frame
  { componentName: 'Aluminium Frame',    category: 'Frame',    currentPrice: 3500, isMandatory: true },
  { componentName: 'Carbon Fibre Frame', category: 'Frame',    currentPrice: 8500, isMandatory: true },
  { componentName: 'Steel Frame',        category: 'Frame',    currentPrice: 1800, isMandatory: true },
  // Tyre
  { componentName: 'MTB Tyre',           category: 'Tyre',     currentPrice: 800,  isMandatory: true },
  { componentName: 'Road Tyre',          category: 'Tyre',     currentPrice: 650,  isMandatory: true },
  { componentName: 'Fat Tyre',           category: 'Tyre',     currentPrice: 1100, isMandatory: true },
  // Gear Set
  { componentName: 'Shimano 21 Speed',   category: 'Gear Set', currentPrice: 2200, isMandatory: true },
  { componentName: 'Shimano 7 Speed',    category: 'Gear Set', currentPrice: 950,  isMandatory: true },
  { componentName: 'SRAM 11 Speed',      category: 'Gear Set', currentPrice: 4200, isMandatory: true },
  // Seat
  { componentName: 'Comfort Seat',       category: 'Seat',     currentPrice: 600,  isMandatory: false },
  { componentName: 'Racing Saddle',      category: 'Seat',     currentPrice: 1200, isMandatory: false },
  // Brake
  { componentName: 'Disc Brake',         category: 'Brake',    currentPrice: 950,  isMandatory: false },
  { componentName: 'V-Brake',            category: 'Brake',    currentPrice: 450,  isMandatory: false },
];

// ─── Main ────────────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Clear existing data ──────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Component.deleteMany({}),
      Configuration.deleteMany({}),
      ConfigurationComponent.deleteMany({}),
      PriceHistory.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing seed collections');

    // ── Create users (password hashing handled by pre-save hook) ────────
    const createdUsers = await User.insertMany(
      await Promise.all(
        users.map(async (u) => ({
          ...u,
          password: await bcrypt.hash(u.password, 10),
        }))
      ),
      { lean: true }
    );
    const admin = createdUsers.find((u) => u.role === 'admin');
    const salesperson = createdUsers.find((u) => u.role === 'salesperson');
    console.log(`👤 Created ${createdUsers.length} users`);

    // ── Create components ────────────────────────────────────────────────
    const createdComponents = await Component.insertMany(
      components.map((c) => ({ ...c, lastUpdatedDate: new Date() }))
    );
    console.log(`🔩 Created ${createdComponents.length} components`);

    // Helper: find a component by name
    const find = (name) => createdComponents.find((c) => c.componentName === name);

    // ── Sample Configuration 1: Mountain Bike ────────────────────────────
    const mountainBike = await Configuration.create({
      configurationName: 'Mountain Bike',
      description: 'All-terrain build with disc brakes and MTB tyres',
      createdBy: salesperson._id,
    });

    await ConfigurationComponent.insertMany([
      { configurationId: mountainBike._id, componentId: find('Aluminium Frame')._id,  quantity: 1 },
      { configurationId: mountainBike._id, componentId: find('MTB Tyre')._id,         quantity: 2 },
      { configurationId: mountainBike._id, componentId: find('Shimano 21 Speed')._id, quantity: 1 },
      { configurationId: mountainBike._id, componentId: find('Comfort Seat')._id,     quantity: 1 },
      { configurationId: mountainBike._id, componentId: find('Disc Brake')._id,       quantity: 1 },
    ]);

    // ── Sample Configuration 2: Road Bike ───────────────────────────────
    const roadBike = await Configuration.create({
      configurationName: 'Road Bike',
      description: 'Lightweight road build with carbon frame and racing saddle',
      createdBy: salesperson._id,
    });

    await ConfigurationComponent.insertMany([
      { configurationId: roadBike._id, componentId: find('Carbon Fibre Frame')._id, quantity: 1 },
      { configurationId: roadBike._id, componentId: find('Road Tyre')._id,          quantity: 2 },
      { configurationId: roadBike._id, componentId: find('SRAM 11 Speed')._id,      quantity: 1 },
      { configurationId: roadBike._id, componentId: find('Racing Saddle')._id,      quantity: 1 },
      { configurationId: roadBike._id, componentId: find('V-Brake')._id,            quantity: 1 },
    ]);

    console.log('🚲 Created 2 sample configurations (Mountain Bike, Road Bike)');

    // ── Summary ──────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────');
    console.log('✅ Seed complete! Login credentials:');
    console.log(`   Admin      → ${users[0].email} / ${users[0].password}`);
    console.log(`   Salesperson→ ${users[1].email} / ${users[1].password}`);
    console.log('─────────────────────────────────────\n');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seed();
