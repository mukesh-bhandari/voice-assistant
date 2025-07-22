const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn, exec } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("index.html");
}

function handleOpenCommand(text) {
  const words = text.split(" ");
  const command = words.find((w) => w !== "open");

  const openMap = {
    firefox: "start firefox",
    code: "code",
    explorer: "start explorer",
    terminal: "start cmd",
    settings: "start ms-settings:",
  };

  if (command && openMap[command]) {
    exec(openMap[command]);
  } else {
    console.log("No matching open command.");
  }
}

function handleCloseCommand(text) {
  const words = text.split(" ");
  const command = words.find((w) => w !== "close");

  const closeMap = {
    firefox: "taskkill /IM firefox.exe /F",
    code: "taskkill /IM Code.exe /F",
    // explorer: "taskkill /IM explorer.exe /F",
    terminal: "taskkill /IM cmd.exe /F",
  };

  if (command && closeMap[command]) {
    exec(closeMap[command]);
  } else {
    console.log("No matching close command.");
  }
}

app.whenReady().then(() => {
  createWindow();

  const py = spawn("python", ["listener.py"]); // change to 'python3' if needed

  py.stdout.on("data", (data) => {
    const text = data.toString().trim().toLowerCase();
    console.log("Python:", text);
    if (!mainWindow || text.length === 0) return;
    if (text === "quit") {
      app.quit();
    } else if (text.startsWith("open ")) {
      handleOpenCommand(text);
    } else if (text.startsWith("close ")) {
      handleCloseCommand(text);
    } else if (text === "volume up") {
      exec("nircmd.exe changesysvolume 5000");
    } else if (text === "volume down") {
      exec("nircmd.exe changesysvolume -5000");
    } else if (text === "mute") {
      exec("nircmd.exe mutesysvolume 1");
    } else if (text === "un mute") {
      exec("nircmd.exe mutesysvolume 0");
    }
  });

  py.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });
});
