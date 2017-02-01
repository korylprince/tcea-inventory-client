<template> <div id="dialogs-view">
        <error-dialog :code="error_code" ref="error-dialog"></error-dialog>
        <exists-dialog :name="name" :value="value" :link="link" ref="exists-dialog"></exists-dialog>
        <unsaved-dialog :next="next" ref="unsaved-dialog"></unsaved-dialog>
        <snackbar :message="message" ref="snackbar"></snackbar>
        <progress-overlay :active="progressActive" :text="progressText"></progress-overlay>
    </div>
</template>
<script>
import eventBus from "../js/event-bus.js";
import errorDialog from "./error-dialog.vue";
import existsDialog from "./exists-dialog.vue";
import unsavedDialog from "./unsaved-dialog.vue";
import snackbar from "./snackbar.vue";
import progressOverlay from "./progress-overlay.vue";

export default {
    name: "feedback-view",
    components: {errorDialog, existsDialog, unsavedDialog, snackbar, progressOverlay},
    data: function() {
        return {
            error_code: null,
            name: null,
            value: null,
            link: null,
            next: null,
            message: null,
            progressActive: true,
            progressText: "Loading...",
            progressCancel: null
        };
    },
    methods: {
        doErrorDialog: function(error_code) {
            this.error_code = error_code;
            this.$refs["error-dialog"].open();
        },
        doExistsDialog: function(name, value, link) {
            this.name = name;
            this.value = value;
            this.link = link;
            this.$refs["exists-dialog"].open();
        },
        doUnsavedDialog: function(next) {
            this.next = next;
            this.$refs["unsaved-dialog"].open();
        },
        doSnackbar: function(message) {
            this.message = message;
            this.$refs["snackbar"].open();
        },
        startProgress: function(text) {
            this.progressText = text;
            this.progressCancel = window.setTimeout(() => {
                this.progressActive = true;
                this.progressCancel = null;
            }, 100);
        },
        stopProgress: function() {
            if (this.progressCancel != null) {
                window.clearTimeout(this.progressCancel);
                this.progressCancel = null;
            }

            this.progressActive = false;
        },
        startLoading: function() {
            this.startProgress("Loading...");
        },
        startSaving: function() {
            this.startProgress("Saving...");
        }
    },
    created: function() {
        eventBus.$on("error-dialog", this.doErrorDialog);
        eventBus.$on("exists-dialog", this.doExistsDialog);
        eventBus.$on("unsaved-dialog", this.doUnsavedDialog);
        eventBus.$on("snackbar", this.doSnackbar);
        eventBus.$on("start-loading", this.startLoading);
        eventBus.$on("stop-loading", this.stopProgress);
        eventBus.$on("start-saving", this.startSaving);
        eventBus.$on("stop-saving", this.stopProgress);
        this.$router.beforeEach((to, from, next) => {
            next();
            this.$refs["exists-dialog"].close();
        });
    }
};
</script>
