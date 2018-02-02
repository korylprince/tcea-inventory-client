import Fuse from "fuse.js";
export default {
    methods: {
        fuzzySearch(options, search) {
            //create search object
            var arr = [];
            for (var o of options) {
                arr.push({location: o});
            }

            //do fuse search
            var fuse = new Fuse(arr, {
                shouldSort: true,
                tokenize: true,
                matchAllTokens: true,
                threshold: 0.2,
                location: 0,
                distance: 10,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [ "location" ]
            });
            var results = fuse.search(search.trim());

            //return string array
            var ret = [];
            for (o of results) {
                ret.push(o.location);
            }

            return ret;
        }
    }
};
