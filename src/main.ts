import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "D's Rawing App";
const canvasSize = 256;
const canvasOrigin = 0;
const firstElement = 0;

const thinMarkerWidth = 1;
const thickMarkerWidth = 5;

const markerIcon = "*";
const markerOffset = 4;
const thickFactor = 2;
const cursorStickerFactor = 2;
const stickerOffsetFactor = 6;
const yFactor = 2;

const sticker1 = "😎";
const sticker2 = "☠️";
const sticker3 = "🔫";

const markerType = "Marker";
const stickerType = "Sticker";

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
  drag(point: Coordinate): void;
}

class Marker implements DrawableObject {
  line: Coordinate[] = [];
  width: number;

  constructor(point: Coordinate, width: number) {
    this.line.push(point);
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

  drag(point: Coordinate) {
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
    let xFactor = 1;
    if (
      currentDrawableType == markerType &&
      currentMarkerWidth == thickMarkerWidth
    ) {
      context.font = "32px monospace";
      calculatedOffset = markerOffset * thickFactor;
    } else if (currentDrawableType == stickerType) {
      context.font = "12px monospace";
      calculatedOffset = markerOffset / cursorStickerFactor;
      xFactor = stickerOffsetFactor / cursorStickerFactor;
    } else {
      context.font = "16px monospace";
      calculatedOffset = markerOffset;
    }
    context.fillText(
      this.getImage(),
      this.location.x - xFactor * calculatedOffset,
      this.location.y + yFactor * calculatedOffset
    );
  }

  drag(point: Coordinate) {
    this.location = point;
  }

  getPosition(): Coordinate {
    return this.location;
  }

  getImage() {
    if (currentDrawableType == stickerType) {
      return currentStickerType;
    } else {
      return markerIcon;
    }
  }
}

class Sticker implements DrawableObject {
  location: Coordinate;
  type: string;

  constructor(point: Coordinate, type: string) {
    this.location = point;
    this.type = type;
  }

  display(context: CanvasRenderingContext2D) {
    context.font = "32px monospace";
    context.fillText(
      this.type,
      this.location.x - stickerOffsetFactor * markerOffset,
      this.location.y + yFactor * markerOffset
    );
  }

  drag(point: Coordinate) {
    this.location = point;
  }
}

const allItems: DrawableObject[] = [];
const redoItems: DrawableObject[] = [];
let currentLine: DrawableObject;

const ctx = canvas.getContext("2d");
const cursor = new Cursor({ x: 0, y: 0 });

let currentMarkerWidth = thinMarkerWidth;
let currentStickerType = sticker1;
let currentDrawableType = markerType;

function drawCanvas() {
  ctx?.clearRect(canvasOrigin, canvasOrigin, canvas.width, canvas.height);
  for (const object of allItems) {
    object.display(ctx!);
  }

  if (cursor.isActive && !cursor.isPressed) {
    cursor.display(ctx!);
  }
}

function createDrawableObject(): DrawableObject {
  if (currentDrawableType == stickerType) {
    return new Sticker(cursor.getPosition(), currentStickerType);
  } else {
    return new Marker(cursor.getPosition(), currentMarkerWidth);
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
  cursor.drag({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(cursorChangedEvent);
});

canvas.addEventListener("mouseout", () => {
  cursor.isActive = false;
  cursor.isPressed = false;
  canvas.dispatchEvent(cursorChangedEvent);
});

canvas.addEventListener("mousedown", (e) => {
  cursor.isPressed = true;
  cursor.drag({ x: e.offsetX, y: e.offsetY });

  currentLine = createDrawableObject();
  allItems.push(currentLine);

  redoItems.splice(firstElement, redoItems.length);

  canvas.dispatchEvent(drawChangedEvent);
});

canvas.addEventListener("mousemove", (e) => {
  cursor.drag({ x: e.offsetX, y: e.offsetY });
  canvas.dispatchEvent(cursorChangedEvent);
  if (cursor.isPressed) {
    currentLine.drag(cursor.getPosition());
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
  currentDrawableType = markerType;
  currentMarkerWidth = thinMarkerWidth;
});

const thickButton = document.getElementById("thick");
thickButton!.innerHTML = "thick";
app.append(thickButton!);

thickButton!.addEventListener("click", () => {
  currentDrawableType = markerType;
  currentMarkerWidth = thickMarkerWidth;
});

const sticker1Button = document.getElementById("sticker1");
sticker1Button!.innerHTML = sticker1;
app.append(sticker1Button!);

sticker1Button!.addEventListener("click", () => {
  currentStickerType = sticker1;
  currentDrawableType = stickerType;
});

const sticker2Button = document.getElementById("sticker2");
sticker2Button!.innerHTML = sticker2;
app.append(sticker2Button!);

sticker2Button!.addEventListener("click", () => {
  currentStickerType = sticker2;
  currentDrawableType = stickerType;
});
const sticker3Button = document.getElementById("sticker3");
sticker3Button!.innerHTML = sticker3;
app.append(sticker3Button!);

sticker3Button!.addEventListener("click", () => {
  currentStickerType = sticker3;
  currentDrawableType = stickerType;
});
