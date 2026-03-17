import { DATABASE_NAME, DB_VERSION } from './constants';

export const initDb = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const open = indexedDB.open(DATABASE_NAME, DB_VERSION);

        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
            open.result.close();
            resolve();
        };

        open.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains('works')) {
                const worksStore = db.createObjectStore('works', { keyPath: 'workId' });
                worksStore.createIndex('status', 'status', { unique: false });
                worksStore.createIndex('downloaded', 'downloaded', { unique: false });
            }
        };
    });
};
