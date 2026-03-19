import { ChapterEntry, Work, WorkStatus } from "@/types";

export const getStatusColorVar = (work: Work, dateUpdated?: number, lastEntry?: ChapterEntry): string => {
    if (work.status === WorkStatus.read) {
        if (dateUpdated && lastEntry && dateUpdated > lastEntry.timestamp) return '--color-updated';
        return '--color-read';
    }
    if (work.status === WorkStatus.partiallyRead) return '--color-partial';
    if (work.status === WorkStatus.doNotRead) return '--color-do-not-read';
    return '--color-seen';
};

export const getStatusText = (status: WorkStatus): string => {
    switch (status) {
        case WorkStatus.read:
            return '✓ Read'
        case WorkStatus.doNotRead:
            return '✗ Do Not Read'
        case WorkStatus.partiallyRead:
            return '✓ Chapter Read'
        case WorkStatus.seen:
            return '👁 Seen';
        case WorkStatus.listOnly:
            return '';
        default:
            break;
    }
    return '';
};

export const hexToRgba = (hex: string, alpha: number): string => {
    const h = hex.trim().replace('#', '');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
