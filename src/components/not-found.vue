<template>
    <div id="not-found">
        <div class="md-display-4">404</div>
        <div class="md-display-1">You're obviously lost. Maybe you should just <router-link :to="{name: 'dashboard'}">Go Home</router-link>.</div>
        <div class="md-caption" v-if="name != null">{{name}} (id:<strong>{{id}}</strong>) doesn't exist.</div>
    </div>
</template>
<script>
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "not-found",
    mixins: [loadingMixin],
    data: function() {
        return {
            name: this.$route.params.name,
            id: this.$route.params.id
        };
    },
    methods: {
        resetRoute: function() {
            this.name = null;
            this.id = null;
        }
    },
    created: function() {
        eventBus.$on("route-redirect", this.resetRoute);
    },
    beforeDestroy: function() {
        eventBus.$off("route-redirect", this.resetRoute);
    }
};
</script>
<style>
#not-found {
    margin-top: 25px;
    text-align: center;
}

#not-found .md-display-4 {
    margin-bottom: 25px;
}

@media (max-device-width: 600px){
    #not-found {
        margin-top: 0px;
    }
}
</style>
