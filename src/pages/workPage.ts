import { WorksService } from "../db";
import { Work, WorkStatus } from "../types/work";
import { injectButtons } from "../ui/workFunctions";
import { extractMetaData } from "../content/metaData";
import logger from "../utils/logger"
import { injectStats } from "@/ui/components/stats";

const BUTTON_TARGETS = [
    'ul.work.navigation.actions',
    'div.feedback ul.actions',
];

export const handleWorkPage = async () => {
    logger.info('Handling work page!');

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
        kudos: false,
        downloaded: false,
        chapterHistory: [],
    };

    await WorksService.upsert(work);
    injectButtons(work, currentChapter, chapterWordCount, BUTTON_TARGETS);
}