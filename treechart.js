const timelineMenu = [];
const nodeIds = []  // used to detect dulicates, orphans
const duplicateNodes = []
const orphanedNodes = []
var maxLoginStateNodeLevel = 99;
const openStoryPng = `iVBORw0KGgoAAAANSUhEUgAAABYAAAAbCAYAAAB4Kn/lAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsEAAA7BAbiRa+0AAAGHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+PHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj48dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9J3cnPz4slJgLAAAEV0lEQVRIS62VUUxTZxTHf70XZi2mFCuOrl0iKMYuLjNMN6BERWYCOBICDxpDlvRpAX0wS4hGkvls9MmMBFzwpXGoLNteJCRISNTEYJQSllGoqaCWNJOQKiuW9fb27AGo9FK2uez39p3/d/4595zvu5/Ku1MDfPqeqn60o6TEHI1GI8YNACZjYAPcdru91VH0vqei0lNWe6wBVRG+7+pOBCYnTzx9+vRnY8LfYSkqKvqqeMeOH+rr6qLfdXbKxOSkxHSRmIgkRWT014CU7dvnNyZmxWazfWI2mzs+3rt3pK2tVQYHB2Vu4Y0sybLhy3hKfl/UZT4h8nLhjRyrr39g9ADIARARy4EDB76IxWL1ZWVlJz4rL8//srGZ4g8/QAHigLaSsNlsAkyoADmbKSwsTGY4rmCqqKg4EQwG2+PxeJnNZuP48eNYCwqILS6haQl0XcdkWj8KRVHQkxq//NgXtW/b9sBqtQ7FYjHf2NjYHIDJ4/FIZWUlTqcTXdfRNA1N0wDJMFq1FiGtpQRyc3OxWq1Eo1H6+/ufvHjxojocDs9SVVUl4XBY/g+uX78uu3bt+hZAEREWFxfX1Jad4eFh5ubmjOEMqqqqcLlcLQCKUcxGMBiktraWzs5Oo5RBKpUiJyfnDf/W+OrVqxw5coS7d+8yOztrlDNYHbQiIsjyRLIyNTXFw4cPuXbtGm63m56eHuOWNGtPz4YVv3r1iqmpKc6fP8+hQ4dwOBx4vV5u377NnTt3iEQiJBIJY1qanLWLkZERent7WVhYYGZmhtevX1NcXMzp06cB2L9/P42NjbS3t7Np0yacTifbt2/H7XZz6tQpVFV9a+bxeCQQCIiISH9/v+Tm5sqZM2dkYmJCwuGw6LpuPFUyPz8voVBIhoeHxeFwSE1NjSSTSQmHw3L06NExAGVtX+rq6rhx4wbj4+MkEgmcTieKsr5bW7dupaSkhIGBAcrLy+nr60NVVZLJt7c7wxigqakJr9dLW1sbjx8/ztBW0TSNs2fP8ujRI7q7uykoKEhrq4WsLwdoaWmhubmZK1euGCUARkdHGRgYoKenh8LCQqMMGxkD2O12tmzZYgwDYLFYcLlc2Gw2o5RGUVU16zkOBoPs2bMHgOfPn3Pp0iUGBwcB2L17N3l5eYRCIUPW8u1jo4pTqRSxWAyLxUJXVxcnT55kfHycixcv0trait/vJy8vj5mZGWNqmqzG8Xgcv9/PhQsXuH//PpcvX8bn83Hz5k1cLhfnzp3j1q1bRCJZ31EAckwm07ofuYjQ0NDAzp07aWpqSsftdjsdHR14vV58Ph9Op3Ndnq7ry4vDhw9roVDIeAf+E9PT03Lw4MEnAEogEPhmaGgo6wDfhaWlJXp7e0kkEg9YeXFspaWlvurq6nq73a6w8klGVttl1EwmE6lUikgk8se9e/d+mp6e/hr4M93c0tLSz81m84fxeDwj8Z/QdZ38/Hyi0ehvz549C6zG/wJFXHaLlKjbHgAAAABJRU5ErkJggg==`
const openPopupPng = `iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+PHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj48dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9J3cnPz4slJgLAAADtUlEQVRIS72WO0szXRCAn002MRJvG4OK4KUTFBRJJBErK2srtbC0tY2tIPhPFC3s30ZBwULFG4KIEDA28bKLMZrdTeLOW2j2M+stxfv5dDuXM+fMzJmzCiD8IgogIr8TU1EUfF7h/82PJ3Qch/39fa6urvjMTkTo6ekhmUyiKIpXXYWiKD8HLBaLDA8PMzAwQEtLi1eNbdtsbW1xcnKCpmledRWVDcl3FAoFSSQScnd351W5JJNJyWazXvEHAKmphoqioOs6FxcX7O7ucnt7y87ODqenp+i6/pqqH9JZoaaAFQKBAI7jYFkWqqpSLBYRkZqDVfCevIpCoSDxeFyur6+9KhERMU1TRkZGak7pj01TKpUYHR1F0zTC4TB+v59yuQyAqqpYlsXl5SX7+/s0Nzd73auoqUsdx+H8/JxsNouiKITDYZaWlggGgywsLJDL5ejo6KC/vx+f7/sK1RTwM1KpFKFQiMXFRa/qW2qaNMViEcuysG2bYrEIwPPzM5ZlAfDy8kK5XKZcLn86GLx8e8Ll5WX+/PlDMBh0O1FVVdLpNH6/n97eXreevG1uYmKCVCr1bpX/+DGlk5OTJBIJZmZm3N2LCKFQCBHBsix3I4qisLKywsHBARsbG56VXvlx0kxPT8vq6qpX/CUrKysyMzPjFbt8mDSlUol8Ps/9/T2WZZHP57m9vaVQKGAYBrZtvzd3fXK5HLZtc3d3x9PTE7Zt8/DwQKFQwHGcKvuqlJ6enjI7O0t7ezuqqpLJZAiHw0QiEUzTpK2tjfX1ddfZcRympqa4v7+nvr4ewzB4fn6mq6uLl5cXbm5uWFtbo6+v7zWYN6Wbm5sSj8fFMAwxDENM05R8Pi+6rsv29rYMDw9LuVx27W3blqGhIdne3hZd1+Xx8VFM0xRd18UwDInFYrKzs+Paf0ipz+ejsbERTdNoaWnB5/PR0NBAJBIhGo0SCoXemwNQX19PNBolEonQ2NhIIBAgEomgaRpNTU0f5uyX9zCdTrO7u0s2mwWoan8vlTqdn5+zt7eHruvw1tFevgwYDAbd16FWSqUSlmV9GqhCVUDHcfD7/QB0dXUxNjZGZ2cnAM3NzZ8uJCLu0B4cHGR8fJxoNApvQ8Lro77/qKur4/DwkLm5OXjrqoqDrutYllU1oH0+H6ZpMj8/T2trq/sQV7JydHT0oe5V1yKfz3N8fEwul6syAvD7/XR3dzMwMODKRISzszMymcynNdY0jVgsRjgchlpG27+mptfiX6Pwy7/6fwEeEgaMPjpu/AAAAABJRU5ErkJggg==`


