import { ChapterEntry, Work, WorkStatus } from "@/types";
import { createIconLabel, getStatusIcon } from "@/ui/components/icons";
import logger from "./logger";

export const getStatusColorVar = (work: Work, dateUpdated?: number, lastEntry?: ChapterEntry): string => {
    // if (work.hidden)                                return '--color-do-not-read';
    // if (work.onHold)                                return '--color-on-hold';
    if (work.status === WorkStatus.read) {
        if (dateUpdated && lastEntry && dateUpdated > lastEntry.timestamp) return '--color-updated';
        return '--color-read';
    }
    if (work.status === WorkStatus.partiallyRead)   return '--color-partial';
    if (work.status === WorkStatus.reading)         return '--color-reading';
    return '--color-seen';
};

export const getStatusLabel = (status: WorkStatus): Element | undefined => {
    const icon = getStatusIcon(status);
    if (!icon) return;
    let text = statusTextHelper(status);
    return createIconLabel(icon, text);
};

const statusTextHelper = (status: WorkStatus) => {
    switch (status) {
        case WorkStatus.read:           return'Read';
        case WorkStatus.partiallyRead:  return 'Chapter Read';
        case WorkStatus.seen:           return 'Seen';
        case WorkStatus.reading:        return 'Reading';
        case WorkStatus.listOnly:       return '';
        default: return '';
    }
}

        // if worker.hidden?  return '✗ Do Not Read';
        // case WorkStatus.onHold:         return '⏸ On Hold';

export const hexToRgba = (hex: string, alpha: number): string => {
    const h = hex.trim().replace('#', '');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
