import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

import auth from "./auth.js";
import eventBus from "./event-bus.js";

import dashboardView from "../components/dashboard.vue";
import signinView from "../components/signin.vue";
import deviceSearchView from "../components/device-search.vue";
import deviceListView from "../components/device-list.vue";
import deviceCreateView from "../components/device-create.vue";
import deviceEditView from "../components/device-edit.vue";
import modelSearchView from "../components/model-search.vue";
import modelListView from "../components/model-list.vue";
import modelCreateView from "../components/model-create.vue";
import modelEditView from "../components/model-edit.vue";
import userCreateView from "../components/user-create.vue";
import userEditView from "../components/user-edit.vue";
import notFoundView from "../components/not-found.vue";

var router = new VueRouter({
    scrollBehavior: function(to, from, savedPosition) {
        to.params.savedPosition = savedPosition;
        if (savedPosition) {
            return savedPosition;
        } else {
            return {x: 0, y: 0};
        }
    },
    routes: [
        {name: "root", path: "/", redirect: {name: "dashboard"}},
        {name: "signin", path: "/signin", component: signinView},
        {name: "dashboard", path: "/dashboard", component: dashboardView},
        {name: "deviceSearch", path: "/devices/search", component: deviceSearchView},
        {name: "deviceList", path: "/devices/", component: deviceListView},
        {name: "deviceCreate", path: "/devices/new", component: deviceCreateView},
        {name: "deviceEdit", path: "/devices/:id", component: deviceEditView},
        {name: "modelSearch", path: "/models/search", component: modelSearchView},
        {name: "modelList", path: "/model/", component: modelListView},
        {name: "modelCreate", path: "/models/new", component: modelCreateView},
        {name: "modelEdit", path: "/models/:id", component: modelEditView},
        {name: "userCreate", path: "/users/new", component: userCreateView},
        {name: "userEdit", path: "/profile", component: userEditView},
        {name: "notFound", path: "/404", component: notFoundView},
        {path: "*", redirect: () => {
            eventBus.$emit("route-redirect");
            return {name: "notFound"};
        }}
    ]
});

auth.$on("authenticated", function() {
    if (router.currentRoute.params.returnToRoute != null && router.currentRoute.name !== "signin") {
        var route = router.currentRoute.params.returnToRoute;
        router.push({name: route.name, params: route.params});
    } else {
        router.push({name: "dashboard"});
    }
});

auth.$on("unauthenticated", function(returnToRoute) {
    if (returnToRoute) {
        router.push({name: "signin", params: {returnToRoute: router.currentRoute}});
    } else {
        router.push({name: "signin"});
    }
});

router.beforeEach(function(to, from, next) {
    if (auth.session_key == null && to.name !== "signin") {
        next({name: "signin", params: {returnToRoute: router.currentRoute}});
    } else if (auth.session_key != null && to.name === "signin") {
        next({name: "dashboard"});
    } else {
        next();
    }
});

eventBus.$on("not-found", function(name, id) {
    router.replace({name: "notFound", params: {name: name, id: id}});
});

export default router;
