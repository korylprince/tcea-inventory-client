<template>
    <nav>
        <md-toolbar class="md-dense">
            <md-button class="md-icon-button" @click="$refs.sidenav.toggle()" v-show="user != null">
                <md-icon>menu</md-icon>
            </md-button>
            <div class="title active" v-if="user != null && $route.name !== 'dashboard'">
                <h2 class="md-title" @click="$router.push({name: 'dashboard'})">Device Inventory</h2>      
                <md-tooltip md-direction="bottom">Go to Dashboard</md-tooltip>
                <md-ink-ripple />
            </div>
            <div class="title active" v-if="user != null && $route.name == 'dashboard'">
                <h2 class="md-title" @click="refresh">Device Inventory</h2>      
                <md-tooltip md-direction="bottom">Refresh Dashboard</md-tooltip>
                <md-ink-ripple />
            </div>
            <div class="title" v-if="user == null">
                <h2 class="md-title">Device Inventory</h2>      
            </div>

            <div id="nav-spacer" v-show="!searchFocused"></div>

            <div id="nav-search" :class="{'search-focus': searchFocused}" @click="focusSearch" @keyup.enter="doSearch(search)" v-show="user != null">
                <md-icon :class="{'md-primary': searchFocused}">search</md-icon>
                <input placeholder="Search devices" ref="search" v-model="search" @blur="blurSearch"></input>
            </div>

            <md-menu id="user-menu" md-offset-y="56" md-offset-x="-120" v-if="user != null">
                <md-avatar md-menu-trigger>
                    <img :src="gravatar" :alt="user.name">
                    <md-ink-ripple />
                </md-avatar>

                <md-menu-content>
                    <md-menu-item @click="$router.push({name: 'userEdit'})">Edit profile</md-menu-item>
                    <md-menu-item @click="signout">Sign out</md-menu-item>
                </md-menu-content>
            </md-menu>
        </md-toolbar>
        <md-sidenav ref="sidenav" class="md-left" v-show="user != null">
            <md-list>
                <md-list-item>
                    <router-link :to="{name: 'dashboard'}" @click.native="$refs.sidenav.close()">Dashboard</router-link>
                </md-list-item>
                <md-list-item>
                    <router-link :to="{name: 'deviceSearch'}" @click.native="$refs.sidenav.close()">Search Devices</router-link>
                </md-list-item>
                <md-list-item>
                    <router-link :to="{name: 'modelSearch'}" @click.native="$refs.sidenav.close()">Search Models</router-link>
                </md-list-item>
            </md-list>
        </md-sidenav>
    </nav>
</template>
<script>
import auth from "../js/auth.js";
import db from "../js/database.js";
import store from "../js/store.js";
import eventBus from "../js/event-bus.js";
export default {
    name: "nav-bar",
    data: function() {
        return {
            search: null,
            searchFocused: false
        };
    },
    computed: {
        user: function() {
            return auth.user;
        },
        gravatar: function() {
            return auth.gravatar;
        }
    },
    methods: {
        signout: function() {
            auth.unauthenticate();
        },
        focusSearch: function() {
            this.searchFocused = true;
            this.$refs.search.focus();
        },
        blurSearch: function() {
            this.search = null;
            this.searchFocused = false;
        },
        doSearch: function(search) {
            if (this.search == null || this.search === "") {
                return;
            }

            eventBus.$emit("start-loading");
            var promise = db.simpleQueryDevice(search);

            promise.then((response) => {
                eventBus.$emit("stop-loading");
                if (response.data.devices == null) {
                    eventBus.$emit("snackbar", "No devices found");
                    return;
                }

                if (response.data.devices.length === 1) {
                    this.$router.push({name: "deviceEdit", params: {id: response.data.devices[0].id}});
                    return;
                }

                store.newDeviceSearch(response.data.devices);
                this.$router.push({name: "deviceList"});
            }).catch(this.catchError);
        },
        refresh: function() {
            eventBus.$emit("dashboard-refresh");
        },
        catchError: function(error) {
            eventBus.$emit("stop-loading");
            if (error.response != null) {
                if (error.response.status === 401) {
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
<style>
.title {
    position: relative;
    user-select: none;
}

.title.active {
    cursor: pointer;
    margin-left: -24px !important;
    margin-right: 5px;
}

.title.active h2:hover {
    color: rgba(255, 255, 255, 1.0);
}

#nav-spacer {
    flex: 1;
}

#nav-search {
    float: right;
    padding-left: 10px;
    padding-right: 10px;
    transition: none;
}

#nav-search {
    user-select: none;
}

#nav-search input {
    height: 34px;
    width: 0px;
    font-size: 16px;
    border: 0px;
    padding-left: 5px;
    outline: none !important;
    background: none;
}

#nav-search.search-focus {
    background-color: rgba(255, 255, 255, 1.0); 
    max-width: 600px;
    display: flex;
    flex: 1;
    margin-left: auto;
    margin-right: auto;
    transition: flex 0.25s;
}

#nav-search.search-focus input {
    flex: 1;
}

#user-menu {
    margin-left: 5px;
    float: right;
    cursor: pointer;
}

@media (max-device-width: 600px){
    .title {
        display: none;
    }
}
</style>
