let fullTable;
const timelineMenu = [];

function prepChartTable(data, newTable) {
    // prepere column properties 
    var renderedTable = new google.visualization.DataTable();
    //const fullTable = new google.visualization.DataTable();
    fullTable = newTable;

    renderedTable.addColumn('string', 'Key_Name');   // contains both the key and what's displayed in the box
    renderedTable.addColumn('string', 'Parent');    // links to the parent key (empty if root)
    // html for tool tip is not working, plain text populated in this (alwasy last) column
    renderedTable.addColumn('string', 'tooltip', { html: true });

    // create second table with same initial rows but not used for tooltip which is very finneky
    fullTable.addColumn('string', 'Key_Name');
    fullTable.addColumn('string', 'Parent');
    fullTable.addColumn('string', 'tooltip');
    fullTable.addColumn('string', 'TimelineUrl');   // timeline, with possible story hash 

    // compose source data into appropriate table values
    const sourceData = processData(data);
    try {
        renderedTable.addRows(removeRemainingColumns(sourceData, 1));
    } catch (error) {
        document.getElementById("err_msg").innerHTML = "Error loading tree data (row number does't count comment rows) " + error;
        console.log(error);
    }
    fullTable.addRows(sourceData);

    localStorage.setItem('chartFullTable', sourceData);
    // Create the chart.
    chart = new google.visualization.OrgChart(document.getElementById('chart_container'));  // popup test //

    return renderedTable;
}

function treeSelectHandler() {
    let currentState = { 'row': -1, isSelected: false, 'url': null };
    var selectedItem = chart.getSelection()[0];
    if (selectedItem && selectedItem.hasOwnProperty('row')) { //&& selectedItem.row) {
        currentState.row = fullTable.getValue(selectedItem.row, 0);
        currentState.isSelected = true;
        currentState.url = fullTable.getValue(selectedItem.row, 3);
        console.log('treeSelectHandler: user selected row ' + selectedItem.row + ' from values ' + JSON.stringify(selectedItem));
    }
    else {
        console.log('treeSelectHandler: user un-selected row '); //+ chart.getSelection()[0] + ', current values: ' + JSON.stringify(selectedItem));
    }
    localStorage.setItem('currentNodeRow', JSON.stringify(currentState));
}


function processData(csvData, isForToolTip) {
    let rows = csvData.split(/\r?\n/);
    let data = [];
    let j = 0;
    // any row starting with # is informational only - not processed
    for (let i = 0; i < rows.length; i++) {
        rawRow = rows[i];
        if (rawRow.length > 1 && !rawRow.startsWith("#")) {
            let rowArray = processDataRow(rows[i], i, j++);
            if (rowArray.length > 2) {
                data.push(rowArray);
            }
        }
    }
    // add timeline links to menu
    const menu = document.getElementById("tl-menu");
    timelineMenu.sort((a, b) => a.seq - b.seq).forEach((menuItem) => {
        const listItem = document.createElement("li");
        const label = document.createElement("label");
        const span = document.createElement("span");
        const link = document.createElement("a");
        label.className = "tl-menu-" + menuItem.level;
        label.htmlFor = 'tl-menu-cbx';
        link.textContent = menuItem.menu;
        span.className = "tl-menu-prefix tl-menu-" + menuItem.level;
        span.textContent = "&nbsp;"
        label.onclick = (function (base, link) { return function () { redirectiFrames(baseiFrameSrc + link, link); this.parentNode.click(); } })(baseiFrameSrc, menuItem.timelineId);

        label.appendChild(span);
        label.appendChild(link);
        listItem.appendChild(label);

        menu.appendChild(listItem);
        //console.log("ordered tree (menu): " + listItem.outerHTML);

    });

    return data;
}

const timelineEmbedBaseUrl = 'https://www.tiki-toki.com/timeline/embed/';
const timelineLinkBtnHtml = '" class="tl-span-id"></span><a class="tl-link-btn" onclick="timelineLink(this)"></a><br/>';
const bodyInsertHtml = "-node'>";

