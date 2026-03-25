export interface ChapterEntry {
    chapter: number;
    timestamp: number;
    wordCount?: number;
    url: string;
}

export interface RereadSession {
    startedAt: number;
    chapterHistory: ChapterEntry[];
    lastReadChapter: number;
}

export interface Work {
    workId: string,
    status: WorkStatus,
    kudos: boolean,
    downloaded: boolean,
    onHold: boolean,
    hidden: boolean,
    reread: number,
    chapterHistory: ChapterEntry[];
    currentReread?: RereadSession;
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
    listOnly = 'LIST_ONLY',
    seen = 'SEEN',
    reading = 'READING',
    read = 'READ',
    partiallyRead = 'PARTIALLY_READ',
}
