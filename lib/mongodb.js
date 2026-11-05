import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function connectToDatabase() {
    await client.connect();
    const db = client.db('testdb');
    return { client, db };
}
