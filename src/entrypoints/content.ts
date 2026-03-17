import { initDb } from '../db';
import { handleListPage, handleUserDashboard, handleWorkPage } from '../pages';

export default defineContentScript({
    matches: [
        '*://*.archiveofourown.org/tags/*',
        '*://*.archiveofourown.org/users/*',
        '*://*.archiveofourown.org/series/*',
        '*://*.archiveofourown.org/bookmarks*',
        '*://*.archiveofourown.org/works*',
        '*://*.archiveofourown.org/collections/*',
        '*://*.archiveofourown.gay/tags/*',
        '*://*.archiveofourown.gay/users/*',
        '*://*.archiveofourown.gay/series/*',
        '*://*.archiveofourown.gay/bookmarks*',
        '*://*.archiveofourown.gay/works*',
        '*://*.archiveofourown.gay/collections/*',
    ],
    runAt: 'document_idle',
    async main() {
        await initDb();
        const path = window.location.pathname;
        const isWorkPage = /^\/works\/\d+/.test(path) && !path.includes('works/new');
        const isDashboard = /\/users\/[^/]+(\/dashboard)?$/.test(path);
        if (isWorkPage) handleWorkPage();
        else if (isDashboard) handleUserDashboard();
        else handleListPage();
    },
});