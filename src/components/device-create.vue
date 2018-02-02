<template>
	<md-card class="content">
		<md-card-area md-inset>
			<md-card-header >
				<div class="md-headline">Create Device</div>
			</md-card-header>
		</md-card-area>

		<md-card-content>
			<form novalidate @keyup.shift.enter.prevent.stop="saveAndAdd(device, note)">

				<md-input-container :class="{'md-input-invalid': errors.has('serial number')}">
					<label>Serial Number</label>
					<md-input ref="serial_number" v-model="device.serial_number" v-validate.initial="device.serial_number" data-vv-name="serial number" data-vv-rules="required" required></md-input>
					<span class="md-error">{{errors.first("serial number")}}</span>
				</md-input-container>

                <md-input-container :class="{'md-input-invalid': errors.has('model')}">
                    <label for="model">Model</label>
                    <md-select name="model" v-model="device.model_id" v-validate.initial="device.model_id" data-vv-name="model" data-vv-rules="required" required>
                        <md-option :value="model.id" v-for="model in models">{{model.manufacturer}} {{model.model}}</md-option>
                    </md-select>
					<span class="md-error">{{errors.first("model")}}</span>
                </md-input-container>

                <md-input-container :class="{'md-input-invalid': errors.has('status')}">
                    <label for="status">Status</label>
                    <md-select name="status" v-model="device.status" v-validate.initial="device.status" data-vv-name="status" data-vv-rules="required" required>
                        <md-option :value="status" v-for="status in statuses">{{status}}</md-option>
                    </md-select>
					<span class="md-error">{{errors.first("status")}}</span>
                </md-input-container>

                <div class="location" :class="{'md-error': errors.has('location')}">
                    <label for="location">Location<sup>*</sup></label>
                    <v-select v-model="device.location"
                        name="location"
                        :options="locations"
                        :filter="fuzzySearch"
                        placeholder="Select location"
                        v-validate.initial="device.location"
                        data-vv-name="location"
                        data-vv-rules="required" >
                    </v-select>
					<span class="md-error">{{errors.first("location")}}</span>
                </div>

				<md-input-container>
					<label>Note</label>
					<md-textarea v-model="note"></md-textarea>
				</md-input-container>

			</form>
		</md-card-content>

		<md-card-actions>
			<md-button class="md-raised md-primary" @click="saveAndAdd(device, note)" :disabled="errors.any() || device.serial_number == null || device.model_id == null || device.status == null || device.location == null">Save &amp; Add</md-button>
			<md-button class="md-raised md-accent" @click="saveAndEdit(device, note)" :disabled="errors.any() || device.serial_number == null || device.model_id == null || device.status == null || device.location == null">Save &amp; Edit</md-button>
			<md-button class="md-raised md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
		</md-card-actions>
	</md-card>
</template>
<script>
import debounce from "lodash/debounce";
import db from "../js/database.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
import fuzzyMixin from "../mixins/fuzzy.js";
export default {
    name: "device-create",
    mixins: [loadingMixin, fuzzyMixin],
    data: function() {
        return {
            device: {
                serial_number: null,
                model_id: null,
                status: null,
                location: null
            },
            note: null,
            statuses: null,
            locations: [],
            models: null
        };
    },
    methods: {
        save: function(device, note) {
            if (db.locked) { return; }
            this.$validator.validateAll();
            if (this.errors.any()) {
                return;
            }

            eventBus.$emit("start-saving");
            return db.createDevice(device, note);
        },
        saveAndEdit: function(device, note) {
            var promise = this.save(device, note);
            if (promise == null) {
                return;
            }
            promise.then((response) => {
                var newDevice = response.data;
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Device saved");
                this.$router.push({name: "deviceEdit", params: {id: newDevice.id, _cache: newDevice}});
            }).catch(this.catchError);
        },
        saveAndAdd: function(device, note) {
            var promise = this.save(device, note);
            if (promise == null) {
                return;
            }
            promise.then(() => {
                this.device.serial_number = null;
                this.note = null;
                eventBus.$emit("stop-saving");
                this.$nextTick(function() {
                    this.errors.clear();
                    this.$refs.serial_number.$el.focus();
                });
                eventBus.$emit("snackbar", "Device saved");
            }).catch(this.catchError);
        },
        catchError: debounce(function(error) {
            eventBus.$emit("stop-saving");
            if (error.response != null) {
                if (error.response.status === 401) {
                    return;
                }
                if (error.response.status === 409) {
                    eventBus.$emit("exists-dialog", "Serial Number", this.device.serial_number, {name: "deviceEdit", params: {id: error.response.data.duplicate_id}});
                    return;
                }
                eventBus.$emit("error-dialog", error.response.status);
            } else {
                eventBus.$emit("error-dialog", error.message);
            }

            console.error({error: error});
        }, 100)
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

.location sup {
    font-size: 12px;
}

.v-select {
    margin-top: 5px;
}

.md-error {
    color: red;
}
</style>
