import { defineConfig } from 'wxt';

export default defineConfig({
    srcDir: 'src',
    imports: false,
    // webExt: {
    //     startUrls: ['https://archiveofourown.org/works/6092269'],
    // },
    manifest: {
        name: 'AO3 Extender',
        version: '1.0',
        description: 'Track works on ao3 and more!',
        host_permissions: [
            '*://*.archiveofourown.org/*',
            '*://*.archiveofourown.gay/*',
        ],
        permissions: ['cookies', 'webNavigation'],
    },
});