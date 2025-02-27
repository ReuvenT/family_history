const baseTimelineUrl = 'https://www.tiki-toki.com/timeline/embed/';
const rootTimeline = "2138285/2648138406/";


window.onload = function(){
  // Here is how you would call the libary
  PanZoom(".panzoom");
}
localStorage.setItem('selectedOrgItem', null);
google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(drawChart);


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
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

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
      if (redirectedTimeline && redirectedTimeline !="null") {
        urlParams.delete("redirectedTimeline");
        console.log('redirectedTimeline: ' + decodeURI(redirectedTimeline));
        redirectiFrames(baseTimelineUrl + redirectedTimeline, redirectedTimeline);
      }
      else{
        redirectiFrames(baseTimelineUrl + rootTimeline, rootTimeline);
      }
    }, 250);
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
    redirectOrgchartiFrame(orgChartElId);
  }
  function redirectTimelineiFrame(newUrl) {
    // set timeline target
    document.getElementById('tl-timeline-iframe').src = newUrl;
  }

  function redirectOrgchartiFrame(orgChartNodeId) {
    // set orgchart target
    // try {
    //   let ocframe = document.getElementById('orgchart-iframe');
    //   if (ocframe.contentWindow && ocframe.contentWindow.postMessage) {
    //     console.log('posting message to orgchart: ' + orgChartNodeId)
    //     ocframe.contentWindow.postMessage(JSON.stringify({ nodeElId: orgChartNodeId, status: true }, "*"));
    //   }
    // } catch (e) {
    //   window.console && window.console.log(e);
    // }
  }

  function toggleTimeline(primaryiFrameId) {
    let tlFrame = document.getElementById("tl-timeline-iframe");
    let ocFrame = document.getElementById("orgchart-iframe");
    if (primaryiFrameId == "tl-timeline-iframe") {
      if (tlFrame.classList.contains("fullScreen")) {
        tlFrame.classList.remove("fullScreen");
        ocFrame.classList.remove("fullScreen");          }
      else {
        tlFrame.classList.add("fullScreen");
      }
    }
    else {
      if (ocFrame.classList.contains("fullScreen")) {
        tlFrame.classList.remove("fullScreen");
        ocFrame.classList.remove("fullScreen");
      }
      else {
        ocFrame.classList.add("fullScreen");
      }
    }
  }

