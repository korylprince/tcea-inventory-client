<template>
    <md-speed-dial md-mode="scale" class="md-fab-bottom-right" @md-fab-click="$router.push({name: 'deviceCreate'})" v-show="user != null">
        <md-button class="md-fab" md-fab-trigger>
            <md-icon md-icon-morph>computer</md-icon>
            <md-icon>add</md-icon>
            <md-tooltip md-direction="left">Create Device</md-tooltip>
        </md-button>

        <md-button class="md-fab md-primary md-mini" @click="$router.push({name: 'modelCreate'})">
            <md-icon>grid_on</md-icon>
            <md-tooltip md-direction="left">Create Model</md-tooltip>
        </md-button>

        <md-button class="md-fab md-primary md-mini" @click="$router.push({name: 'userCreate'})">
            <md-icon>account_circle</md-icon>
            <md-tooltip md-direction="left">Create User</md-tooltip>
        </md-button>
    </md-speed-dial>
</template>
<script>
import auth from "../js/auth.js";
export default {
    name: "speed-dial",
    computed: {
        user: function() {
            return auth.user;
        }
    }
};
</script>
<style>
#root .md-speed-dial {
    position: fixed;
}
</style>
