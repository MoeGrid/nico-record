const {remote} = require('electron')
require('./ajaxhook.min');

const mainWindow = remote.getGlobal('mainWindow');

const urlReg = new RegExp('https://\\S+.nicovideo.jp/watch/\\S+');
const tsReg = new RegExp('https://\\S+.dmc.nico/\\S+\\.ts\\S+');

let title = null;

window.addEventListener('DOMContentLoaded', () => {
    // 报告插件状态
    const isVideo = urlReg.test(location.href);
    mainWindow.send('plugin_status', isVideo);
    if (!isVideo) return;
    // 报告标题
    title = document.querySelector('meta[property="og:title"]');
    title = title ? title.content : document.title.replace(' - ニコニコ動画', '');
    if (!title) return;
    title = title.replace(/[\/:*?"<>|]/g, '');
    mainWindow.send('plugin_title', title);
});

ah.proxy({
    onResponse: (response, handler) => {
        if (tsReg.test(response.config.url) && response.status === 200 && title) {
            mainWindow.send('plugin_ts', {
                url: response.config.url,
                data: response.response
            });
        }
        handler.next(response)
    }
});
