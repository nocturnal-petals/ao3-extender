export interface ChapterEntry {
    chapter: number;
    timestamp: number;
    wordCount?: number;
    url: string;
}

export interface Work {
    workId: string,
    status: WorkStatus,
    kudos: boolean,
    downloaded: boolean,
    reread: number,
    chapterHistory: ChapterEntry[];
    timestamp: number,
    meta: {
        wordCount: number,
        title: string,
        author: string,
        chapterCount: number,
        fandom: string,
        isCompleted: boolean,
    },
}

export enum WorkStatus {
    read = 'READ',
    doNotRead = 'DO_NOT_READ',
    partiallyRead = 'PARTIALLY_READ',
    seen = 'SEEN',
    listOnly = 'LIST_ONLY',
}