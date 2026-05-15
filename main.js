const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn, exec } = require("child_process");

let mainWindow;

// Track process IDs for each application in LIFO order
const processStacks = {
  firefox: [],
  code: [],
  terminal: [],
  explorer: [],
};

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
    // Track the new process after a short delay to allow it to spawn
    if (processStacks.hasOwnProperty(command)) {
      setTimeout(() => {
        trackNewProcesses(command);
      }, 500);
    }
  } else {
    console.log("No matching open command.");
  }
}

function handleCloseCommand(text) {
  const words = text.split(" ");
  const command = words.find((w) => w !== "close");

  if (command && processStacks.hasOwnProperty(command)) {
    closeLastProcess(command);
  } else {
    console.log("No matching close command.");
  }
}

// Get all process IDs for a specific application
function getProcessPIDs(appName) {
  return new Promise((resolve) => {
    const psName = appName === "code" ? "Code" : appName;
    const command = `powershell "Get-Process ${psName} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error || !stdout.trim()) {
        resolve([]);
        return;
      }
      
      const pids = stdout
        .trim()
        .split("\n")
        .map((pid) => parseInt(pid.trim()))
        .filter((pid) => !isNaN(pid));
      
      resolve(pids);
    });
  });
}

// Track newly spawned processes for an application
async function trackNewProcesses(appName) {
  const currentPIDs = await getProcessPIDs(appName);
  const stackPIDs = processStacks[appName];
  
  // Add any new PIDs that aren't already in the stack
  currentPIDs.forEach((pid) => {
    if (!stackPIDs.includes(pid)) {
      stackPIDs.push(pid);
    }
  });
  
  console.log(`Tracked ${appName}: ${JSON.stringify(stackPIDs)}`);
}

// Close the most recently opened instance of an application
function closeLastProcess(appName) {
  const stack = processStacks[appName];
  
  if (!stack || stack.length === 0) {
    console.log(`No open instances of ${appName} to close.`);
    return;
  }
  
  const pid = stack.pop();
  exec(`taskkill /PID ${pid} /F`, (error) => {
    if (error) {
      console.log(`Failed to close ${appName} (PID: ${pid}). It may have already closed.`);
      // Try to remove it from the stack anyway
      const index = stack.indexOf(pid);
      if (index > -1) stack.splice(index, 1);
    } else {
      console.log(`Closed ${appName} (PID: ${pid}). Remaining instances: ${stack.length}`);
    }
  });
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
