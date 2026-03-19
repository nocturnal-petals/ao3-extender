import { Work } from "../types/work";
import logger from "../utils/logger";

export const getLastReadChapter = (work: Work): number =>
  work.chapterHistory.at(-1)?.chapter ?? 0;

export const getChapterWordCount = (): number => {
  // TODO: probably won't work on "Entire Work"
    const text = document.querySelector('div#chapters div.userstuff')?.textContent 
        ?? document.querySelector('div.userstuff')?.textContent 
        ?? '';
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export const getWorkIdFromUrl = (url: string): string | null => {
    const match = url.match(/works\/(\d+)/);
    return match ? match[1] : null;
};

export const getWorkUpdateTime = (context: Element | Document = document): number => {
    const isDocument = context === document || context instanceof Document;
    const raw = isDocument ? (document.querySelector('dd.status')
        ?? document.querySelector('dd.published')) : context.querySelector('p.datetime');
    if (!raw) return 0;
    const t = new Date(raw.textContent?.trim()).getTime();
    return t > 0 ? t : 0;
};

export const getChapterPublishDate = async (workId: string, chapterLink: string) => {
    try {
        const res = await fetch(`/works/${workId}/navigate`);
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const link = doc.querySelector(`ol.chapter.index.group li a[href="${chapterLink}"]`);
        const span = link?.parentElement?.querySelector('span');
        if (span) return span.textContent.replace(/[()]/g, '');
    } catch { /* skip on error */ }
}

export const extractMetaData = (context: Document | Element = document): Omit<Work, 'status' | 'kudos' | 'downloaded' | 'reread' | 'timestamp'> | null => {
  const isDocument = context === document || context instanceof Document;
  const workId = isDocument
    ? getWorkIdFromUrl(window.location.href)
    : getWorkIdFromUrl(context.querySelector('h4.heading a[href*="/works/"]')?.getAttribute('href') ?? '');

  if (!workId) return null;

  try {
    let title = 'Unknown Work';
    let author = 'Anonymous';
    let fandom = 'Uncategorized';
    let chapterCount = 1;

    const wordCountWork = parseInt(context.querySelector('dd.words')?.textContent?.replace(/[,\s]/g, '') ?? '0');
    const chapterText = context.querySelector('dd.chapters')?.textContent?.trim() ?? '1';

    const mFull = chapterText.match(/(\d+)\s*\/\s*(\d+)/);
    const mUnknown = chapterText.match(/(\d+)\s*\/\s*\?/);
    if (mFull) chapterCount = parseInt(mFull[2], 10);
    else if (mUnknown) chapterCount = parseInt(mUnknown[1], 10);
    else chapterCount = parseInt(chapterText, 10) || 1;

    if (isDocument) {
      title = document.querySelector('h2.title')?.textContent.trim() ?? title;
      author = document.querySelector('h3.byline a')?.textContent.trim()
        ?? document.querySelector('h3.byline')?.textContent.replace('by', '').trim()
        ?? author;
      fandom = document.querySelector('.fandom ul li a')?.textContent.trim() ?? fandom;
    } else {
      title = context.querySelector('h4.heading a[href*="/works/"]')?.textContent.trim() ?? title;
      author = context.querySelector('h4.heading a[href*="/users/"]')?.textContent.trim() ?? author;
      fandom = context.querySelector('h5.fandoms a')?.textContent.trim() ?? fandom;
    }

    return {
      workId,
      chapterHistory: [],
      meta: {
        title: title,
        author: author,
        wordCount: wordCountWork,
        fandom: fandom,
        chapterCount: chapterCount,
        isCompleted: mFull ? parseInt(mFull[1], 10) === parseInt(mFull[2], 10) : false,
      }
    };

  } catch (err) {
    logger.warn('Metadata extraction failed:', err);
    return null;
  }
}

export const getLoggedInUsername = () => {
  return document.querySelector('#greeting a[href^="/users/"]')
        ?.getAttribute('href')?.split('/users/')[1]?.split('/')[0];
}
