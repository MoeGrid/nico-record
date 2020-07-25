<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'nico-record'
    }
</script>

<style>
    /* CSS */
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    html, body, #app {
        height: 100%;
    }

    body {
        font-family: 'Source Sans Pro', sans-serif;
    }
</style>
