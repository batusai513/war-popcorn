 /* Riot 0.9.8, @license MIT, (c) 2014 Moot Inc + contributors */
(function($) {
    "use strict";
    
    $.observable = function(el) {
        var callbacks = {}, slice = [].slice;
        
        el.on = function(events, fn) {
            if (typeof fn === "function") {
                events.replace(/[^\s]+/g, function(name, pos) {
                    (callbacks[name] = callbacks[name] || []).push(fn);
                    fn.typed = pos > 0;
                });
            }
            return el;
        };
        
        el.off = function(events) {
            events.replace(/[^\s]+/g, function(name) {
                callbacks[name] = [];
            });
            if (events == "*")
                callbacks = {};
            return el;
        };

        // only single event supported
        el.one = function(name, fn) {
            if (fn)
                fn.one = true;
            return el.on(name, fn);
        };
        
        el.trigger = function(name) {
            var args = slice.call(arguments, 1), 
            fns = callbacks[name] || [];
            
            for (var i = 0, fn; fn = fns[i]; ++i) {
                if (!fn.one || !fn.done) {
                    fn.apply(el, fn.typed ? [name].concat(args) : args);
                    fn.done = true;
                }
            }
            
            return el;
        };
        
        return el;
    
    };
    // Precompiled templates (JavaScript functions)
    var FN = {};

    // Render a template with data
    $.render = function(template, data) {
        if (!template)
            return '';
        
        FN[template] = FN[template] || new Function("_", 
        "return '" + template
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/'/g, "\\'")
        .replace(/\{\s*(\w+)\s*\}/g, "'+(_.$1?(_.$1+'').replace(/&/g,'&amp;').replace(/\"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):(_.$1===0?0:''))+'") + "'"
        );
        
        return FN[template](data);
    };


    /* Cross browser popstate */

    // for browsers only
    if (typeof top != "object")
        return;
    
    var currentHash, 
    pops = $.observable({}), 
    listen = window.addEventListener, 
    doc = document;
    
    function pop(hash) {
        hash = hash.type ? location.hash : hash;
        if (hash != currentHash)
            pops.trigger("pop", hash);
        currentHash = hash;
    }
    
    if (listen) {
        listen("popstate", pop, false);
        doc.addEventListener("DOMContentLoaded", pop, false);
    
    } else {
        doc.attachEvent("onreadystatechange", function() {
            if (doc.readyState === "complete")
                pop("");
        });
    }

    // Change the browser URL or listen to changes on the URL
    $.route = function(to) {
        // listen
        if (typeof to === "function")
            return pops.on("pop", to);

        // fire
        if (history.pushState)
            history.pushState(0, 0, to);
        pop(to);
    
    };
})(typeof top == "object" ? window.$ || (window.$ = {}) : exports);
;
(function(top) {
    // The admin API
    function Admin(conf) {
        
        var self = $.observable(this), 
        backend = new Backend(conf);
        
        $.extend(self, conf);

        // load a given page from the server
        self.load = function(page, fn) {
            
            self.trigger("before:load", page);
            
            self.one("load", fn);
            
            backend.call("load", page, function(view) {
                self.trigger("load", view);
            });
        
        };

        // ... other API methods goes here

        // same as load("search")
        self.search = function(query, fn) {
            return backend.call("search", query, fn);
        };


        // initialization
        backend.call("init", conf.page).always(function(data) {
            self.user = new User(self, data ? data.user : {}, backend);
            self.trigger("ready");
        
        }).done(function(data) {
            self.trigger("load", data.view);
        
        }).fail(function() {

            // failed because
            self.user.one("login", function(data) {
                $.extend(self.user, data.user);
                self.trigger("load", data.view);
            
            });
        
        });

        // on each "page" load
        self.on("load", function(view) {
            self.trigger("load:" + view.type, view.data, view.path);
            self.page = view.type;
        });
    
    }


    // Fake backend to simulate a real thing
    function Backend(conf) {
        
        var self = this, 
        cache = {}, 
        storage = top.localStorage || {sessionId: conf.sessionId}, 
        debug = conf.debug && typeof console != 'undefined';


        // underlying implementation for `call` can change
        self.call = function(method, arg, fn) {
            
            var ret = test_data[method](arg, storage.sessionId), 
            promise = new Promise(fn);

            // debug message
            if (debug)
                console.info("->", method, arg);

            // configurable caching for the "load" method
            if (conf.cache && method == 'load') {
                if (cache[arg])
                    return promise.done(cache[arg]);
                cache[arg] = ret;
            }

            // session management
            if (ret.sessionId)
                storage.sessionId = ret.sessionId;
            else if (method == 'logout')
                storage.removeItem("sessionId");

            // fake delay for the call
            setTimeout(function() {
                if (debug)
                    console.info("<-", ret);
                
                promise.always(ret);
                promise[ret === false ? 'fail' : 'done'](ret);
            
            }, 400);

            // given callback
            promise.done(fn);
            
            return promise;
        
        };
    
    }


    // A generic promiese interface by using $.observable
    
    function Promise(fn) {
        var self = $.observable(this);
        
        $.map(['done', 'fail', 'always'], function(name) {
            self[name] = function(arg) {
                return self[$.isFunction(arg) ? 'on' : 'trigger'](name, arg);
            };
        
        });
    
    }


    // The ability to split your single-page application (SPA) into loosely-coupled modules
    
    var instance;
    
    top.admin = $.observable(function(arg) {

        // admin() --> return instance
        if (!arg)
            return instance;

        // admin(fn) --> add a new module
        if ($.isFunction(arg)) {
            top.admin.on("ready", arg);

        // admin(conf) --> initialize the application
        } else {
            
            instance = new Admin(arg);
            
            instance.on("ready", function() {
                top.admin.trigger("ready", instance);
            });
        
        }
    
    });



    /*jshint multistr:true */

    // Fake server responses (aka. "fixtures"),
    
    var customers = $.map([
        'Acme, inc.', 
        'Widget Corp', 
        '123 Warehousing', 
        'Demo Company', 
        'Smith and Co.', 
        'Foo Bars', 
        'ABC Telecom', 
        'Fake Brothers', 
        'QWERTY Logistics', 
        'Demo, inc.', 
        'Sample Company', 
        'Sample, inc', 
        'Acme Corp', 
        'Allied Biscuit', 
        'Ankh-Sto Associates', 
        'Extensive Enterprise', 
        'Galaxy Corp', 
        'Globo-Chem', 
        'Mr. Sparkle', 
        'Globex Corporation', 
        'LexCorp', 
        'LuthorCorp', 
        'Praxis Corporation', 
        'Sombra Corporation', 
        'Sto Plains Holdings'
    
    ], function(name, i) {
        return {name: name,id: i + 1,val: 100 - (i * 4) + (5 * Math.random())};
    
    });
    
    function customer(id) {
        return $.extend(customers[id - 1], {
            
            img: 'img/company.png',
            joined: (+new Date() - 100000),
            email: 'demo@company.it',
            
            desc: 'Elit hoodie pickled, literally church-key whatever High Life skateboard \
      tofu actually reprehenderit. Id slow-carb asymmetrical accusamus \
      Portland, flannel tempor proident odio esse quis.',
            
            invoices: $.map([200, 350, 150, 600], function(total, i) {
                return {id: i + 1,total: total,time: (+new Date() - 1234567890 * i)};
            }),
            
            users: users
        
        });
    
    }
    
    var users = $.map([
        'Cheryll Egli', 
        'Dominque Larocca', 
        'Judie Flaugher', 
        'Leonard Fason', 
        'Lia Monteith', 
        'Lindsy Woolard', 
        'Rosanna Broadhead', 
        'Sharyl Finlayson', 
        'Spencer Zeller', 
        'Zelda Fazenbaker'
    
    ], function(name, i) {
        return {name: name,id: i + 1,img: 'img/tipiirai.jpg'};
    
    });
    
    function user(id) {
        
        return $.extend(users[id - 1], {
            username: 'dominique2',
            email: 'demo.user@riotjs.com',
            joined: (+new Date() - 100000),
            
            desc: 'Elit hoodie pickled, literally church-key whatever High Life skateboard \
      tofu actually reprehenderit. Id slow-carb asymmetrical accusamus \
      Portland, flannel tempor proident odio esse quis.'
        });
    
    }
    
    function graph(multiplier) {
        var arr = [];
        
        for (var i = 0; i < 30; i++) {
            arr[i] = Math.random() * multiplier * i;
        }
        
        return arr;
    }
    
    
    var test_data = {

        // load new "page"
        load: function(path) {
            
            var els = path.split("/"), 
            page = els[0];
            
            return {
                path: path,
                type: page || "stats",
                data: page == "stats" ? [graph(100), graph(100), graph(200)] : 
                page == "customers" ? customers : 
                page == "customer" ? customer(els[1]) : 
                page == "user" ? user(els[1]) : []
            };
        
        },

        // init
        init: function(page, sessionId) {
            
            return !sessionId ? false : {
                user: {
                    email: "joe@riotjs.com",
                    name: "Joe Rebellous",
                    username: "riot"
                },
                sessionId: sessionId,
                view: test_data.load(page || 'stats')
            };
        
        },
        
        search: function(query) {
            return users;
        },
        
        login: function(params) {
            return test_data.init(params.page, params.username == 'riot');
        },
        
        logout: function() {
            return true;
        }
    
    };


    // Current user (logged in or anonymous)
    function User(app, data, backend) {
        
        var self = $.observable(this);
        
        $.extend(self, data);
        
        self.login = function(params, fn) {
            
            self.one("login", fn);
            
            return backend.call("login", params, function(data) {
                self.trigger("login", data);
            });
        
        };
        
        self.logout = function(fn) {
            
            self.one("logout", fn);
            
            return backend.call("logout", {}, function(data) {
                self.trigger("logout");
            });
        
        };
    
    }
})(typeof top == "object" ? window : exports);
// A minimalistic line graph tool (use with extreme care, not tested)
$.fn.graph2 = function(data, color) {
    
    var graph = this.attr("width", this.parent().width() - 10), 
    padd = 35, 
    c = graph[0].getContext("2d"), 
    max = Math.max.apply(0, data), 
    width = graph.width(), 
    height = graph.height(), 
    len = data.length;

    // re-render? -> clear
    c.clearRect(0, 0, width, height);
    
    function getX(val) {
        return ((width - padd) / len) * val + (padd * 1.5);
    }
    
    function getY(val) {
        return height - (((height - padd) / max) * val) - padd;
    }
    
    c.strokeStyle = "#999";
    c.font = "12px " + $("body").css("fontFamily");
    c.fillStyle = "#666";
    c.textAlign = "center";

    // axises
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(padd, 0);
    c.lineTo(padd, height - padd);
    c.lineTo(width, height - padd);
    c.stroke();

    // x labels
    for (var i = 0; i < len; i++) {
        c.fillText(i, getX(i), height - padd + 20);
    }

    // y labels
    c.textAlign = "right";
    c.textBaseline = "middle";
    
    var steps = Math.round(max / 6 / 100) * 100;
    
    for (i = 0; i < max; i += steps) {
        c.fillText(i, padd - 10, getY(i));
    }

    // lines
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(getX(0), getY(data[0]));
    
    for (i = 1; i < len; i++) {
        c.lineTo(getX(i), getY(data[i]));
    }
    
    c.strokeStyle = color;
    c.stroke();

};



