import { ChapterEntry, Work, WorkStatus } from "@/types";
import { makeExtenderClass } from "./elements";
import { getStatusColorVar, getStatusLabel, hexToRgba } from "@/utils/helpers";
import { createIconLabel } from "./icons";

export const updateBadgesVisualState = (work: Work, dateUpdated: number, context: Document | Element = document) => {
    const isDocument = context === document || context instanceof Document;
    const locator = isDocument ? 'dl.work.meta.group' : 'div.header.module';
    const header = context.querySelector(locator);
    if (!header) return;

    const lastEntry: ChapterEntry | undefined = work.chapterHistory.at(-1);
    const colorVar = getStatusColorVar(work, dateUpdated, lastEntry);

    if (!isDocument) {
        context.removeAttribute('style');
        context.removeAttribute('data-extender-status');
        if (work.status !== WorkStatus.listOnly) {
            makeBadgeStatusContainer(header, work, dateUpdated, lastEntry, colorVar, true);
            applyBlurbBackground(context, colorVar);
        }
        context.setAttribute(makeExtenderClass('data--status'), work.status.toLowerCase());
    } else {
        const existing = header.querySelector(`.${makeExtenderClass('stats--status-container')}`);
        if (existing) {
            existing.previousElementSibling?.remove();
            existing.remove();
        }
        const statusEl = document.createElement('dd');
        const wrapper = makeBadgeStatusContainer(statusEl, work, dateUpdated, lastEntry, colorVar, false);
        const statusTitle = Object.assign(document.createElement('dt'), { textContent: 'Status:' });
        header.prepend(statusTitle, wrapper);
    }
};

const makeBadgeStatusContainer = (parent: Element, work: Work, dateUpdated: number, lastEntry: ChapterEntry | undefined, colorVar: string, isBlurb: boolean) => {
    const wrapper = createBadgeWrapper(parent, isBlurb);

    wrapper.appendChild(makeDoNotReadBadge(work.hidden));
    wrapper.appendChild(makeOnHoldBadge(work.onHold));
    wrapper.appendChild(makeDownloadedBadge(work.downloaded));
    wrapper.appendChild(makeKudosedBadge(work.kudos));

    const isUpdated = lastEntry && dateUpdated > lastEntry.timestamp;
    if (work.status !== WorkStatus.partiallyRead) {
        const child = makeStatusBadge(work);
        if (child) wrapper.appendChild(child);
    }
    if (work.status === WorkStatus.read && isUpdated) {
        wrapper.appendChild(createBadge('New Chapter!', '--color-updated'));
    } else if (work.status === WorkStatus.partiallyRead && lastEntry) {
        const label = `Stopped at: Ch ${lastEntry.chapter}`;
        const timestamp = new Date(lastEntry.timestamp).toLocaleDateString();
        const badge = createBadge(`${label} (${timestamp})`, colorVar, lastEntry.url);
        wrapper.appendChild(badge);
    }

    parent.classList.add(makeExtenderClass('stats--status-container'));
    return parent;
};

const applyBlurbBackground = (blurb: Element, colorVar: string) => {
    const hex = getComputedStyle(document.documentElement)
        .getPropertyValue(colorVar.replace('var(', '').replace(')', '').trim()).trim();
    if (!hex) return;
    blurb.setAttribute('style', `background-color: ${hexToRgba(hex, 0.1)}; border: 1px solid ${hexToRgba(hex, 0.6)}; border-radius: 4px;`);
};

export const makeStatusBadge = (work: Work) => {
    const colorVar = getStatusColorVar(work);
    const text = getStatusLabel(work.status);
    if (!text) return;
    const badge = createBadge(text, colorVar);
    return badge;
};

export const makeDoNotReadBadge = (hidden: boolean) => {
    const label = createIconLabel('ban', 'Marked as Hidden');
    const badge = createBadge(label, '--color-do-not-read') as HTMLElement;
    if (!hidden) badge.classList.add('invisible');
    return badge;
};

export const makeOnHoldBadge = (hidden: boolean) => {
    const label = createIconLabel('pause', 'Marked On Hold');
    const badge = createBadge(label, '--color-on-hold') as HTMLElement;
    if (!hidden) badge.classList.add('invisible');
    return badge;
};

export const makeKudosedBadge = (kudosed: boolean) => {
    const label = createIconLabel('heart', 'Kudosed');
    const badge = createBadge(label, '--color-kudos') as HTMLElement;
    if (!kudosed) badge.classList.add('invisible');
    return badge;
};

export const makeDownloadedBadge = (downloaded: boolean) => {
    const label = createIconLabel('download', 'Downloaded');
    const badge = createBadge(label, '--color-downloaded') as HTMLElement;
    if (!downloaded) badge.classList.add('invisible');
    return badge;
};

export const createBadge = (content: string | Element, colorVar: string, href?: string): Element => {
    let el;
     if (typeof content === 'string') {
        el = document.createElement(href ? 'a' : 'span') as HTMLElement;
        el.textContent = content;
    } else {
        el = content as HTMLElement;
    }
    el.className = makeExtenderClass('badge');  
    el.style.setProperty('--badge-color', `var(${colorVar})`);
    if (href && el instanceof HTMLAnchorElement) {
        el.href = href;
        el.style.textDecoration = 'none';
    }
    return el;
};

export const createBadgeWrapper = (header: Element, isBlurb: boolean): Element => {
    let wrapper = header.querySelector(`.${makeExtenderClass('badges-wrapper')}`)
        || header.parentElement?.querySelector(`.${makeExtenderClass('badges-wrapper')}`);
    if (!wrapper) {
        wrapper = document.createElement('span');
        wrapper.className = makeExtenderClass('badges-wrapper');
        isBlurb ? header.insertAdjacentElement('afterend', wrapper) : header.append(wrapper);
    }
    wrapper.innerHTML = '';
    return wrapper;
};