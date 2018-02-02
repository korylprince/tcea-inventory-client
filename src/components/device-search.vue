<template>
    <md-card class="content">
        <md-card-area md-inset>
            <md-card-header >
                <div class="md-headline">Search Devices</div>
            </md-card-header>
        </md-card-area>

        <md-card-content>
            <form novalidate @keyup.enter.prevent.stop="doSearch(search)">

                <md-input-container>
                    <label>Serial Number</label>
                    <md-input v-model="search.serial_number"></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Manufacturer</label>
                    <md-input v-model="search.manufacturer"></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Model</label>
                    <md-input v-model="search.model"></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Status</label>
                    <md-input v-model="search.status"></md-input>
                </md-input-container>

                <div class="location">
                    <label>Location</label>
                    <v-select
                        v-model="search.location"
                        :options="locations"
                        :filter="fuzzySearch"
                        placeholder="Select location"
                        >
                    </v-select>
                </div>

            </form>
		</md-card-content>

        <md-card-actions>
            <md-button class="md-raised md-primary" @click="doSearch(search)">Search</md-button>
            <md-button class="md-raised md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
        </md-card-actions>

	</md-card>
</template>
<script>
import db from "../js/database.js";
import store from "../js/store.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
import fuzzyMixin from "../mixins/fuzzy.js";
export default {
    name: "model-search",
    mixins: [loadingMixin, fuzzyMixin],
    data: function() {
        return {
            search: {
                serial_number: null,
                manufacturer: null,
                model: null,
                status: null,
                location: null
            },
            statuses: null,
            locations: [],
            models: []
        };
    },
    methods: {
        doSearch: function(search) {
            eventBus.$emit("start-loading");
            var promise = db.queryDevice(search);

            promise.then((response) => {
                eventBus.$emit("stop-loading");
                if (response.data.devices == null) {
                    eventBus.$emit("snackbar", "No devices found");
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

        Promise.all([db.readStatusesCached(), db.readLocationsCached(), db.readModels()]).then(function(responses) {
            next(function(vm) {
                vm.statuses = responses[0].data.statuses;
                vm.locations = responses[1].data.locations;
                vm.models = responses[2].data.models;
            });
        }).catch(function(error) {
            next(function(vm) {
                vm.catchError(error);
            });
        });
    }
};
</script>
<style>
.location {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.54);
}

.v-select {
    margin-top: 5px;
    z-index: 100;
}
</style>

