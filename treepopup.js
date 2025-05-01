const popup = document.getElementById("tree-popup");
var r = document.getElementById('resizer');
r.addEventListener('mousedown', initDrag, false);

function captureAndSaveChartState() {
  let mode = "popup";
  let pState = getChartViewState();
  let currentEl = document.getElementById("LOU_TRA");
  let selectedList = document.querySelectorAll('.selected');
  if (selectedList && selectedList.length){
    currentEl = selectedList[0];
    pState.isSelected = true;
  }
  else{
    currentEl = getCenterElement().centerEl;
    pState.isSelected = false;
  }
  if (currentEl) {
    pState.currentId = currentEl.id;
    pState.timelineId = currentEl.getAttribute('data-timelineid');
  }

  let rect = popup.getBoundingClientRect();
  if (rect.width > 30 && rect.height > 50) {
    pState.left = rect.left; 
    pState.top = rect.top; 
    pState.height = rect.height; 
    pState.width = rect.width;
    pState.popupScale = getTransformScale(true, pState.popupScale);
  }
  else{
    pState.fullScale = getTransformScale(false, pState.fullScale);
    mode = "full";
  }

  // safeguards:
  if (pState.left < 1) {
    pState.left = 1;
  }
  if (pState.top < 1) {
    pState.top = 1;
  }
  if (pState.width < 300 || pState.width > 800) {
    pState.width = 300;
  }
  if (pState.height < 150 || pState.height > 800) {
    pState.height = 750;
  }

  //console.log("captureAndSaveChartState (" + mode + ") state: " + JSON.stringify(pState));
  setChartViewState(pState);
  return pState.popupScale;
}

function toggleOrgChartPopup() {
  if (popup.style.display == "none") {
    openOrgChartPopup();
  }
  else {
    closeChartPopup();
  }
}

function closeChartPopup() {
  popup.style.display = "none";
  let popupState = getChartViewState();
  popupState.showPopUp = false;
  setChartViewState(popupState);
  //console.log("closeChartPopup");
  let ocEle = document.getElementById("orgchart-container");
  ocEle.style.removeProperty('height');
  captureAndSaveChartState();
}

function openOrgChartPopup() {
  let ocEle = document.getElementById("orgchart-container");
  let popupState = getChartViewState();
  //console.log("openOrgChartPopup popupState: " + JSON.stringify(popupState));
  let contHeight = document.getElementById("tl-timeline-iframe").getBoundingClientRect().height;
  if (popupState.height > contHeight - 50){
    popupState.height = contHeight - 50;
  }
  popupState.showPopUp = true;
  setChartViewState(popupState);
  popup.style.top = (popupState.top) + "px";
  popup.style.left = (popupState.left) + "px";
  popup.style.width = (popupState.width) + "px";
  popup.style.height = (popupState.height) + "px";
  let matrix = 'matrix(' + popup.style.popupScale + ', 0, 0, ' + popup.style.popupScale + ', 0, 0)';
  document.getElementById("panzoom_container").style.transform = matrix;
  radiobtn = document.getElementById("view-timeline");
  ocEle.style.height = popup.style.height;
  if (radiobtn.checked) {
    //console.log('openOrgChartPopup radiobtn.checked: ' + radiobtn.checked)
    ocEle.style.display = "block";
    ocEle.style.visibility = "visible";
    popup.style.display = "block";
    moveOrgChart(false) ;
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
  //console.log("do drag");
  popup.style.width = (startWidth + e.clientX - startX) + 'px';
  popup.style.height = (startHeight + e.clientY - startY) + 'px';
}

function stopResizePopup(e) {
  popup.removeEventListener('mousemove', doResizePopup, false);
  popup.removeEventListener('mouseup', stopResizePopup, false);
  captureAndSaveChartState();
  let ocEle = document.getElementById("orgchart-container");
  ocEle.style.height = popup.style.height
  //console.log("stop drag state");
}

dragElement(popup);

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
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
    captureAndSaveChartState();
    console.log("closeDragElement");

  }
}