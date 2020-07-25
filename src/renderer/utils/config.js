import {ipcRenderer} from 'electron';

const config = {
    RECORD_DIR: undefined,
    PROXY: undefined
};

const proxy = new Proxy(config, {
    get(target, key) {
        return ipcRenderer.sendSync('config', {key});
    },
    set(target, key, value) {
        ipcRenderer.sendSync('config', {key, value});
        return true;
    }
});

export default proxy;
