var Collection = function(options){
  this.movies = [];
  this.type = options.type || '';
  this.url = options.url;
  $.extend(true, this, Events);
}

Collection.prototype.fetch = function(){
  var _this = this,
      data = request(this.url);
  data.done(function(data){
    _this.movies = [];
    $.each(_this.parse(data), function(i, el){
      _this.movies.push(new Movie(el))
    });
    console.log(_this.movies)
    _this.trigger('collection/added', [_this.movies]);
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
      collection = _collection,
      _this = this;

  function events(){
    var _this = this;
    collection.on('collection/added', function(data){
      $.each(data, function(i, el){
        createItem.call(_this, el);
      });
    });
  }

  function createItem(model){
    var movie = new MoviePresenter(new MovieView({tmp: "#movie-item", model: model}));
    movie.setModel(model);
    movie.model.on('movie/single', function(a){collection.trigger('movies/single', [a])})
    var tempView = movie.getView();
    $(view).append($(tempView));
  }

  function init(){
    $.extend(true, this, Events);
    events.call(this);
    collection.fetch();
  }
  return{
    init: init,
    collection: collection
  }
}
