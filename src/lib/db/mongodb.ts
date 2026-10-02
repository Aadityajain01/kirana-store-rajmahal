import { MongoClient, Db } from 'mongodb';

const uri = process.env.DATABASE_URL || '';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    throw new Error('DATABASE_URL must be a valid MongoDB connection string.');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!globalThis._mongoClientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      globalThis._mongoClientPromise = client.connect();
    }
    return globalThis._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getMongoDb(dbName?: string): Promise<Db> {
  const connectedClient = await getMongoClientPromise();
  return connectedClient.db(dbName);
}
