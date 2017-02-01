<template>
	<md-card class="content">
		<md-card-area md-inset>
			<md-card-header >
				<div class="md-headline">Create User</div>
			</md-card-header>
		</md-card-area>

		<md-card-content>
			<form novalidate @keyup.shift.enter.prevent.stop="save(email, name, password)">

                    <md-input-container :class="{'md-input-invalid': errors.has('email')}">
                        <label>Email</label>
                        <md-input ref="email" type="email" v-model="email" v-validate.initial="email" data-vv-name="email" data-vv-rules="required" required></md-input>
                        <span class="md-error" >{{errors.first('email')}}</span>
                    </md-input-container>

                    <md-input-container :class="{'md-input-invalid': errors.has('name')}">
                        <label>Name</label>
                        <md-input v-model="name" v-validate.initial="name" data-vv-name="name" data-vv-rules="required" required></md-input>
                        <span class="md-error" >{{errors.first('name')}}</span>
                    </md-input-container>

                    <md-input-container :class="{'md-input-invalid': errors.has('password')}">
                        <label>Password</label>
                        <md-input type="password" v-model="password" v-validate.initial="password" data-vv-name="password" data-vv-rules="required|confirmed:confirm_password" required></md-input>
                        <span class="md-error" >{{errors.first('password')}}</span>
                    </md-input-container>

                    <md-input-container :class="{'md-input-invalid': errors.has('confirm password')}">
                        <label>Confirm Password</label>
                        <md-input type="password" v-model="confirm_password" v-validate.initial="confirm_password" name="confirm_password" data-vv-name="confirm password" data-vv-rules="required" required></md-input>
                        <span class="md-error" >{{errors.first('confirm password')}}</span>
                    </md-input-container>

			</form>
		</md-card-content>

		<md-card-actions>
			<md-button class="md-raised md-primary" @click="save(email, name, password)" :disabled="errors.any() || email == null || name == null || password == null || confirm_password == null">Save</md-button>
			<md-button class="md-raised md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
		</md-card-actions>
	</md-card>
</template>
<script>
import db from "../js/database.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "user-create",
    mixins: [loadingMixin],
    data: function() {
        return {
            email: null,
            name: null,
            password: null,
            confirm_password: null
        };
    },
    methods: {
        save: function(email, name, password) {
            if (db.locked) { return; }
            this.$validator.validateAll();
            if (this.errors.any()) {
                return;
            }

            eventBus.$emit("start-saving");
            var promise = db.createUser(email, name, password);

            promise.then(() => {
                this.email = null;
                this.name = null;
                this.password = null;
                this.confirm_password = null;

                eventBus.$emit("stop-saving");
                this.$nextTick(function() {
                    this.errors.clear();
                    this.$refs.email.$el.focus();
                });

                eventBus.$emit("snackbar", "User saved");
            }).catch(this.catchError);
        },
        catchError: function(error) {
            eventBus.$emit("stop-saving");
            if (error.response != null) {
                if (error.response.status === 401) {
                    return;
                }
                if (error.response.status === 409) {
                    eventBus.$emit("exists-dialog", "email", this.email);
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