function processDataRow(csvDataRow, i, dataRowNbr) {
    let cells = csvDataRow.split(',');
    let dataRow = [];
    try {
        var body = cells[2];
        var insertPoint = body.indexOf(bodyInsertHtml) + 7;
        // insert link button if url is specified
        if (cells.length > 3 && cells[4] && insertPoint > 7) {
            body = body.slice(0, insertPoint) + '<span data-row="' + dataRowNbr + '" id="' + cells[4] + timelineLinkBtnHtml + body.slice(insertPoint);
        }
        else {
            insertPoint = body.indexOf("<div >") + 5;
            body = body.slice(0, insertPoint) + ' data-row="' + dataRowNbr + '" id="' + cells[0] + '"' + body.slice(insertPoint);
        }
        //console.log("tree load dataRowNbr " + dataRowNbr + " body: " + body)
        dataRow.push({ "v": cells[0], "f": body });         // Key_Name, Body
        dataRow.push(cells[1]);                             // Parent

        if (cells.length > 2) {
            if (cells[3]) {
                dataRow.push(cells[3]);                             // provided Tooltip
            }
            else {
                dataRow.push(removeTags(cells[2]));                 // use body as Tooltip (without html)
            }
        }
        if (cells[4]) {
            dataRow.push(timelineEmbedBaseUrl + cells[4]);          // button link to new timeline
        }
        else {
            dataRow.push('');
        }

        if (cells.length > 5 && cells[6]) {             // menu item
            try {
                let menuItem = JSON.parse(cells[6].replaceAll("'", "\"").replaceAll(";", ","));
                menuItem.elId = cells[0];
                menuItem.timelineId = cells[4];
                //console.log("tree (menu) in source file row " + i + " : " + JSON.stringify(menuItem));
                timelineMenu.push(menuItem);
            } catch (error) {
                alert("tree (menu) load error in source file row " + i)
                console.log("tree (menu) load error in source file row " + i)
                console.error(error);
            }
        }


    } catch (error) {
        alert("tree load error in source file row " + i)
        console.log("tree load error in source file row " + i)
        console.error(error);
    }
    return dataRow;
}

function removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    // Regular expression to identify HTML tags in the input string. Replacing the identified HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '');
}

function timelineLink(el) {
    var storedSelection = JSON.parse(localStorage.getItem('currentNodeRow'));
    if (storedSelection) {
        console.log("timelineLink clicked for row(cell) " + storedSelection.row + " with url " + storedSelection.url);
        // Just fire the message through parent object (this is still used even though it was coded when this was in iFrame)
        if (window.parent) {
            window.parent.postMessage({ from: 'org-chart', node: storedSelection.row, url: storedSelection.url }, '*');
        }
        showNode(el, true);
        handleViewChoiceClick("view-timeline", true)
    }
};

function removeRemainingColumns(data, fromIndex) {
    return data.map(function (row) {
        return row.slice(0, -fromIndex);
    });
}

function selectChartItem(rowIndex) {
    var selectionArray = new Array(1).fill({ row: rowIndex, column: null });
    console.log("selectChartItem row(cell) " + JSON.stringify(selectionArray));
    chart.setSelection(selectionArray);
}

function captureAndSaveCurrentNodeState() {
    let currentNodeState = localStorage.getItem('currentNodeRow');
    let nodeState = (currentNodeState != '[object Object]' && (typeof currentNodeState === 'string' || currentNodeState instanceof String)) ?
        JSON.parse(currentNodeState) : { "row": -1, "isSelected": false, "url": null };

    var selectedItem = chart.getSelection()[0];
    if (selectedItem && selectedItem.hasOwnProperty('row')) {
        nodeState.row = selectedItem.row;
        nodeState.isSelected = true;
        nodeState.url = fullTable.getValue(selectedItem.row, 3);
    }
    else {
        let currentEl = getCenterElement().centerEl;
        nodeState.row = (!currentEl) ? -1 : currentEl.getAttribute('data-row');
        nodeState.isSelected = false;
    }
    console.log('captureAndSaveCurrentNodeState: ' + JSON.stringify(nodeState));
    localStorage.setItem('currentNodeRow', JSON.stringify(nodeState));
}

function moveOrgChart(isFullPage) {
    let ocSource = document.getElementById("orgchart-container");
    var currentItem = JSON.parse(localStorage.getItem('currentNodeRow'));
    let targetContainer = document.getElementById((isFullPage ? 'tree_container' : 'popup-content-target'));
    // if (scale > .2 && scale < 1.1) {
    //     let matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', 0, 0)';
    //     document.getElementById("panzoom_container").style.transform = matrix;
    // }
    console.log('moveOrgChart moving to ' + (isFullPage ? 'full' : 'popup') + 'page with current item ' + JSON.stringify(currentItem));
    try {
        if (ocSource.innerHTML.length > 1000) {
            targetContainer.appendChild(ocSource);
        }
        let currentNodeState = JSON.parse(localStorage.getItem('currentNodeRow'));
        let treeEl = document.querySelector('[data-row="' + (currentNodeState.row) + '"]');
        showNode(treeEl, isFullPage);
    } catch (error) {
        console.log(error);
    }
    // clear timeline menu if open
    let cbx = document.getElementById("tl-menu-cbx");
    if (cbx.checked) {
        cbx.checked = false;
    }
}


