import { Work } from "@/types";
import { createStatDiv, makeExtenderClass } from "./elements";
import logger from "@/utils/logger";

export const injectStats = (work: Work, context: Document | Element = document) => {
    const statsList = context.querySelector('dl.stats');
    if (!statsList) {
        logger.warn('Stats injection target not found!');
        return;
    }
    if (!work) return;

    const modifiedList = wrapDtDdPairs(statsList.cloneNode(true)) as Element;
    const ref = modifiedList.childNodes.item(2);

    const newElements = makeReadingStats(work).filter(Boolean) as Element[];

    newElements.forEach(el => modifiedList.insertBefore(el, ref));

    modifiedList.classList.add(makeExtenderClass('stats'));
    statsList.replaceWith(modifiedList);
}

export const injectChapterStats = () => {

}

const getWordsRemaining = (work: Work) => {
    const read = work.chapterHistory.reduce((sum, ch) => sum + (ch.wordCount ?? 0), 0);
    return work.meta.wordCount - read;
};

const getReadingTime = (work: Work, isRemaining: boolean) => {
    const wordsPerMinute = 250;
    const wordsRemaining = isRemaining ? getWordsRemaining(work) : work.meta.wordCount;
    return Math.round(wordsRemaining / (wordsPerMinute || 250));
}

const formatTime = (readingTime: number) => {
    if (readingTime <= 0) return '';
    const hours = Math.floor(readingTime / 60);
    const minutes = readingTime % 60;
    const hoursText = hours >= 1 ? `${hours} hour${hours > 1 ? 's' : ''},` : '';
    const minutesText = minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : '';
    return `${hoursText} ${minutesText}`.trim();
}

const makeReadingStats = (work: Work) => {
    const totalTime = getReadingTime(work, false);
    const remainingTime = getReadingTime(work, true);
    if (totalTime <= 0) return [];

    const hasProgress = remainingTime !== totalTime && remainingTime > 0;
    const state = { showingRemaining: true };
    const getCurrentTime = () => state.showingRemaining && hasProgress ? remainingTime : totalTime;

    return [
        createReadingTimeStat(hasProgress, state, getCurrentTime),
        createFinishTimeStat(getCurrentTime),
    ];
};

const createReadingTimeStat = (hasProgress: boolean, state: { showingRemaining: boolean }, getCurrentTime: () => number) => {
    const dd = document.createElement('dd');
    const dt = document.createElement('dt');
    const div = document.createElement('div');
    const span = Object.assign(document.createElement('span'), {
        tabIndex: hasProgress ? 0 : -1,
    });

    const update = () => {
        const time = getCurrentTime();
        span.textContent = formatTime(time);
        dt.textContent = hasProgress && state.showingRemaining ? 'Reading time (remaining):' : 'Reading time:';
        div.title = hasProgress
            ? state.showingRemaining ? 'Click for total' : 'Click for remaining'
            : '';
    };

    dd.append(span);
    div.classList.add(makeExtenderClass('stats--reading-time'));
    if (hasProgress) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', () => { state.showingRemaining = !state.showingRemaining; update(); });
    }
    div.append(dt, dd);
    update();
    return div;
};

const createFinishTimeStat = (getCurrentTime: () => number) => {
    const dd = document.createElement('dd');
    const span = Object.assign(document.createElement('span'), { tabIndex: 0 });

    const update = () => {
        const finish = new Date(Date.now() + getCurrentTime() * 60 * 1000);
        span.textContent = `${finish.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} ⏱`;
    };

    dd.append(span);
    const div = createStatDiv('Finish by:', dd, 'stats--finish-time');
    div.style.cursor = 'pointer';
    div.addEventListener('click', update);
    div.title = 'Click to update';
    update();
    return div;
};

const wrapDtDdPairs = (dl: Node) => {
    const children = Array.from(dl.childNodes);
    let currentDiv: Element | null = null;

    children.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node?.textContent?.trim() === '') return;

        if (node.nodeName === 'DT') {
            const el = node as Element;
            currentDiv = document.createElement('div');
            if (el.className) currentDiv.classList.add(el.className);
            dl.insertBefore(currentDiv, node);
            currentDiv.appendChild(node);
        } else if (node.nodeName === 'DD' && currentDiv) {
            const el = node as Element;
            const text = el.textContent;
            if (text) {
                el.setAttribute(makeExtenderClass('-ao3-original-data'), text);
                el.textContent = text.replace(/[,\s]/g, ' ');
            }
            currentDiv.appendChild(node);
        } else {
            currentDiv = null;
        }
    });

    return dl;
}
