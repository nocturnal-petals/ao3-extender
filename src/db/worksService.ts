import * as database from './databaseActions'
import { Work } from '../types/work';

const WORKS_STORE = 'works';

type WorkUpdate = Partial<Work>;

export const WorksService = {
    get: (workId: string): Promise<Work | undefined> =>
        database.getElement<Work>(WORKS_STORE, workId),

    getAll: (): Promise<Work[]> =>
        database.getAllElements<Work>(WORKS_STORE),

    add: (work: Work): Promise<IDBValidKey> =>
        database.addElement(WORKS_STORE, work),

    edit: (workId: string, update: WorkUpdate): Promise<IDBValidKey> =>
        database.editElement(WORKS_STORE, workId, update),

    remove: (workId: string): Promise<undefined> =>
        database.removeElement(WORKS_STORE, workId),

    clearAll: (): Promise<undefined> =>
        database.removeElement(WORKS_STORE, 'all'),

    upsert: async (work: Work): Promise<void> => {
        const existing = await database.getElement<Work>(WORKS_STORE, work.workId);
        if (!existing) {
            await database.addElement(WORKS_STORE, work);
        } else {
            await database.editElement(WORKS_STORE, work.workId, { meta: work.meta });
        }
    },
};