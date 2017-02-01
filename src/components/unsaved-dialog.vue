<template>
    <md-dialog ref="unsaved-dialog" @close="outsideCancel">
        <md-dialog-title>Are you sure?</md-dialog-title>
        <md-dialog-content>There's unsaved changes. Are you sure you want to leave this page?</md-dialog-content>
        <md-dialog-actions>
            <md-button class="md-accent" @click="cancel">Cancel</md-button>
            <md-button class="md-primary" @click="leave">Leave</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>
<script>
export default {
    name: "unsaved-dialog",
    props: ["next"],
    methods: {
        open: function() {
            this.$refs["unsaved-dialog"].open();
        },
        close: function() {
            this.$refs["unsaved-dialog"].close();
        },
        outsideCancel: function() {
            this.next(false);
        },
        cancel: function() {
            this.next(false);
            this.close();
        },
        leave: function() {
            this.next();
            this.close();
        }
    }
};
</script>
