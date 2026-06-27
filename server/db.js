// server/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log('Connected to MongoDB:', process.env.DB_NAME);
}

function getDB() {
  if (!db) throw new Error('DB not connected. Call connectDB() first.');
  return db;
}

module.exports = { connectDB, getDB };