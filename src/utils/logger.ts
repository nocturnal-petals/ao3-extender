import browser from 'webextension-polyfill';

const isDevMode = !('update_url' in browser.runtime.getManifest());
const PREFIX = '[AO3 Extender]';

const logger = {
    info: (message: string, ...args: unknown[]) => {
        if (!isDevMode) return;
        console.info(`${PREFIX} ${message}`, ...args);
    },

    warn: (message: string, ...args: unknown[]) => {
        if (!isDevMode) return;
        console.warn(`${PREFIX} ${message}`, ...args);
    },

    error: (message: string, ...args: unknown[]) => {
        if (!isDevMode) return;
        console.error(`${PREFIX} ${message}`, ...args);
    },
};

export default logger;