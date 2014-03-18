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
