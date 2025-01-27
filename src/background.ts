import { getUUID, getSettings, generateNewUuid } from "./settings.js";
interface Metric {
    name: string;
    value: number;
    type?: 'counter' | 'gauge' | 'histogram';
    buckets?: { [upperBound: number]: number };
}

class MetricsManager {
    metrics: Metric[];

    constructor() {
        this.metrics = [];
    }

    incrementCounter(name: string, value = 1) {
        const metricIndex = this.metrics.findIndex((metric: Metric) => metric.name === name && metric.type === 'counter');
        if (metricIndex === -1) { // create metric if it doesn't exist
            this.metrics.push({ name: name, value: value, type: 'counter' });
        } else {
            this.metrics[metricIndex].value += value;
        }
    }

    setGauge(name: string, value: number) {
        const metricIndex = this.metrics.findIndex((metric: Metric) => metric.name === name && metric.type === 'gauge');
        if (metricIndex === -1) {
            this.metrics.push({ name: name, value: value, type: 'gauge' });
        } else {
            this.metrics[metricIndex].value = value;
        }
    }

    async generateMetrics() {
        let output = '';
        for (const metric of this.metrics) {
            if (metric.type === 'counter' || metric.type === 'gauge') {
                output += `# TYPE ${metric.name} ${metric.type}\n${metric.name} ${metric.value}\n`;
            }
        }
        return output;
    }
}

const metricsManager = new MetricsManager();

async function pushMetrics() {
    const settings = await getSettings()
    const uuid = await getUUID(); // get latest and greatest uuid
    const body = await metricsManager.generateMetrics();

    fetch(settings.url + "/metrics/job/browser-exporter/instance/" + uuid , {
        method: "POST",
        headers: {
            "Content-Type": "text/plain"
        },
        body: body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log("Metrics pushed successfully:", data);
        })
        .catch(error => {
            console.error("Failed to push metrics:", error);
        });
}

// gauge metrics
function setMetrics() {
    // get certain kinds of tabs?
    chrome.tabs.query({}, (tabs) => {
        metricsManager.setGauge('browser_tabs_open', tabs.length);
    });

    chrome.tabs.query({ active: true }, (tabs) => {
        metricsManager.setGauge('browser_tabs_active', tabs.length);
    });

    chrome.tabs.query({ muted: true }, (tabs) => {
        metricsManager.setGauge('browser_tabs_muted', tabs.length);
    });

    // tabs that are unloaded from memory
    chrome.tabs.query({ discarded: true }, (tabs) => {
        metricsManager.setGauge('browser_tabs_discarded', tabs.length);
    })

    // blank tabs
    chrome.tabs.query({ url: 'chrome://newtab/' }, (tabs) => {
        metricsManager.setGauge('browser_tabs_blank', tabs.length);
    });


    // currently active tab's zoom factor
    chrome.tabs.getZoom((zoomFactor) => {
        metricsManager.setGauge('browser_tab_zoom_factor', zoomFactor);
    });

    chrome.windows.getAll({}, (windows) => {
        metricsManager.setGauge('browser_windows_open', windows.length);
    });

    chrome.bookmarks.getTree((bookmarksTreeNodes) => {
        const countBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): number => nodes.reduce((count, node) => {
            return count + (node.children ? countBookmarks(node.children) : 1);
        }, 0);
        metricsManager.setGauge('browser_bookmarks', countBookmarks(bookmarksTreeNodes));
    });

    chrome.system.memory.getInfo((info) => {
        metricsManager.setGauge('browser_memory_available_bytes', info.availableCapacity);
        metricsManager.setGauge('browser_memory_existing_bytes', info.capacity);
    });

}

// incremented counters
chrome.tabs.onCreated.addListener(() => {
    metricsManager.incrementCounter('browser_tabs_opened', 1);
    console.log("Tab created")
});

chrome.tabs.onRemoved.addListener(() => {
    metricsManager.incrementCounter('browser_tabs_closed', 1);
    console.log("Tab removed")
});

chrome.tabs.onActivated.addListener((tab) => {
    metricsManager.incrementCounter('browser_tabs_changed', 1);
    metricsManager.setGauge('browser_tabs_currentactive', tab.tabId);
})

chrome.bookmarks.onCreated.addListener(() => {
    metricsManager.incrementCounter('browser_bookmarks_created', 1);
})

chrome.bookmarks.onChanged.addListener(() => {
    metricsManager.incrementCounter('browser_bookmarks_changed', 1);
});

chrome.bookmarks.onRemoved.addListener(() => {
    metricsManager.incrementCounter('browser_bookmarks_removed', 1);
});

chrome.windows.onCreated.addListener(() => {
    metricsManager.incrementCounter('browser_windows_opened', 1);
});

chrome.windows.onRemoved.addListener(() => {
    metricsManager.incrementCounter('browser_windows_closed', 1);
});

chrome.webRequest.onCompleted.addListener(() => {
    metricsManager.incrementCounter('browser_webrequests_completed_total', 1);
}, { urls: ["<all_urls>"] });

chrome.webRequest.onErrorOccurred.addListener(() => {
    metricsManager.incrementCounter('browser_webrequests_error_total', 1);
}, { urls: ["<all_urls>"] });


// alarms for pushing metrics
chrome.alarms.create('pushMetrics', { periodInMinutes: 0.5 }); // 30 seconds is the minimum interval between alarms see https://developer.chrome.com/docs/extensions/reference/api/alarms

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pushMetrics') {// does both
        if (alarm.scheduledTime >= Date.now() - 1000) { // if the alarm was delayed by more than 1 second, ignore, we don't want mass firing when device wakes up. https://developer.chrome.com/docs/extensions/reference/api/alarms#device_sleep
            setMetrics();
            pushMetrics();
        }
    }
});

// on first install, redirect users to options page
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        generateNewUuid(); // so when we get to settings uuid isn't blank
        chrome.tabs.create({ url: chrome.runtime.getURL('/src/options.html') });
    }
})
