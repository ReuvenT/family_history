const popup = document.getElementById("tree-popup");
//const popupStateItem = localStorage.getItem("treePopupState");
var r = document.getElementById('resizer');
r.addEventListener('mousedown', initDrag, false);


// restore previous popup state
function initChartPopup(callOpenPopup){
  let popupStateItem = localStorage.getItem("treePopupState");
  if (popupStateItem != '[object Object]' && (typeof popupStateItem === 'string' || popupStateItem instanceof String)) {
    let popupState = JSON.parse(popupStateItem);
    if (popupState) {
      console.log("initChartPopup callOpenPopup, popupState: " + callOpenPopup + ", " + JSON.stringify(popupState));
      popup.style.top = (popupState.top) + "px";
      popup.style.left = (popupState.left) + "px";
      popup.style.width = (popupState.width) + "px";
      popup.style.height = (popupState.height) + "px";
      if (callOpenPopup && popupState && popupState.shown) {
        openOrgChartPopup();
      }
    }
  }
}

// restore previous popup state
function captureAndSaveChartPopupState(shownFlag){
  let rect = popup.getBoundingClientRect();
  let pState = {shown: shownFlag, left: rect.left, top: rect.top, height: rect.height, width: rect.width};
  console.log("captureChartPopupState popupState: " + JSON.stringify(pState));
  localStorage.setItem("treePopupState", JSON.stringify(pState));
}

function toggleOrgChartPopup(){
  if (popup.style.display == "none"){
    openOrgChartPopup();
  }
  else{
    closeChartPopup();
  }
}

function closeChartPopup(){
  popup.style.display = "none";
  captureAndSaveChartPopupState(false);
}

function openOrgChartPopup(){
  initChartPopup(false);
  radiobtn = document.getElementById("view-timeline");
  let tpTarget = document.getElementById("popup-content-target");
  let ocEle= document.getElementById("orgchart-container");
  let ocSource = document.getElementById("chart-content-target");
  if (radiobtn.checked){
      console.log('openOrgChartPopup radiobtn.checked: ' + radiobtn.checked)

      ocEle.style.display = "block";
      popup.style.display = "block";
      try {
          tpTarget.appendChild(ocSource.firstElementChild);
      } catch (error) {
          console.log(error);            
      }
  }
}


var startX, startY, startWidth, startHeight;

function initDrag(e) {
  console.log("init drag");
  startX = e.clientX;
  startY = e.clientY;
  startWidth = parseInt(document.defaultView.getComputedStyle(popup).width, 10);
  startHeight = parseInt(document.defaultView.getComputedStyle(popup).height, 10);
  popup.addEventListener('mousemove', doResizePopup, false);
  popup.addEventListener('mouseup', stopResizePopup, false);
}

function doResizePopup(e) {
  console.log("do drag");
  popup.style.width = (startWidth + e.clientX - startX) + 'px';
  popup.style.height = (startHeight + e.clientY - startY) + 'px';
}

function stopResizePopup(e) {
  popup.removeEventListener('mousemove', doResizePopup, false);
  popup.removeEventListener('mouseup', stopResizePopup, false);
  captureAndSaveChartPopupState(true);
  console.log("stop drag state");
}

dragElement(popup);

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
    // } else {
    //   /* otherwise, move the DIV from anywhere inside the DIV:*/
    //   elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    captureAndSaveChartPopupState(true);
    console.log("closeDragElement");
    
  }
}