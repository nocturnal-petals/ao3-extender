
export const makeExtenderClass = (classString: string) => {
    return 'ao3-extender-' + classString;
}

export const createStatDiv = (label: string, content: string | Element, classItem: string) => {
    const dt = Object.assign(document.createElement('dt'), { textContent: label });
    const div = document.createElement('div');
    div.classList.add(makeExtenderClass(classItem));

    if (typeof content === 'string') {
        const dd = Object.assign(document.createElement('dd'), { textContent: content });
        div.append(dt, dd);
    } else {
        div.append(dt, content);
    }

    return div;
}
