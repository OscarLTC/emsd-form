const DB_NAME = 'emsd-contingencia';
const DB_VERSION = 1;

export const STORE_OUTBOX = 'outbox';

let connection: Promise<IDBDatabase> | null = null;

function openConnection(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        const store = db.createObjectStore(STORE_OUTBOX, { keyPath: 'id' });
        store.createIndex('status', 'status');
        store.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getDb(): Promise<IDBDatabase> {
  if (!connection) {
    connection = openConnection().catch((error) => {
      connection = null;
      throw error;
    });
  }
  return connection;
}

function run<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return getDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const request = operation(transaction.objectStore(storeName));

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
        transaction.onabort = () => reject(transaction.error);
      }),
  );
}

export const idb = {
  get: <T>(store: string, key: IDBValidKey) => run<T | undefined>(store, 'readonly', (s) => s.get(key)),
  getAll: <T>(store: string) => run<T[]>(store, 'readonly', (s) => s.getAll()),
  put: <T>(store: string, value: T) => run<IDBValidKey>(store, 'readwrite', (s) => s.put(value)),
  remove: (store: string, key: IDBValidKey) => run<undefined>(store, 'readwrite', (s) => s.delete(key)),
  clear: (store: string) => run<undefined>(store, 'readwrite', (s) => s.clear()),
};
