const baseiFrameSrc = 'https://www.tiki-toki.com/timeline/embed/';
const rootTimeline = "2138285/2648138406/";


window.onload = function () {
    // Here is how you would call the libary
    PanZoom(".panzoom");
}

google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(drawChart);

// popup test //document.getElementById("tree-popup").classList.add("hide-popup")

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
        if (document.getElementById("orgchart-container").innerHTML.length > 500){
            initChartPopup(true);
        }
      console.log('Iframe content loaded or reloaded');
        if (chart.getSelection()[0]){
            localStorage.setItem('currentNodeRow', JSON.stringify({row: chart.getSelection()[0].row, isSelected: true, url: ""}));
        }
    };


    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectedTimeline = decodeURI(urlParams.get('newtimeline'));
        //const redirectedTimeline = HttpContext.Current.Request.QueryString("newtimeline")
        if (redirectedTimeline && redirectedTimeline != "null") {
            urlParams.delete("redirectedTimeline");
            console.log('redirectedTimeline: ' + decodeURI(redirectedTimeline));
            redirectiFrames(baseiFrameSrc + redirectedTimeline, redirectedTimeline);
        }
        else {
            redirectiFrames(baseiFrameSrc + rootTimeline, rootTimeline);
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

    console.log('chart drawn');
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
    console.log('redirectiFrames orgChartElId: data-row: ' + orgChartElId + ": " + document.getElementById(orgChartElId).getAttribute("data-row"));
    selectChartItem(document.getElementById(orgChartElId).getAttribute("data-row"));
    captureAndSaveCurrentNodeState();
}

function redirectTimelineiFrame(newUrl) {
    // set timeline target
    document.getElementById('tl-timeline-iframe').src = newUrl;
}

function handleViewChoiceClick(viewChoice, setChecked) {
    let tlFrame = document.getElementById("tl-timeline-iframe");
    let ocEle = document.getElementById("orgchart-container");
    let tpEle = document.getElementById("tree-popup");
    let pu = document.getElementById("tree-popup-btn");
    console.log('handleViewChoiceClick to viewChoice: ' + viewChoice + ', setChecked: ' + setChecked)
    captureAndSaveCurrentNodeState();
    if (viewChoice == "view-tree") {
        tlFrame.classList.remove("fullScreen");
        tlFrame.style.display = "none";
        moveOrgChart(document.getElementById("tree_container"), true, 1)
        ocEle.style.display = "block"; //orgchart-container
        ocEle.classList.add("fullScreen");
        pu.style.display = "none";
        tpEle.style.display = "none";
        if (setChecked) {
            radiobtn = document.getElementById("view-tree");
            radiobtn.checked = true;
        }

        // move chart back home if it was in the popup
        //moveOrgChart(document.getElementById("tree_container"), true, 1)
        }
        else if (viewChoice == "view-timeline") {
            ocEle.classList.remove("fullScreen");
            tlFrame.classList.add("fullScreen");
            tlFrame.style.display = "block";
            pu.style.display = "inline";
            if (setChecked) {
                radiobtn = document.getElementById("view-timeline");
                radiobtn.checked = true;
            }
            initChartPopup(true);
        }
}

