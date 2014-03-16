
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

var getTypeCollection = function(collection){
	var collection;
	collection = request({where: 'movie/', what: collection})
	collection.done(function(data){
		topRatedCollection = data;
		$.each(topRatedCollection.results, function(i, el){$('#top-rated').append(renderMovies('#movie-item', el))})
	});
};

var renderMovies = function(el, obj){
	var tmpl = _.template($(el).html());
	return tmpl(obj);
}

var addMovies = function(){
	getTypeCollection('top-rated');
	$.each(getTypeCollection, function(i, el){
		console.log(new Movie(el))
	});
};


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

