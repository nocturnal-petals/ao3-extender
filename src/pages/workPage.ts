import { WorksService } from "../db";
import { Work, WorkStatus } from "../types/work";
import { injectButtons } from "../ui/workFunctions";
import { extractMetaData } from "../content/metaData";
import logger from "../utils/logger"
import { createBackToTopButton } from "@/ui/components/buttons";
import { getLoggedInUsername } from "@/content/metaData";

const BUTTON_TARGETS = [
    'ul.work.navigation.actions',
    'div.feedback ul.actions',
];

export const handleWorkPage = async () => {
    logger.info('Handling work page!');

    createBackToTopButton();
    const metaData = extractMetaData();
    if (!metaData) return;

    const currentChapter = parseInt(document?.querySelector('div.chapter.preface.group')?.parentElement?.getAttribute('id')?.split('-')[1] ?? '0') || 0;
    const chapterText = document.querySelector('div.userstuff')?.textContent ?? '';
    const chapterWordCount = chapterText.trim() ? chapterText.trim().split(/\s+/).length : 0;

    const existing = await WorksService.get(metaData.workId);

    const work: Work = existing ?? {
        ...metaData,
        reread: 0,
        status: WorkStatus.seen,
        timestamp: Date.now(),
        kudos: false,
        downloaded: false,
        chapterHistory: [],
    };

    if (work.status === WorkStatus.listOnly) {
        work.status = WorkStatus.seen;
        work.timestamp = Date.now();
        await WorksService.edit(work.workId, { status: WorkStatus.seen, timestamp: Date.now() });
    }

    await WorksService.upsert(work);
    const username = getLoggedInUsername();

    if (username && !work.kudos && document.querySelector(`#kudos a[href="/users/${username}"]`)) {
        work.kudos = true;
        await WorksService.edit(work.workId, { kudos: true });
    }

    const updateAll = injectButtons(work, currentChapter, chapterWordCount, BUTTON_TARGETS);
    if (!updateAll) return;

    document.querySelector('#kudo_submit')?.addEventListener('click', async () => {
        if (work.kudos) return;
        work.kudos = true;
        await WorksService.edit(work.workId, { kudos: true });
        updateAll(work);
    });
}