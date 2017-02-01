import eventBus from "../js/event-bus.js";
export default {
    mounted: function() {
        eventBus.$emit("stop-loading");
    }
};
