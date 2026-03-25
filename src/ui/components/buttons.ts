import { getStatusLabel } from "@/utils";
import { makeExtenderClass } from "./elements";
import { Work, WorkStatus } from "@/types";
import { createIconLabel } from "./icons";
import { handleChapterRead, handleDoNotRead, handleDownload, handleOnHold, handleToggleStatus } from "../handlers";

export const createStatusButton = (label: string | Element, classItem: string, onClick: () => void): HTMLLIElement => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    (label instanceof Element) ? button.append(label) : button.textContent = label;
    button.classList.add(makeExtenderClass(classItem));
    button.classList.add(makeExtenderClass('btn'));
    button.addEventListener('click', onClick);
    li.append(button);
    return li;
};

export const createBackToTopButton = () => {
    if (document.getElementById(makeExtenderClass('back-to-top'))) return;

    const btn = document.createElement('a');
    btn.id = makeExtenderClass('back-to-top');
    btn.href = '#';
    btn.textContent = '↑';
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(btn);
    window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400));
};

export const createDoNotReadButton = (getCurrent: () => Work, updateAll: (work: Work, persisted: boolean) => void, ensurePersisted: () => Promise<boolean> | boolean) => {
    return createStatusButton(createIconLabel('ban', 'Mark Hidden') || 'Mark Hidden', 'do-not-read-btn', async () => {
        const persisted = await ensurePersisted();
        const updated = await handleDoNotRead(getCurrent());
        updateAll(updated, persisted);
    });
}

export const createOnHoldButton = (getCurrent: () => Work, updateAll: (work: Work, persisted: boolean) => void, ensurePersisted: () => Promise<boolean> | boolean) => {
    return createStatusButton(createIconLabel('pause', 'Mark On Hold') || 'Mark On Hold', 'on-hold-btn', async () => {
        const persisted = await ensurePersisted();
        const updated = await handleOnHold(getCurrent());
        updateAll(updated, persisted);
    });
}

export const createReadButton = (getCurrent: () => Work, updateAll: (work: Work, persisted: boolean) => void, ensurePersisted: () => Promise<boolean> | boolean) => {
    return createStatusButton(getStatusLabel(WorkStatus.read) || 'Read', 'read-btn', async () => {
        const persisted = await ensurePersisted();
        const updated = await handleToggleStatus(getCurrent(), WorkStatus.read);
        updateAll(updated, persisted);
    });
}

export const createDownloadButton = (getCurrent: () => Work, updateAll: (work: Work, persisted: boolean) => void, ensurePersisted: () => Promise<boolean> | boolean) => {
    return createStatusButton(createIconLabel('download', 'Download'), 'download-btn', async () => {
        const persisted = await ensurePersisted();
        const updated = await handleDownload(getCurrent());
        updateAll(updated, persisted);
    });
}

export const createChapterRead = (getCurrent: () => Work, updateAll: (work: Work, persisted: boolean) => void, ensurePersisted: () => Promise<boolean> | boolean, currentChapter: number, chapterWordCount: number) => {
    return createStatusButton(getStatusLabel(WorkStatus.partiallyRead) || 'Chapter Read', 'chapter-read-btn', async () => {
        const persisted = await ensurePersisted();
        const updated = await handleChapterRead(getCurrent(), currentChapter, chapterWordCount);
        updateAll(updated, persisted);
    });
}