// Presenter for single user
admin(function(app) {
    
    var root = $("#customer-page"), 
    tmpl = $("#customer-tmpl").html(), 
    user_tmpl = $("#user-link-tmpl").html(), 
    invoice_tmpl = $("#invoice-tmpl").html();
    
    app.on("load:customer", function(data) {
        
        data.joined = util.timeformat(data.joined);
        root.html($.render(tmpl, data));

        // users
        var list = $("#user-list", root);
        
        $.each(data.users, function(i, el) {
            list.append($.render(user_tmpl, el));
        });

        // invoices
        list = $("#invoice-list ul", root);
        
        $.each(data.invoices, function(i, el) {
            el.time = util.timeformat(el.time);
            list.append($.render(invoice_tmpl, el));
        });
    
    });

});

// Presenter for customer list
admin(function(app) {
    
    var root = $("#bars", app.root), 
    tmpl = $("#bars-tmpl").html();
    
    app.on("load:customers", function(view) {
        
        var max;

        // clear existing data
        root.empty();

        // add new ones
        $.each(view, function(i, entry) {

            // first one is the largest
            if (!i)
                max = entry.val;
            
            entry.width = Math.round(entry.val / max * 100);
            
            root.append($.render(tmpl, entry));
        
        });
    
    });

});

// Login and logout features

