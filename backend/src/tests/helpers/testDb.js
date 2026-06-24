const mongoose = require('mongoose');

/**
 * Connect to the test database (uses MONGO_URI from .env.test or .env)
 */
const connectTestDB = async () => {
  const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(uri);
};

/**
 * Drop all collections — called before/after each test suite
 */
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Close the connection after all tests finish
 */
const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

module.exports = { connectTestDB, clearTestDB, closeTestDB };
