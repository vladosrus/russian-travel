import { translations } from './translations.js';

const DEFAULT_LANG = 'ru';
const STORAGE_KEY = 'russian-travel:lang';
const ACTIVE_LINK_CLASS = 'header__lang-link_active';

// Какой атрибут элемента переводим: data-i18n — текст, остальные — атрибуты.
const bindings = [
    { selector: '[data-i18n]', key: 'i18n', apply: (el, value) => { el.textContent = value; }, read: (el) => el.textContent },
    { selector: '[data-i18n-alt]', key: 'i18nAlt', apply: (el, value) => { el.alt = value; }, read: (el) => el.alt },
    { selector: '[data-i18n-content]', key: 'i18nContent', apply: (el, value) => { el.content = value; }, read: (el) => el.content },
];

const langLinks = document.querySelectorAll('.header__lang-link[data-lang]');

// Русский словарь собираем из исходной разметки, чтобы не дублировать тексты.
function collectDefaultDictionary() {
    const dictionary = {};
    bindings.forEach(({ selector, key, read }) => {
        document.querySelectorAll(selector).forEach((el) => {
            dictionary[el.dataset[key]] ??= read(el);
        });
    });
    return dictionary;
}

translations[DEFAULT_LANG] = collectDefaultDictionary();

function getSavedLang() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function saveLang(lang) {
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // localStorage может быть недоступен (приватный режим) — просто не запоминаем выбор.
    }
}

function setLanguage(lang) {
    const dictionary = translations[lang];
    if (!dictionary) return;

    bindings.forEach(({ selector, key, apply }) => {
        document.querySelectorAll(selector).forEach((el) => {
            const value = dictionary[el.dataset[key]];
            if (value !== undefined) apply(el, value);
        });
    });

    document.documentElement.lang = lang;

    langLinks.forEach((link) => {
        const isActive = link.dataset.lang === lang;
        link.classList.toggle(ACTIVE_LINK_CLASS, isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    saveLang(lang);
}

langLinks.forEach((link) => {
    link.addEventListener('click', (evt) => {
        evt.preventDefault();
        setLanguage(link.dataset.lang);
    });
});

setLanguage(getSavedLang() ?? DEFAULT_LANG);
