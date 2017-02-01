/*global API_BASE*/
import axios from "axios";
import auth from "./auth.js";
import store from "./store.js";

export default {
    locked: false,
    handlePromise: function(promise) {
        promise.then(() => {
            this.locked = false;
        }).catch((error) => {
            this.locked = false;
            if (error.response != null && error.response.status === 401) {
                auth.unauthenticate(true);
            }
        });
    },

    readStatuses: function() {
        var promise = axios.get(API_BASE + "/statuses/", auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readStatusesCached: function() {
        if (store.store.statuses_cache != null) {
            return store.store.statuses_cache;
        }

        var promise = this.readStatuses();
        store.store.statuses_cache = promise;

        var timeout = setTimeout(() => {
            store.store.statuses_cache = null;
        }, 1000 * 60 * 10); // 10 minutes

        // if promise fails to resolve, clear instantly
        promise.catch(() => {
            clearTimeout(timeout);
            store.store.statuses_cache = null;
        });
        return promise;
    },

    createDevice: function(device, note) {
        this.locked = true;
        var createDeviceRequest = {device: device, note: note};
        var promise = axios.post(API_BASE + "/devices/", createDeviceRequest, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readDevice: function(id) {
        var promise = axios.get(API_BASE + "/devices/" + id, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readDeviceCached: function(id) {
        if (store.store.device_cache[id] != null) {
            return store.store.device_cache[id];
        }
        var promise = this.readDevice(id);
        store.store.device_cache[id] = promise;
        setTimeout(() => {
            delete store.store.device_cache[id];
        }, 100);
        return promise;
    },
    readDeviceWithEvents: function(id) {
        var promise = axios.get(API_BASE + "/devices/" + id + "?events=true", auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    updateDevice: function(device) {
        this.locked = true;
        var promise = axios.post(API_BASE + "/devices/" + device.id, device, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    createDeviceNote: function(device_id, note) {
        this.locked = true;
        var noteRequest = {note: note};
        var promise = axios.post(API_BASE + "/devices/" + device_id + "/notes/", noteRequest, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    queryDevice: function(queryDeviceRequest) {
        var promise = axios({method: "GET", url: API_BASE + "/devices/",
            params: queryDeviceRequest,
            headers: auth.authOptions.headers, timeout: auth.authOptions.timeout
        });
        this.handlePromise(promise);
        return promise;
    },
    simpleQueryDevice: function(search) {
        var simpleQueryDeviceRequest = {search: search};
        var promise = axios({method: "GET", url: API_BASE + "/devices/",
            params: simpleQueryDeviceRequest,
            headers: auth.authOptions.headers, timeout: auth.authOptions.timeout
        });
        this.handlePromise(promise);
        return promise;
    },

    createModel: function(model, note) {
        this.locked = true;
        var createModelRequest = {model: model, note: note};
        var promise = axios.post(API_BASE + "/models/", createModelRequest, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readModel: function(id) {
        var promise = axios.get(API_BASE + "/models/" + id, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readModelCached: function(id) {
        if (store.store.model_cache[id] != null) {
            return store.store.model_cache[id];
        }
        var promise = this.readModel(id);
        store.store.model_cache[id] = promise;
        setTimeout(() => {
            delete store.store.model_cache[id];
        }, 100);
        return promise;
    },
    readModelWithEvents: function(id) {
        var promise = axios.get(API_BASE + "/models/" + id + "?events=true", auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    updateModel: function(model) {
        this.locked = true;
        var promise = axios.post(API_BASE + "/models/" + model.id, model, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    createModelNote: function(model_id, note) {
        this.locked = true;
        var noteRequest = {note: note};
        var promise = axios.post(API_BASE + "/models/" + model_id + "/notes/", noteRequest, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    queryModel: function(queryModelRequest) {
        var promise = axios({method: "GET", url: API_BASE + "/models/",
            params: queryModelRequest,
            headers: auth.authOptions.headers, timeout: auth.authOptions.timeout
        });
        this.handlePromise(promise);
        return promise;
    },
    readModels: function() {
        return this.queryModel();
    },

    createUser: function(email, name, password) {
        this.locked = true;
        var userCreateRequest = {email: email, name: name, password: password};
        var promise = axios.post(API_BASE + "/users/", userCreateRequest, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readUser: function(id) {
        var promise = axios.get(API_BASE + "/users/" + id, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readUserCached: function(id) {
        if (store.store.user_cache[id] != null) {
            return store.store.user_cache[id];
        }
        var promise = this.readUser(id);
        store.store.user_cache[id] = promise;
        setTimeout(() => {
            delete store.store.user_cache[id];
        }, 100);
        return promise;
    },
    updateUser: function(user) {
        this.locked = true;
        var promise = axios.post(API_BASE + "/users/" + user.id, user, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    changeUserPassword: function(old_password, new_password) {
        this.locked = true;
        var changeUserPasswordRequest = {old_password: old_password, new_password: new_password};
        var promise = axios.post(API_BASE + "/users/" + auth.user.id + "/password", changeUserPasswordRequest, auth.authOptions);
        this.handlePromise(promise);
        return promise;
    },
    readStats: function() {
        var promise = axios.get(API_BASE + "/stats/", auth.authOptions);
        this.handlePromise(promise);
        return promise;
    }
};
