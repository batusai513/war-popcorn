var BaseObject = {
	extend: $.extend,
	url: ''
}

var Movie = function(options){
	$.observable(this);
	this.isFavorite = false;
	$.extend(true, this, options);
}

Movie.prototype.getYear = function(){
	return new Date(this.release_date).getFullYear();
}

Movie.prototype.toggleFavorite = function(){
	this.isFavorite = !this.isFavorite;
	this.trigger('change', this);
}

var MovieView = function(options){
	var tmp,
		$el = $(options.el),
		el = $el[0];

		tmp = _.template($(options.tmp).html());

	function setModel(model){
		this.tmpl = tmp(model);
	}

	function getView(){
		return this.tmpl;
	}

	return {
		setModel: setModel,
		getView: getView
	}
}

var MoviePresenter = function(_view){
	var view = _view,
		model;

	function getView(){
		console.log(view)
		return view.getView();
	}

	function setModel(_model){
		model = _model;
		view.setModel(model);
	}


	return {
		getView: getView,
		setModel: setModel
	}
}

var Collection = function(options){
	this.movies = [];
	this.type = options.type || '';
	this.url = options.url;
	$.observable(this);
}

Collection.prototype.fetch = function(){
	var _this = this,
			data = request(this.url);
	data.done(function(data){
		_this.movies = [];
		$.each(_this.parse(data), function(i, el){
			_this.movies.push(new Movie(el))
		})
		_this.trigger('collection:added', _this.movies);
	});
}

Collection.prototype.parse = function(data){
	return data.results;
}

Collection.prototype.getCollection = function(){
	return this.movies;
}

var CollectionPresenter = function(_view, _collection){
	var view = _view,
	collection = _collection;

	function events(){
		collection.on('collection:added', function(data){
			$.each(data, function(i, el){
				createItem(el);
			});
		});
	}

	function createItem(model){
		var movie = new MoviePresenter(new MovieView({tmp: "#movie-item"}));
		movie.setModel(model);
		$(view).append(movie.getView())
	}

	function init(){
		collection.fetch();
	}
	events();
	return{
		init: init
	}
}


var App = App || {};

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
	)).
		done(function(data){
			console.log(data)
			deferred.resolve(data);
	}).
		fail(function(){
			deferred.resolve({})
	});

	return deferred.promise();
}

var c1 = new Collection({
	url: 'movie/popular',
	type: 'popular'
})
var popular = new CollectionPresenter("#popular", c1)
popular.init()

var c2 = new Collection({
	url: 'movie/upcoming',
	type: 'popular'
})
var latest = new CollectionPresenter("#latest", c2)
latest.init()

