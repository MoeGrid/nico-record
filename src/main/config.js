import Store from 'electron-store';
import {ipcMain} from 'electron';

const store = new Store();

const config = {
    RECORD_DIR: undefined,
    PROXY: undefined
};

const proxy = new Proxy(config, {
    get(target, key) {
        if (target[key] === undefined)
            target[key] = store.get(key);
        return target[key];
    },
    set(target, key, value) {
        target[key] = value;
        store.set(key, value);
        return true;
    }
});

ipcMain.on('config', (event, arg) => {
    if (arg.value) {
        proxy[arg.key] = arg.value;
        event.returnValue = true;
    } else {
        event.returnValue = proxy[arg.key];
    }
});

export default proxy;
