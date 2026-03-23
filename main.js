const {
    app,
    BrowserWindow
} = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, "assets/day.ico"),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    win.loadFile(path.join(__dirname, "index.html"));

    // if (isDev) {
    //     win.webContents.openDevTools();
    // }

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
