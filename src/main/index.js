import {app, BrowserView, BrowserWindow, ipcMain} from 'electron'
import path from 'path'
import fs from "fs";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

/** @type Electron.BrowserWindow */
global.mainWindow = null;
/** @type Electron.BrowserView */
global.mainView = null;

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

// 创建工作目录
const dir = path.join(process.cwd(), 'record');
if (!fs.existsSync(dir))
    fs.mkdirSync(dir, {recursive: true});

/**
 * 创建主窗口
 */
function createWindow() {
    // 创建主窗口
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        useContentSize: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(winURL);
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 创建主View
    mainView = new BrowserView({
        webPreferences: {
            webSecurity: false,
            preload: path.join(__static, 'preload.js')
        }
    });
    mainView.setBounds({x: 0, y: 0, width: 0, height: 0});
    mainView.webContents.loadURL('https://nicovideo.jp/');
    if (process.env.NODE_ENV === 'development')
        mainView.webContents.openDevTools();
    mainView.webContents.on('new-window', (e, url) => {
        mainView.webContents.loadURL(url);
    });

    mainWindow.setBrowserView(mainView);
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
    if (mainWindow === null) {
        createWindow();
    }
});

// 调整webview大小和位置
ipcMain.on('view-resize', (event, arg) => {
    if (mainView)
        mainView.setBounds(arg);
});

// 操作webview
ipcMain.on('view-action', (event, arg) => {
    if (!mainView) return;
    switch (arg.action) {
        case 'go':
            mainView.webContents.loadURL(arg.url);
            break;
        case 'home':
            mainView.webContents.loadURL('https://nicovideo.jp/');
            break;
        case 'back':
            mainView.webContents.goBack();
            break;
        case 'forward':
            mainView.webContents.goForward();
            break;
        case 'refresh':
            mainView.webContents.reload();
            break;
    }
});
