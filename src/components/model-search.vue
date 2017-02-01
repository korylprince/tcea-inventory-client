<template>
    <md-card class="content">
        <md-card-area md-inset>
            <md-card-header >
                <div class="md-headline">Search Models</div>
            </md-card-header>
        </md-card-area>

        <md-card-content>
            <form novalidate @keyup.enter.prevent.stop="doSearch(search)">

                <md-input-container>
                    <label>Manufacturer</label>
                    <md-input v-model="search.manufacturer"></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Model</label>
                    <md-input v-model="search.model"></md-input>
                </md-input-container>

            </form>
		</md-card-content>

        <md-card-actions>
            <md-button class="md-raised md-primary" @click="doSearch(search)" :disabled="!validSearch">Search</md-button>
            <md-button class="md-raised md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
        </md-card-actions>

	</md-card>
</template>
<script>
import db from "../js/database.js";
import store from "../js/store.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "model-search",
    mixins: [loadingMixin],
    data: function() {
        return {
            search: {
                manufacturer: null,
                model: null
            }
        };
    },
    computed: {
        validSearch: function() {
            return (this.search.manufacturer != null && this.search.manufacturer !== "") ||
                (this.search.model != null && this.search.model !== "");
        }
    },
    methods: {
        doSearch: function(search) {
            if (!this.validSearch) {
                return;
            }

            eventBus.$emit("start-loading");
            var promise = db.queryModel(search);

            promise.then((response) => {
                eventBus.$emit("stop-loading");
                if (response.data.models == null) {
                    eventBus.$emit("snackbar", "No models found");
                    return;
                }

                if (response.data.models.length === 1) {
                    this.$router.push({name: "modelEdit", params: {id: response.data.models[0].id}});
                    return;
                }

                store.newModelSearch(response.data.models);
                this.$router.push({name: "modelList"});
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
    }
};
</script>
