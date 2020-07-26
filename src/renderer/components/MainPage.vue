<template>
    <div class="main-page">
        <div class="header">
            <el-button type="primary" icon="el-icon-back" circle @click="back"></el-button>
            <el-button type="primary" icon="el-icon-right" circle @click="forward"></el-button>
            <el-button type="primary" icon="el-icon-refresh-right" circle @click="refresh"></el-button>
            <el-button type="primary" icon="el-icon-house" circle @click="home"></el-button>
            <el-input placeholder="请输入视频或直播地址" v-model="url" @keyup.enter.native="go" style="margin-left: 10px"/>
        </div>
        <div class="body">
            <div class="left-bar">
                <el-collapse v-model="activeNames">
                    <el-collapse-item title="工作状态" name="1">
                        <el-badge :value="status ? '工作中' : '未工作'" :type="status ? 'success' : 'danger'"/>
                        <br>
                        <el-switch v-model="enable" active-text="开启" inactive-text="关闭"/>
                        <p class="tip">切换后需刷新</p>
                    </el-collapse-item>
                    <el-collapse-item title="视频标题" name="2">
                        <div>{{title}}</div>
                    </el-collapse-item>
                    <el-collapse-item title="保存目录" name="3">
                        <el-input size="mini" placeholder="请输入代理地址" v-model="recordDir" readonly/>
                        <el-button type="text" @click="selectDir">选择目录</el-button>
                        <el-button type="text" @click="openDir">打开目录</el-button>
                    </el-collapse-item>
                    <el-collapse-item title="代理" name="4">
                        <el-input size="mini" placeholder="请输入代理地址" v-model="proxy"/>
                        <el-button type="text" @click="setProxy">设置代理</el-button>
                        <br>
                        <p class="tip">
                            格式为 scheme://host:port<br>
                            scheme支持http、https、socks5<br>
                            为空不设置代理
                        </p>
                    </el-collapse-item>
                </el-collapse>
            </div>
            <div class="webview" ref="view"></div>
        </div>
    </div>
</template>

<script>
    import {ipcRenderer, remote} from 'electron';
    import fs from 'fs';
    import url from 'url';
    import path from 'path';
    import config from '../utils/config';

    const mainView = remote.getGlobal('mainView');

    export default {
        name: 'landing-page',
        data() {
            return {
                recordDir: '',
                url: '',
                proxy: '',
                enable: false,
                status: false,
                title: '未获取',
                activeNames: [
                    '1', '2', '3', '4'
                ]
            };
        },
        methods: {
            resize() {
                const view = this.$refs.view;
                mainView.setBounds({
                    x: view.offsetLeft,
                    y: view.offsetTop,
                    width: view.offsetWidth,
                    height: view.offsetHeight,
                });
            },
            go() {
                mainView.webContents.loadURL(this.url);
            },
            home() {
                mainView.webContents.loadURL('https://nicovideo.jp/');
            },
            back() {
                mainView.webContents.goBack();
            },
            forward() {
                mainView.webContents.goForward();
            },
            refresh() {
                mainView.webContents.reload();
            },
            pluginStatus(event, arg) {
                this.status = arg && this.enable;
                this.title = '未获取';
            },
            pluginTitle(event, arg) {
                this.title = arg;
            },
            pluginTs(event, arg) {
                if (!this.status) return;
                const uri = url.parse(arg.url);
                const file = path.join(this.recordDir, this.title, path.basename(uri.pathname));
                const dir = path.dirname(file);
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, {recursive: true});
                fs.writeFileSync(file, Buffer.from(arg.data));
            },
            selectDir() {
                const res = remote.dialog.showOpenDialogSync({properties: ['openDirectory']});
                if (res.length > 0) {
                    this.recordDir = res[0];
                    config.RECORD_DIR = res[0];
                }
            },
            openDir() {
                remote.shell.openPath(this.recordDir);
            },
            setProxy() {
                this.proxy = this.proxy ? this.proxy.trim() : '';
                config.PROXY = this.proxy;
                mainView.webContents.session.setProxy({proxyRules: this.proxy});
                this.refresh();
            }
        },
        mounted() {
            this.recordDir = config.RECORD_DIR;
            this.proxy = config.PROXY;
            this.setProxy();

            window.onresize = this.resize;
            this.resize();

            this.home();

            ipcRenderer.on('plugin_status', this.pluginStatus);
            ipcRenderer.on('plugin_title', this.pluginTitle);
            ipcRenderer.on('plugin_ts', this.pluginTs);
        }
    }
</script>

<style>
    .main-page {
        height: 100%;
    }

    .main-page .header {
        height: 60px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        background-color: #D3DCE6;
    }

    .main-page .body {
        height: calc(100% - 60px);
    }

    .left-bar {
        width: 300px;
        height: 100%;
        padding: 10px;
        background-color: #B3C0D1;
        overflow: auto;
        float: left;
    }

    .left-bar::-webkit-scrollbar {
        display: none;
    }

    .left-bar .el-collapse {
        background-color: white;
        padding: 0 10px;
    }

    .webview {
        background-color: #D3DCE6;
        float: right;
        width: calc(100% - 300px);
        height: 100%;
    }

    .tip {
        color: dimgray;
        font-size: 12px;
    }
</style>
