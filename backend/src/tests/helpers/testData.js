/**
 * Reusable sample data for tests
 */

const adminUser = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'password123',
  role: 'admin',
};

const salespersonUser = {
  name: 'Test Salesperson',
  email: 'sales@test.com',
  password: 'password123',
  role: 'salesperson',
};

const anotherSalespersonUser = {
  name: 'Other Salesperson',
  email: 'other@test.com',
  password: 'password123',
  role: 'salesperson',
};

// One component per mandatory category
const sampleComponents = [
  { componentName: 'Aluminium Frame', category: 'Frame', currentPrice: 3500, isMandatory: true },
  { componentName: 'MTB Tyre', category: 'Tyre', currentPrice: 800, isMandatory: true },
  { componentName: 'Shimano 21 Speed', category: 'Gear Set', currentPrice: 2200, isMandatory: true },
  { componentName: 'Comfort Seat', category: 'Seat', currentPrice: 600, isMandatory: false },
  { componentName: 'Disc Brake', category: 'Brake', currentPrice: 950, isMandatory: false },
];

module.exports = { adminUser, salespersonUser, anotherSalespersonUser, sampleComponents };
