window.onload = function(){
  // Here is how you would call the libary
  PanZoom(".panzoom");
}
localStorage.setItem('selectedOrgItem', null);
google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(drawChart);

document.addEventListener('DOMContentLoaded', function(){ 
    console.log("org chart document ready");
    window.addEventListener('message',
        (event) => {
            console.log("someone's calling the orgchart listener with event data " + JSON.stringify(event.data));
            navigateToNode(JSON.parse(event.data).nodeElId);
        },
        false
    );
///            window.addEventListener('message', function(e) { console.log('child from console: ' + e.data)});
}, false);


async function drawChart() {
    const response = await fetch('/data/familydata.csv');
    const data = await response.text();

    // prepere column properties 
    var renderedTable = new google.visualization.DataTable();
    const fullTable = new google.visualization.DataTable();

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
    renderedTable.addRows(removeRemainingColumns(sourceData, 1));
    fullTable.addRows(sourceData);

    localStorage.setItem('chartFullTable', sourceData);
    // Create the chart.
    chart = new google.visualization.OrgChart(document.getElementById('chart_container'));

    function selectHandler() {
        var selectedItem = chart.getSelection()[0];
        if (selectedItem && selectedItem.hasOwnProperty('row') ){ //&& selectedItem.row) {
            if (selectedItem) {
                var val0 = fullTable.getValue(selectedItem.row, 0);
                var val1 = fullTable.getValue(selectedItem.row, 1);
                var val2 = fullTable.getValue(selectedItem.row, 2);
                var val3 = fullTable.getValue(selectedItem.row, 3);
                localStorage.setItem('selectedOrgItem', JSON.stringify({'row': selectedItem.row, 'url': val3}));
                console.log('The user selected row ' + selectedItem.row + ' with values ' + val0 + ', ' + val1 + ', ' + val2 + ', ' + val3);
            }

        }
    }

    google.visualization.events.addListener(chart, 'select', selectHandler);

    var drawOptions = { allowHtml: true, allowCollapse: true, tooltip: { isHtml: true } };
    // Draw the chart, setting the allowHtml option to true for the tooltips.
    chart.draw(renderedTable, drawOptions);
}

function processData(csvData, isForToolTip) {
    let rows = csvData.split(/\r?\n/);
    let data = [];
    let j = 0;
    // any row starting with # is informational only - not processed
    for (let i = 0; i < rows.length; i++) {
        rawRow = rows[i];
        if (!rawRow.startsWith("#")) {
            let rowArray = processDataRow(rows[i], i, j++);
            if (rowArray.length > 2) {
                data.push(rowArray);
            }
        }
    }
    return data;
}
const timelineEmbedBaseUrl = 'https://www.tiki-toki.com/timeline/embed/';
const timelineLinkBtnHtml = '"></span><a class="tl-link-btn" onclick="timelineLink(this)"></a>';
const bodyInsertHtml = "-node'>";

function processDataRow(csvDataRow, i, dataRowNbr) {
    let cells = csvDataRow.split(',');
    let dataRow = [];
    try {
        var body = cells[2];
        // insert link button if url is specified
        if (cells.length > 3 && cells[4]) {
            var insertPoint = body.indexOf(bodyInsertHtml) + 7;
            if (insertPoint > 7) {
                body = body.slice(0, insertPoint) + '<span data-row="' + dataRowNbr + '" id="' + cells[4] + timelineLinkBtnHtml + body.slice(insertPoint);
            }
        }
        dataRow.push({ "v": cells[0], "f": body });         // Key_Name, Body
        dataRow.push(cells[1]);                             // Parent

        if (cells.length > 2) {
            if (cells[3]) {
                dataRow.push(cells[3]);                             // provided Tooltip
            }
            else {
                dataRow.push(removeTags(cells[2]));                             // use body as Tooltip (without html)
            }
        }
        if (cells[4]) {
            dataRow.push(timelineEmbedBaseUrl + cells[4]);
        }
        else {
            dataRow.push('');
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
    const scrollOptions = { behavior: "smooth", block: "center", inline: "center" };
    var storedSelection = JSON.parse(localStorage.getItem('selectedOrgItem'));
    if (storedSelection){
        console.log("timelineLink clicked for row(cell) " + storedSelection.row + " with url " + storedSelection.url);
        // Just fire the message through parent object
        if (window.parent) {
            window.parent.postMessage({from: 'org-chart', node: storedSelection.row, url: storedSelection.url}, '*');
        }
        if (el){
            el.scrollIntoView(scrollOptions);
        }
    }
};

function removeRemainingColumns(data, fromIndex) {
    return data.map(function (row) {
        return row.slice(0, -fromIndex);
    });
}

function selectChartItem(rowIndex) {
    var selectionArray = new Array(1).fill({ row: rowIndex, column: null });
    console.log("selectChartItem row(cell) " + selectionArray);
    chart.setSelection(selectionArray);
}

function navigateToNode(elementId){
    console.log('navigating to ' + elementId);
    const element = document.getElementById(elementId);
    if (element){
        selectChartItem(element.dataset.row);
        var scrollOptions = { behavior: "smooth", block: "center", inline: "center" };
       element.scrollIntoView(scrollOptions);
    }
}
