// import "vue-material/dist/vue-material.css";
import "./css/main.css";

import Vue from "vue";
// import VueMaterial from "vue-material";
import VueMaterial from "../vue-material/src/index.js";
import VeeValidate from "vee-validate";

Vue.use(VueMaterial);
Vue.use(VeeValidate);

import router from "./js/router.js";

import navBar from "./components/nav.vue";
import speedDial from "./components/speed-dial.vue";
import feedbackView from "./components/feedback-view.vue";

Vue.material.registerTheme("default", {
    primary: "indigo",
    accent: "pink",
    warn: "red",
    background: "white"
});

new Vue({
    el: "#root",
    components: {navBar, speedDial, feedbackView},
    router: router
});
