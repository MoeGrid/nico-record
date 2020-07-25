<template>
    <el-container style="height: 100%;">
        <el-header>
            <el-button type="primary" icon="el-icon-back" circle @click="back"></el-button>
            <el-button type="primary" icon="el-icon-right" circle @click="forward"></el-button>
            <el-button type="primary" icon="el-icon-refresh-right" circle @click="refresh"></el-button>
            <el-button type="primary" icon="el-icon-house" circle @click="home"></el-button>
            <el-input placeholder="请输入视频或直播地址" v-model="url" @keyup.enter.native="go"
                      style="margin-left: 10px"></el-input>
        </el-header>
        <el-container>
            <el-aside width="300px">
                <div class="control-bar">
                    <p>工作状态</p>
                    <p>
                        <el-badge :value="plugin.status ? '工作中' : '未工作'" :type="plugin.status ? 'success' : 'danger'"/>
                    </p>
                    <p>标题</p>
                    <p>{{plugin.title}}</p>
                    <el-button type="primary" @click="openDir">打开录像目录</el-button>
                </div>
            </el-aside>
            <el-container>
                <web-view ref="view"></web-view>
                <!--<el-footer height="30px">Footer</el-footer>-->
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
    import WebView from "@/components/WebView";
    import {ipcRenderer} from "electron";
    import fs from "fs";
    import url from "url";
    import path from "path";

    const {shell} = require("electron").remote;

    export default {
        name: 'landing-page',
        components: {WebView},
        data() {
            return {
                saveDir: '',
                url: '',
                plugin: {
                    status: false,
                    title: '',
                }
            };
        },
        methods: {
            go() {
                this.$refs.view.go(this.url);
            },
            home() {
                this.$refs.view.home();
            },
            back() {
                this.$refs.view.back();
            },
            forward() {
                this.$refs.view.forward();
            },
            refresh() {
                this.$refs.view.refresh();
            },
            pluginStatus(event, arg) {
                this.plugin.status = arg;
                this.plugin.title = '未获取';
            },
            pluginTitle(event, arg) {
                this.plugin.title = arg;
            },
            pluginTs(event, arg) {
                if (!this.plugin.title) return;
                const uri = url.parse(arg.url);
                const file = path.join(this.saveDir, this.plugin.title, path.basename(uri.pathname));
                const dir = path.dirname(file)
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, {recursive: true});
                fs.writeFileSync(file, Buffer.from(arg.data))
            },
            openDir() {
                shell.openPath(this.saveDir);
            }
        },
        mounted() {
            this.saveDir = path.join(process.cwd(), 'record');
            ipcRenderer.on('plugin_status', this.pluginStatus);
            ipcRenderer.on('plugin_title', this.pluginTitle);
            ipcRenderer.on('plugin_ts', this.pluginTs);
        }
    }
</script>

<style>
    .el-header {
        padding-top: 20px;
        display: flex;
        align-items: center;
        background-color: #D3DCE6;
    }

    /*.el-footer {*/
    /*    background-color: #B3C0D1;*/
    /*    color: #333;*/
    /*}*/

    .el-aside {
        background-color: #B3C0D1;
    }

    .el-main {
        background-color: #E9EEF3;
    }

    .control-bar {
        padding: 10px;
    }

    .control-bar > p {
        margin-bottom: 5px;
    }
</style>
