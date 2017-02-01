<template>
    <md-card id="signin" class="content">
        <md-card-area md-inset>
            <md-card-header >
                <div class="md-headline">Sign in</div>
            </md-card-header>
        </md-card-area>

        <md-card-content>
            <form novalidate @keyup.enter="signin(email, password)">

                <md-input-container :class="{'md-input-invalid': errors.has('email')}">
                    <label>Email</label>
                    <md-input type="email" v-model="email" v-validate.initial="email" data-vv-name="email" data-vv-rules="required" required></md-input>
                    <span class="md-error">{{errors.first("email")}}</span>
                </md-input-container>

                <md-input-container :class="{'md-input-invalid': errors.has('password')}">
                    <label>Password</label>
                    <md-input type="password" v-model="password" v-validate.initial="password" data-vv-name="password" data-vv-rules="required" required></md-input>
                    <span class="md-error">{{errors.first("password")}}</span>
                </md-input-container>

            </form>
            <div id="signin-error" v-if="error != null">{{error}}</div>
        </md-card-content>

        <md-card-actions>
            <md-button class="md-raised md-primary" @click="signin(email, password)" :disabled="errors.any() || email == null || password == null">Sign in</md-button>
        </md-card-actions>
    </md-card>
</template>
<script>
import auth from "../js/auth.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "signin-view",
    mixins: [loadingMixin],
    data: function() {
        return {
            email: null,
            password: null,
            error: null
        };
    },
    methods: {
        signin: function(email, password) {
            this.error = null;

            this.$validator.validateAll();
            if (this.errors.any()) {
                return;
            }

            eventBus.$emit("start-loading");
            auth.authenticate(email, password).then(function() {
                eventBus.$emit("stop-loading");
            }).catch((error) => {
                eventBus.$emit("stop-loading");
                if (error.response !== null && error.response.status === 401) {
                    this.error = "Wrong email or password.";
                } else {
                    this.error = "Oops! Something bad happened. Contact your system administrator.";
                    console.error({error: error});
                }
            });
        }
    },
    created: function() {
        if (this.$route.params.returnToRoute != null && this.$route.params.returnToRoute.path !== "/") {
            this.error = "Your session has expired. Please sign in again.";
        }
    }
};
</script>
<style>
.content#signin {
    max-width: 480px;
}

#signin-error {
    color: red;
}

@media (max-device-width: 600px) {
    .content#signin {
        max-width: none;
    }
}
</style>
