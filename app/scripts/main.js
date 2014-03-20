App.models.Movie = App.Model.mixin({
	url: 'movie/',
	init: function(){
	},
	isFavorite: false,
	getYear: function(){
		return new Date(this.release_date).getFullYear();
	},
	toggleFavorite: function(){
		this.isFavorite = !this.isFavorite;
		this.trigger('change:isFavorite', this);
		return this;
	}
});

App.collections.Movies = App.Collections.mixin({
	model: App.models.Movie,
	url: 'movie/popular',
	parse: function(data){
		return data.results;
	},
	init: function(){
	}
});

App.collections.Favorites = App.Collections.mixin({
	findMovie: function (id){
	    var foundIndex = -1;
	    $.each(this.models, function(index, item) {
	        if (item.id === id) {
	            foundIndex = index;
	            return false;
	        }
	    });
	    return foundIndex;
	},

	addMovie: function (movie) {
	    var  _this = this;
	    if (this.findMovie(movie.id) === -1) {
	        _this.models.push(movie);
	        _this.trigger('collection:update');
	        _this.saveMovies();
	    }
	},

	removeMovie: function (id) {
	    var  _this = this;
	    var movieIndex = this.findMovie(id);
	    if (movieIndex !== -1) {
	        this.models.splice(movieIndex, 1);
	        _this.trigger('collection:update');
	        _this.saveMovies();
	    }
	},

	getMovies: function () {
	    var savedMovies = localStorage[this.collectionUrl] || null;
	    if (savedMovies) {
	        var parsed = JSON.parse(savedMovies);
	        var movies = [];
	        $.each(parsed.movies, function(index, movieData) {
	                var movie = new Movie(movieData);
	                movies.push(movie);
	        });
	        this.models = movies;
	        this.trigger('collection:update');
	    }
	},

	saveMovies: function () {
	    var savedMovies = JSON.stringify({movies: this.models});
	    localStorage[this.collectionUrl] = savedMovies;
	}
})

App.views.DetailView = App.Presenter.mixin({
	className: 'white-box panel',
	init: function(){
		this.template = _.template($('#movie-popup').html());
		this.model.on('change:isFavorite', this.render.bind(this));
	},

	render: function(){
		console.log('----');
		this.$el.remove();
		$.magnificPopup.close();
		var template = this.template(this.model),
				html = this.$el.html(template),
				_this = this,
				config = {
					type: 'inline',
					items: {
						src: html
					},
					callbacks:{
						open: function(){
							this.content.find('.fav').on('click', function(e){
								e.preventDefault();
								_this.model.toggleFavorite();
							})
						},
						close: function() {
						    this.content.find('.fav').off('click');
						}
					}
				};
		$.magnificPopup.open(config);
	}
});

App.views.SingleView = App.Presenter.mixin({
	template: _.template($('#movie-item').html()),
	className: 'col-xs-4 col-md-2',
	events: {
		'click': 'click'
	},
	click: function(e){
		e.preventDefault();
		this.trigger('model/selected', this.model);
	},
	init: function(){
		var view = null;
		this.model.on('fetch', function(model){
			view = new App.views.DetailView({model: model}).render();
		}.bind(this))

		this.on('model/selected', function(model){
			model.fetch();
			model.fetch({others: '/credits'});
		})
	},
	render: function(){
		this.$el.append(this.template(this.model));
		return this;
	}
});

App.views.CollectionView = App.Presenter.mixin({
	init: function(){
		this.collection.on('collection:update', this.addAll.bind(this));
	},
	addOne: function(model){
		var view = new App.views.SingleView({model: model});
		this.$el.append(view.render().$el);
	},
	addAll: function(collection){
		var _this = this;
		$.each(this.collection.models, function(i, model){
			_this.addOne(model);
		});
	}
});

(function(){
	var col = new App.collections.Movies();
	var col2 = new App.collections.Movies([], {
		url: 'movie/upcoming'
	});
	window.favorites = new App.collections.Favorites();

	var cv = new App.views.CollectionView({
		el: "#popular",
		collection: col
	});

	var cv2 = new App.views.CollectionView({
		el: "#latest",
		collection: col2
	});

	var cv3 = new App.views.CollectionView({
		el: "#favorites",
		collection: favorites
	});

	cv.collection.fetch();
	cv2.collection.fetch();
	cv3.collection.addMovie(new App.models.Movie({id: 456}))
}());
