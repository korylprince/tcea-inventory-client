<template>
    <div class="content">
        <md-card>
            <md-card-area md-inset>
                <md-card-header class="md-headline">
                    <div class="md-title">Edit Profile</div>
                </md-card-header>
            </md-card-area>

            <md-card-content>
                <div id="avatar-xl">
                    <a href="https://gravatar.com" target="_blank">
                        <md-avatar>
                            <img :src="gravatar" alt="Avatar">
                            <md-tooltip md-direction="bottom">Edit Gravatar</md-tooltip>
                            <md-ink-ripple />
                        </md-avatar>
                    </a>
                </div>
                <form novalidate @keyup.shift.enter.prevent.stop="saveUser(user)" data-vv-scope="user">

                    <md-input-container :class="{'md-input-invalid': errors.has('email', 'user')}">
                        <label>Email</label>
                        <md-input type="email" v-model="user.email" v-validate.initial="user.email" data-vv-name="email" data-vv-rules="required" required></md-input>
                        <span class="md-error" >{{errors.first('email', 'user')}}</span>
                    </md-input-container>

                    <md-input-container :class="{'md-input-invalid': errors.has('name', 'user')}">
                        <label>Name</label>
                        <md-input v-model="user.name" v-validate.initial="user.name" data-vv-name="name" data-vv-rules="required" required></md-input>
                        <span class="md-error" >{{errors.first('name', 'user')}}</span>
                    </md-input-container>

                </form>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-raised md-primary" @click="saveUser(user)" :disabled="!dirty || errors.any('user') || user.email == null || user.name == null">Save</md-button>
                <md-button class="md-raised md-accent" @click="$router.push({name: 'dashboard'})">Cancel</md-button>
            </md-card-actions>
        </md-card>

        <md-card class="card-multiple">
            <md-card-area md-inset>
                <md-card-header class="md-headline">
                    <div class="md-title">Change Password</div>
                </md-card-header>
            </md-card-area>

            <md-card-content>
                <form novalidate @keyup.shift.enter.prevent.stop="changePassword(old_password, new_password)" data-vv-scope="pass">

                    <md-input-container :class="{'md-input-invalid': errors.has('old password', 'pass')}">
                        <label>Old Password</label>
                        <md-input type="password" v-model="old_password" v-validate.initial="old_password" data-vv-name="old password" data-vv-rules="required" required></md-input>
                        <span class="md-error" >{{errors.first('old password', 'pass')}}</span>
                    </md-input-container>

                    <md-input-container :class="{'md-input-invalid': errors.has('new password', 'pass')}">
                        <label>New Password</label>
                        <md-input type="password" v-model="new_password" v-validate.initial="new_password" data-vv-name="new password" data-vv-rules="required|confirmed:new_password_confirm" required></md-input>
                        <span class="md-error" >{{errors.first('new password', 'pass')}}</span>
                    </md-input-container>

                    <md-input-container :class="{'md-input-invalid': errors.has('confirm new password', 'pass')}">
                        <label>Confirm New Password</label>
                        <md-input type="password" v-model="new_password_confirm" v-validate.initial="new_password_confirm" name="new_password_confirm" data-vv-name="confirm new password" data-vv-rules="required" required></md-input>
                        <span class="md-error" >{{errors.first('confirm new password', 'pass')}}</span>
                    </md-input-container>

                </form>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-raised md-primary" @click="changePassword(old_password, new_password)" :disabled="errors.any('pass') || old_password == null || new_password == null">Change Password</md-button>
            </md-card-actions>
        </md-card>
    </div>
</template>
<script>
import auth from "../js/auth.js";
import db from "../js/database.js";
import eventBus from "../js/event-bus.js";
import loadingMixin from "../mixins/loading.js";
export default {
    name: "user-edit",
    mixins: [loadingMixin],
    data: function() {
        return {
            user: {
                id: null,
                email: null,
                name: null
            },
            user_: {
                email: null,
                name: null
            },
            old_password: null,
            new_password: null,
            new_password_confirm: null
        };
    },
    computed: {
        gravatar: function() {
            return auth.gravatar;
        },
        dirty: function() {
            return this.user.email !== this.user_.email || this.user.name !== this.user_.name;
        }
    },
    methods: {
        setUser: function(user) {
            this.user.id = user.id;
            this.user.email = user.email;
            this.user.name = user.name;
            this.user_.email = user.email;
            this.user_.name = user.name;
        },
        saveUser: function(user) {
            if (!this.dirty || db.locked) {
                return;
            }
            this.$validator.validateAll("user");
            if (this.errors.any()) {
                return;
            }

            eventBus.$emit("start-saving");
            db.updateUser(user).then((response) => {
                this.setUser(response.data);
                auth.updateUser(response.data);
                eventBus.$emit("stop-saving");
                eventBus.$emit("snackbar", "User saved");
            }).catch(this.catchError);
        },
        changePassword: function(old_password, new_password) {
            if (db.locked) { return; }
            this.$validator.validateAll("pass");
            if (this.errors.any()) {
                return;
            }

            eventBus.$emit("start-saving");
            db.changeUserPassword(old_password, new_password).then((response) => {
                this.setUser(response.data);

                this.old_password = null;
                this.new_password = null;
                this.new_password_confirm = null;
                eventBus.$emit("stop-saving");
                this.$nextTick(function() {
                    this.errors.clear("pass");
                });
                eventBus.$emit("snackbar", "Password saved");
            }).catch(this.catchError);
        },
        catchError: function(error) {
            eventBus.$emit("stop-saving");
            if (error.response != null) {
                if (error.response.status === 401) {
                    return;
                }
                if (error.response.status === 409) {
                    eventBus.$emit("exists-dialog", "Email", this.user.email);
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
    beforeRouteEnter: function(to, from, next) {
        eventBus.$emit("start-loading");
        var loadData = function(next) {
            db.readUserCached(auth.user.id).then(function(response) {
                next(function(vm) {
                    vm.setUser(response.data);
                });
            }).catch(function(error) {
                next(function(vm) {
                    vm.catchError(error);
                });
            });
        };

        if (auth.user == null) {
            eventBus.$once("user-loaded", () => {
                loadData(next);
            });
        } else {
            loadData(next);
        }
    },
    beforeRouteLeave: function(to, from, next) {
        if (!this.dirty) {
            next();
            return;
        }
        eventBus.$emit("unsaved-dialog", next);
    },
    beforeDestroy: function() {
        eventBus.$off("user-loaded");
    }
};
</script>
<style>
#avatar-xl {
    display: block;
    text-align: center;
    margin-bottom: 15px;
}

#avatar-xl .md-avatar {
    width: 80px;
    min-width: 80px;
    height: 80px;
    min-height: 80px;
    border-radius: 80px;
    border: 2px solid #f5f5f5;
    cursor: pointer;
}

#avatar-xl .md-avatar:hover {
    border-color: #d5d5d5;
}
</style>
