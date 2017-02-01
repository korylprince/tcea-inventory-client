<template>
    <md-dialog ref="error-dialog">
        <md-dialog-title>Oops!</md-dialog-title>
        <md-dialog-content>An error (<strong>{{code}}</strong>) occurred. Please contact your system administrator.</md-dialog-content>
        <md-dialog-actions>
            <md-button class="md-primary" @click="close">Close</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>
<script>
export default {
    name: "error-dialog",
    props: ["code"],
    methods: {
        open: function() {
            this.$refs["error-dialog"].open();
        },
        close: function() {
            this.$refs["error-dialog"].close();
        }
    }
};
</script>
