<template>
	<div class="content">
		<md-card>
			<md-card-area md-inset>
				<md-card-header >
					<div class="md-headline">Edit Model</div>
				</md-card-header>
			</md-card-area>

			<md-card-content>
				<form novalidate @keyup.shift.enter.prevent.stop="save(model)">

				<md-input-container :class="{'md-input-invalid': errors.has('manufacturer')}">
					<label>Manufacturer</label>
					<md-input v-model="model.manufacturer" v-validate.initial="model.manufacturer" data-vv-name="manufacturer" data-vv-rules="required" required></md-input>
					<span class="md-error">{{errors.first("manufacturer")}}</span>
				</md-input-container>

				<md-input-container :class="{'md-input-invalid': errors.has('model')}">
					<label>Model</label>
					<md-input ref="model" v-model="model.model" v-validate.initial="model.model" data-vv-name="model" data-vv-rules="required" required></md-input>
					<span class="md-error">{{errors.first("model")}}</span>
				</md-input-container>

				</form>
			</md-card-content>

			<md-card-actions>
				<md-button class="md-raised md-primary" @click="save(model)" :disabled="!dirty || errors.any() || model.manufacturer == null || model.model == null">Save</md-button>
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
				<form novalidate @keyup.shift.enter.prevent.stop="addNote(model.id, note)">

					<md-input-container>
						<label>Enter note...</label>
						<md-textarea v-model="note"></md-textarea>
					</md-input-container>

				</form>
			</md-card-content>

			<md-card-actions>
				<md-button class="md-raised md-primary" @click="addNote(model.id, note)" :disabled="note == null || note === ''">Add Note</md-button>
			</md-card-actions>
		</md-card>

		<md-card class="card-multiple">
			<md-card-area md-inset>
				<md-card-header >
					<div class="md-headline">History</div>
				</md-card-header>
			</md-card-area>

			<md-card-content v-if="model.events != null">
                <event-view :event="event" :master="model_" v-for="event in model.events" @revert="revert"></event-view>
			</md-card-content>
		</md-card>
	</div>
</template>
<script>
import db from "../js/database.js";
import eventBus from "../js/event-bus.js";
import eventView from "./event-view.vue";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "model-edit",
    mixins: [loadingMixin],
    components: {eventView},
    data: function() {
        return {
            model: {
                id: null,
                manufacturer: null,
                model: null
            },
            model_: {
                manufacturer: null,
                model: null
            },
            note: null
        };
    },
    computed: {
        dirty: function() {
            return this.model.manufacturer !== this.model_.manufacturer ||
                this.model.model !== this.model_.model;
        }
    },
    methods: {
        setModel: function(model) {
            this.model = model;
            this.model_.manufacturer = model.manufacturer;
            this.model_.model = model.model;
        },
        save: function(model) {
            if (!this.dirty || db.locked) {
                return;
            }
            this.$validator.validateAll();
            if (this.errors.any()) {
                return;
            }

            var mod = {
                id: model.id,
                manufacturer: model.manufacturer,
                model: model.model
            };

            eventBus.$emit("start-saving");
            db.updateModel(mod).then((response) => {
                this.setModel(response.data);
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Model saved");
            }).catch(this.catchError);
        },
        addNote: function(model_id, note) {
            if (note == null || note.trim() === "" || db.locked) {
                return;
            }

            eventBus.$emit("start-saving");
            db.createModelNote(model_id, note).then((response) => {
                this.setModel(response.data);
                this.note = null;
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Note saved");
            }).catch(this.catchError);
        },
        revert: function(fields) {
            if (db.locked) { return; }
            var change = false;
            for (var i = 0; i < fields.length; i++) {
                if (this.model_[fields[i].name] !== fields[i].value) {
                    change = true;
                }
            }

            if (!change) { return; }

            var mod = {
                id: this.model.id,
                manufacturer: this.model_.manufacturer,
                model: this.model_.model
            };

            for (i = 0; i < fields.length; i++) {
                mod[fields[i].name] = fields[i].value;
            }

            eventBus.$emit("start-saving");
            db.updateModel(mod).then((response) => {
                this.setModel(response.data);
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Model saved");
            }).catch(this.catchError);
        },
        catchError: function(error) {
            eventBus.$emit("stop-saving");
            if (error.response != null) {
                if (error.response.status === 401) {
                    return;
                }
                if (error.response.status === 404) {
                    eventBus.$emit("not-found", "Model", this.$route.params.id);
                    return;
                }
                if (error.response.status === 409) {
                    eventBus.$emit("exists-dialog", "Model", this.model.manufacturer + " " + this.model.model, {name: "modelEdit", params: {id: error.response.data.duplicate_id}});

                    return;
                }
                eventBus.$emit("error-dialog", error.response.status);
            } else {
                eventBus.$emit("error-dialog", error.message);
            }

            console.error({error: error});
        }
    },
    watch: {
        "$route": function() {
            this.note = null;
            db.readModelWithEvents(this.$route.params.id).then((response) => {
                this.setModel(response.data);
            }).catch((error) => {
                this.catchError(error);
            });
        }
    },
    beforeRouteEnter: function(to, from, next) {
        eventBus.$emit("start-loading");
        if (to.params._cache != null) {
            next(function(vm) {
                vm.setModel(to.params._cache);
            });
        } else {
            db.readModelWithEvents(to.params.id).then(function(response) {
                next(function(vm) {
                    vm.setModel(response.data);
                });
            }).catch(function(error) {
                next(function(vm) {
                    vm.catchError(error);
                });
            });
        }
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
