/*global API_BASE*/
import debounce from "lodash/debounce";
import gravatar from "gravatar";
import axios from "axios";
import Vue from "vue";
import eventBus from "./event-bus.js";

export default new Vue({
    data: {
        user: null,
        session_key: null
    },
    computed: {
        authOptions: function() {
            return {
                headers: {
                    "Content-Type": "application/json",
                    "X-Session-Key": this.session_key
                },
                timeout: 5000
            };
        },
        gravatar: function() {
            if (this.user != null && this.user.email != null) {
                return gravatar.url(this.user.email, {s: 80});
            }
            return null;
        }
    },
    methods: {
        updateUser: function(newUser) {
            this.user = newUser;
        },
        authenticate: function(email, password) {
            var promise = axios.post(API_BASE + "/auth", {email: email, password: password});
            promise.then((response) => {
                this.user = response.data.user;
                this.session_key = response.data.session_key;
                this.$emit("authenticated");
            });
            return promise;
        },
        unauthenticate: debounce(function(returnToRoute) {
            // if user is already null, user watcher won't fire so we must clear storage here
            window.localStorage.removeItem("user_id");
            this.user = null;
            this.session_key = null;
            this.$emit("unauthenticated", returnToRoute);
        }, 100),
        catchError: function(error) {
            if (error.response != null) {
                if (error.response.status === 401) {
                    this.unauthenticate(true);
                    return;
                }
                eventBus.$emit("error-dialog", error.response.status);
            } else {
                this.error_code = error.message;
                eventBus.$emit("error-dialog", error.message);
            }

            console.error({error: error});
        }
    },
    watch: {
        user: function(newUser) {
            if (newUser == null) {
                window.localStorage.removeItem("user_id");
                return;
            }
            eventBus.$emit("user-loaded");
            window.localStorage.setItem("user_id", newUser.id);
        },
        session_key: function(newKey) {
            if (newKey == null) {
                window.localStorage.removeItem("session_key");
                return;
            }
            window.localStorage.setItem("session_key", newKey);
        }
    },
    created: function() {
        this.session_key = window.localStorage.session_key;
        var user_id = window.localStorage.getItem("user_id");
        if (user_id == null) {
            return;
        }

        var promise = axios.get(API_BASE + "/users/" + user_id, this.authOptions);
        promise.then((response) => {
            this.user = response.data;
        }).catch(this.catchError);
    }
});
