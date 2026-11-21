import { useEffect } from 'react';

const LANGUAGES = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['te', 'తెలుగు'],
  ['ta', 'தமிழ்'],
  ['kn', 'ಕನ್ನಡ'],
  ['ml', 'മലയാളം'],
  ['bn', 'বাংলা'],
  ['es', 'Español']
];

let dictionary = null;
let currentLanguage = sessionStorage.getItem('huq_language') || 'en';

function hash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

function normalize(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

function translateText(text) {
  if (!dictionary) return text;
  const translated = dictionary[hash(normalize(text))];
  return translated || text;
}

export function useLanguage() {
  useEffect(() => {
    const records = new WeakMap();
    const attrs = ['aria-label', 'title', 'placeholder'];

    const translateNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.closest('[translate="no"]')) return;
      if (node.nodeType === Node.TEXT_NODE && node.parentElement?.closest('[translate="no"]')) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const original = records.get(node) || node.nodeValue;
        if (!records.has(node)) records.set(node, original);
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        const translated = translateText(normalize(original));
        const wanted = translated === normalize(original) ? original : leading + translated + trailing;
        if (node.nodeValue !== wanted) node.nodeValue = wanted;
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      attrs.forEach((attr) => {
        if (!node.hasAttribute(attr)) return;
        const raw = node.getAttribute(attr);
        node.setAttribute(attr, translateText(normalize(raw)) || raw);
      });
      node.childNodes.forEach(translateNode);
    };

    const translateDocument = () => translateNode(document.body);
    const observer = new MutationObserver((changes) => {
      changes.forEach((change) => {
        change.addedNodes.forEach((node) => translateNode(node));
        if (change.type === 'characterData') translateNode(change.target);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    window.addEventListener('huq-language-change', translateDocument);
    return () => {
      observer.disconnect();
      window.removeEventListener('huq-language-change', translateDocument);
    };
  }, []);
}

export async function setLanguage(code) {
  const next = LANGUAGES.some(([value]) => value === code) ? code : 'en';
  currentLanguage = next;
  dictionary = null;
  sessionStorage.setItem('huq_language', next);
  document.documentElement.lang = next;
  document.documentElement.dataset.script = {
    hi: 'deva', te: 'telu', ta: 'taml', kn: 'knda', ml: 'mlym', bn: 'beng'
  }[next] || 'latin';
  window.dispatchEvent(new CustomEvent('huq-language-change', { detail: { code: next } }));
  if (next !== 'en') {
    try {
      const response = await fetch(`/i18n/${next}.json`);
      if (response.ok) dictionary = await response.json();
    } catch (error) {
      console.warn(`Could not load ${next} translations.`, error);
    }
  }
  window.dispatchEvent(new CustomEvent('huq-language-change', { detail: { code: next } }));
}

export function getLanguage() {
  return currentLanguage || sessionStorage.getItem('huq_language') || 'en';
}

export { LANGUAGES };
