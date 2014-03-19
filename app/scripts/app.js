var Movi = App.Model.mixin({
	url: 'movie/',
	init: function(){
	},
	isFavorite: false,
	getYear: function(){
		return new Date(this.release_date).getFullYear();
	},
	toggleFavorite: function(){
		this.isFavorite = !this.isFavorite;
		$(this).trigger('change/isFavorite', this);
		return this;
	}
});

var Col = App.Collections.mixin({
	model: Movi,
	url: 'movie/popular',
	parse: function(data){
		return data.results;
	},
	init: function(){
	}
});

var SingleView = App.Presenter.mixin({
	className: 'white-box panel',
	init: function(){
		this.template = _.template($('#movie-popup').html());
		$(this.model).on('change/isFavorite', this.render.bind(this));
	},

	render: function(){
		console.log('test');
		this.$el.remove();
		$.magnificPopup.close();
		var template = this.template(this.model),
				html = this.$el.html(template)
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
						}
					}
				};
		$.magnificPopup.open(config);
	}
});

var Vie = App.Presenter.mixin({
	template: _.template($('#movie-item').html()),
	className: 'col-xs-4 col-md-2',
	events: {
		'click': 'click'
	},
	click: function(e){
		e.preventDefault();
		this.model.fetch()
		this.model.on('fetch', function(model){
			new SingleView({model: model}).render();
		}.bind(this))
		this.trigger('model/selected', [this.model]);
	},
	init: function(){
		this.model.on('fetch', function(){

		}.bind(this))
	},
	render: function(){
		this.$el.append(this.template(this.model));
		return this;
	}
});

var col = new Col();

var CollectionView = App.Presenter.mixin({
	init: function(){
		this.collection.on('collection/add', this.addAll.bind(this));
	},
	addOne: function(model){
		var view = new Vie({model: model});
		this.$el.append(view.render().$el);
	},
	addAll: function(collection){
		var _this = this;
		$.each(this.collection.models, function(i, model){
			_this.addOne(model);
		});
	}
});

var cv = new CollectionView({
	el: "#popular",
	collection: col
});

var cv2 = new CollectionView({
	el: "#latest",
	collection: col
});

cv.collection.fetch()
