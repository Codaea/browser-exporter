export const getUUID = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('chrome_exporter_uuid', (items) => {
            let uuid = items.chrome_exporter_uuid;
            // if no uuid, make one
            if (!uuid) {
                uuid = crypto.randomUUID().toString();
                chrome.storage.local.set({ 'chrome_exporter_uuid': uuid }, () => {
                    resolve(uuid);
                });
            } else {
                resolve(uuid);
            }
        });
    });
};

// generate new uuid on request
export const generateNewUuid = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uuid = crypto.randomUUID().toString();
        chrome.storage.local.set({ 'chrome_exporter_uuid': uuid }, () => {
            resolve(uuid);
        });
    });
}

export const getSettings = (): Promise<{ url: string, uuid: string }> => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({
            chrome_exporter_url: "",
        }, (syncItems) => {
            chrome.storage.local.get({
                chrome_exporter_uuid: "",
            }, (localItems) => {
                resolve({
                    url: syncItems.chrome_exporter_url,
                    uuid: localItems.chrome_exporter_uuid
                });
            });
        });
    });
};

export const saveSettings = (url: string, uuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const syncPromise = new Promise<void>((syncResolve, syncReject) => {
            chrome.storage.sync.set({
                chrome_exporter_url: url,
            }, () => {
                syncResolve();
            });
        });

        const localPromise = new Promise<void>((localResolve, localReject) => {
            chrome.storage.local.set({
                chrome_exporter_uuid: uuid,
            }, () => {
                localResolve();
            });
        });

        Promise.all([syncPromise, localPromise]).then(() => {
            resolve();
        });
    });
};