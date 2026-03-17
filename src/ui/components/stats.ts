import { Work } from "@/types";
import { createStatDiv, makeExtenderClass } from "./elements";

const noOp = { updateStats: (_: Work) => {} };

export const injectStats = (work: Work, context: Document | Element = document) => {
    const statsList = context.querySelector('dl.stats');
    if (!statsList) {
        logger.warn('Stats injection target not found!');
        return noOp;
    }
    if (!work) return noOp;

    const modifiedList = wrapDtDdPairs(statsList.cloneNode(true)) as Element;
    const ref = modifiedList.childNodes.item(2);

    const newElements = [
        makeReadingTimeStat(work.meta.wordCount),
        makeFinishTimeStat(work.meta.wordCount),
    ].filter(Boolean) as Element[];

    newElements.forEach(el => modifiedList.insertBefore(el, ref));

    modifiedList.classList.add(makeExtenderClass('stats'));
    statsList.replaceWith(modifiedList);
}

export const injectChapterStats = () => {

}

const getReadingTime = (wordCount: number) => {
    const wordsPerMinute = 250;
    return Math.round(wordCount / (wordsPerMinute || 250));
}

const makeReadingTimeStat = (wordCount: number) => {
    const readingTime = getReadingTime(wordCount);
    if (readingTime <= 0) return null;
    const hours = Math.floor(readingTime / 60);
    const minutes = readingTime % 60;
    const hoursText = hours >= 1 ? `${hours} hour${hours > 1 ? 's' : ''},` : '';
    const minutesText = minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : '';

    return createStatDiv('Reading time:', `${hoursText} ${minutesText}`.trim(), 'stats--reading-time');
}

const makeFinishTimeStat = (wordCount: number) => {
    const readingTime = getReadingTime(wordCount);
    if (readingTime <= 0) return null;

    const spanButton = Object.assign(document.createElement('span'), {
        tabIndex: 0,
        role: 'button',
    });

    function updateTime() {
        const start = Date.now();
        const finish = new Date(start + readingTime * 60 * 1000);
        const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const finishTime = finish.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        spanButton.title = `Using current time of ${startTime}. Click to update.`;
        spanButton.textContent = `${finishTime} 🔄`;
    }

    spanButton.style.cursor = 'pointer';
    spanButton.addEventListener('click', updateTime);
    updateTime(); // set initial value
    const dd = document.createElement('dd');
    dd.append(spanButton);

    return createStatDiv('Finish by:', dd, 'stats--finish-time');
}

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
