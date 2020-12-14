//#region DECLARATION ZONE
const canvas = document.getElementById("canvas");
const ctx = document.getElementById("canvas").getContext("2d");
const canvasOver = document.getElementById("canvasOver");
const ctxOver = document.getElementById("canvasOver").getContext("2d");
const canvasContainer = document.getElementById("canvas-container");
const canvasOffsetX = 20;
const canvasOffsetY = 100;
const histogramCanvas = document.getElementById("histogramCanvas")
const histogramCtx = histogramCanvas.getContext('2d');
const btnShowHistogram = document.getElementById("btnShowHistogram")
const btnGrayscale = document.getElementById("btnGrayscale");
const btnInvert = document.getElementById("btnInvert");
const sliderBrightness = document.getElementById("brightnessSlider");
const sliderContrast = document.getElementById("contrastSlider");
const btnAddText = document.getElementById("btnAddText");
const textInput = document.getElementById("textInput");
const xInput = document.getElementById("xInput");
const yInput = document.getElementById("yInput");
const sizeInput = document.getElementById("sizeInput");
const colorInput = document.getElementById("colorInput");
const btnCrop = document.getElementById("cropBtn");
let selecting = false;
let movingSelection = false;
let shiftDown = false;
let tempImageData;
let originalImage;
let originalRatio = 16 / 9;
let img = new Image();
let xStart = 0;
let yStart = 0;
let xEnd = 0;
let yEnd = 0;
//#endregion

//#region EVENT LISTENERS

btnCrop.onclick = function (){
  if(xEnd-xStart) {
    const imageData = ctx.getImageData(xStart, yStart, xEnd - xStart, yEnd - yStart);
    canvas.width = xEnd-xStart;
    canvas.height = yEnd - yStart;
    ctx.putImageData(imageData,0,0);
    canvasContainer.style.width = xEnd-xStart.toString()+"px";
    canvasContainer.style.height = yEnd-yStart.toString()+"px";
    canvasOver.width = xEnd-xStart;
    canvasOver.height = yEnd - yStart;

  }
  else{
    const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    xStart = 0;
    yStart = 0;
    xEnd = canvas.width;
    yEnd = canvas.height;
    grayscale(imageData);
  }
}

btnAddText.onclick = function(){
  drawText();
}

sliderBrightness.onchange = function() {
  applyBrightness(this.value);
}

sliderContrast.onchange = function() {
  applyContrast(parseInt(sliderContrast.value, 10));
}

btnShowHistogram.addEventListener("click",()=>{
  drawHistogram();
})
btnGrayscale.addEventListener("click",()=>{
  if(xEnd-xStart) {
    const imageData = ctx.getImageData(xStart, yStart, xEnd - xStart, yEnd - yStart);
    grayscale(imageData);
  }
  else{
    const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    xStart = 0;
    yStart = 0;
    xEnd = canvas.width;
    yEnd = canvas.height;
    grayscale(imageData);
  }

})
btnInvert.addEventListener("click",()=>{
  if(xEnd-xStart) {
    const imageData = ctx.getImageData(xStart, yStart, xEnd - xStart, yEnd - yStart);
    invert(imageData);
  }
  else{
    const imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    xStart = 0;
    yStart = 0;
    xEnd = canvas.width;
    yEnd = canvas.height;
    invert(imageData);
  }

})

canvasOver.addEventListener("mousedown", (e) => {
  if(shiftDown){
    tempImageData = ctx.getImageData(xStart, yStart, xEnd - xStart, yEnd - yStart);
    movingSelection = true;
  }
  else {
    selecting = true;
    xStart = Math.round(e.clientX - canvasOffsetX);
    yStart = Math.round(e.clientY - canvasOffsetY);
    ctxOver.clearRect(0, 0, canvas.width, canvas.height)
    drawHistogram()
  }
});

canvasOver.addEventListener("mouseup", (e) => {
  let xEndMove = Math.round(e.clientX - canvasOffsetX);
  let yEndMove = Math.round(e.clientY - canvasOffsetY);
  if(shiftDown){
    ctx.putImageData(tempImageData,xEndMove,yEndMove);
    deleteSelection(tempImageData)
    movingSelection = false;
  }
  else{
    selecting = false;
    xEnd = Math.round(e.clientX - canvasOffsetX);
    yEnd = Math.round(e.clientY - canvasOffsetY);
  ctxOver.fillstyle = "#000000"
  ctxOver.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
  drawHistogram()
  }
});


document.addEventListener("keydown", logKeyDown);
document.addEventListener("keyup",logKeyUp);

