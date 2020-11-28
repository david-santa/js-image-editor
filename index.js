//#region DECLARATION ZONE
const buttonBW = document.querySelector(".btnBW");
const canvas = document.getElementById("canvas");
const ctx = document.getElementById("canvas").getContext("2d");
const canvasOver = document.getElementById("canvasOver");
const ctxOver = document.getElementById("canvasOver").getContext("2d");
var xStart = 0;
var yStart = 0;
var xEnd = 0;
var yEnd = 0;
//#endregion

//#region EVENT LISTENERS

canvasOver.addEventListener("mousedown", (e) => {
  var cRect = canvas.getBoundingClientRect();
  var canvasX = Math.round(e.clientX - canvas.offsetLeft);
  var canvasY = Math.round(e.clientY - canvas.offsetTop);
  xStart = canvasX;
  yStart = canvasY;
  console.log(xStart, yStart);
});

canvasOver.addEventListener("mouseup", (e) => {
  var canvasX = Math.round(e.clientX - canvas.offsetLeft);
  var canvasY = Math.round(e.clientY - canvas.offsetTop);
  xEnd = canvasX;
  yEnd = canvasY;
});


document.addEventListener("keydown", logKey);

function logKey(e) {
  if (e.code === `KeyA`) {
    ctxOver.fillstyle = "#000000"
    canvasOver
      .getContext("2d")
      .fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
  }
  if(e.code === `KeyB`){
    //ctxOver.fillStyle = "#00000000";
    ctxOver.clearRect(0,0,canvas.width,canvas.height);
  }
}

canvas.addEventListener("mousemove", function (e) {
  var cRect = canvas.getBoundingClientRect();
  var canvasX = Math.round(e.clientX - cRect.left);
  var canvasY = Math.round(e.clientY - cRect.top);
  canvasOver.getContext("2d").clearRect(0, 0, 100, 30);
  canvasOver.getContext("2d").fillText("X: " + canvasX + ", Y: " + canvasY, 10, 20);
});
//#endregion

//#region QUERY SELECTOR ALL

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      var file = inputElement.files;
      var img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
      };
      img.src = URL.createObjectURL(inputElement.files[0]);
      updateThumbnail(dropZoneElement, inputElement.files[0]);
      changeMode();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      inputElement = inputElement.files = e.dataTransfer.files;
      var img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      img.src = URL.createObjectURL(e.dataTransfer.files[0]);
      changeMode();
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });
});

//#endregion

//#region UTILITARIES

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
}

//#endregion

//#region IMAGE EFFECTS

function albNegru(imageData) {
  const data = imageData.data;
  for (var i = 0; i < data.length; i += 4) {
    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg; // red
    data[i + 1] = avg; // green
    data[i + 2] = avg; // blue
    ctx.putImageData(
      imageData,
      xStart < xEnd ? xStart : xEnd,
      yStart < yEnd ? yStart : yEnd
    );
  }
}

//#endregion
