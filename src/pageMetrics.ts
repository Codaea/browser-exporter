// script injected into browser that measures length of tab scrolled
(function () {
    const scrollDistance = {
        x: window.scrollX,
        y: window.scrollY
    };

    chrome.runtime.sendMessage({
        type: 'scrollDistance',
        scrollDistance
    })
})