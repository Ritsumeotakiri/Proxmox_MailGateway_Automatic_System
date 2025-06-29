import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);


let db;

export async function connectDb() {
  if (!db) {
    await client.connect();
    db = client.db('pmg_dashboard');
    console.log('✅ MongoDB connected');
  }
  return db;
}
