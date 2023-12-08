import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "D's Rawing App";
const canvasSize = 256;
const canvasOrigin = 0;
const firstElement = 0;

const thinPenWidth = 1;
const mediumPenWidth = 3;
const thickPenWidth = 5;
const penColorsList: string[][] = [
  ["black", "⚫"],
  ["red", "🔴"],
  ["yellow", "🟡"],
  ["green", "🟢"],
  ["blue", "🔵"],
  ["purple", "🟣"],
];

const penIcon = "*";
const penOffset = 4;
const thickFactor = 2;
const mediumFactor = 1.5;
const cursorStickerFactor = 2;
const stickerOffsetFactor = 6;
const yFactor = 2;

const stickersList: string[] = ["😎", "☠️", "🔫", "🎲", "🐢", "😈", "🌊"];
const firstIndex = 0;
const baseSticker = "baseSticker";
const customSticker = "customSticker";

const penType = "Pen";
const stickerType = "Sticker";

const exportScaleFactor = 4;
const exportOffsetX = 64;
const exportOffsetY = 4;

document.title = gameName;

// Canvas, clear, and mouse code from https://shoddy-paint.glitch.me/paint0.html
// Array data saving implementation from https://shoddy-paint.glitch.me/paint1.html

const header: HTMLElement | null = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

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

class Pen implements DrawableObject {
  line: Coordinate[] = [];
  width: number;
  color: string;

  constructor(point: Coordinate, width: number, color: string) {
    this.line.push(point);
    this.width = width;
    this.color = color;
  }

  display(context: CanvasRenderingContext2D) {
    if (this.line.length) {
      context.strokeStyle = this.color;
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
    if (currentDrawableType == penType && penData.width == thickPenWidth) {
      context.font = "32px monospace";
      calculatedOffset = penOffset * thickFactor;
    } else if (
      currentDrawableType == penType &&
      penData.width == mediumPenWidth
    ) {
      context.font = "24px monospace";
      calculatedOffset = penOffset * mediumFactor;
    } else if (currentDrawableType == stickerType) {
      context.font = "12px monospace";
      calculatedOffset = penOffset / cursorStickerFactor;
      xFactor = stickerOffsetFactor / cursorStickerFactor;
    } else {
      context.font = "16px monospace";
      calculatedOffset = penOffset;
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
      return penIcon;
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
    context.fillStyle = "black";
    context.font = "32px monospace";
    context.fillText(
      this.type,
      this.location.x - stickerOffsetFactor * penOffset,
      this.location.y + yFactor * penOffset
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

let currentStickerType = stickersList[firstIndex];
let currentDrawableType = penType;

const penData = { width: thinPenWidth, color: "black" };

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
    return new Pen(cursor.getPosition(), penData.width, penData.color);
  }
}

function createPenColorButton(color: string, icon: string) {
  const colorButton = document.createElement("button");
  colorButton.innerHTML = icon;
  colorButton.setAttribute("class", "pen");
  app.append(colorButton);

  colorButton.addEventListener("click", () => {
    penData.color = color;
    currentDrawableType = penType;
  });
}

function createStickerButton(sticker: string, type: string) {
  const stickerButton = document.createElement("button");
  stickerButton.innerHTML = sticker;
  stickerButton.setAttribute("class", type);
  app.append(stickerButton);

  stickerButton.addEventListener("click", () => {
    currentStickerType = sticker;
    currentDrawableType = stickerType;
  });
}

canvas.addEventListener("drawing-changed", () => {
  drawGame();
});

canvas.addEventListener("mouseenter", (e) => {
  updateMousePos(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  updateMousePos(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousedown", (e) => {
  updateMousePos(e.offsetX, e.offsetY);
  checkAllClickables();
  if (allClickables.length <= 0) {
    setGame(3);
  }
  canvas.dispatchEvent(drawingChangedEvent);
});

function generateNewClickables(numToCreate: number) {
  for (let i = 0; i < numToCreate; i++) {
    const c = new Clickable(
      Math.random() * gameWidth,
      Math.random() * gameHeight,
      i
    );

    allClickables.push(c);
  }
});

const redoButton = document.getElementById("redo");
redoButton!.innerHTML = "Redo ⟳";
app.append(redoButton!);

redoButton!.addEventListener("click", () => {
  const redoneLine = redoItems.pop();

  if (redoneLine != undefined) {
    allItems.push(redoneLine);
    canvas.dispatchEvent(drawChangedEvent);
  }
});

const exportButton = document.createElement("button");
exportButton.innerHTML = "Share Art 😎";
exportButton.setAttribute("id", "export");
app.append(exportButton);

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  canvas.setAttribute("id", "canvas");
  exportCanvas.width = canvasSize * exportScaleFactor;
  exportCanvas.height = canvasSize * exportScaleFactor;

  const exportContext = exportCanvas.getContext("2d");
  exportContext!.fillStyle = "white";
  exportContext!.fillRect(
    canvasOrigin,
    canvasOrigin,
    exportCanvas.width,
    exportCanvas.height
  );
  exportContext?.scale(exportScaleFactor, exportScaleFactor);
  for (const object of allItems) {
    object.display(exportContext!);
  }

  exportContext!.fillStyle = "black";
  exportContext!.font = "8px monospace";
  exportContext!.fillText(
    gameName,
    canvasSize - exportOffsetX,
    canvasSize - exportOffsetY
  );

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
});

app.append(document.createElement("br"));

const penButton = document.getElementById("penTool");
penButton!.innerHTML = "Pen 🖊️";
penButton?.setAttribute("id", "thin");
app.append(penButton!);

penButton!.addEventListener("click", () => {
  if (penData.width == thinPenWidth) {
    penData.width = mediumPenWidth;
    penButton?.setAttribute("id", "medium");
  } else if (penData.width == mediumPenWidth) {
    penData.width = thickPenWidth;
    penButton?.setAttribute("id", "thick");
  } else {
    penData.width = thinPenWidth;
    penButton?.setAttribute("id", "thin");
  }
});

for (const colorInfo of penColorsList) {
  const [color, icon] = colorInfo;
  createPenColorButton(color, icon);
}

app.append(document.createElement("br"));

for (const sticker of stickersList) {
  createStickerButton(sticker, baseSticker);
}

app.append(document.createElement("br"));

const addCustomStickerButton = document.createElement("button");
addCustomStickerButton.innerHTML = "+ Sticker";
addCustomStickerButton.setAttribute("class", "customSticker");
app.append(addCustomStickerButton);

addCustomStickerButton.addEventListener("click", () => {
  const text = prompt("Type in a new sticker!", "🧽");
  createStickerButton(text!, customSticker);
});
