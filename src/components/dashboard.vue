<template>
    <div id="dashboard">
        <div class="row">
            <md-table-card id="dashboard-device-list" class="card-multiple" v-if="stats != null && stats.devices != null && stats.devices.length > 1">
                <md-card-area md-inset>
                    <md-card-header >
                        <div class="md-headline">{{stats.devices.length}} Devices Last Added</div>
                    </md-card-header>
                </md-card-area>

                <md-table>
                    <md-table-header>
                        <md-table-row>
                            <md-table-head>Serial Number</md-table-head>
                            <md-table-head>Manufacturer</md-table-head>
                            <md-table-head>Model</md-table-head>
                            <md-table-head>Status</md-table-head>
                            <md-table-head>Location</md-table-head>
                        </md-table-row>
                    </md-table-header>

                    <md-table-body vif="stats.devices != null">
                        <md-table-row v-for="device in stats.devices">
                            <md-table-cell><router-link :to="{name: 'deviceEdit', params: {id: device.id}}">{{device.serial_number}}</router-link></md-table-cell>
                            <md-table-cell>{{device.model.manufacturer != null ? device.model.manufacturer : ""}}</md-table-cell>
                            <md-table-cell>{{device.model.model != null ? device.model.model : ""}}</md-table-cell>
                            <md-table-cell>{{device.status}}</md-table-cell>
                            <md-table-cell>{{device.location}}</md-table-cell>
                        </md-table-row>
                        <md-table-row>
                            <md-table-cell colspan="5" align="center"><strong><a href="#" @click.prevent="doSearch({})">{{stats.device_count}} Total Devices</a></strong></md-table-cell>
                        </md-table-row>
                    </md-table-body>

                </md-table>
            </md-table-card>
        </div>

        <div class="row">
            <md-table-card class="card-multiple" v-if="stats != null && stats.locations != null && stats.locations.length > 1">
                <md-card-area md-inset>
                    <md-card-header >
                        <div class="md-headline">Top {{stats.locations.length}} Locations</div>
                    </md-card-header>
                </md-card-area>

                <md-table>
                    <md-table-header>
                        <md-table-row>
                            <md-table-head>Location</md-table-head>
                            <md-table-head>Number of Devices</md-table-head>
                        </md-table-row>
                    </md-table-header>

                    <md-table-body>
                        <md-table-row v-for="location in stats.locations">
                            <md-table-cell>{{location.location}}</md-table-cell>
                            <md-table-cell align="center"><a href="#" @click.prevent="doSearch({location: location.location})">{{location.count}}</a></md-table-cell>
                        </md-table-row>
                    </md-table-body>

                </md-table>
            </md-table-card>

            <md-table-card class="card-multiple" v-if="stats != null && stats.models != null && stats.models.length > 1">
                <md-card-area md-inset>
                    <md-card-header >
                        <div class="md-headline">Top {{stats.models.length}} Models</div>
                    </md-card-header>
                </md-card-area>

                <md-table>
                    <md-table-header>
                        <md-table-row>
                            <md-table-head>Model</md-table-head>
                            <md-table-head>Number of Devices</md-table-head>
                        </md-table-row>
                    </md-table-header>

                    <md-table-body>
                        <md-table-row v-for="model in stats.models">
                            <md-table-cell><router-link :to="{name: 'modelEdit', params: {id: model.id}}">{{model.manufacturer}} {{model.model}}</router-link></md-table-cell>
                            <md-table-cell align="center"><a href="#" @click.prevent="doSearch({manufacturer: model.manufacturer, model: model.model})">{{model.count}}</a></md-table-cell>
                        </md-table-row>
                    </md-table-body>

                </md-table>
            </md-table-card>

            <md-table-card class="card-multiple" v-if="stats != null && stats.statuses != null && stats.statuses.length > 1">
                <md-card-area md-inset>
                    <md-card-header >
                        <div class="md-headline">Top {{stats.statuses.length}} Statuses</div>
                    </md-card-header>
                </md-card-area>

                <md-table>
                    <md-table-header>
                        <md-table-row>
                            <md-table-head>Status</md-table-head>
                            <md-table-head>Number of Devices</md-table-head>
                        </md-table-row>
                    </md-table-header>

                    <md-table-body>
                        <md-table-row v-for="status in stats.statuses">
                            <md-table-cell>{{status.status}}</md-table-cell>
                            <md-table-cell align="center"><a href="#" @click.prevent="doSearch({status: status.status})">{{status.count}}</a></md-table-cell>
                        </md-table-row>
                    </md-table-body>

                </md-table>
            </md-table-card>
        </div>
    </div>
</template>
<script>
import db from "../js/database.js";
import store from "../js/store.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "dashboard",
    mixins: [loadingMixin],
    data: function() {
        return {
            stats: null
        };
    },
    methods: {
        doSearch: function(search) {
            eventBus.$emit("start-loading");
            var promise = db.queryDevice(search);

            promise.then((response) => {
                eventBus.$emit("stop-loading");
                if (response.data.devices == null) {
                    eventBus.$emit("error-dialog", "No devices found");
                    return;
                }

                if (response.data.devices.length === 1) {
                    this.$router.push({name: "deviceEdit", params: {id: response.data.devices[0].id}});
                    return;
                }

                store.newDeviceSearch(response.data.devices);
                this.$router.push({name: "deviceList"});
            }).catch(this.catchError);
        },
        refresh: function() {
            db.readStats().then((response) => {
                this.stats = response.data;
            }).catch(this.catchError);
        },
        catchError: function(error) {
            eventBus.$emit("stop-loading");
            if (error.response != null) {
                if (error.response.status === 401) {
                    return;
                }
                eventBus.$emit("error-dialog", error.response.status);
            } else {
                eventBus.$emit("error-dialog", error.message);
            }

            console.error({error: error});
        }
    },
    beforeRouteEnter: function(to, from, next) {
        eventBus.$emit("start-loading");
        db.readStats().then(function(response) {
            next(function(vm) {
                vm.stats = response.data;
            });
        }).catch(function(error) {
            next(function(vm) {
                vm.catchError(error);
            });
        });
    },
    created: function() {
        eventBus.$on("dashboard-refresh", this.refresh);
    },
    beforeDestroy: function() {
        eventBus.$off("dashboard-refresh", this.refresh);
    }
};
</script>
<style>
#dashboard {
    display: flex;
    flex-wrap: wrap;
    margin-top: 10px;
}

#dashboard .row {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    overflow-x: auto;
}

#dashboard .card-multiple {
    max-width: 360px;
    margin: 10px;
    flex: 1;
}

#dashboard #dashboard-device-list {
    max-width: 1120px;
}

@media (max-device-width: 600px){
    #dashboard {
        margin: 0px;
        flex: 1;
    }

    #dashboard .card-multiple {
        max-width: 100%;
        margin: 0px;
        margin-top: 10px;
        flex: 1;
    }

    #dashboard #dashboard-device-list {
        max-width: 100%;
    }
}

</style>
