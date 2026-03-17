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