import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "D's Rawing App";
const canvasSize = 256;

document.title = gameName;

const header: HTMLElement | null = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas: HTMLElement | null = document.createElement("canvas");
canvas.setAttribute("id", "canvas");
canvas.setAttribute("height", canvasSize.toString());
canvas.setAttribute("width", canvasSize.toString());
app.append(canvas);
