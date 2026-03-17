import { DATABASE_NAME, DB_VERSION } from './constants';

type ActionMode = 'readonly' | 'readwrite';

const withStore = <T>(
    storeName: string,
    mode: ActionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        const open = indexedDB.open(DATABASE_NAME, DB_VERSION);

        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
            const db = open.result;

            if (!db.objectStoreNames.contains(storeName)) {
                db.close();
                return reject(new Error(`Object store "${storeName}" not found`));
            }

            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);

            let request: IDBRequest<T>;
            try {
                request = action(store);
            } catch (e) {
                db.close();
                return reject(e);
            }

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            transaction.oncomplete = () => db.close();
            transaction.onerror = () => reject(transaction.error);
        };
    });
};

export const getElement = <T>(storeName: string, key: string): Promise<T | undefined> =>
    withStore<T | undefined>(storeName, 'readonly', (store) =>
        store.get(key)
    );

export const getAllElements = <T>(storeName: string): Promise<T[]> =>
    withStore<T[]>(storeName, 'readonly', (store) =>
        store.getAll()
    );

export const addElement = (storeName: string, payload: object): Promise<IDBValidKey> =>
    withStore<IDBValidKey>(storeName, 'readwrite', (store) =>
        store.add(structuredClone(payload))
    );

export const editElement = (storeName: string, key: string, payload: Partial<object>): Promise<IDBValidKey> => {
    return new Promise((resolve, reject) => {
        const open = indexedDB.open(DATABASE_NAME, DB_VERSION);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
            const db = open.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            const getRequest = store.get(key);
            getRequest.onerror = () => reject(getRequest.error);
            getRequest.onsuccess = () => {
                const updated = { ...getRequest.result, ...structuredClone(payload) };
                const putRequest = store.put(updated);
                putRequest.onerror = () => reject(putRequest.error);
                putRequest.onsuccess = () => resolve(putRequest.result);
            };

            transaction.oncomplete = () => db.close();
            transaction.onerror = () => reject(transaction.error);
        };
    });
};

export const removeElement = (storeName: string, key: IDBValidKey): Promise<undefined> =>
    withStore<undefined>(storeName, 'readwrite', (store) =>
        key === 'all' ? store.clear() : store.delete(key)
    );