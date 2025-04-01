const baseiFrameSrc = 'https://www.tiki-toki.com/timeline/embed/';
let rootTimeline = "2138285/2648138406/";


window.onload = function () {
    drawChart().then(result => {
        let itemCount = (JSON.stringify(result).match(/\"id\":/g) || []).length;
        let leafCount = (JSON.stringify(result).match(/isLeaf\":true/g) || []).length; // (JSON.stringify(result).match(/isLeaf\":true /g) || []).length;;
        console.log("chartTable row count: " + itemCount + ", leaf count: " + leafCount);

        if (result.length) {
            let htmlTable = createTable(result[0], result[0].children.length, 0);
            let container = document.getElementById("chart_container");
            container.appendChild(htmlTable);

            let rootDiv = document.querySelectorAll("[data-parentId='root']")[0];
            rootTimeline = rootDiv.getAttribute('data-timelineid');
            var style = rootDiv.currentStyle || window.getComputedStyle(rootDiv);
            rootMarginDiff = 12; //style.marginTop;

            alignChildrenRows('root');
        }
    })
        .catch(error => {
            // Handle errors here
            console.error(error);
        });

    PanZoom(".panzoom");
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("parent document ready");
    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectedTimeline = decodeURI(urlParams.get('newtimeline'));
        var displayPopup = false;
        var storedSelection = getChartViewState();
        if (redirectedTimeline && redirectedTimeline != "null") {
            urlParams.delete("redirectedTimeline");
            console.log('redirectedTimeline: ' + decodeURI(redirectedTimeline));
            storedSelection.timelineId = redirectedTimeline;
        }
        else {
            console.log("default launch " + storedSelection.currentId + " with timelineId " + storedSelection.timelineId);
            if (storedSelection.timelineId == null) {
                storedSelection.timelineId = "2138285/2648138406/";
            }
        }

        if (storedSelection.currentId) {
            if (storedSelection.isSelected) {
                nodeIdSetSelected(storedSelection.currentId);
            }
            if (storedSelection.popUpShown) {
                displayPopup = true;
                storedSelection.popUpShown = false;
            }
        }
        if (!storedSelection.timelineId) {
            storedSelection.timelineId = rootTimeline;
        }
        setChartViewState(storedSelection);
        redirectiFrames(baseiFrameSrc + storedSelection.timelineId, storedSelection.timelineId);

        // restore popup if needed
        setTimeout((id) => {
            if (displayPopup) {
                openOrgChartPopup();
                showNode(document.getElementById(id), false);
            }
            else {
                setTimeout((id) => {
                    document.getElementById("orgchart-container").style.display = "block";
                }, 1500);
            }
        }, 500, storedSelection.currentId);

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
    else {
        console.log('chart drawn');
        return prepChartTable(data)
    }
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
    //captureAndSaveChartState();
    let timelineId = extractTimelineIdFromURL(timeframeUrl);
    redirectTimelineiFrame(timelineId);
    if (orgChartElId) {
        let chartNodeEl = document.getElementById(orgChartElId);
        if (chartNodeEl) {
            console.log('redirectiFrames orgChartElId: ' + orgChartElId);
            nodeClick(chartNodeEl, true);
            let cState = getChartViewState();
            cState.currentId = orgChartElId;
            cState.isSelected = true;
            cState.timelineId = timelineId;
            setChartViewState(cState);
            //captureAndSaveCurrentNodeState();
            handleViewChoiceClick("view-timeline", true);
        }
    }
}

function extractTimelineIdFromURL(fullURL) {
    // eg https://www.tiki-toki.com/timeline/embed/2139216/5281753800/ ==> 2139216/5281753800/
    let start = fullURL.indexOf("embed/");
    if (start < 10) {
        return fullURL;
    }
    else {
        return fullURL.substring(start + 6);
    }
}

function redirectTimelineiFrame(newtimelineId) {
    // set timeline target
    newtimelineId = baseiFrameSrc + newtimelineId;
    document.getElementById('tl-timeline-iframe').src = newtimelineId;
    handleViewChoiceClick("view-timeline", true);
}

function getChartViewState() {
    let cState = localStorage.getItem('chartViewState');
    if (cState != '[object Object]' && (typeof cState === 'string' || cState instanceof String)) {
        return JSON.parse(cState);
    }
    else {
        return {
            "currentId": null,
            "isSelected": false,
            "timelineId": null,
            "top": 80,
            "left": 130,
            "width": 350,
            "height": 380,
            "popUpShown": false,
            "popupScale": 1,
            "fullScale": 1
        }
    }
}

function setChartViewState(objChartViewState) {
    // safeguards:
    if (objChartViewState.left == undefined || objChartViewState.left < 1) {
        objChartViewState.left = 70;
    }
    if (objChartViewState.top == undefined || objChartViewState.top < 1) {
        objChartViewState.top = 100;
    }
    if (objChartViewState.width == undefined || objChartViewState.width < 300 || objChartViewState.width > 800) {
        objChartViewState.width = 400;
    }
    if (objChartViewState.height == undefined || objChartViewState.height < 150 || objChartViewState.height > 800) {
        objChartViewState.height = 750;
    }
    objChartViewState.left = parseInt(objChartViewState.left);
    objChartViewState.top = parseInt(objChartViewState.top);
    objChartViewState.width = parseInt(objChartViewState.width);
    objChartViewState.height = parseInt(objChartViewState.height);
    localStorage.setItem('chartViewState', JSON.stringify(objChartViewState));
}


function handleViewChoiceClick(viewChoice, setChecked) {
    let tlFrame = document.getElementById("tl-timeline-iframe");
    let ocEle = document.getElementById("orgchart-container");
    let tpEle = document.getElementById("tree-popup");
    let pu = document.getElementById("tree-popup-btn");
    //console.log('handleViewChoiceClick to viewChoice: ' + viewChoice + ', setChecked: ' + setChecked)
    if (viewChoice == "view-tree") {
        tlFrame.classList.remove("fullScreen");
        tlFrame.style.display = "none";
        moveOrgChart(true)
        ocEle.style.display = "block"; //orgchart-container
        ocEle.classList.add("fullScreen");
        pu.style.display = "none";
        tpEle.style.display = "none";
        if (setChecked) {
            radiobtn = document.getElementById("view-tree");
            radiobtn.checked = true;
        }
    }
    else if (viewChoice == "view-timeline") {
        captureAndSaveChartState();
        ocEle.classList.remove("fullScreen");
        tlFrame.classList.add("fullScreen");
        tlFrame.style.display = "block";
        pu.style.display = "inline";
        if (setChecked) {
            radiobtn = document.getElementById("view-timeline");
            radiobtn.checked = true;
        }

        if (getChartViewState().popUpShown) {
            openOrgChartPopup();
        }
    }
    // clear timeline menu if open
    let cbx = document.getElementById("tl-menu-cbx");
    if (cbx.checked) {
        cbx.checked = false;
    }
}

