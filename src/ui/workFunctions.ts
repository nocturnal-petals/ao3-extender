import { Work, WorkStatus } from "../types/work";
import { handleReread } from "./handlers";
import logger from "../utils/logger";
import "../styles/style.css"
import { injectStats } from "./components/stats";
import { getLastReadChapter, getWorkUpdateTime } from '../content/metaData';
import { makeExtenderClass } from "./components/elements";
import { createChapterRead, createDoNotReadButton, createOnHoldButton, createReadButton, createStatusButton } from "./components/buttons";
import { updateBadgesVisualState } from "./components/badges";

export const injectButtons = (initial: Work | null, currentChapter: number, chapterWordCount: number, parentLocators: string[]) => {
    if (!initial) return;
    let current = initial;

    const targets = parentLocators
        .map(selector => document.querySelector(selector))
        .filter((el): el is Element => el !== null);

    if (targets.length === 0) {
        logger.warn('No injection targets found');
        return;
    }

    const ensurePersisted = () => true;

    const updateAll = (updated: Work) => {
        if (!updated) return;
        current = updated;
        updateButtonStates(updated, currentChapter);
        updateBadgesVisualState(updated, getWorkUpdateTime());
    };

    const getCurrent = () => current;

    targets.forEach(target => {
        createButtonsForTarget(getCurrent, target, currentChapter, chapterWordCount, updateAll, ensurePersisted);
    });

    injectStats(current);
    updateAll(current);
    return updateAll;
};

const createButtonsForTarget = (getCurrent: () => Work, target: Element, currentChapter: number, chapterWordCount: number, updateAll: (work: Work) => void, ensurePersisted: () => boolean) => {
    const readBtn = createReadButton(getCurrent, updateAll, ensurePersisted);
    const chapterReadBtn = createChapterRead(getCurrent, updateAll, ensurePersisted, currentChapter, chapterWordCount);
    const doNotReadBtn = createDoNotReadButton(getCurrent, updateAll, ensurePersisted);
    const onHoldBtn = createOnHoldButton(getCurrent, updateAll, ensurePersisted);

    const rereadBtn = createStatusButton('+ Re-read', 're-read-plus-btn', async () => {
        const updated = await handleReread(getCurrent(), true);
        updateAll(updated);
    });

    const removeRereadBtn = createStatusButton('- Re-read', 're-read-minus-btn', async () => {
        const updated = await handleReread(getCurrent(), false);
        updateAll(updated);
    });

    target.append(readBtn, chapterReadBtn, doNotReadBtn, onHoldBtn, rereadBtn, removeRereadBtn);
}

const updateButtonStates = (current: Work, currentChapter: number) => {
    document.querySelectorAll(`.${makeExtenderClass('read-btn')}`).forEach(button => button.classList.toggle('active', current?.status === WorkStatus.read));
    document.querySelectorAll(`.${makeExtenderClass('chapter-read-btn')}`).forEach(button => {
        button.classList.toggle('invisible', (current?.meta.chapterCount ?? 0) <= 1);
        button.classList.toggle('active', (current?.status === WorkStatus.partiallyRead && getLastReadChapter(current) === currentChapter) || current?.status === WorkStatus.read);
    });
    document.querySelectorAll(`.${makeExtenderClass('do-not-read-btn')}`).forEach(button => button.classList.toggle('active', current?.hidden));
    document.querySelectorAll(`.${makeExtenderClass('on-hold-btn')}`).forEach(button => button.classList.toggle('active', current?.onHold));
    document.querySelectorAll(`.${makeExtenderClass('re-read-plus-btn')}`).forEach(button => button.classList.toggle('invisible', current?.status !== WorkStatus.read));
    document.querySelectorAll(`.${makeExtenderClass('re-read-minus-btn')}`).forEach(button => button.classList.toggle('invisible', (current?.reread ?? 0) < 1));
};
