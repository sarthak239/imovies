const mongoose = require('mongoose');
const store = require('./store');

let isMongoConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[iMovies Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[iMovies Database] MongoDB service unavailable (${error.message}).`);
    console.log(`[iMovies Database] Activating resilient in-memory data store with live TTL locking.`);
    await store.init();
  }

  // Periodic Seat Lock TTL cleanup every 15 seconds
  setInterval(() => {
    store.cleanExpiredLocks();
  }, 15000);
};

const getDBStatus = () => isMongoConnected;

module.exports = { connectDB, getDBStatus, store };
