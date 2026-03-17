import { Work, WorkStatus } from "@/types";
import { handleDownload, handleToggleStatus } from "./handlers";
import { WorksService } from "@/db";
import logger from "../utils/logger";
import { makeExtenderClass } from "./components/elements";
import { createStatusButton } from "./components/buttons";
import { updateBadgesVisualState } from "./components/badges";
import { injectStats } from "./components/stats";
import { getStatusText } from "@/utils/helpers";
import { getWorkUpdateTime } from "@/content/metaData";


export const injectBlurbButtons = (initial: Work, blurb: Element, targetSelector: string, exists: boolean) => {
    let persisted = exists;

    const ensurePersisted = async () => {
        if (!persisted) {
            current.timestamp = Date.now();
            await WorksService.add(current);
            persisted = true;
        }
    };

    let current = initial;
    const target = blurb.querySelector(targetSelector);

    if (!target) {
        logger.warn('No blurb injection target found!');
        return;
    }

    const container = document.createElement('div');
    container.classList.add(makeExtenderClass('list-controls'));

    const updateButtonStates = () => {
        readBtn.querySelector('button')?.classList.toggle('active', current?.status === WorkStatus.read);
        doNotReadBtn.querySelector('button')?.classList.toggle('active', current?.status === WorkStatus.doNotRead);
        downloadBtn.querySelector('button')?.classList.toggle('active', current?.downloaded === true);
    };

    const updateAll = (updated: Work) => {
        if (!updated) return;
        current = updated;
        updateButtonStates();
        updateBadgesVisualState(updated, getWorkUpdateTime(blurb), blurb);
        collapseBlurb(blurb, updated);
    }

    const readBtn = createStatusButton(getStatusText(WorkStatus.read), 'read-btn', async () => {
        if (!current) return;
        await ensurePersisted();
        current = await handleToggleStatus(current, WorkStatus.read);
        updateAll(current);
    });

    const doNotReadBtn = createStatusButton(getStatusText(WorkStatus.doNotRead), 'do-not-read-btn', async () => {
        if (!current) return;
        await ensurePersisted();
        current = await handleToggleStatus(current, WorkStatus.doNotRead);
        updateAll(current);
    });

    const downloadBtn = createStatusButton('↓ Download', 'download-btn', async () => {
        if (!current) return;
        await ensurePersisted();
        current = await handleDownload(current);
        updateAll(current);
    });

    container.append(readBtn, doNotReadBtn, downloadBtn);
    blurb.append(container);
    injectStats(current, blurb);

    updateAll(current);
};

export const collapseBlurb = (blurb: Element, work: Work) => {
    if (![WorkStatus.doNotRead, WorkStatus.read].includes(work.status)) {
        blurb.classList.remove(makeExtenderClass('collapsed'));
        return;
    }

    if (!blurb.classList.contains(makeExtenderClass('collapsed'))){
        blurb.classList.add(makeExtenderClass('collapsed'));
    }

    const label = getCollapseLabel(work);
    const existing = blurb.querySelector(`.${makeExtenderClass('collapse-info')}`);

    if (existing) {
        // just update the label text, don't rebuild
        const span = existing.querySelector('span');
        if (span) span.textContent = label;
        return;
    }

    const info = document.createElement('div');
    info.className = makeExtenderClass('collapse-info');

    if (label) {
        const span = document.createElement('span');
        span.textContent = label;
        info.appendChild(span);
    }

    const header = blurb.querySelector('div.header.module');
    header?.insertAdjacentElement('beforebegin', info);
    header?.addEventListener('click', (e) => {
        if ((e.target as Element).closest('a')) return;
        blurb.classList.toggle(makeExtenderClass('expanded'));
    });
};

const getCollapseLabel = (work: Work): string => {
    const lastEntry = work.chapterHistory.at(-1);
    const ts = Math.max(lastEntry?.timestamp ?? 0, work.timestamp ?? 0) || undefined;
    const date = ts ? new Date(ts).toLocaleDateString() : '';

    if (work.status === WorkStatus.read) {
        return `Read on ${date}`;
    }
    if (work.status === WorkStatus.partiallyRead && lastEntry) {
        return `Last read ${date} — Ch ${lastEntry.chapter}`;
    }
    if (work.status === WorkStatus.doNotRead) {
        return 'Marked: Do Not Read';
    }
    return '';
};