function logKeyDown(e) {
  if(e.code === `KeyA`){
    // canvas.width=300;
    // canvas.height=300/originalRatio;
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  if(e.code === `Delete`){
    deleteSelection(ctx.getImageData(xStart,xEnd,xEnd-xStart,yEnd-yStart));
  }
  if(e.code === `ShiftLeft`){
    shiftDown = true;
  }
}

function logKeyUp(e){
  if(e.code=== `ShiftLeft`){
    shiftDown = false;
  }
}

canvasOver.addEventListener("mousemove", function (e) {
  if(movingSelection){
    ctxOver.clearRect(0,0,canvasOver.width,canvasOver.height);
    drawSelectionBox(e.clientX-canvasOffsetX,e.clientY-canvasOffsetY);
  }
  if(selecting){
    ctxOver.clearRect(0,0,canvasOver.width,canvasOver.height);
    drawSelecting(e.clientX-canvasOffsetX-xStart,e.clientY-canvasOffsetY-yStart);
  }
  const cRect = canvas.getBoundingClientRect();
  const canvasX = Math.round(e.clientX - cRect.left);
  const canvasY = Math.round(e.clientY - cRect.top);
  canvasOver.getContext("2d").clearRect(0, 0, 100, 30);
  canvasOver.getContext("2d").fillText("X: " + canvasX + ", Y: " + canvasY, 10, 20);
});
//#endregion

//#region QUERY SELECTOR ALL

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  canvasContainer.style.display = "none";
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", () => {
    inputElement.click();
  });

  inputElement.addEventListener("change", () => {
    if (inputElement.files.length) {
      img = new Image();
      img.onload = function () {
        canvas.width = 800;
        canvas.height = 600;
        canvasOver.width = 800;
        canvasOver.height = 600;
        originalRatio = img.width/img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        originalImage = img;
      };
      img.src = URL.createObjectURL(inputElement.files[0]);
      updateThumbnail(dropZoneElement, inputElement.files[0]);
      changeMode();
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, () => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      changeMode();
      inputElement = inputElement.files = e.dataTransfer.files;
      img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        originalImage = img;
      };
      img.src = URL.createObjectURL(e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });
});

//#endregion

//#region UTILITARIES

function drawText() {
  ctx.font = sizeInput.value + "px Arial";
  ctx.fillStyle = colorInput.value;
  console.log(sizeInput.value);
  ctx.fillText(textInput.value, xInput.value, yInput.value);
}

function drawSelectionBox(x,y) {
  ctxOver.strokeRect(x,y,tempImageData.width,tempImageData.height);
}

function drawSelecting(w,h){
  ctxOver.strokeRect(xStart,yStart,w,h)
}

function truncateColor(value) {
  if (value < 0) {
    value = 0;
  } else if (value > 255) {
    value = 255;
  }

  return value;
}

function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

function changeMode() {
  let formElement = document.querySelector(".form-drop");
  formElement.remove();
  canvasContainer.style.display = "block";
  canvasContainer.width = 800;
}

function redrawImage() {
  ctx.drawImage(originalImage,0,0,canvas.width,canvas.height);
}


//#endregion

//#region IMAGE EFFECTS

function grayscale(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // red
    data[i + 1] = avg; // green
    data[i + 2] = avg; // blue
  }
  imageData.data = data;
  ctx.putImageData(
      imageData,
      xStart < xEnd ? xStart : xEnd,
      yStart < yEnd ? yStart : yEnd
  );
}

function deleteSelection(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i++) {
    data[i]=255;
  }
  imageData.data = data;
  ctx.putImageData(
      imageData,
      xStart < xEnd ? xStart : xEnd,
      yStart < yEnd ? yStart : yEnd
  );
}

function invert(imageData){
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i];     // red
    data[i + 1] = 255 - data[i + 1]; // green
    data[i + 2] = 255 - data[i + 2]; // blue
  }
  imageData.data = data;
  ctx.putImageData(imageData,
      xStart < xEnd ? xStart : xEnd,
      yStart < yEnd ? yStart : yEnd
  );
}

function applyBrightness(brightness) {
  redrawImage();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i+= 4) {
    data[i] += 255 * (brightness / 100);
    data[i+1] += 255 * (brightness / 100);
    data[i+2] += 255 * (brightness / 100);
  }
  imageData.data = data;
  ctx.putImageData(imageData,0,0)
}
function applyContrast(contrast) {
  redrawImage();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = truncateColor(factor * (data[i] - 128.0) + 128.0);
    data[i + 1] = truncateColor(factor * (data[i + 1] - 128.0) + 128.0);
    data[i + 2] = truncateColor(factor * (data[i + 2] - 128.0) + 128.0);
  }
  imageData.data = data;
  ctx.putImageData(imageData,0,0)
}

//#endregion

//#region HISTOGRAMA
function array256(default_value) {
  let arr = [];
  for (let i=0; i<256; i++) { arr[i] = default_value; }
  return arr;
}
function drawHistogram() {
  histogramCtx.clearRect(0,0,histogramCanvas.width,histogramCanvas.height);
  const reds = array256(0);
  const greens = array256(0);
  const blues = array256(0);
  let imageData;
  if(xEnd-xStart)
   imageData = ctx.getImageData(xStart, yStart, xEnd-xStart, yEnd-yStart);
  else {
     imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  for (let i = 0; i < imageData.width * imageData.height; i += 4) {
    reds[imageData.data[i]]++;
    greens[imageData.data[i + 1]]++;
    blues[imageData.data[i + 2]]++;
  }
  let maxRed = Math.max(...reds);
  let maxGreen = Math.max(...greens);
  let maxBlue = Math.max(...blues);
  let maxMax = Math.max(maxGreen,maxRed,maxBlue);
  for(let i=0;i<255;i++) {
    histogramCtx.strokeStyle = "#FF0000"
    histogramCtx.fillStyle = "#FF0000"
    histogramCtx.fillRect(i, 30, 1, reds[i] / maxMax * 80);
    histogramCtx.strokeStyle = "#00FF00"
    histogramCtx.fillStyle = "#00FF00"
    histogramCtx.fillRect(i, 30, 1, greens[i] / maxMax * 80);
    histogramCtx.strokeStyle = "#0000FF"
    histogramCtx.fillStyle = "#0000FF"
    histogramCtx.fillRect(i, 30, 1, blues[i] / maxMax * 80);
  }
}

//#endregion
