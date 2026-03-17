import { defineBackground } from '#imports';
import browser from 'webextension-polyfill';

const setAdultCookie = async () => {
    await browser.cookies.set({
        url: 'https://archiveofourown.org',
        name: 'view_adult',
        value: 'true',
        path: '/',
    });
    await browser.cookies.set({
        url: 'https://archiveofourown.gay',
        name: 'view_adult',
        value: 'true',
        path: '/',
    });
};

export default defineBackground(() => {
    browser.runtime.onInstalled.addListener(setAdultCookie);
    browser.runtime.onStartup.addListener(setAdultCookie);
});