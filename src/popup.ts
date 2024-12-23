const button = document.getElementById('button');

function PushMetrics() {
    console.log("Pushing...")
    const url = "http://devbox.mermaid-pike.ts.net:9091"

    fetch( url + "/metrics/job/chrome-exporter", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain"
        },
        body: ``
    })
}



