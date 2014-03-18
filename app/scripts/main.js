var App = App || {};
$.observable(App);
var BaseObject = {
	extend: $.extend,
	url: ''
}

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

var MovieView = function(options){
	var tmp,
		$el = options.el || $('<div/>'),
		model = options.model,
		tmp = _.template($(options.tmp).html());

	$el.addClass('col-xs-4 col-md-2')


	function setModel(model){
		this.tmpl = tmp(model);
		this.$el.append(this.tmpl);
	}

	function getView(){
		return this.$el;
	}

	function addClickHandler(handler){
      this.$el.on('click', handler.bind(this));
  }

	return {
		$el: $el,
		setModel: setModel,
		getView: getView,
		addClickHandler: addClickHandler,
		model: model
	}
}

var MoviePresenter = function(_view){
	$.observable(this);
	var view = _view,
			model,
			_this = this;

	function getView(){
		return view.getView();
	}

	function setModel(_model){
		$.observable(this);
		model = _model;
		view.setModel(model);
    view.addClickHandler(function(e){
        e.preventDefault();
        this.model.trigger('movie:single', view.model);
    });
	}

	return {
		getView: getView,
		setModel: setModel,
		model: view.model
	}
}

var CollectionPresenter = function(_view, _collection){
	var view = _view,
			collection = _collection,
			_this = this;

	function events(){
		var _this = this;
		collection.on('collection:added', function(data){
			$.each(data, function(i, el){
				createItem.call(_this, el);
			});
		});
	}

	function createItem(model){
		var movie = new MoviePresenter(new MovieView({tmp: "#movie-item", model: model}));
		movie.setModel(model);
		movie.model.on('movie:single', function(a){collection.trigger('movie:single', a)})
		var tempView = movie.getView();
		$(view).append($(tempView));
	}

	function init(){
		$.observable(this);
		events.call(this);
		collection.fetch();
	}
	return{
		init: init,
		collection: collection
	}
}

var ModalView = function(){
	var tmp,
		$el = options.el || $('<article/>'),
		tmp = _.template($(options.tmp).html());

	$el.addClass('white-box')


	function setModel(model){
		this.tmpl = tmp(model);
		this.$el.append(this.tmpl);
	}

	function getView(){
		return this.$el;
	}

	function openModal(){
		$.magnificPopup.open({
			type: 'inline',
			items: {
				src: this.$el
			}
		});
	}

	function closeModal(){
		$.magnificPopup.close();
	}

	function addClickHandler(handler){
      this.$el.on('click', handler.bind(this));
  }

	return {
		$el: $el,
		setModel: setModel,
		getView: getView,
		openModel: openModal
	}
}

var ModalPresenter = function(_view){
	$.observable(this);
	var view = _view,
			model;

	function getView(){
		return view.getView();
	}

	function openModal(){
		view.openModal();
	}

	function setModel(_model){
		model = _model;
		view.setModel(model);
	}

	return {
		getView: getView,
		setModel: setModel,
		openModal: openModal
	}
}

var AppMediator = function(_modalPresenter){
	modalPresenter = _modalPresenter;
}

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

c1.on('movie:single', function(a){
	console.log(a);
	a.fetch();
	a.on('model:fetch', function(a){
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

