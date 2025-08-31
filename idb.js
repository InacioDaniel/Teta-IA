// idb.js - minimal helper
const DB_NAME = 'teta-db';
const DB_VERSION = 1;
const STORE = 'memoria';

function openDb() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open(DB_NAME, DB_VERSION);
    rq.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}

async function putItem(item) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => res(true);
    tx.onerror = () => rej(tx.error);
  });
}

async function getItem(id) {
  const db = await openDb();
  return new Promise((res, rej) => {
    const rq = db.transaction(STORE).objectStore(STORE).get(id);
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}

async function getAll() {
  const db = await openDb();
  return new Promise((res, rej) => {
    const rq = db.transaction(STORE).objectStore(STORE).getAll();
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}
