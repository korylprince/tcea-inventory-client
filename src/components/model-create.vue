<template>
	<md-card class="content">
		<md-card-area md-inset>
			<md-card-header >
				<div class="md-headline">Create Model</div>
			</md-card-header>
		</md-card-area>

		<md-card-content>
			<form novalidate @keyup.shift.enter.prevent.stop="saveAndAdd(model)">

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
			<md-button class="md-raised md-primary" @click="saveAndAdd(model)" :disabled="errors.any() || model.manufacturer == null || model.model == null">Save &amp; Add</md-button>
			<md-button class="md-raised md-accent" @click="saveAndEdit(model)" :disabled="errors.any() || model.manufacturer == null || model.model == null">Save &amp; Edit</md-button>
			<md-button class="md-raised md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
		</md-card-actions>
	</md-card>
</template>
<script>
import db from "../js/database.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "model-create",
    mixins: [loadingMixin],
    data: function() {
        return {
            model: {
                manufacturer: null,
                model: null
            }
        };
    },
    methods: {
        save: function(model) {
            if (db.locked) { return; }
            this.$validator.validateAll();
            if (this.errors.any()) {
                return;
            }

            eventBus.$emit("start-saving");
            return db.createModel(model);
        },
        saveAndEdit: function(model) {
            var promise = this.save(model);
            if (promise == null) {
                return;
            }
            promise.then((response) => {
                var newModel = response.data;
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "Model saved");
                this.$router.push({name: "modelEdit", params: {id: newModel.id, _cache: newModel}});
            }).catch(this.catchError);
        },
        saveAndAdd: function(model) {
            var promise = this.save(model);
            if (promise == null) {
                return;
            }
            promise.then(() => {
                this.model.model = null;
                this.$nextTick(function() {
                    this.errors.clear();
                    this.$refs.model.$el.focus();
                });
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
    }
};
</script>
