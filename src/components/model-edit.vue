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

	</div>
</template>
<script>
import db from "../js/database.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "model-edit",
    mixins: [loadingMixin],
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
            }
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
            db.readModel(this.$route.params.id).then((response) => {
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
            db.readModel(to.params.id).then(function(response) {
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
