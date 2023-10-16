import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "D's Rawing App";
const canvasSize = 256;

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

const allLines: Coordinate[][] = [];
const redoLines: Coordinate[][] = [];
let currentLine: Coordinate[] = [];

const ctx = canvas.getContext("2d");

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("drawing-changed", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of allLines) {
    if (line.length > 1) {
      ctx?.beginPath();
      const coord: Coordinate = line[0];
      ctx?.moveTo(coord.x, coord.y);
      for (const pair of line) {
        ctx?.lineTo(pair.x, pair.y);
      }
      ctx?.stroke();
    }
  }
});

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  allLines.push(currentLine);
  currentLine.push({ x: cursor.x, y: cursor.y });

  redoLines.splice(0, redoLines.length);

  canvas.dispatchEvent(drawChangedEvent);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine.push({ x: cursor.x, y: cursor.y });

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
  allLines.splice(0, allLines.length);
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
