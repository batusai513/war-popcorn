var Movi = App.Model.mixin({
	url: 'movie/',
	init: function(){
		this.fetch();
	},
	id: 550,
	isFavorite: false,
	toggleFavorite: function(){
		return this.isFavorite = !this.isFavorite;
	}
});

var m = new Movi();

var Vie = App.View.mixin({
	template: _.template($('#movie-item').html()),
	className: 'col-xs-4 col-md-2',
	tagName: "li",
	events: {
		'click': 'click'
	},
	click: function(e){
		e.preventDefault();
		console.log(this)
	},
	init: function(){
		this.model.on('fetch', function(){
			this.render().$el.appendTo('body')
		}.bind(this))
	},
	render: function(){
		this.$el.append(this.template(this.model));
		return this;
	}
});

var v = new Vie({
	model: m
})

var Movi2 = App.Model.mixin({
	url: 'movie/',
	init: function(){
		this.fetch();
	},
	id: 551,
	isFavorite: false,
	toggleFavorite: function(){
		return this.isFavorite = !this.isFavorite;
	}
});

var m2 = new Movi2();

var Vie2 = App.View.mixin({
	template: _.template($('#movie-item').html()),
	className: 'col-xs-4 col-md-2',
	tagName: "li",
	events: {
		'click': 'click'
	},
	click: function(e){
		e.preventDefault();
		console.log(this)
	},
	init: function(){
		this.model.on('fetch', function(){
			this.render().$el.appendTo('body')
		}.bind(this))
	},
	render: function(){
		console.log(this.model)
		this.$el.append(this.template(this.model));
		return this;
	}
});

var v2 = new Vie2({
	model: m2
})