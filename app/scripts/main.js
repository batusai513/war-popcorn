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

	var Model = App.Model = function(attributes, options){
		var options = options || {};
		if(attributes){
			$.extend(this, attributes)
		}
		if(attributes === null && attributes['id']){
			this.id = attributes['id'];
		}
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
				model.trigger('fetch', [this]);
			}.bind(this));
			return this;
		},

		parse: function(data){
			return data;
		},

		init: function(){},
	});

	var Collections = App.Collections = function(models, options){
		var options = options || {};
		this.options = options || {};
		this.models = [];
		if(models){
			this.createModels(models);
		}
		this.init.apply(this, arguments);
	}

	$.extend(true, Collections.prototype, Events, {
		init: function(){},

		fetch: function(){
			var url = this.url,
					request = App.request(url),
					models = [];
			request.done(function(data){
				models = this.parse(data);
				this.createModels(models);
			}.bind(this));
		},

		parse: function(data){
			return data;
		},

		createModels: function(models){
			var newModel = $.noop();
			this.models = [];
			$.each(models, function(i, model){
				newModel = new this.model(model);
				this.models.push(newModel);
			}.bind(this));
			this.trigger('collection/add', [this.models]);
		}
	});




	var Presenter = App.Presenter = function(options){
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

	$.extend(true, Presenter.prototype, Events, {

		init: function(){},

		render: function(){
			return this;
		},

		$: function(el){
			return this.$el.find(el);
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
					this.$el.on(eventName, this[method].bind(this));
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
	  Model.mixin = Presenter.mixin = Collections.mixin = mixin;

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


// var c1 = new Collection({
// 	url: 'movie/popular',
// 	type: 'popular'
// })
// var popular = new CollectionPresenter("#popular", c1)
// popular.init();

// c1.on('movies/single', function(a){
// 	a.fetch();
// 	a.on('model/fetch', function(a){
// 	var tmlp = _.template($('#movie-popup').html())(a);
// 	$.magnificPopup.open({
// 		type: 'inline',
// 		items: {
// 			src: tmlp
// 		}
// 	});
// 	})
// })

// var c2 = new Collection({
// 	url: 'movie/upcoming',
// 	type: 'popular'
// })
// var latest = new CollectionPresenter("#latest", c2)
// latest.init()

}(App, jQuery, request, Events));


