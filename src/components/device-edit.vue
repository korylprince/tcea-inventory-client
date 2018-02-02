<template>
    <div class="content">
        <md-card>
            <md-card-area md-inset>
                <md-card-header >
                    <div class="md-headline">Edit Device</div>
                </md-card-header>
            </md-card-area>

            <md-card-content>
                <form novalidate @keyup.shift.enter.prevent.stop="save(device)">

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
                        <md-select name="status1" v-model="device.status" v-validate.initial="device.status" data-vv-name="status" data-vv-rules="required" required>
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

                </form>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-raised md-primary" @click="save(device)" :disabled="!dirty || errors.any() || device.serial_number == null || device.model_id == null || device.status == null || device.location == null">Save</md-button>
                <md-button class="md-raised md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
            </md-card-actions>
        </md-card>

        <md-card class="card-multiple">
            <md-card-area md-inset>
                <md-card-header >
                    <div class="md-headline">Add Note</div>
                </md-card-header>
            </md-card-area>

            <md-card-content>
                <form novalidate @keyup.shift.enter.prevent.stop="addNote(device.id, note)">

                    <md-input-container>
                        <label>Enter note...</label>
                        <md-textarea v-model="note"></md-textarea>
                    </md-input-container>

                </form>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-raised md-primary" @click="addNote(device.id, note)" :disabled="note == null || note === ''">Add Note</md-button>
            </md-card-actions>
        </md-card>

        <md-card class="card-multiple">
            <md-card-area md-inset>
                <md-card-header >
                    <div class="md-headline">History</div>
                </md-card-header>
            </md-card-area>

            <md-card-content v-if="device.events != null">
                <event-view :event="event" :master="device_" v-for="event in device.events" @revert="revert"></event-view>
            </md-card-content>
        </md-card>
    </div>
</template>
<script>
import debounce from "lodash/debounce";
import db from "../js/database.js";
import eventBus from "../js/event-bus.js";
import eventView from "./event-view.vue";
import loadingMixin from "../mixins/loading.js";
import fuzzyMixin from "../mixins/fuzzy.js";
export default {
    name: "device-edit",
    mixins: [loadingMixin, fuzzyMixin],
    components: {eventView},
    data: function() {
        return {
            device: {
                id: null,
                serial_number: null,
                model_id: null,
                status: null,
                location: null,
                events: null
            },
            device_: {
                serial_number: null,
                model_id: null,
                status: null,
                location: null
            },
            statuses: null,
            locations: [],
            models: null,
            note: null
        };
    },
    computed: {
        dirty: function() {
            return this.device.serial_number !== this.device_.serial_number ||
                this.device.model_id !== this.device_.model_id ||
                this.device.status !== this.device_.status ||
                this.device.location !== this.device_.location;
        }
    },
    methods: {
        setDevice: function(device) {
            this.device = device;
            this.device_.serial_number = device.serial_number;
            this.device_.model_id = device.model_id;
            this.device_.status = device.status;
            this.device_.location = device.location;
        },
        save: function(device) {
            if (!this.dirty || db.locked) {
                return;
            }
            this.$validator.validateAll();
            if (this.errors.any()) {
                return;
            }

            var dev = {
                id: device.id,
                serial_number: device.serial_number,
                model_id: device.model_id,
                status: device.status,
                location: device.location
            };

            eventBus.$emit("start-saving");
            db.updateDevice(dev).then((response) => {
                this.setDevice(response.data);
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Device saved");
            }).catch(this.catchError);
        },
        addNote: function(device_id, note) {
            if (note == null || note.trim() === "" || db.locked) {
                return;
            }

            eventBus.$emit("start-saving");
            db.createDeviceNote(device_id, note).then((response) => {
                this.setDevice(response.data);
                this.note = null;
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Note saved");
            }).catch(this.catchError);
        },
        revert: function(fields) {
            if (db.locked) { return; }

            var change = false;
            for (var i = 0; i < fields.length; i++) {
                if (this.device_[fields[i].name] !== fields[i].value) {
                    change = true;
                }
            }

            if (!change) { return; }

            var dev = {
                id: this.device.id,
                serial_number: this.device_.serial_number,
                model_id: this.device_.model_id,
                status: this.device_.status,
                location: this.device_.location
            };

            for (i = 0; i < fields.length; i++) {
                dev[fields[i].name] = fields[i].value;
            }

            eventBus.$emit("start-saving");
            db.updateDevice(dev).then((response) => {
                this.setDevice(response.data);
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Device saved");
            }).catch(this.catchError);
        },
        catchError: debounce(function(error) {
            eventBus.$emit("stop-saving");
            if (error.response != null) {
                if (error.response.status === 401) {
                    return;
                }
                if (error.response.status === 404) {
                    eventBus.$emit("not-found", "Device", this.$route.params.id);
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
    watch: {
        "$route": function(to) {
            this.note = null;
            Promise.all([
                db.readDeviceWithEvents(to.params.id),
                db.readStatusesCached(),
                db.readLocationsCached(),
                db.readModels()
            ]).then((responses) => {
                this.setDevice(responses[0].data);
                this.statuses = responses[1].data.statuses;
                this.locations = responses[2].data.locations;
                this.models = responses[3].data.models;
            }).catch((error) => {
                this.catchError(error);
            });
        }
    },
    beforeRouteEnter: function(to, from, next) {
        eventBus.$emit("start-loading");
        var p0 = new Promise((resolve, reject) => {
            if (to.params._cache != null) {
                resolve(to.params._cache);
            } else {
                db.readDeviceWithEvents(to.params.id).then(function(response) {
                    resolve(response.data);
                }).catch(function(error) {
                    reject(error);
                });
            }
        });

        Promise.all([p0, db.readStatusesCached(), db.readLocationsCached(), db.readModels()]).then(function(responses) {
            next(function(vm) {
                vm.setDevice(responses[0]);
                vm.statuses = responses[1].data.statuses;
                vm.locations = responses[2].data.locations;
                vm.models = responses[3].data.models;
            });
        }).catch(function(error) {
            next(function(vm) {
                vm.catchError(error);
            });
        });
    },
    beforeRouteLeave: function(to, from, next) {
        if (!this.dirty) {
            next();
            return;
        }
        eventBus.$emit("unsaved-dialog", next);
    }
};
</script>
<style>
.md-card {
    overflow: inherit;
}

.md-card.card-multiple {
    z-index: 0;
}

.location {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.54);
}

.location sup {
    font-size: 12px;
}

.v-select {
    margin-top: 5px;
    z-index: 100;
}

.md-error {
    color: red;
}
</style>
