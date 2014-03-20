var App = App || {}
App.models = {},
App.collections = {},
App.views = {};

$.observable(App);


(function(App, $){

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

	App.request = request;

	var Model = App.Model = function(attributes, options){
		$.observable(this);
		var options = options || {};
		if(attributes){
			$.extend(this, attributes)
		}
		if(attributes === null && attributes['id']){
			this.id = attributes['id'];
		}
		this.init.apply(this, arguments);
	}

	$.extend(true, Model.prototype, {

		fetch: function(options){
			var options = options || {};
			var url = this.url + this.id + (options.others || '');
			var request = App.request(url);
			var model = this;
			request.done(function(data){
				$.extend(model, data)
				model.trigger('fetch', this);
			}.bind(this));
			return this;
		},

		parse: function(data){
			return data;
		},

		init: function(){},
	});

	var Collections = App.Collections = function(models, options){
		$.observable(this);
		var options = options || {};
		this.options = options || {};
		this.models = [];
		if(options.url) this.url = options.url;
		if(models){
			this.createModels(models);
		}
		this.init.apply(this, arguments);
	}

	$.extend(true, Collections.prototype, {

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
			this.trigger('collection:update', this.models);
		}
	});




	var Presenter = App.Presenter = function(options){
		$.observable(this)
		this.cid = _.uniqueId('vw');
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
		this._createEl();
		this.init.apply(this, arguments);
		this.addEvents();
	}

	$.extend(true, Presenter.prototype, {

		init: function(){},

		render: function(){
			return this;
		},

		$: function(el){
			return this.$el.find(el);
		},

		addEl: function(el, add){
			if (this.$el) this.removeEvents();
			if(el instanceof jQuery){
				this.$el = el;
				this.el = this.$el[0];
			}else{
				this.$el = $(el)
			}
			if (add !== false) this.addEvents();
			return this;
		},

		_createEl: function(){
			if(!this.el){
				var attrs = {};
				var tagName = this.tagName || this.options.tagName || 'div';
				attrs['id'] = this.id;
				attrs['class'] = this.className;
				var $el = $('<' + tagName + '>').attr(attrs);
				this.addEl($el, false);
			}else{
				this.addEl(this.el, false);
			}
		},

		removeEvents: function(){
			this.$el.off('.remEvents' + this.cid);
			return this;
		},

		addEvents: function(){
			var events = this.events;
			var method = $.noop(),
				eventName = '';
			this.removeEvents();
			for(key in events){
				if(events.hasOwnProperty(key)){
					eventName += key + '.remEvents' + this.cid;
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

}(App, jQuery));
