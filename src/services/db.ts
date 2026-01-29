import type { ManifestRecord } from '../types';

const DB_NAME = 'ParticipaDF_DB';
const DB_VERSION = 1;
const STORE_NAME = 'manifestations';

export const db = {
  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'protocol' });
        }
      };
    });
  },

  async saveManifestation(manifest: ManifestRecord): Promise<void> {
    const dbInstance = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(manifest);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async getManifestation(protocol: string): Promise<ManifestRecord | undefined> {
    const dbInstance = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(protocol);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAllManifestations(): Promise<ManifestRecord[]> {
    const dbInstance = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Sort by date descending (newest first)
        const results = request.result as ManifestRecord[];
        results.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
        resolve(results);
      };
    });
  },

  async deleteManifestation(protocol: string): Promise<void> {
    const dbInstance = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(protocol);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
};
