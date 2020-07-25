<template>
    <div class="web-view" ref="view"></div>
</template>

<script>
    import {ipcRenderer} from 'electron'

    export default {
        data() {
            return {}
        },
        methods: {
            go(url) {
                ipcRenderer.send('view-action', {action: 'go', url: url});
            },
            home() {
                ipcRenderer.send('view-action', {action: 'home'});
            },
            back() {
                ipcRenderer.send('view-action', {action: 'back'});
            },
            forward() {
                ipcRenderer.send('view-action', {action: 'forward'});
            },
            refresh() {
                ipcRenderer.send('view-action', {action: 'refresh'});
            },
            resize() {
                const view = this.$refs.view;
                ipcRenderer.send('view-resize', {
                    x: view.offsetLeft,
                    y: view.offsetTop,
                    width: view.offsetWidth,
                    height: view.offsetHeight,
                });
            }
        },
        mounted() {
            window.onresize = this.resize;
            this.resize();
        }
    }
</script>

<style scoped>
    .web-view {
        flex: 1;
    }
</style>
