import Vue from "vue";
import eventBus from "./event-bus.js";

export default new Vue({
    data: function() {
        return {
            store: {
                device_search: null,
                model_search: null,
                statuses_cache: null,
                device_cache: {},
                model_cache: {},
                location_cache: {},
                user_cache: {}
            }
        };
    },
    methods: {
        newDeviceSearch: function(results) {
            this.store.device_search = results;
        },
        newModelSearch: function(results) {
            this.store.model_search = results;
        },
        catchError: function(error) {
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
    }
});
