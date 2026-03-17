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
