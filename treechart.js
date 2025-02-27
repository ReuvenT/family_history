let fullTable;

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
    chart = new google.visualization.OrgChart(document.getElementById('chart_container'));

    return renderedTable;
}

function treeSelectHandler() {
    var selectedItem = chart.getSelection()[0];
    if (selectedItem && selectedItem.hasOwnProperty('row')) { //&& selectedItem.row) {
        if (selectedItem) {
            var val0 = fullTable.getValue(selectedItem.row, 0);
            var val1 = fullTable.getValue(selectedItem.row, 1);
            var val2 = fullTable.getValue(selectedItem.row, 2);
            var val3 = fullTable.getValue(selectedItem.row, 3);
            localStorage.setItem('selectedOrgItem', JSON.stringify({ 'row': selectedItem.row, 'url': val3 }));
            console.log('The user selected row ' + selectedItem.row + ' with values ' + val0 + ', ' + val1 + ', ' + val2 + ', ' + val3);
        }

    }
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
    if (storedSelection) {
        console.log("timelineLink clicked for row(cell) " + storedSelection.row + " with url " + storedSelection.url);
        // Just fire the message through parent object
        if (window.parent) {
            window.parent.postMessage({ from: 'org-chart', node: storedSelection.row, url: storedSelection.url }, '*');
        }
        if (el) {
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

function navigateToNode(elementId) {
    console.log('navigating to ' + elementId);
    const element = document.getElementById(elementId);
    if (element) {
        selectChartItem(element.dataset.row);
        var scrollOptions = { behavior: "smooth", block: "center", inline: "center" };
        element.scrollIntoView(scrollOptions);
    }
}
