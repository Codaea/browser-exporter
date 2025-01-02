import { getSettings } from "./settings.js";
const url = document.getElementById('url') as HTMLSpanElement;
const uuid = document.getElementById('uuid') as HTMLSpanElement;
const goToOptions = document.getElementById('go-to-options') as HTMLLinkElement;

document.addEventListener('DOMContentLoaded', () => {
    getSettings().then((settings) => {
        url.textContent = settings.url;
        uuid.textContent = settings.uuid;
    });
});

goToOptions.addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
});