admin(function(app) {
    
    var user = app.user, 
    loading = "is-loading";

    // login
    $("#login").submit(function(e) {
        e.preventDefault();
        
        var el = $(this).addClass("is-loading");
        
        user.login({
            username: this.username.value,
            password: this.password.value,
            page: app.page
        
        }).fail(function() {
            console.info("login failed");
        
        }).done(function() {
            el.removeClass("is-loading");
        
        });
    
    });

    // logout
    $("#logout").click(function(e) {
        e.preventDefault();
        var el = $(this).addClass("is-loading");
        
        user.logout(function() {
            el.removeClass("is-loading");
        });
    
    });
    
    function toggle(is_logged) {
        app.root.toggleClass("is-logged", is_logged).toggleClass("is-not-logged", !is_logged);
    }
    
    user.on("login logout", function(type) {
        toggle(type == 'login');
    });
    
    toggle(!!user.username);

});

// Search dropdown
admin(function(app) {
    
    var form = $("#search"), 
    tmpl = $("#result-tmpl").html(), 
    results = $("#results");
    
    form.submit(function(e) {
        
        e.preventDefault();
        
        var form = $(this), 
        val = $.trim(this.q.value);
        
        if (!val)
            return;
        
        form.addClass("is-loading");
        
        app.search(val, function(arr) {
            form.removeClass("is-loading");
            results.empty().show();
            
            $.each(arr, function(i, res) {
                results.append($.render(tmpl, res));
            });
        
        });
        
        $(document).one("click keypress", function() {
            results.hide();
        });
    
    });

});

