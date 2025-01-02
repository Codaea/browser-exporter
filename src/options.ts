import { getSettings, saveSettings, generateNewUuid } from './settings.js';

const urlEl = document.getElementById("url") as HTMLInputElement;
const uuidEl = document.getElementById("uuid") as HTMLSpanElement;

// on pageload, populate the form with the current settings
document.addEventListener("DOMContentLoaded", () => {
    getSettings().then((settings) => {
        urlEl.value = settings.url;
        uuidEl.textContent = settings.uuid;
    });
});

// save url when button is clicked
const saveButton = document.getElementById("save") as HTMLButtonElement;
saveButton.addEventListener("click", () => {
saveSettings(urlEl.value, uuidEl.textContent || "").then(() => {
        const status = document.getElementById("status");
        if (status) {
            status.textContent = "Options saved.";
            setTimeout(() => {
                status.textContent = "";
            }, 750);
        }
    });
})

// handle new uuid button
const newUuidButton = document.getElementById("new-uuid");
if (newUuidButton) {
    newUuidButton.addEventListener("click", () => {
        generateNewUuid().then((newUuid) => {
            uuidEl.textContent = newUuid;
        });
    });
}