function xgetDefaultCurrentElement(isFirstDisplay) {
    // find selected, iFrame, or centered element in container
    let currentItem = JSON.parse(localStorage.getItem('currentNodeRow'));
    if (currentItem && (true + currentItem.row > 0)) {
        //console.log('getDefaultCurrentElement for container: ' + container.id + ' returning current row: ' + currentItem.row);
        return document.querySelector('[data-row="' + (currentItem.row) + '"]');
    }
    else if (chart.getSelection()[0]) {
        //console.log('getDefaultCurrentElement for container: ' + container.id + ' returning selected* row: ' + chart.getSelection()[0].row);
        return document.querySelector('[data-row="' + (chart.getSelection()[0].row) + '"]');
    }
    else {
        if (isFirstDisplay) {
            let nodeId = "";
            let iFrameSourceElements = document.getElementById('tl-timeline-iframe').src.split("/")
            if (iFrameSourceElements.length > 3) {
                nodeId = iFrameSourceElements[iFrameSourceElements.length - 3] + "/" + iFrameSourceElements[iFrameSourceElements.length - 2] + "/"
            }
            if (nodeId == "") {
                //console.log('getDefaultCurrentElement (firstDisplay) for container: ' + container.id + ' returning getCenterElement');
                return getCenterElement().centerEl;
            }
            else {
                //console.log('getDefaultCurrentElement (firstDisplay) for container: ' + container.id + ' returning element with nodeId: ' + nodeId);
                return document.getElementById(nodeId);
            }
        }
        else {
            //console.log('getDefaultCurrentElement for container: ' + container.id + ' returning getCenterElement');
            return getCenterElement().centerEl;
        }
    }
}

function isFullChartPageDisplayed() {
    return document.getElementById("tree_container").innerHTML.length > 100;
}

function getCenterElement() {
    // calculate the central point of the container
    let isFullPage = isFullChartPageDisplayed();
    let chartContainerBounds = (isFullPage) ? document.getElementById("orgchart-container").getBoundingClientRect() :
        document.getElementById("tree-popup").getBoundingClientRect();
    if (chartContainerBounds.width + chartContainerBounds.height == 0) {
        console.log('getCenterElement isFullPage: ' + isFullPage + ' had no width and height, cannot get center element');
        return { centerEl: null, visibleCount: 0 };
    }
    let containerCenter = { x: (chartContainerBounds.left + (chartContainerBounds.width / 2)), y: (chartContainerBounds.top + (chartContainerBounds.height / 2)) };
    console.log(`getCenterElement: isFullPage ${isFullPage} bounds (top, right, bottom, and left) ${chartContainerBounds.top}px, ${chartContainerBounds.right}px, ${chartContainerBounds.bottom}px, ${chartContainerBounds.left}px center: ${JSON.stringify(containerCenter)}`);
    let sortedDist = [];
    let elements = document.querySelectorAll('[data-row]');
    let visibleCount = 0;
    elements.forEach((el) => {
        let elBounds = el.getBoundingClientRect();
        if (elBounds.right == 0) {
            elBounds = el.parentElement.getBoundingClientRect();
        }

        let { top, left, bottom, right } = elBounds;// el.getBoundingClientRect();
        let elCenter = { x: (left + ((right - left) / 2)), y: (top + ((bottom - top) / 2)) };
        let dist = ((containerCenter.x - elCenter.x) * (containerCenter.x - elCenter.x)) + ((containerCenter.y - elCenter.y) * (containerCenter.y - elCenter.y));
        if (elCenter.x > chartContainerBounds.left && elCenter.y < chartContainerBounds.bottom && elCenter.x < chartContainerBounds.right && elCenter.y > chartContainerBounds.top) {
            visibleCount++;
            sortedDist.push({ elId: el.id, row: el.getAttribute("data-row"), dist: Math.sqrt(dist) });
            //console.log('getCenterElement visible row ' + el.dataset.row + ', dist ' + Math.sqrt(dist)  + ' ' + JSON.stringify(elCenter));
        }
        else {
            //console.log('getCenterElement not vis row ' + el.dataset.row + ', dist ' + Math.sqrt(dist)  + ' ' + JSON.stringify(elCenter));
        }
    });
    orderedList = sortedDist.sort((a, b) => a.dist - b.dist)
    if (orderedList.length == 0) {
        console.log('for isFullPage: ' + isFullPage + ' no visible elements found');
        return { centerEl: null, visibleCount: 0 };
    }
    console.log('getCenterElement isFullPage: ' + isFullPage + ' closest element: ' + orderedList[0].elId + ' row: ' + orderedList[0].row + " dist: " + orderedList[0].dist + " visible " + visibleCount + "/" + elements.length);
    return { centerEl: document.getElementById(orderedList[0].elId), visibleCount };
}

