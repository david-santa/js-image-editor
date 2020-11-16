var xStart = 0;
var yStart = 0;
var xEnd = 0;
var yEnd = 0;

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      inputElement = inputElement.files = e.dataTransfer.files;
      var can = document.getElementById("canvas");
      var ctx = document.getElementById("canvas").getContext("2d");
      var img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, can.clientWidth, can.clientHeight);
      };
      img.src = URL.createObjectURL(e.dataTransfer.files[0]);
      updateThumbnail(dropZoneElement, inputElement.files[0]);
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
      var canvas = document.getElementById("canvas");
      var ctx = document.getElementById("canvas").getContext("2d");
      var img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //albNegru(imageData);
      };
      img.src = URL.createObjectURL(e.dataTransfer.files[0]);
      changeMode();
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });
});

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

function albNegru(imageData) {
  var ctx = document.getElementById("canvas").getContext("2d");
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

const canvas = document.querySelector(".canvas");
canvas.addEventListener("mousedown", (e) => {
  var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
  var canvasX = Math.round(e.clientX - canvas.offsetLeft); // Subtract the 'left' of the canvas
  var canvasY = Math.round(e.clientY - canvas.offsetTop);
  xStart = canvasX;
  yStart = canvasY;
  console.log(xStart, yStart);
  // var context = canvas.getContext("2d");
  // context.beginPath();
  // context.moveTo(x, y);
  // context.lineTo(0, 0);
  // context.stroke();
});

canvas.addEventListener("mouseup", (e) => {
  var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
  var canvasX = Math.round(e.clientX - canvas.offsetLeft); // Subtract the 'left' of the canvas
  var canvasY = Math.round(e.clientY - canvas.offsetTop);
  xEnd = canvasX;
  yEnd = canvasY;
});

document.addEventListener("keydown", logKey);

const buttonBW = document.querySelector(".btnBW");
buttonBW.addEventListener("click", (e) => {
  var canvas = document.getElementById("canvas");
  var ctx = document.getElementById("canvas").getContext("2d");
  const imageData = ctx.getImageData(
    xStart,
    yStart,
    xEnd - xStart,
    yEnd - yStart
  );
  albNegru(imageData);
});

function logKey(e) {
  if (e.code === `KeyA`) {
    canvas
      .getContext("2d")
      .fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
    console.log(xEnd, yEnd);
    console.log(xStart, yStart, xEnd - xStart, yEnd - yStart);
  }
}

canvas.addEventListener("mousemove", function (e) {
  var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
  var canvasX = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas
  var canvasY = Math.round(e.clientY - cRect.top); // from the X/Y positions to make
  canvas.getContext("2d").clearRect(0, 0, 100, 30); // (0,0) the top left of the canvas
  canvas.getContext("2d").fillText("X: " + canvasX + ", Y: " + canvasY, 10, 20);
});