function prepChartTable(csvData, isAuthenticated) {
    if (!isAuthenticated) {
        maxLoginStateNodeLevel = 3;
    }

    let rows = csvData.split(/\r?\n/);
    let result = buildTree(rows, "", 0, 0, isAuthenticated);

    if (isAuthenticated) {
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
    }

    // check for orphaned items
    let orphans = "";
    orphanedNodes.forEach((element) => {
        if (!nodeIds.includes(element)) {
            if (orphans.indexOf(element) < 0) {
                orphans += element + ", "
            };
        };
    });
    // check for dulicated items
    let dupes = "";
    duplicateNodes.forEach((element) => {
        dupes += element + ", "
    });
    if (orphans || dupes) {
        let msg = "data processing error loading dataSource: ";
        if (orphans) {
            msg += `orphans ${orphans} `;
        }
        if (dupes) {
            msg += `duplicates ${dupes}`;
        }
        alert(msg);
    }
    return result;
}

function buildTree(data, parentId, i, level, isAuthenticated) {
    let tree = [];
    data.forEach(item => {
        if (!item.startsWith("#") && item.length > 8) {
            // Check if the item belongs to the current parent
            let parsedRow = processDataRow(item, i++, level);
            if (parsedRow.parentId === parentId) {
                if (nodeIds.indexOf(parsedRow.id) < 0) {
                    nodeIds.push(parsedRow.id);
                }
                else {
                    duplicateNodes.push(parsedRow.id);
                }
                // Recursively build the children of the current item
                i++;
                let children = buildTree(data, parsedRow.id, i, level + 1);
                // If children exist, assign them to the current item
                if (children.length) {
                    parsedRow.children = children;
                    //let itemCount = (JSON.stringify(children).match(/\"id\":/g) || []).length;
                    let leafCount = (JSON.stringify(children).match(/isLeaf\":true/g) || []).length; // (JSON.stringify(result).match(/isLeaf\":true /g) || []).length;;
                    //console.log("buildTree row count: " + itemCount + ", leaf count: " + leafCount);
                    parsedRow.leafCount = leafCount;
                }
                else {
                    //level++;
                    parsedRow.isLeaf = true;
                }
                //console.log("buildTree result: level: " + level + " " + parsedRow.id);
                // Add the current item to the tree
                if (level < maxLoginStateNodeLevel ){
                    tree.push(parsedRow);
                }
            }
            else {
                // potential orphan
                orphanedNodes.push(parsedRow.id);
            }

        }

    });
    return tree;
}


function createTable(data, nbrChildren, level, isAuthenticated) {
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

    if (data.timelineId && data.timelineId.length > 0 && isAuthenticated) {
        let nodeLink = document.createElement('button');
        let image = document.createElement('img');
        //        image.src = '/img/open_story.png';
        image.src = "data:image/png;base64, " + openStoryPng;
        if (data.timelineId.length > 20){
            image.title = "open timeline to this story";
         }
         else{
            image.title = "open this timeline";
         }
        nodeLink.appendChild(image);
        nodeLink.classList.add('tl-link-btn')
        nodeDiv.appendChild(nodeLink);
        // Add an event listener to the button (optional)
        nodeLink.addEventListener('click', function (event) {
            let path = data.timelineId;
            if (data.panelHash) {
                path += data.panelHash;
            }
            redirectiFrames(path, data.id);
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
    if (data.timelineId && data.timelineId.length > 0) {
        nodeDiv.setAttribute('data-timelineId', data.timelineId);
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
            // recursively generate the sub-table
            const childTable = createTable(item, ((item.children) ? item.children.length : 0), level, isAuthenticated);
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


function showNode(nodeEl, isFullPage) {
    if (nodeEl) {
        let nodeText = nodeEl.textContent;
        if (nodeText == '') {
            nodeText = nodeEl.parentElement.textContent;
        }
        //console.log(`showNode id: ${nodeEl.id} ${nodeEl.classList.contains('selected') ? "(selected)" : ""}, isFullPage: ${isFullPage}`);
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

        let containerCenter = { x: (chartContainerBounds.left + (chartContainerBounds.width / 2)), y: (chartContainerBounds.top + (chartContainerBounds.height / 2)) };
        let elCenter = { x: (elBounds.left + (elBounds.width / 2)), y: (elBounds.top + (elBounds.height / 2)) };
        //console.log("showNode: cont " + boundsDisplay(chartContainerBounds));
        //console.log(`showNode: cont center ${xyDisplay(containerCenter.x, containerCenter.y)}`);
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

        //console.log(`showNode: (xTranslation, xTranslation, scale): ${xTranslation}, ${yTranslation}, ${scale}`);

        matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + parseInt(xTranslation) + ', ' + parseInt(yTranslation) + ')';
        //console.log("showNode transform matrix: " + matrix);
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
        if (element.firstElementChild) {
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
    if (element){
        element.classList.toggle("selected", true);
        element.firstElementChild.classList.toggle("selected", true);
        currentState.isSelected = true;
    }
    else{
        currentState.currentId = null;
        currentState.isSelected = false;
    }
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
