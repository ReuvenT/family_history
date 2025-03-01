const baseTimelineUrl = 'https://www.tiki-toki.com/timeline/embed/';
const rootTimeline = "2138285/2648138406/";


window.onload = function () {
    // Here is how you would call the libary
    PanZoom(".panzoom");
}

localStorage.setItem('selectedOrgItem', null);

google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(drawChart);

document.getElementById("tree-popup").classList.add("hide-popup")

document.addEventListener('DOMContentLoaded', function () {
    console.log("parent document ready");
    window.addEventListener('message',
        (event) => {
            console.log("someone's calling the parent method with event data " + JSON.stringify(event.data));
            if (event.data.from === 'org-chart' && event.data.url) {
                redirectTimelineiFrame(event.data.url)
            }
        },
        false
    );

    const iframe = document.getElementById('tl-timeline-iframe');
    //const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    iframe.addEventListener('load', () => {
        console.log('iFrame loaded');
    });

    iframe.onload = function () {
        console.log('Iframe content loaded or reloaded');
    };


    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectedTimeline = decodeURI(urlParams.get('newtimeline'));
        //const redirectedTimeline = HttpContext.Current.Request.QueryString("newtimeline")
        if (redirectedTimeline && redirectedTimeline != "null") {
            urlParams.delete("redirectedTimeline");
            console.log('redirectedTimeline: ' + decodeURI(redirectedTimeline));
            redirectiFrames(baseTimelineUrl + redirectedTimeline, redirectedTimeline);
        }
        else {
            redirectiFrames(baseTimelineUrl + rootTimeline, rootTimeline);
        }
    }, 250);
}, false);

async function drawChart() {
    let fName = "/data/familytreedata.csv";
    const response = await fetch(fName);
    const data = await response.text();

    if (response.status > 200) {
        document.getElementById("err_msg").innerHTML = data;
        //alert ("failed to load tree data from " + fName);
    }

    var renderedTable = prepChartTable(data, new google.visualization.DataTable())

    // Create the chart.
    chart = new google.visualization.OrgChart(document.getElementById('chart_container'));

    google.visualization.events.addListener(chart, 'select', treeSelectHandler);

    var drawOptions = { allowHtml: true, allowCollapse: true, tooltip: { isHtml: true } };

    // Draw the chart, setting the allowHtml option to true for the tooltips.
    chart.draw(renderedTable, drawOptions);
}

if (window.postMessage) {
    var tlMouseupFunc = function () {
        var tlFrame = document.getElementById("tl-timeline-iframe");
        if (tlFrame.contentWindow && tlFrame.contentWindow.postMessage) {
            tlFrame.contentWindow.postMessage("mouseup", "*");
        }
    }
    if (typeof window.addEventListener != "undefined") {
        window.addEventListener("mouseup", tlMouseupFunc, false);
    }
    else if (typeof window.attachEvent != "undefined") {
        window.attachEvent("onmouseup", tlMouseupFunc);
    }
}

function redirectiFrames(timeframeUrl, orgChartElId) {
    redirectTimelineiFrame(timeframeUrl);
    navigateToNode(orgChartNodeId, false);
}

function redirectTimelineiFrame(newUrl) {
    // set timeline target
    document.getElementById('tl-timeline-iframe').src = newUrl;
}

function handleViewChoiceClick(viewChoice, setTimelineChecked) {
    let tlFrame = document.getElementById("tl-timeline-iframe");
    let ocEle = document.getElementById("orgchart-container");
    let tpEle = document.getElementById("tree-popup");
    let pu = document.getElementById("tree-popup-btn");
    console.log('handleViewChoiceClick to viewChoice: ' + viewChoice + ', setTimelineChecked: ' + setTimelineChecked)
    if (viewChoice == "view-tree") {
        tlFrame.classList.remove("fullScreen");
        tlFrame.style.display = "none";
        ocEle.style.display = "block"; //orgchart-container
        ocEle.classList.add("fullScreen");
        pu.style.display = "none";
        tpEle.style.display = "none";
        // move chart back home if it was in the popup
        let tpSource = document.getElementById("popup-content-target");
        let ocTarget = document.getElementById("chart-content-target");
        if (tpSource.innerHTML.length > 1000){
            console.log('handleViewChoiceClick moving from popup back to chart container ');
            ocTarget.appendChild(tpSource.firstElementChild);
        }
    }
        else if (viewChoice == "view-timeline") {
            ocEle.classList.remove("fullScreen");
            tlFrame.classList.add("fullScreen");
            tlFrame.style.display = "block";
            pu.style.display = "inline";
            if (setTimelineChecked) {
                radiobtn = document.getElementById("view-timeline");
                radiobtn.checked = true;
            }
            // if popup was previously displayed, re-show it
            if (Boolean(localStorage.getItem("treePopupUsed"))){
                openOrgChartPopup()
            }
        }
}

function openOrgChartPopup(){
    radiobtn = document.getElementById("view-timeline");
    let tpEle = document.getElementById("tree-popup");
    let tpTarget = document.getElementById("popup-content-target");
    let ocEle= document.getElementById("orgchart-container");
    let ocSource = document.getElementById("chart-content-target");
    if (radiobtn.checked){
        console.log('openOrgChartPopup radiobtn.checked: ' + radiobtn.checked)
        ocEle.style.display = "block";
        tpEle.style.display = "block";
        tpTarget.appendChild(ocSource.firstElementChild);
        localStorage.setItem("treePopupUsed", 'true');
    }
}

function orgChartPopupClosed(){
    localStorage.setItem("treePopupUsed", 'false');
}