
var BaseObject = {
	extend: $.extend,
	url: ''
}

var Movie = function(data){
	$.observable(this);
	this.isFavorite = false;
	$.extend(true, this, data);
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

var movie = new Movie({"adult":false,"backdrop_path":"/8uO0gUM8aNqYLs1OsTBQiXu0fEv.jpg","belongs_to_collection":null,"budget":63000000,"genres":[{"id":28,"name":"Action"},{"id":18,"name":"Drama"},{"id":53,"name":"Thriller"}],"homepage":"","id":550,"imdb_id":"tt0137523","original_title":"Fight Club","overview":"A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.","popularity":9.34757776181267,"poster_path":"/2lECpi35Hnbpa4y46JX0aY3AWTy.jpg","production_companies":[{"name":"20th Century Fox","id":25},{"name":"Fox 2000 Pictures","id":711},{"name":"Regency Enterprises","id":508}],"production_countries":[{"iso_3166_1":"DE","name":"Germany"},{"iso_3166_1":"US","name":"United States of America"}],"release_date":"1999-10-14","revenue":100853753,"runtime":139,"spoken_languages":[{"iso_639_1":"en","name":"English"}],"status":"Released","tagline":"How much can you know about yourself if you've never been in a fight?","title":"Fight Club","vote_average":7.6,"vote_count":2825})
var presenter = new MoviePresenter(new MovieView({el: "div", tmp: "#movie-item"}))
presenter.setModel(movie)
var p = presenter.getView();


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


//$.each(topRatedCollection.results, function(i, el){$('#new-releases').append(renderMovie('#movie-item', el))})


function request(options){
	var deferred = $.Deferred(),
		url = '',
		id = options.id || '',
		where = options.where,
		what = options.what,
		extra = options.extra || '';

	if(options.id){
		url = where + id + extra
	}else{
		url = where + what
	} 

	$.ajax($.extend(true, App.config.ajaxConfig, 
		{
			url: App.config.baseUrl + url

		}
	)).
		done(function(data){
			deferred.resolve(data);
	}).
		fail(function(){
			deferred.resolve({})	
	});

	return deferred.promise();
}

