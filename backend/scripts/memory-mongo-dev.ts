/**
 * Local dev helper: runs the API against MongoDB Memory Server when no real MongoDB is available.
 * Usage: yarn start:dev-memory (from backend/)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

config({ path: resolve(__dirname, '../.env') });

async function run(): Promise<void> {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URL = mongod.getUri();
  // eslint-disable-next-line no-console
  console.error(`[memory-mongo-dev] ${process.env.MONGO_URL}`);
  await import('../src/main');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
