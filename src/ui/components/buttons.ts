import { makeExtenderClass } from "./elements";

export const createStatusButton = (label: string, classItem: string, onClick: () => void): HTMLLIElement => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = label;
    button.classList.add(makeExtenderClass(classItem));
    button.classList.add(makeExtenderClass('btn'));
    button.addEventListener('click', onClick);
    li.append(button);
    return li;
};