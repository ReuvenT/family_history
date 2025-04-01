const timelineMenu = [];

function prepChartTable(csvData, isForToolTip) {
    let rows = csvData.split(/\r?\n/);
    let result = buildTree(rows, "", 0, 0);

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
        label.onclick = (function (base, link) { return function (event) { redirectiFrames(baseiFrameSrc + menuItem.timelineId, menuItem.elId); event.preventDefault(); } })(baseiFrameSrc, menuItem.timelineId);

        label.appendChild(span);
        label.appendChild(link);
        listItem.appendChild(label);

        menu.appendChild(listItem);
        //console.log("ordered tree (menu): " + listItem.outerHTML);

    });

    return result;
}

function buildTree(data, parentId, i, level) {
    let tree = [];
    data.forEach(item => {
        if (!item.startsWith("#") && item.length > 8) {
            // Check if the item belongs to the current parent
            let parsedRow = processDataRow(item, i++, level);
            if (parsedRow.parentId === parentId) {
                // Recursively build the children of the current item
                i++;
                let children = buildTree(data, parsedRow.id, i, level);
                // If children exist, assign them to the current item
                if (children.length) {
                    parsedRow.children = children;
                    let itemCount = (JSON.stringify(children).match(/\"id\":/g) || []).length;
                    let leafCount = (JSON.stringify(children).match(/isLeaf\":true/g) || []).length; // (JSON.stringify(result).match(/isLeaf\":true /g) || []).length;;
                    //console.log("buildTree row count: " + itemCount + ", leaf count: " + leafCount);
                    parsedRow.leafCount = leafCount;
                }
                else {
                    level++;
                    parsedRow.isLeaf = true;
                }
                //console.log("buildTree result: level: " + level + " " + parsedRow.id);
                // Add the current item to the tree
                tree.push(parsedRow);
            }

        }

    });
    return tree;
}


function createTable(data, nbrChildren, level) {
    const table = document.createElement('table');
    table.setAttribute('cellpadding', 0);
    table.setAttribute('cellspacing', 0);
    table.setAttribute('border', 0);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    let nodeRow = document.createElement('tr');
    nodeRow.classList.add('oc-oc-node-cells')
    let nodeCell = document.createElement('td');
    nodeCell.classList.add('oc-node-cell')
    nodeCell.setAttribute('colspan', nbrChildren * 2);

    let nodeDiv = document.createElement('div');

    if (data.timelineId && data.timelineId.length > 0) {
        let nodeLink = document.createElement('button');
        let image = document.createElement('img');
        image.src = '/img/open_story.png';
        //image.alt = 'Open ' + data.content + ' timeline';
        nodeLink.appendChild(image);
        nodeLink.classList.add('tl-link-btn')
        nodeDiv.appendChild(nodeLink);
        // Add an event listener to the button (optional)
        nodeLink.addEventListener('click', function(event) {
            redirectiFrames(data.timelineId + data.panelHash, data.id);
            //event.preventDefault();
        });
    }

    nodeDiv.classList.add('oc-node')
    nodeDiv.classList.add('oc-node-level-' + level);
    nodeDiv.setAttribute('data-level', level);
    nodeDiv.addEventListener("click", function () {
        nodeClick(this);
    });
    let nodeText = document.createElement('span');
    nodeText.innerHTML = data.content;
    nodeDiv.appendChild(nodeText);
    nodeDiv.id = data.id;
    if (data.parentId && data.parentId.length > 0) {
        nodeDiv.setAttribute('data-parentId', data.parentId);
    }
    else {
        nodeDiv.setAttribute('data-parentId', 'root');
    }
    if (data.panelHash && data.panelHash.length > 0) {
        nodeDiv.setAttribute('data-panelHash', data.panelHash);
    }
    if (data.tooltip && data.tooltip.length > 0) {
        nodeDiv.setAttribute('title', data.tooltip);
    }


    nodeCell.appendChild(nodeDiv);
    nodeRow.appendChild(nodeCell);
    tbody.appendChild(nodeRow);

    if (data.children) {
        level++;
        tbody.appendChild(createUpperBelowLine(data.children.length));
        tbody.appendChild(createLowerBelowLine(data.children.length));
        let childRow = document.createElement('tr');
        for (const item of data.children) {
            const cell = document.createElement('td');
            cell.classList.add('oc-node-container')
            cell.setAttribute('colspan', 2);
            //cell.textContent = item.content;
            //cell.style.paddingLeft = `${level * 20}px`;
            const childTable = createTable(item, ((item.children) ? item.children.length : 0), level);
            cell.appendChild(childTable);
            childRow.appendChild(cell);
            tbody.appendChild(childRow);
        }
    }
    //console.log("createTable children count: " + (data.children ? data.children.length : 0) + ", level: " + level + " for: " + data.id);

    return table;
}

function createUpperBelowLine(nbrChildren) {
    let childRowHeader = document.createElement('tr');
    let lineCell = document.createElement('td');
    lineCell.setAttribute('colspan', nbrChildren * 2);
    let lineDiv = document.createElement('div');
    lineDiv.classList.add('line');
    lineDiv.classList.add('down');
    lineCell.appendChild(lineDiv);
    childRowHeader.appendChild(lineCell);
    return childRowHeader;
}

function createLowerBelowLine(nbrChildren) {
    let childRowHeader = document.createElement('tr');
    let lineCell1 = document.createElement('td');
    lineCell1.classList.add('line', 'left')
    lineCell1.textContent = " ";
    let lineCell2 = document.createElement('td');
    lineCell2.classList.add('line', 'right')
    lineCell2.textContent = " ";
    if (nbrChildren > 1) {
        lineCell2.classList.add('top')
    }
    childRowHeader.appendChild(lineCell1);
    childRowHeader.appendChild(lineCell2);
    if (nbrChildren > 1) {
        for (let i = 0; i < nbrChildren - 1; i++) {
            let lineCell1 = document.createElement('td');
            lineCell1.classList.add('line', 'left', 'top')
            lineCell1.textContent = " ";
            childRowHeader.appendChild(lineCell1);
            let lineCell2 = document.createElement('td');
            lineCell2.classList.add('line', 'right')
            lineCell2.textContent = " ";
            if (i < nbrChildren - 2) {
                lineCell2.classList.add('top')
            }
            childRowHeader.appendChild(lineCell1);
            childRowHeader.appendChild(lineCell2);
        }

    }
    return childRowHeader;
}

function alignChildrenRows(parentId) {
    let childNodes = document.querySelectorAll("[data-parentId='" + parentId + "']")
    if (childNodes && childNodes.length) {
        let maxHeight = 0;
        childNodes.forEach(item => {
            let ht = item.offsetHeight;
            if (ht > maxHeight) {
                maxHeight = ht;
            }
        });
        //console.log("alignChildrenRows parentId: " + parentId + ", marginDiff:" + rootMarginDiff + ", maxHeight:" + maxHeight);
        childNodes.forEach((item) => {
            item.style.height = (maxHeight - rootMarginDiff) + "px";
            //console.log("alignChildrenRows parentId: " + parentId + ", node Id " + item.id);
            alignChildrenRows(item.id);
        });
    }
}



function processDataRow(csvDataRow, i) {
    let cells = csvDataRow.split(',');
    let item = { id: null, parentId: null, tooltip: null, timelineId: null, panelHash: null, menu: null, isLeaf: false, leafCount: 0 };
    try {
        item.id = cells[0];
        item.parentId = cells[1];
        item.content = cells[2];
        item.tooltip = cells[3];
        if (cells.length > 3) {
            item.timelineId = cells[4];
        }
        if (cells.length > 4) {
            item.panelHash = cells[5];
        }
        if (cells.length > 5 && cells[6]) {
            item.menu = cells[6];
            let menuExists = timelineMenu.some(obj => obj.elId === cells[0]);
            if (!menuExists) {
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
        }

    } catch (error) {
        alert("tree load error in source file row " + i);
        console.log("tree load error in source file row " + i);
        console.log(error);
    }
    //console.log("processDataRow result: " + i + " " + JSON.stringify(item));
    return item;
}

function moveOrgChart(isFullPage) {
    let ocSource = document.getElementById("orgchart-container");
    var currentItem = getChartViewState();
    let targetContainer = document.getElementById((isFullPage ? 'tree_container' : 'popup-content-target'));
    //console.log('moveOrgChart moving to ' + (isFullPage ? 'full' : 'popup') + 'page with current item ' + JSON.stringify(currentItem));
    try {
        if (ocSource.innerHTML.length > 1000) {
            targetContainer.appendChild(ocSource);
        }
        let treeEl = document.getElementById(currentItem.currentId);
        showNode(treeEl, isFullPage);
    } catch (error) {
        console.log(error);
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
        //console.log('getCenterElement isFullPage: ' + isFullPage + ' had no width and height, cannot get center element');
        return { centerEl: null, visibleCount: 0 };
    }
    let containerCenter = { x: (chartContainerBounds.left + (chartContainerBounds.width / 2)), y: (chartContainerBounds.top + (chartContainerBounds.height / 2)) };
    //console.log(`getCenterElement: isFullPage ${isFullPage} ${boundsDisplay(chartContainerBounds)}`);

    let sortedDist = [];
    let elements = document.querySelectorAll('.oc-node');
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
            sortedDist.push({ elId: el.id, dist: Math.sqrt(dist) });
            //console.log('getCenterElement visible ' + el.id + ', dist ' + Math.sqrt(dist)  + ' ' + JSON.stringify(elCenter));
        }
        else {
            //console.log('getCenterElement not vis ' + el.id + ', dist ' + Math.sqrt(dist)  + ' ' + JSON.stringify(elCenter));
        }
    });
    orderedList = sortedDist.sort((a, b) => a.dist - b.dist)
    if (orderedList.length == 0) {
        //console.log('for isFullPage: ' + isFullPage + ' no visible elements found');
        return { centerEl: null, visibleCount: 0 };
    }
    //console.log('getCenterElement isFullPage: ' + isFullPage + ' closest element: ' + orderedList[0].elId + " dist: " + orderedList[0].dist + " visible " + visibleCount + "/" + elements.length);
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


function showNode(nodeEl, isFullPage, isRecursive) {
    if (nodeEl) {
        let nodeText = nodeEl.textContent;
        if (nodeText == '') {
            nodeText = nodeEl.parentElement.textContent;
        }
        //console.log(`showNode id: ${nodeEl.id}, isFullPage: ${isFullPage}`);
        let elBounds = nodeEl.getBoundingClientRect();
        if (elBounds.right == 0) {
            elBounds = nodeEl.parentElement.getBoundingClientRect();
        }
        let chartContainer = document.getElementById("chart_container"); ////(isFullPage) ? document.getElementById("chart_container").getBoundingClientRect() : 
        let chartContainerBounds = chartContainer.getBoundingClientRect(); ////(isFullPage) ? document.getElementById("chart_container").getBoundingClientRect() : 
        if (chartContainerBounds.right == 0 && chartContainerBounds.parentElement) {
            chartContainerBounds = chartContainer.parentElement.getBoundingClientRect();
        }


        let panZoomStyle = document.getElementById("panzoom_container").style;
        let matrix = panZoomStyle.transform;
        let idxScale = matrix.indexOf(",");
        let scale = matrix.slice(7, idxScale) * 1;

        let cState = getChartViewState();
        if (isFullPage) {
            scale = cState.fullScale;
        }
        else {
            scale = cState.popupScale;
        }
        if (scale == 0 || Math.abs(scale) > 1) {
            scale = 1;
        }

        // //matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + parseInt(xTranslation) + ', ' + parseInt(yTranslation) + ')';
        // let tScale = 'scale(' + scale + ')';
        // //console.log("showNode transform tScale: " + tScale);
        // //document.getElementById("panzoom_container").style.transform = tScale;


        // matrix = 'matrix(1, 0, 0, 1, -1095, -5)';
        // //matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + parseInt(xTranslation) + ', ' + parseInt(yTranslation) + ')';
        // console.log("showNode transform matrix: " + matrix);
        // document.getElementById("panzoom_container").style.transform = matrix;



        let containerCenter = { x: (chartContainerBounds.left + (chartContainerBounds.width / 2)), y: (chartContainerBounds.top + (chartContainerBounds.height / 2)) };
        let elCenter = { x: (elBounds.left + (elBounds.width / 2)), y: (elBounds.top + (elBounds.height / 2)) };
        //console.log("showNode: cont " + boundsDisplay(chartContainerBounds));
        console.log(`showNode: cont center ${xyDisplay(containerCenter.x, containerCenter.y)}`);
        // console.log("showNode: item " + boundsDisplay(elBounds));
        // console.log(`showNode: item center ${xyDisplay(elCenter.x, elCenter.y)}`);

        let xTranslation = -parseInt((elCenter.x - containerCenter.x));
        let yTranslation = -parseInt((elCenter.y - containerCenter.y));

        // adjust the height of the node based on the level
        let rootDiv = document.querySelectorAll("[data-parentId='root']")[0];
        let rootTop = rootDiv.getBoundingClientRect().top;
        let level = nodeEl.getAttribute('data-level');
        let yOffset = (elBounds.top - rootTop) / 5;
        yOffset *= level;

        //if (!isFullPage) {
        //let level = nodeEl.getAttribute('data-level');
        //let popupContainerBounds = document.getElementById("tree-popup").getBoundingClientRect();
        //let yOffset = popupContainerBounds.height / 2;
        //xTranslation = -(elCenter.x - popupCenter.x);
        //yTranslation -= yOffset;
        //console.log("showNode yOffset: " + yOffset);
        //}
        // first call to full page doesn't center correctly - re-do 

        console.log(`showNode: (xTranslation, xTranslation, scale): ${xTranslation}, ${yTranslation}, ${scale}`);

        if (!isRecursive && isFullPage && (xTranslation + xTranslation == 0)){
            matrix = 'matrix(1, 0, 0, 1, -2572, -274)';
        // console.log("showNode transform matrix: " + matrix);
            document.getElementById("panzoom_container").style.transform = matrix;
            showNode(nodeEl, true, true);
        }


        // let translate = `translate(${xTranslation}px, ${yTranslation}px)`;
        // console.log("showNode translate: " + translate);
        // document.getElementById("panzoom_container").style.transform = `translate(${xTranslation}px, ${yTranslation}px)`;


        // // restore scale
        // // if (isFullPage != wasFullPage) {
        // cState = getChartViewState();
        // //     let prevScale = scale;
        // //     xTranslation /= prevScale;
        // //     yTranslation /= prevScale;
        // if (isFullPage) {
        //     scale = cState.fullScale;  // moving to full
        //     //cState.popupScale = prevScale;
        // }
        // else {
        //     scale = cState.popupScale;  // moving to popup
        //     //cState.fullScale = prevScale;
        // }
        // if (scale == 0 || Math.abs(scale) > 1) {
        //     scale = 1;
        // }
        // //setChartViewState(cState);
        // // adjust x/y
        // //scale = 1;
        // xTranslation /= scale;
        // yTranslation *= scale;
        // xTranslation +=7;
        // yTranslation  +=7;
        //console.log(`showNode rescaled: (xTranslation, yTranslation, scale, fullScale, popupScale): ${xTranslation}, ${yTranslation}, ${scale}, ${cState.fullScale}, ${cState.popupScale}`);
        //}
        //scale = 1;

        matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + parseInt(xTranslation) + ', ' + parseInt(yTranslation) + ')';
        console.log("showNode transform matrix: " + matrix);
        document.getElementById("panzoom_container").style.transform = matrix;

        // log the "after"
        // elBounds = nodeEl.getBoundingClientRect();
        // if (elBounds.right == 0) {
        //     elBounds = nodeEl.parentElement.getBoundingClientRect();
        // }
        //console.log("showNode (after): item " + boundsDisplay(elBounds));
    }
}


function nodeClick(node) {
    let currentState = getChartViewState();
    currentState.currentId = node.id;
    let wasSelected = node.classList.contains('selected');
    const selectedList = document.querySelectorAll('.selected');
    selectedList.forEach(element => {
        element.classList.remove('selected');
        if (element.firstElementChild){
            element.firstElementChild.classList.remove('selected');
        }
    });
    node.classList.toggle("selected", !wasSelected);
    node.firstElementChild.classList.toggle("selected", !wasSelected);
    currentState.isSelected = !wasSelected;
    setChartViewState(currentState);
}

function nodeIdSetSelected(nodeId) {
    let currentState = getChartViewState();
    currentState.currentId = nodeId;
    const selectedList = document.querySelectorAll('.selected');
    selectedList.forEach(element => {
        element.classList.remove('selected');
        element.firstElementChild.classList.remove('selected');
    });
    let element = document.getElementById(nodeId);
    element.classList.toggle("selected", true);
    element.firstElementChild.classList.toggle("selected", true);
    currentState.isSelected = true;
    setChartViewState(currentState);
}


function timelineLink(el) {
    var storedSelection = getChartViewState();
    console.log("timelineLink clicked for " + storedSelection.currentId + " with timelineId " + storedSelection.timelineId);
    redirectiFrames(baseiFrameSrc + storedSelection.timelineId, storedSelection.timelineId);
};

function boundsDisplay(bounds) {
    return ` bounds (top, right, bottom, and left) ${parseInt(bounds.top)}px, ${parseInt(bounds.right)}px, ${parseInt(bounds.bottom)}px, ${parseInt(bounds.left)}px`;
}
function xyDisplay(x, y) {
    return ` (x, y) ${parseInt(x)}, ${parseInt(y)}`;
}
