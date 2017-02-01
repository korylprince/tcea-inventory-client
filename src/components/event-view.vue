<template>
    <md-card class="history-item">
        <md-card-header >
            <div class="md-headline">
                <div class="md-title">{{event.type | eventTitle}}</div>
                <div class="md-subheading">
                    <md-avatar>
                        <img :src="gravatar" :alt="event._user.name">
                    </md-avatar>
                    <div class="history-name">{{event._user.name}}</div>
                    <div>
                        <span class="md-caption">{{event.date | prettyDate}}</span>
                        <md-tooltip md-direction="bottom">{{event.date | fullDate}}</md-tooltip>
                    </div>
                </div>
            </div>
        </md-card-header>

		<md-card-content>

            <div v-if="event.type === 'created'" v-for="field in event.content.fields">
                <strong>{{field.name | fieldTitle}}</strong>
                <span>set to</span>
                <strong v-if="field.name !== 'model_id'">{{field.value}}</strong>
                <router-link v-if="field.name === 'model_id'" :to="{name: 'modelEdit', params: {id: field._model.id}}">{{field._model.manufacturer}} {{field._model.model}}</router-link>
            </div>

            <blockquote v-if="event.type === 'note'">{{event.content.note}}</blockquote>

            <div v-if="event.type === 'modified'" v-for="field in event.content.fields">
                <strong>{{field.name | fieldTitle}}</strong>
                <span>changed from</span>
                <strong v-if="field.name !== 'model_id'">{{field.old_value}}</strong>
                <router-link v-if="field.name === 'model_id'" :to="{name: 'modelEdit', params: {id: field._old_model.id}}">{{field._old_model.manufacturer}} {{field._old_model.model}}</router-link>
                <span>to</span>
                <strong v-if="field.name !== 'model_id'">{{field.new_value}}</strong>
                <router-link v-if="field.name === 'model_id'" :to="{name: 'modelEdit', params: {id: field._new_model.id}}">{{field._new_model.manufacturer}} {{field._new_model.model}}</router-link>
            </div>

		</md-card-content>

		<md-card-actions v-if="event.type === 'created' || event.type === 'modified'">
            <div>
                <md-button class="md-raised md-primary" @click="revert(revertFields)" :disabled="!revertPossible">Revert</md-button>
                <md-tooltip md-direction="top">
                    <span v-if="revertPossible && event.type === 'created'">Revert to these initial values</span>
                    <span v-if="revertPossible && event.type === 'modified'">Revert these changes</span>
                    <span v-if="!revertPossible">Values already set</span>
                </md-tooltip>
            </div>
		</md-card-actions>
	</md-card>
</template>
<script>
import moment from "moment";
import gravatar from "gravatar";
export default {
    name: "event-view",
    props: ["event", "master"],
    computed: {
        gravatar: function() {
            return gravatar.url(this.event._user.email, {s: 80});
        },
        revertFields: function() {
            if (this.event.type === "created") {
                return this.event.content.fields;
            } else if (this.event.type === "modified") {
                var fields = [];
                for (var i = 0; i < this.event.content.fields.length; i++) {
                    fields[i] = {
                        name: this.event.content.fields[i].name,
                        value: this.event.content.fields[i].old_value
                    };
                }
                return fields;
            } else {
                return null;
            }
        },
        revertPossible: function() {
            for (var i = 0; i < this.event.content.fields.length; i++) {
                if (this.event.type === "created") {
                    if (this.master[this.event.content.fields[i].name] !== this.event.content.fields[i].value) {
                        return true;
                    }
                } else if (this.event.type === "modified") {
                    if (this.master[this.event.content.fields[i].name] !== this.event.content.fields[i].old_value) {
                        return true;
                    }
                }
            }
            return false;
        }
    },
    methods: {
        revert: function revert(fields) {
            this.$emit("revert", fields);
        }
    },
    filters: {
        prettyDate: function prettyDate(date) {
            return moment(date).fromNow();
        },
        fullDate: function fullDate(date) {
            return moment(date).format("LLLL");
        },
        eventTitle: function(title) {
            return {
                "created": "Created",
                "note": "Note Added",
                "modified": "Modified"
            }[title];
        },
        fieldTitle: function(title) {
            return {
                "serial_number": "Serial Number",
                "model_id": "Model",
                "status": "Status",
                "location": "Location",
                "manufacturer": "Manufacturer",
                "model": "Model"
            }[title];
        }
    }
};
</script>
<style>
.history-item {
    margin-top: 10px;
}

.history-item:first-child {
    margin-top: 0px;
}

.history-item.md-card .md-card-header, .history-item.md-card .md-card-content {
    padding-top: 6px;
    padding-bottom: 6px;
}

.history-item .md-title {
    font-size: 20px;
}

.history-item .md-subheading {
    font-size: 14px;
    display: flex;
    float: left;
}

.history-item .md-subheading div {
    align-self: center;
}

.md-card.history-item .md-card-header .md-avatar {
    margin-right: 5px;
}

.history-item .history-name {
    font-weight: bold;
    margin-right: 5px;
}

.history-item blockquote {
    border-left: 1px solid rgba(0, 0, 0, .12);
    padding-left: 10px;
    margin-left: 20px;
    font-weight: bold;
    white-space: pre-wrap;
}
</style>
