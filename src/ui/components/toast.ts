import { makeExtenderClass } from './elements';

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export const showToast = (message: string, duration = 3000) => {
    let toastBar = document.getElementById(makeExtenderClass('toast-bar')) as HTMLElement | null;
    let toast = document.getElementById(makeExtenderClass('toast')) as HTMLElement | null;

    if (!toastBar) {
        toastBar = document.createElement('div');
        toastBar.id = makeExtenderClass('toast-bar');
        toast = document.createElement('div');
        toast.id = makeExtenderClass('toast');
        toastBar.appendChild(toast);
        document.body.appendChild(toastBar);
    }

    if (!toast) return;

    if (toastTimeout) clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast!.classList.remove('show'), duration);
};