import { ChapterEntry, Work, WorkStatus } from "@/types";
import { createIconLabel, getStatusIcon } from "@/ui/components/icons";
import { Colors } from "@/content/contstants";

export const getStatusColorVar = (work: Work, dateUpdated?: number, lastEntry?: ChapterEntry): string => {
    if (work.status === WorkStatus.read) {
        if (dateUpdated && lastEntry && dateUpdated > lastEntry.timestamp) return Colors.UPDATED;
        return Colors.READ;
    }
    if (work.status === WorkStatus.partiallyRead)   return Colors.PARTIAL;
    if (work.status === WorkStatus.reading)         return Colors.READING;
    return Colors.SEEN;
};

export const getBlurbColorVar = (work: Work, colorVar: string): string => {
    if (work.hidden) return Colors.DO_NOT_READ;
    if (work.onHold) return Colors.ON_HOLD;
    return colorVar;
};

export const getStatusLabel = (status: WorkStatus): Element | undefined => {
    const icon = getStatusIcon(status);
    if (!icon) return;
    let text = statusTextHelper(status);
    return createIconLabel(icon, text);
};

const statusTextHelper = (status: WorkStatus) => {
    switch (status) {
        case WorkStatus.read:           return 'Read';
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
