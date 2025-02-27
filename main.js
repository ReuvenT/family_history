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
}, false);

async function drawChart() {
    let fName = "/data/familytreedata.csv";
    const response = await fetch(fName);
    const data = await response.text();

    if (response.status > 200)
    {
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

