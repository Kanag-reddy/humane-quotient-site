require('dotenv').config();
const mongoose = require('mongoose');

const TARGET_DATABASE = 'huq';
const APP_COLLECTIONS = [
  { name: 'users', indexes: [{ key: { email: 1 }, options: { unique: true } }] },
  { name: 'submissions', indexes: [{ key: { submissionId: 1 }, options: { unique: true } }] }
];

async function ensureCollection(database, name) {
  const exists = await database.listCollections({ name }, { nameOnly: true }).hasNext();
  if (!exists) await database.createCollection(name);
}

async function copyDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI to the source MongoDB database before running this command.');

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const source = mongoose.connection.db;
  const sourceName = source.databaseName;
  if (sourceName === TARGET_DATABASE) {
    throw new Error(`MONGODB_URI already points to "${TARGET_DATABASE}"; set it to the source database to copy.`);
  }

  const target = mongoose.connection.client.db(TARGET_DATABASE);
  const targetCollections = await target.listCollections({}, { nameOnly: true }).toArray();
  for (const collection of targetCollections) {
    const count = await target.collection(collection.name).countDocuments();
    if (count > 0) {
      throw new Error(`Target database "${TARGET_DATABASE}" is not empty; refusing to overwrite existing data.`);
    }
  }

  const copied = {};
  for (const { name, indexes } of APP_COLLECTIONS) {
    await ensureCollection(target, name);
    const sourceExists = await source.listCollections({ name }, { nameOnly: true }).hasNext();
    const documents = sourceExists ? await source.collection(name).find({}).toArray() : [];
    if (documents.length) {
      await target.collection(name).insertMany(documents);
    }
    for (const index of indexes) {
      await target.collection(name).createIndex(index.key, index.options);
    }
    copied[name] = documents.length;
  }

  console.log(`Copied application data from "${sourceName}" to "${TARGET_DATABASE}": ${JSON.stringify(copied)}.`);
  console.log(`The source database "${sourceName}" was left unchanged.`);
}

copyDatabase()
  .catch((err) => {
    console.error(`Database copy failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
