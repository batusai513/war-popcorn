var Events = (function (){
                var cache = {},
                        /**
                         *      Events.publish
                         *      e.g.: Events.publish("/Article/added", [article], this);
                         *
                         *      @class Events
                         *      @method publish
                         *      @param topic {String}
                         *      @param args     {Array}
                         *      @param scope {Object} Optional
                         */
                        publish = function (topic, args, scope) {

                                if (cache[topic]) {
                                        var thisTopic = cache[topic],
                                                i = thisTopic.length - 1;
                                                console.log(thisTopic)

                                        for (i; i >= 0; i -= 1) {
                                                thisTopic[i].apply( scope || this, args || []);
                                        }
                                }
                        },
                        /**
                         *      Events.subscribe
                         *      e.g.: Events.subscribe("/Article/added", Articles.validate)
                         *
                         *      @class Events
                         *      @method subscribe
                         *      @param topic {String}
                         *      @param callback {Function}
                         *      @return Event handler {Array}
                         */
                        subscribe = function (topic, callback) {
                                if (!cache[topic]) {
                                        cache[topic] = [];
                                }
                                cache[topic].push(callback);
                                console.log(cache)
                                return [topic, callback];
                        },
                        /**
                         *      Events.unsubscribe
                         *      e.g.: var handle = Events.subscribe("/Article/added", Articles.validate);
                         *              Events.unsubscribe(handle);
                         *
                         *      @class Events
                         *      @method unsubscribe
                         *      @param handle {Array}
                         *      @param completly {Boolean}
                         *      @return {type description }
                         */
                        unsubscribe = function (handle, completly) {
                                var t = handle[0],
                                        i = cache[t].length - 1;

                                if (cache[t]) {
                                        for (i; i >= 0; i -= 1) {
                                                if (cache[t][i] === handle[1]) {
                                                        cache[t].splice(cache[t][i], 1);
                                                        if(completly){ delete cache[t]; }
                                                }
                                        }
                                }
                        };

                return {
                        trigger: publish,
                        on: subscribe,
                        off: unsubscribe
                };
        }()
);

