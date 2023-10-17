import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "D's Rawing App";
const canvasSize = 256;
const canvasOrigin = 0;
const firstElement = 0;

const thinMarkerWidth = 1;
const thickMarkerWidth = 5;
let currentMarkerWidth = thinMarkerWidth;

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

const allLines: DrawableObject[] = [];
const redoLines: DrawableObject[] = [];
let currentLine: Marker;

const ctx = canvas.getContext("2d");

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("drawing-changed", () => {
  ctx?.clearRect(canvasOrigin, canvasOrigin, canvas.width, canvas.height);
  for (const object of allLines) {
    object.display(ctx!);
  }
});

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = new Marker({ x: cursor.x, y: cursor.y }, currentMarkerWidth);
  allLines.push(currentLine);

  redoLines.splice(firstElement, redoLines.length);

  canvas.dispatchEvent(drawChangedEvent);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine.addPoint({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(drawChangedEvent);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

app.append(document.createElement("br"));

const clearButton = document.getElementById("clear");
clearButton!.innerHTML = "clear";
app.append(clearButton!);

clearButton!.addEventListener("click", () => {
  allLines.splice(firstElement, allLines.length);
  redoLines.splice(firstElement, redoLines.length);
  canvas.dispatchEvent(drawChangedEvent);
});

const undoButton = document.getElementById("undo");
undoButton!.innerHTML = "undo";
app.append(undoButton!);

undoButton!.addEventListener("click", () => {
  const undoneLine = allLines.pop();

  if (undoneLine != undefined) {
    redoLines.push(undoneLine);
    canvas.dispatchEvent(drawChangedEvent);
  }
});

const redoButton = document.getElementById("redo");
redoButton!.innerHTML = "redo";
app.append(redoButton!);

redoButton!.addEventListener("click", () => {
  const redoneLine = redoLines.pop();

  if (redoneLine != undefined) {
    allLines.push(redoneLine);
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
