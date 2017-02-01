<template>
    <md-snackbar ref="snackbar">{{message}}</md-snackbar>
</template>
<script>
export default {
    name: "snackbar",
    props: ["message"],
    methods: {
        open: function() {
            this.$refs["snackbar"].open();
        },
        close: function() {
            this.$refs["snackbar"].close();
        }
    }
};
</script>
