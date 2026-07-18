import { MongoMemoryServer } from 'mongodb-memory-server';

const mem = await MongoMemoryServer.create({ instance: { port: 27099 } });
process.env.MONGODB_URI = `${mem.getUri()}fashionhub`;

const { runSeed } = await import('../src/seed/index.js');
await runSeed({ disconnect: false });

await import('../src/index.js');
