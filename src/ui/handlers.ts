import { WorksService } from "../db";
import { Work, WorkStatus } from "../types/work";
import {getLastReadChapter} from "../content/metaData";

export const handleToggleStatus = async (work: Work, status: WorkStatus): Promise<Work> => {
    const newStatus = work.status === status ? WorkStatus.seen : status;
    await WorksService.edit(work.workId, { status: newStatus });
    return { ...work, status: newStatus };
};

export const handleReread = async (work: Work, countUp: boolean): Promise<Work> => {
    const newReread = countUp ? work.reread + 1 : work.reread - 1;
    await WorksService.edit(work.workId, { reread: newReread });
    return { ...work, reread: newReread };
};

export const handleChapterRead = async (work: Work, currentChapter: number, chapterWordCount: number): Promise<Work> => {
    const lastChapterRead = getLastReadChapter(work);

    const newHistory = lastChapterRead !== currentChapter
        ? [...work.chapterHistory, { chapter: currentChapter, timestamp: Date.now(), wordCount: chapterWordCount, url: window.location.href}]
        : work.chapterHistory.slice(0, -1);

    const newStatus = newHistory.length === 0
        ? WorkStatus.seen
        : currentChapter === work.meta.chapterCount
            ? WorkStatus.read
            : WorkStatus.partiallyRead;

    await WorksService.edit(work.workId, { chapterHistory: newHistory, status: newStatus });
    return { ...work, chapterHistory: newHistory, status: newStatus };
}

export const handleDownload = async (work: Work) => {
    const titleSlug = work.meta.title.toLowerCase().replace(/\s+/g, '_');
    const updatedAt = Date.now();
    window.location.href = `https://archiveofourown.org/downloads/${work.workId}/${encodeURIComponent(titleSlug)}.epub${updatedAt ? `?updated_at=${updatedAt}` : ''}`;
    return await handleToggle(work, 'downloaded', true);
}

export const handleKudos = async (work: Work) => {
    return await handleToggle(work, 'kudos', true);
}

const handleToggle = async (work: Work, field: 'kudos' | 'downloaded', value: boolean) => {
    await WorksService.edit(work.workId, { [field]: value });
    return { ...work, [field]: value };
};