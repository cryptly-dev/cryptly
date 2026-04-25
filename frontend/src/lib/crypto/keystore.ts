const DB_NAME = "cryptly-keystore";
const DB_VERSION = 1;
const MASTER_STORE = "master";
const PROJECTS_STORE = "projects";
const MASTER_KEY_ID = "self";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MASTER_STORE)) {
        db.createObjectStore(MASTER_STORE);
      }
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function tx(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function awaitRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const keystore = {
  async getMasterKey(): Promise<CryptoKey | null> {
    const db = await openDb();
    const result = await awaitRequest(
      tx(db, MASTER_STORE, "readonly").get(MASTER_KEY_ID)
    );
    return (result as CryptoKey | undefined) ?? null;
  },

  async setMasterKey(key: CryptoKey): Promise<void> {
    const db = await openDb();
    await awaitRequest(
      tx(db, MASTER_STORE, "readwrite").put(key, MASTER_KEY_ID)
    );
  },

  async clearMasterKey(): Promise<void> {
    const db = await openDb();
    await awaitRequest(
      tx(db, MASTER_STORE, "readwrite").delete(MASTER_KEY_ID)
    );
  },

  async getProjectKey(projectId: string): Promise<CryptoKey | null> {
    const db = await openDb();
    const result = await awaitRequest(
      tx(db, PROJECTS_STORE, "readonly").get(projectId)
    );
    return (result as CryptoKey | undefined) ?? null;
  },

  async setProjectKey(projectId: string, key: CryptoKey): Promise<void> {
    const db = await openDb();
    await awaitRequest(
      tx(db, PROJECTS_STORE, "readwrite").put(key, projectId)
    );
  },

  async clearProjectKey(projectId: string): Promise<void> {
    const db = await openDb();
    await awaitRequest(
      tx(db, PROJECTS_STORE, "readwrite").delete(projectId)
    );
  },

  async wipeAll(): Promise<void> {
    const db = await openDb();
    await Promise.all([
      awaitRequest(tx(db, MASTER_STORE, "readwrite").clear()),
      awaitRequest(tx(db, PROJECTS_STORE, "readwrite").clear()),
    ]);
  },
};
