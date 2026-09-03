const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

/**
 * Connect to MongoDB database.
 * Tries local or cloud URI first; falls back gracefully to MongoMemoryServer
 * to provide a seamless zero-config local development and testing environment.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yellow_metal';

  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to external MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Starting embedded MongoMemoryServer...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected successfully to embedded MongoMemoryServer at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start embedded MongoMemoryServer:', memErr);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