const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return partiallyVisible
        ? ((top > 0 && top < innerHeight) ||
            (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
        : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};


function showNode(nodeEl, isFullPage) {
    if (nodeEl) {
        let nodeText = nodeEl.textContent;
        if (nodeText == '') {
            nodeText = nodeEl.parentElement.textContent;
        }
        console.log(`showNode nodeEl ${nodeText}, id:  ${nodeEl.id}, isFullPage: ${isFullPage}`);
        let elBounds = nodeEl.getBoundingClientRect();
        if (elBounds.right == 0) {
            elBounds = nodeEl.parentElement.getBoundingClientRect();
        }
        let chartContainer = document.getElementById("chart_container"); ////(isFullPage) ? document.getElementById("chart_container").getBoundingClientRect() : 
        let chartContainerBounds = chartContainer.getBoundingClientRect(); ////(isFullPage) ? document.getElementById("chart_container").getBoundingClientRect() : 
        if (chartContainerBounds.right == 0 && chartContainerBounds.parentElement) {
            chartContainerBounds = chartContainer.parentElement.getBoundingClientRect();
        }

        //console.log(`showNode: cont bounds (top, right, bottom, and left) ${chartContainerBounds.top}px, ${chartContainerBounds.right}px, ${chartContainerBounds.bottom}px, ${chartContainerBounds.left}px`);
        //console.log(`showNode: item bounds (top, right, bottom, and left) ${elBounds.top}px, ${elBounds.right}px, ${elBounds.bottom}px, ${elBounds.left}px`);

        let panZoomStyle = document.getElementById("panzoom_container").style;
        let matrix = panZoomStyle.transform;
        let idxScale = matrix.indexOf(",");
        let scale = matrix.slice(7, idxScale) * 1;

        let containerCenter = { x: (chartContainerBounds.left + (chartContainerBounds.width / 2)), y: (chartContainerBounds.top + (chartContainerBounds.height / 2)) };
        let elCenter = { x: (elBounds.left + (elBounds.width / 2)), y: (elBounds.top + (elBounds.height / 2)) };
        //console.log(`showNode: cont center (x, y): ${containerCenter.x}px, ${containerCenter.y}px`);
        //console.log(`showNode: item center (x, y): ${elCenter.x}px, ${elCenter.y}px`);

        let xTranslation = -(elCenter.x - containerCenter.x);
        let yTranslation = -(elCenter.y - containerCenter.y);

        // adjust the height of the node if popup
        if (!isFullPage) {
            let popupContainerBounds = document.getElementById("tree-popup").getBoundingClientRect();
            let yOffset = popupContainerBounds.height / 3;
            //xTranslation = -(elCenter.x - popupCenter.x);
            yTranslation -= yOffset;
            console.log("showNode yOffset: " + yOffset);
        }
        
        //console.log(`showNode: (xTranslation, yTranslation, scale): ${xTranslation}, ${yTranslation}, ${scale}`);
        //console.log(`showNode: container y diff: : ${elCenter.y - containerCenter.x}px,`);

        // let translate = `translate(${xTranslation}px, ${yTranslation}px)`;
        // console.log("showNode translate: " + translate);
        // document.getElementById("panzoom_container").style.transform = `translate(${xTranslation}px, ${yTranslation}px)`;

        // restore scale
        // let popupStateItem = localStorage.getItem("treePopupState");
        // if (popupStateItem != '[object Object]' && (typeof popupStateItem === 'string' || popupStateItem instanceof String)) {
        //     let pState = JSON.parse(popupStateItem);
        //     if (isFullPage) {
        //         scale = pState.fullScale;  // moving to full
        //     }
        //     else {
        //         scale = pState.popupScale;  // moving to popup
        //     }
        //     if (scale == 0 || Math.abs(scale) > 1) {
        scale = 1;
        //     }
        // }


        matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + xTranslation + ', ' + yTranslation + ')';
        console.log("showNode transform matrix: " + matrix);
        document.getElementById("panzoom_container").style.transform = matrix;

        // log the "after"
        elBounds = nodeEl.getBoundingClientRect();
        if (elBounds.right == 0) {
            elBounds = nodeEl.parentElement.getBoundingClientRect();
        }
        console.log(`showNode (after): item bounds (top, right, bottom, and left) ${elBounds.top}px, ${elBounds.right}px, ${elBounds.bottom}px, ${elBounds.left}px`);


    }
}

