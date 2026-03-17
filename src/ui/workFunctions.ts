import { Work, WorkStatus } from "../types/work";
import { handleChapterRead, handleReread, handleToggleStatus } from "./handlers";
import logger from "../utils/logger";
import "../styles/style.css"
import { injectStats } from "./components/stats";
import {getLastReadChapter, getWorkUpdateTime } from '../content/metaData';
import { makeExtenderClass } from "./components/elements";
import { createStatusButton } from "./components/buttons";
import { updateBadgesVisualState } from "./components/badges";
import { getStatusText } from "@/utils/helpers";

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

    const updateButtonStates = () => {
        document.querySelectorAll(`.${makeExtenderClass('read-btn')}`).forEach(button => button.classList.toggle('active', current?.status === WorkStatus.read));
        document.querySelectorAll(`.${makeExtenderClass('chapter-read-btn')}`).forEach(button => {
            button.classList.toggle('invisible', (current?.meta.chapterCount ?? 0) <= 1);
            button.classList.toggle('active', (current?.status === WorkStatus.partiallyRead && getLastReadChapter(current) === currentChapter) || current?.status === WorkStatus.read);
        });
        document.querySelectorAll(`.${makeExtenderClass('do-not-read-btn')}`).forEach(button => button.classList.toggle('active', current?.status === WorkStatus.doNotRead));
        document.querySelectorAll(`.${makeExtenderClass('re-read-plus-btn')}`).forEach(button => button.classList.toggle('invisible', current?.status !== WorkStatus.read));
        document.querySelectorAll(`.${makeExtenderClass('re-read-minus-btn')}`).forEach(button => button.classList.toggle('invisible', (current?.reread ?? 0) < 1));
    };

    const updateAll = (updated: Work) => {
        if (!updated) return;
        current = updated;
        updateButtonStates();
        updateBadgesVisualState(updated, getWorkUpdateTime());
    };

    targets.forEach(target => {
        const readBtn = createStatusButton(getStatusText(WorkStatus.read), 'read-btn', async () => {
            if (!current) return;
            current = await handleToggleStatus(current, WorkStatus.read);
            updateAll(current);
        });

        const chapterReadBtn = createStatusButton(getStatusText(WorkStatus.partiallyRead), 'chapter-read-btn', async () => {
            if (!current) return;
            current = await handleChapterRead(current, currentChapter, chapterWordCount);
            updateAll(current);
        });

        const doNotReadBtn = createStatusButton(getStatusText(WorkStatus.doNotRead), 'do-not-read-btn', async () => {
            if (!current) return;
            current = await handleToggleStatus(current, WorkStatus.doNotRead);
            updateAll(current);
        });

        const rereadBtn = createStatusButton('+ Re-read', 're-read-plus-btn', async () => {
            if (!current) return;
            current = await handleReread(current, true);
            updateAll(current);
        });

        const removeRereadBtn = createStatusButton('- Re-read', 're-read-minus-btn', async () => {
            if (!current) return;
            current = await handleReread(current, false);
            updateAll(current);
        });

        target.append(readBtn, chapterReadBtn, doNotReadBtn, rereadBtn, removeRereadBtn);
    });

    injectStats(current);
    updateAll(current);
};
