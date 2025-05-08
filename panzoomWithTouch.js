// Inital method to call to apply PanZoom to elements given a selector
// code used from https://github.com/SpencerWie/Panzoom?tab=readme-ov-file
function PanZoom() {
    let ele = document.getElementById("panzoom_container");
    return new AttachPanZoom(ele, 0.1, 5, 0.05, false);
}

// Appy PanZoom functionality to a given element, allow user defined zoom min and inc per scroll
function AttachPanZoom(ele, minScale, maxScale, increment, liner) {
    this.increment = increment;
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.liner = liner;
    this.panning = false;
    this.oldX = this.oldY = 0;
    this.touchDistance = 0;
    let self = this;

    ele.style.transform = "matrix(1, 0, 0, 1, 0, 0)";

    // Gets the current Scale, along with transX and transY
    this.getTransformMatrix = function () {
        let trans = ele.style.transform;
        let start = trans.indexOf("(") + 1;
        let end = trans.indexOf(")");
        let matrix = trans.slice(start, end).split(",");
        return {
            "scale": +matrix[0],
            "transX": +matrix[4],
            "transY": +matrix[5]
        }
    }

    // Given the scale, translateX and translateY apply to CSSS transform
    this.setTransformMatrix = function (o) {
        let matrix = 'matrix(' + o.scale + ', 0, 0, ' + o.scale + ', ' + o.transX + ', ' + o.transY + ')';
        let scale = 'scale(' + o.scale + ')';
        //console.log("setTransformMatrix transform matrix: " + matrix + " scale: " + scale);
        ele.style.transform = matrix;
    }

    this.applyTranslate = function (dx, dy) {
        let newTrans = this.getTransformMatrix();
        newTrans.transX += dx;
        newTrans.transY += dy;
        //console.log("applyTranslate manewTranstrix: " + JSON.stringify(newTrans));
        this.setTransformMatrix(newTrans);
    }

    // Applying Deltas to Scale and Translate transformations
    this.applyScale = function (dscale, x, y) {
        //console.log("applyScale (x,y): "  +  dscale + ', ' + x + ', ' + y );
        let newTrans = this.getTransformMatrix();
        let width = ele.width ? ele.width : ele.offsetWidth;
        let height = ele.height ? ele.height : ele.offsetHeight;
        //console.log("applyScale scale, (x,y): "  +  dscale + ', ' + x + ', ' + y + " offset (x,y): "  +  xOffset + ', ' + yOffset );
        let tranX = x - (width / 2);
        let tranY = y - (height / 2);
        dscale = (this.liner ? dscale : dscale * (newTrans.scale)) // scale either liner or non-liner 
        //console.log("applyScale (x,y): "  +  dscale + ', ' + tranX + ', ' + tranY );
        newTrans.scale += dscale;
        let maxOrMinScale = (newTrans.scale <= this.minScale || newTrans.scale >= this.maxScale);
        if (newTrans.scale < this.minScale) newTrans.scale = this.minScale;
        if (newTrans.scale > this.maxScale) newTrans.scale = this.maxScale;
        if (!maxOrMinScale) {
            //  get element in center before move
            centEl = getCenterElement().centerEl;
            cendElRect = centEl.getBoundingClientRect();
            if (cendElRect.right == 0) {
                centEl = centEl.parentElement;
                cendElRect = centEl.getBoundingClientRect();
            }
            cendPos = { x: cendElRect.left, y: cendElRect.top };
            this.applyTranslate(tranX, tranY);
            this.setTransformMatrix(newTrans);
            //centEl = document.getElementById(centEl.id);
            cendElRect = centEl.getBoundingClientRect();
            let diffX = cendPos.x - cendElRect.left;
            let diffY = cendPos.y - cendElRect.top;
            //console.log("applyScale diff (x,y): "  +  diffX + ', ' + diffY );
            this.applyTranslate(diffX, diffY);
            //this.applyTranslate(-(tranX * dscale * 2), -(tranY * dscale * 2));
        }
    }

    // Capture when the mouse is down on the element or not
    ele.addEventListener("mousedown", function (e) {
        e.preventDefault();
        this.touchDistance = 0;
        this.panning = true;
        this.oldX = e.clientX;
        this.oldY = e.clientY;
    });
    // Capture when the screen is touched(single is pan, 2 is zoom)
    ele.addEventListener("touchstart", function (e) {
        e.preventDefault();
        console.log("touchstart (e.touches.length): "  +  e.touches.length );
        if (e.touches.length >= 2) {
            this.touchDistance = getDistance(e.touches);
        }
        else {
            this.panning = true;
            this.oldX = e.clientX;
            this.oldY = e.clientY;
        }
    });

    ele.addEventListener("mouseup", function (e) { this.panning = false; });
    ele.addEventListener("mouseleave", function (e) { this.panning = false; });
    ele.addEventListener("touchend", function (e) { this.panning = false; });
    ele.addEventListener("touchcancel", function (e) { this.panning = false; });

    ele.addEventListener("mousemove", function (e) {
        if (this.panning) {
            let deltaX = e.clientX - this.oldX;
            let deltaY = e.clientY - this.oldY;

            self.applyTranslate(deltaX, deltaY);
            this.oldX = e.clientX;
            this.oldY = e.clientY;
        }
    });
    ele.addEventListener("touchmove", function (e) {
        console.log("touchmove (e.touches.length): "  +  e.touches.length + ", touchDistance " + this.touchDistance + ", panning " + this.panning);
        if (this.touchDistance && e.touches.length >= 2) {
            const newDistance = getDistance(e.touches);
            const scaleFactor = newDistance / this.touchDistance;
            console.log("touchmove (scaleFactor): "  +  scaleFactor);
            self.style.transform = `scale(${scaleFactor})`;
        }
        else {
            if (this.panning) {
                let deltaX = e.clientX - this.oldX;
                let deltaY = e.clientY - this.oldY;

                self.applyTranslate(deltaX, deltaY);
                this.oldX = e.clientX;
                this.oldY = e.clientY;
            }
        }
    });

    this.getScrollDirection = function (e) {
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        if (delta < 0) {
            self.applyScale(-self.increment, e.offsetX, e.offsetY)
        }
        else {
            self.applyScale(self.increment, e.offsetX, e.offsetY);
        }
        //console.log("getScrollDirection delta: " + delta);
        //showNode(getCenterElement().centerEl);
    }

    ele.addEventListener('DOMMouseScroll', this.getScrollDirection, false);
    ele.addEventListener('mousewheel', this.getScrollDirection, false);
}

function getDistance(touches) {
    const x1 = touches[0].clientX;
    const y1 = touches[0].clientY;
    const x2 = touches[1].clientX;
    const y2 = touches[1].clientY;
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function getTransformScale(isPopup, currentScale) {
    let tScale = 1;
    try {
        transform = document.getElementById("panzoom_container").style.transform;
        //console.log("getTransformScale for " + (isPopup ? "popup" : "full") + " current: " + currentScale + " transform: " + JSON.stringify(transform));
        let start = transform.indexOf("(") + 1;
        let end = transform.indexOf(")");
        let matrix = transform.slice(start, end).split(",");
        if (matrix[4] == " 0") {
            tScale = currentScale;
        }
        else {
            if (matrix[0] * 1 > 1) {
                tScale = 1;
            }
            else {
                tScale = matrix[0];
            }
        }


    } catch (error) {
        console.log("getTransformScale matrix error: " + error);
    }
    //console.log("getTransformScale returns: " + tScale + ", isPopup: " + isPopup);
    return tScale;
}
