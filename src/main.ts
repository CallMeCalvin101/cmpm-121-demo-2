import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "D's Rawing App";
const canvasSize = 256;
const canvasOrigin = 0;
const firstElement = 0;

const thinMarkerWidth = 1;
const thickMarkerWidth = 5;
let currentMarkerWidth = thinMarkerWidth;

const markerOffset = 4;
const sizeFactor = 2;
const yFactor = 2;

document.title = gameName;

const header: HTMLElement | null = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

// Canvas, clear, and mouse code from https://shoddy-paint.glitch.me/paint0.html
// Array data saving implementation from https://shoddy-paint.glitch.me/paint1.html
const canvas = document.createElement("canvas");
canvas.setAttribute("id", "canvas");
canvas.width = canvasSize;
canvas.height = canvasSize;
app.append(canvas);

const drawChangedEvent: Event = new Event("drawing-changed");
const cursorChangedEvent: Event = new Event("cursor-changed");

interface Coordinate {
  x: number;
  y: number;
}

interface DrawableObject {
  display(ctx: CanvasRenderingContext2D): void;
}

class Marker implements DrawableObject {
  line: Coordinate[] = [];
  width: number;

  constructor(point: Coordinate, width: number) {
    this.addPoint(point);
    this.width = width;
  }

  display(context: CanvasRenderingContext2D) {
    if (this.line.length) {
      context.lineWidth = this.width;
      context.beginPath();
      const [firstPair, ...otherPairs] = this.line;
      context.moveTo(firstPair.x, firstPair.y);
      for (const pair of otherPairs) {
        context.lineTo(pair.x, pair.y);
      }
      context.stroke();
    }
  }

  addPoint(point: Coordinate) {
    this.line.push(point);
  }
}

class Cursor implements DrawableObject {
  isActive: boolean;
  isPressed: boolean;
  location: Coordinate;

  constructor(point: Coordinate) {
    this.isActive = false;
    this.isPressed = false;
    this.location = point;
  }

  display(context: CanvasRenderingContext2D) {
    let calculatedOffset = 0;
    if (currentMarkerWidth == thickMarkerWidth) {
      context.font = "32px monospace";
      calculatedOffset = markerOffset * sizeFactor;
    } else {
      context.font = "16px monospace";
      calculatedOffset = markerOffset;
    }
    context.fillText(
      "*",
      this.location.x - calculatedOffset,
      this.location.y + yFactor * calculatedOffset
    );
  }

  setPosition(point: Coordinate) {
    this.location = point;
  }

  getPosition(): Coordinate {
    return this.location;
  }
}

const allItems: DrawableObject[] = [];
const redoItems: DrawableObject[] = [];
let currentLine: Marker;

const ctx = canvas.getContext("2d");

const cursor = new Cursor({ x: 0, y: 0 });

function drawCanvas() {
  ctx?.clearRect(canvasOrigin, canvasOrigin, canvas.width, canvas.height);
  for (const object of allItems) {
    object.display(ctx!);
  }

  if (cursor.isActive) {
    cursor.display(ctx!);
  }
}

canvas.addEventListener("drawing-changed", () => {
  drawCanvas();
});

canvas.addEventListener("cursor-changed", () => {
  drawCanvas();
});

canvas.addEventListener("mouseenter", (e) => {
  cursor.isActive = true;
  cursor.setPosition({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(cursorChangedEvent);
});

canvas.addEventListener("mouseout", () => {
  cursor.isActive = false;
  console.log("disabled");
  canvas.dispatchEvent(cursorChangedEvent);
});

canvas.addEventListener("mousedown", (e) => {
  cursor.isPressed = true;
  cursor.setPosition({ x: e.offsetX, y: e.offsetY });

  currentLine = new Marker(cursor.getPosition(), currentMarkerWidth);
  allItems.push(currentLine);

  redoItems.splice(firstElement, redoItems.length);

  canvas.dispatchEvent(drawChangedEvent);
});

canvas.addEventListener("mousemove", (e) => {
  cursor.setPosition({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(cursorChangedEvent);
  if (cursor.isPressed) {
    currentLine.addPoint(cursor.getPosition());
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.isPressed = false;
});

app.append(document.createElement("br"));

const clearButton = document.getElementById("clear");
clearButton!.innerHTML = "clear";
app.append(clearButton!);

clearButton!.addEventListener("click", () => {
  allItems.splice(firstElement, allItems.length);
  redoItems.splice(firstElement, redoItems.length);
  canvas.dispatchEvent(drawChangedEvent);
});

const undoButton = document.getElementById("undo");
undoButton!.innerHTML = "undo";
app.append(undoButton!);

undoButton!.addEventListener("click", () => {
  const undoneLine = allItems.pop();

  if (undoneLine != undefined) {
    redoItems.push(undoneLine);
    canvas.dispatchEvent(drawChangedEvent);
  }
});

const redoButton = document.getElementById("redo");
redoButton!.innerHTML = "redo";
app.append(redoButton!);

redoButton!.addEventListener("click", () => {
  const redoneLine = redoItems.pop();

  if (redoneLine != undefined) {
    allItems.push(redoneLine);
    canvas.dispatchEvent(drawChangedEvent);
  }
});

const thinButton = document.getElementById("thin");
thinButton!.innerHTML = "thin";
app.append(thinButton!);

thinButton!.addEventListener("click", () => {
  currentMarkerWidth = thinMarkerWidth;
});

const thickButton = document.getElementById("thick");
thickButton!.innerHTML = "thick";
app.append(thickButton!);

thickButton!.addEventListener("click", () => {
  currentMarkerWidth = thickMarkerWidth;
});
