<template>
	<md-table-card id="model-list" class="content">
		<md-card-area md-inset>
			<md-card-header >
				<div class="md-headline">Model Search Results</div>
			</md-card-header>
		</md-card-area>

		<md-table>
			<md-table-header>
				<md-table-row>
                    <md-table-head>Manufacturer</md-table-head>
					<md-table-head>Model</md-table-head>
				</md-table-row>
			</md-table-header>

			<md-table-body vif="models != null">
                <md-table-row v-for="model in models">
                    <md-table-cell><router-link :to="{name: 'modelEdit', params: {id: model.id}}">{{model.manufacturer}}</router-link></md-table-cell>
                    <md-table-cell><router-link :to="{name: 'modelEdit', params: {id: model.id}}">{{model.model}}</router-link></md-table-cell>
				</md-table-row>
			</md-table-body>

		</md-table>
	</md-table-card>
</template>
<script>
import store from "../js/store.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "model-list",
    mixins: [loadingMixin],
    computed: {
        models: function() {
            return store.store.model_search;
        }
    },
    beforeCreate: function() {
        if (store.store.model_search == null) {
            this.$router.push({name: "modelSearch"});
        }
    }
};
</script>
