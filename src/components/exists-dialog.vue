<template>
    <md-dialog ref="exists-dialog">
        <md-dialog-title>{{name}} exists</md-dialog-title>
        <md-dialog-content>The {{name}} <strong>{{value}}</strong> already exists.</md-dialog-content>
        <md-dialog-actions>
            <md-button class="md-primary" @click="editExisting" v-if="link != null">Edit Existing</md-button>
            <md-button :class="{'md-primary': link == null, 'md-accent': link != null}" @click="close">Close</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>
<script>
export default {
    name: "exists-dialog",
    props: ["name", "value", "link"],
    methods: {
        open: function() {
            this.$refs["exists-dialog"].open();
        },
        close: function() {
            this.$refs["exists-dialog"].close();
        },
        editExisting: function() {
            this.close();
            this.$router.push(this.link);
        }

    }
};
</script>
