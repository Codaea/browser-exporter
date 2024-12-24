interface Metric {
    name: string;
    value: number;
    type?: 'counter' | 'gauge' | 'histogram';
    buckets?: { [upperBound: number]: number};
}

class MetricsManager {
    metrics: Metric[];
    url: string;
    uuid!: string;

    constructor() {
        this.url = "http://devbox.mermaid-pike.ts.net:9091";
        this.metrics = [];
        this.initializeUUID();
        this.initializeUUID();
    }

    async initializeUUID() {
        this.uuid = await this.getUUID();
    }

    // label to identify the computer to the metrics
    getUUID(): Promise<string> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('chrome_exporter_uuid', (items) => {
                let uuid = items.chrome_exporter_uuid;
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

    /*
    observeHistogram(name: string, value: number, buckets: number[]) {
        let metric = this.metrics.find((metric: Metric) => metric.name === name && metric.type === 'histogram');
        if (!metric) {
            metric = { name: name, value: value, type: 'histogram', buckets: {} };
            for (const bucket of buckets) {
                metric.buckets[bucket] = 0;
            }
            metric.buckets[Infinity] = 0; // for values greater than highest bucket
            this.metrics.push(metric);
        }
        metric.value += value;
        for (const bucket of buckets) {
            if (value <= bucket) {
                metric.buckets[bucket]++;
            }
        }
        this.metrics.buckets[Infinity]++;
    }
    */

    generateMetrics() {
        let output = '';
        for (const metric of this.metrics) {
            if (metric.type === 'counter' || metric.type === 'gauge') {
                output += `# TYPE ${metric.name} ${metric.type}\n${metric.name}{uuid="${this.uuid}"} ${metric.value}\n`;
            } 
            /*
            else if (metric.type === 'histogram') {
                output += `# TYPE ${metric.name} histogram\n`;
                for (const [upperBound, count] of Object.entries(metric.buckets)) {
                    output += `${metric.name}_bucket{le="${upperBound}"} ${count}\n`;
                }
                output += `${metric.name}_count ${metric.value}\n`;
            }
            */
        }
        return output;
    }
}

const metricsManager = new MetricsManager();

function pushMetrics() {
    const url = "http://devbox.mermaid-pike.ts.net:9091"
    const body = metricsManager.generateMetrics();
    console.log("Pushing...")
    console.log(metricsManager.metrics)
    console.log(body)

    fetch(url + "/metrics/job/chrome-exporter", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain"
        },
        body: body
    });
}

// gauge metrics
function setMetrics() {
    // get certain kinds of tabs?
    chrome.tabs.query({}, (tabs) => {
        metricsManager.setGauge('chrome_tabs_open', tabs.length);
    });

    chrome.tabs.query({ active: true }, (tabs) => {
        metricsManager.setGauge('chrome_tabs_active', tabs.length);
    });

    chrome.tabs.query({ muted: true }, (tabs) => {
        metricsManager.setGauge('chrome_tabs_muted', tabs.length);
    });

    // tabs that are unloaded from memory
    chrome.tabs.query({ discarded: true }, (tabs) => {
        metricsManager.setGauge('chrome_tabs_discarded', tabs.length);
    })
    
    // blank tabs
    chrome.tabs.query({ url: 'chrome://newtab/' }, (tabs) => {
        metricsManager.setGauge('chrome_tabs_blank', tabs.length);
    });


    // currently active tab's zoom factor
    chrome.tabs.getZoom((zoomFactor) => {
        metricsManager.setGauge('chrome_tab_zoom_factor', zoomFactor);
    });

    // calculate max zoom factor of all tabs

    // calculate average zoom factor of all tabs

    // calculate min zoom factor of all tabs

    // to get these metrics, we have to inject a script into the tab to fetch the distance.

    // total distance scrolled in all tabs
    /*
    let totalScrollDistance = 0;
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id! }, 
                files : ['pageMetrics.js']
                })
        })
    });

    chrome.runtime.onMessage.addListener((message, sender) => {
        if (message.type === 'scrollDistance') {
            const scrollDistance = message.scrollDistance;
            totalScrollDistance += scrollDistance.y;
        }
    })
    */

    // iframe nesting depth?
    // total distance scrollable in all tabs

    chrome.tabs.query

    chrome.windows.getAll({}, (windows) => {
        metricsManager.setGauge('chrome_windows_open', windows.length);
    });

    chrome.bookmarks.getTree((bookmarksTreeNodes) => {
        const countBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]): number => nodes.reduce((count, node) => {
            return count + (node.children ? countBookmarks(node.children) : 1);
        }, 0);
        metricsManager.setGauge('chrome_bookmarks', countBookmarks(bookmarksTreeNodes));
    });

    /* // chrome is gaslighting me, this does exist in the api. https://developer.chrome.com/docs/extensions/reference/api/readingList
    chrome.readingList.query({}, (readingListItems: ) => {
        metricsManager.setGauge('chrome_reading_list_total', readingListItems.length);
    })
    */

    chrome.management.getAll((extensions) => {
        metricsManager.setGauge('chrome_extensions', extensions.length);
    });

    chrome.downloads.search({ state: 'in_progress' }, (downloads) => {
        metricsManager.setGauge('chrome_downloads_in_progress', downloads.length);
    });

    chrome.system.memory.getInfo((info) => {
        metricsManager.setGauge('chrome_memory_available_bytes', info.availableCapacity);
        metricsManager.setGauge('chrome_memory_existing_bytes', info.capacity);
    });

}

// incremented counters
chrome.tabs.onCreated.addListener(() => {
    metricsManager.incrementCounter('chrome_tabs_opened', 1);
    console.log("Tab created")
});

chrome.tabs.onRemoved.addListener(() => {
    metricsManager.incrementCounter('chrome_tabs_closed', 1);
    console.log("Tab removed")
});

chrome.bookmarks.onCreated.addListener(() => {
    metricsManager.incrementCounter('chrome_bookmarks_created', 1);
})

chrome.bookmarks.onChanged.addListener(() => {
    metricsManager.incrementCounter('chrome_bookmarks_changed', 1);
});

chrome.bookmarks.onChanged.addListener(() => {
    metricsManager.incrementCounter('chrome_bookmarks_changed', 1);
});

chrome.bookmarks.onRemoved.addListener(() => {
    metricsManager.incrementCounter('chrome_bookmarks_removed', 1);
});

chrome.webRequest.onCompleted.addListener(() => {
    metricsManager.incrementCounter('chrome_webrequests_completed_total', 1);
}, { urls: ["<all_urls>"] });

chrome.webRequest.onErrorOccurred.addListener(() => {
    metricsManager.incrementCounter('chrome_webrequests_error_total', 1);
}, { urls : ["<all_urls>"] });


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
