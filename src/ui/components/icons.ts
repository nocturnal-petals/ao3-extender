import { WorkStatus } from "@/types";

export type IconName = 
    'check' | 'book-open' | 'eye' | 'book' | 'pause' | 'ban' |
    'download' | 'heart' | 'chevron-down' | 'arrow-up' | 'clock' | 'refresh-cw';

const ICONS: Record<IconName, string> = {
    'check':        'M20 6L9 17l-5-5',
    'book-open':    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    'book':         'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
    'eye':          'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    'pause':        'M6 4h4v16H6zM14 4h4v16h-4z',
    'ban':          'M18.364 5.636a9 9 0 1 0-12.728 12.728A9 9 0 0 0 18.364 5.636zM5.636 5.636l12.728 12.728',
    'download':     'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    'heart':        'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    'chevron-down': 'M6 9l6 6 6-6',
    'arrow-up':     'M12 19V5M5 12l7-7 7 7',
    'clock':        'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2',
    'refresh-cw':   'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
};

export const createIcon = (name: IconName, size = 14): SVGSVGElement => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.style.cssText = 'display:inline-block;vertical-align:middle;flex-shrink:0;';
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ICONS[name]);
    svg.appendChild(path);
    return svg;
};

export const createIconLabel = (iconName: IconName, text: string, size = 14): HTMLSpanElement => {
    const span = document.createElement('span');
    span.style.cssText = 'display:inline-flex;align-items:center;gap:5px;';
    span.appendChild(createIcon(iconName, size));
    const insideSpan = Object.assign(document.createElement('span'),{ textContent: text });
    span.appendChild(insideSpan);
    return span;
};

export const getStatusIcon = (status: WorkStatus): IconName | null => {
    switch (status) {
        case WorkStatus.read:           return 'check';
        case WorkStatus.partiallyRead:  return 'book-open';
        case WorkStatus.seen:           return 'eye';
        case WorkStatus.reading:        return 'book';
        // case WorkStatus.onHold:         return 'pause';
        // case WorkStatus.doNotRead:      return 'ban';
        default:                        return null;
    }
};