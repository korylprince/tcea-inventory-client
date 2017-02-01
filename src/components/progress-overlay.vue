<template>
    <div id="progress" v-if="active">
        <md-progress class="md-accent" md-indeterminate></md-progress>
        <div id="progress-modal"></div>
        <div id="progress-box">
            <md-spinner :md-size="30" :md-stroke="3" md-indeterminate></md-spinner>
            <span id="progress-text">{{text}}</span>
        </div>
    </div>
</template>
<script>
export default {
    name: "progress-overlay",
    props: ["active", "text"]
};
</script>
<style>
#progress {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 100;
}

#progress-modal {
    position: fixed;
    top: 4px;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.1);
    z-index: 99;
}

#progress-box {
    position: fixed;
    display: flex;
    align-items: center;
    padding: 15px;
    bottom: 20px;
    left: 20px;
    font-size: 1.2em;
    color: #fff;
    background-color: rgb(64, 64, 64);
    border-radius: 2px;
    opacity: 0.95;
    z-index: 100;
}

#progress-box .md-spinner-path {
    stroke: #fff;
}

#progress-text {
    margin-left: 15px;
}
</style>
