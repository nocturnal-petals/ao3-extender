import { extractMetaData } from "@/content/metaData";
import { WorksService } from "@/db";
import { Work, WorkStatus } from "@/types";
import { injectBlurbButtons } from "@/ui/listFunctions";
import logger from "@/utils/logger";

const BUTTON_TARGET = 'div.header.module';

export const handleListPage = async () => {
    logger.info('Handling list page!');

    const initialBlurbs = [...document.querySelectorAll('li.work.blurb, li.bookmark.blurb')];
    await processBlurbs(initialBlurbs);
}

export const processBlurbs = async (blurbElements: Element[]) => {

    for (const blurb of blurbElements) {
        if (blurb.getAttribute('ao3-extender-processed')) continue;

        const metaData = extractMetaData(blurb);
        if (!metaData) continue;

        const existing = await WorksService.get(metaData.workId);

        if (!existing) {
            const newWork: Work = {
                ...metaData,
                reread: 0,
                status: WorkStatus.seen,
                kudos: false,
                downloaded: false,
                chapterHistory: [],
            };
            injectBlurbButtons(newWork, blurb, BUTTON_TARGET, false);
        } else {
            injectBlurbButtons(existing, blurb, BUTTON_TARGET, true);
        }
    }
}