// Presenter for stats (the line graphs, see ext/graph.js)
admin(function(app) {
    
    var canvas = $("canvas", app.root), 
    colors = ['#be0000', '#4cbe00', '#1fadc5'];
    
    app.on("load:stats", function(stats) {
        
        $.each(stats, function(i, data) {
            canvas.eq(i).graph2(data, colors[i]);
        });
    
    });

});

// Presenter for single user
admin(function(app) {
    
    var root = $("#user-page"), 
    tmpl = $("#user-tmpl").html();
    
    app.on("load:user", function(data) {
        data.joined = util.timeformat(data.joined);
        root.html($.render(tmpl, data));

        // not real banning feature on this demo
        $("button", root).click(function() {
            $(this).text("User is banned!");
        });
    
    });

});

// List of utility functions for the UI
var util = {

    // date formatting goes to presenter layer, not inside model
    timeformat: function(time) {
        var d = new Date(time);
        return d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate();
    }

};

/*
  Handle view switching, aka. "routing"
  The transition effect is done with CSS
*/
admin(function(app) {
    
    var is_active = "is-active";

    // 1. select elements from the page to call $.route(path)
    app.root.on("click", "[href^='#/']", function(e) {
        
        e.preventDefault();
        
        var link = $(this);

        // no action
        if (link.hasClass(is_active))
            return;

        // loading indicator
        link.addClass("is-loading");

        // Riot changes the URL, notifies listeners and takes care of the back button
        $.route(link.attr("href"));
    
    });


    // 2. listen to route clicks and back button
    $.route(function(path) {

        // Call API method to load stuff from server
        app.load(path.slice(2));
    
    });

    // 3. Set "is-active" class name for the active page and navi element
    app.on("before:load", function() {

        // remove existing class
        $("." + is_active).removeClass(is_active);
    
    
    }).on("load", function(view) {

        // set a new class
        $("#" + view.type + "-page").add("#" + view.type + "-nav").addClass(is_active);

        // remove loading indicator
        $("nav .is-loading").removeClass("is-loading");
    
    });

});

