var App = App || {},
	BaseObject = {
	extend: $.extend
};



$.extend(App, Events);
$.extend(true, App, BaseObject);

function request(url){
	var deferred = $.Deferred();

	$.ajax($.extend(true, App.config.ajaxConfig,
		{
			url: App.config.baseUrl + url

		}
	)).done(function(data){
			deferred.resolve(data);
	}).fail(function(){
			deferred.resolve({})
	});

	return deferred.promise();
}


(function(App, jQuery, request, events){

	App.config = (function(){
		var APIKEY = '2c78ff3d64b6f6e489fc3faf1edd3a64',
				BASEURL = 'https://api.themoviedb.org/3/'

		return{
			apiKey: APIKEY,
			baseUrl: BASEURL,
			ajaxConfig: {
				url: BASEURL,
				type: 'GET',
				crossDomain: true,
				data: {api_key: APIKEY}
			}
		}

	}).call(this);

	App.request = request;

	var Model = App.Model = function(options){
		var options = options || {};
		this.init.apply(this, arguments);
	}

	$.extend(true, Model.prototype, Events, {
		fetch: function(options){
			var options = options || {};
			var url = this.url + this.id + (options.others || '');
			var request = App.request(url);
			var model = this;
			request.done(function(data){
				$.extend(model, data)
				model.trigger('fetch');
			});
			return this;
		},

		parse: function(data){
			return data;
		},

		init: function(){},
	});

	var Collection = App.Collection = function(models, options){
		var options = options || {};
		this.options = options || {};
		if(options.model){
			this.model = options.model;
		}
		this.initialize.bind(this)
	}

	$.extend(true, Collection.prototype, Events, {
		initialize: function(){},
		model: Model
	})




	var View = App.View = function(options){
		var options = options || {};
		this.options = options;
		if(options.model){
			this.model = options.model;
			}else{
				if(options.collection){
					this.collection = options.collection;
				}
			}
		this.el = options.el || null;
		this.createEl();
		this.init.apply(this, arguments);
		this.addEvents();
	}

	$.extend(true, View.prototype, Events, {
		
		init: function(){},

		render: function(){
			return this;
		},

		addEl: function(el){
			if(el instanceof jQuery){
				this.$el = el;
				this.el = this.$el[0];
			}else{
				this.$el = $(el)
			}
			return this;
		},

		createEl: function(){
			if(!this.el){
				var attrs = {};
				var tagName = this.tagName || this.options.tagName || 'div';
				attrs['id'] = this.id;
				attrs['class'] = this.className;
				var $el = $('<' + tagName + '>').attr(attrs);
				this.addEl($el);
			}else{
				this.addEl(this.el);
			}
		},

		addEvents: function(){
			var events = this.events;
			var method = $.noop(),
				eventName = '';
			for(key in events){
				if(events.hasOwnProperty(key)){
					eventName = key;
					method = events[key];
					this.$el.on(eventName, this[method].bind(this))
				}
			}
		}

	});

	  var mixin = function(protoProps, staticProps) {
	    var parent = this;
	    var child;

	    if (protoProps && _.has(protoProps, 'constructor')) {
	      child = protoProps.constructor;
	    } else {
	      child = function(){ return parent.apply(this, arguments); };
	    }
	    $.extend(true, child, parent, staticProps);
	    var Surrogate = function(){ this.constructor = child; };
	    Surrogate.prototype = parent.prototype;
	    child.prototype = new Surrogate;
	    if (protoProps) $.extend(true, child.prototype, protoProps);
	    child.__super__ = parent.prototype;

	    return child;
	  };
	  Model.mixin = View.mixin = mixin;

App.config = (function(){
	var APIKEY = '2c78ff3d64b6f6e489fc3faf1edd3a64',
			BASEURL = 'https://api.themoviedb.org/3/'

	return{
		apiKey: APIKEY,
		baseUrl: BASEURL,
		ajaxConfig: {
			url: BASEURL,
			type: 'GET',
			crossDomain: true,
			data: {api_key: APIKEY}
		}
	}

}).call(this);


var c1 = new Collection({
	url: 'movie/popular',
	type: 'popular'
})
var popular = new CollectionPresenter("#popular", c1)
popular.init();

c1.on('movies/single', function(a){
	console.log(a);
	a.fetch();
	a.on('model/fetch', function(a){
	var tmlp = _.template($('#movie-popup').html())(a);
	$.magnificPopup.open({
		type: 'inline',
		items: {
			src: tmlp
		}
	});
	})
})

var c2 = new Collection({
	url: 'movie/upcoming',
	type: 'popular'
})
var latest = new CollectionPresenter("#latest", c2)
latest.init()

}(App, jQuery, request, Events));


