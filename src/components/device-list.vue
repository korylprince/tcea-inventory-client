<template>
	<md-table-card id="device-list" class="content">
		<md-card-area md-inset>
			<md-card-header >
				<div class="md-headline">Device Search Results</div>
                <div class="md-subheading">{{count}} devices found</div>
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

			<md-table-body vif="devices != null">
                <md-table-row v-for="device in devices">
                    <md-table-cell><router-link :to="{name: 'deviceEdit', params: {id: device.id}}">{{device.serial_number}}</router-link></md-table-cell>
                    <md-table-cell>{{device.model.manufacturer != null ? device.model.manufacturer : ""}}</md-table-cell>
                    <md-table-cell>{{device.model.model != null ? device.model.model : ""}}</md-table-cell>
                    <md-table-cell>{{device.status}}</md-table-cell>
                    <md-table-cell>{{device.location}}</md-table-cell>
				</md-table-row>
			</md-table-body>

		</md-table>
	</md-table-card>
</template>
<script>
import store from "../js/store.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "device-list",
    mixins: [loadingMixin],
    computed: {
        devices: function() {
            return store.store.device_search;
        },
        count: function() {
            if (store.store.device_search != null) {
                return store.store.device_search.length;
            }
            return 0;
        }
    },
    beforeCreate: function() {
        if (store.store.device_search == null) {
            this.$router.push({name: "deviceSearch"});
        }
    }
};
</script>
<style>
#device-list {
    max-width: 960px;
}

@media (max-device-width: 960px){
    #device-list {
        margin-top: 0px;
    }
}
</style>
