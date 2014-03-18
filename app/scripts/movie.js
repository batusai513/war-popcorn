var Movie = function(options){
  $.observable(this);
  this.url =  'movie/',
  this.isFavorite = false;
  $.extend(true, this, options);
}

Movie.prototype.fetch = function(extra){
  console.log(this);
  var url = this.url + this.id + (extra || ''),
      respond,
      _this = this;

  respond = request(url);
  respond.done(_this.onSuccess.bind(this))
}

Movie.prototype.onSuccess = function(data){
  $.extend(this, data);
  this.trigger('model:fetch', this);
}

Movie.prototype.getYear = function(){
  return new Date(this.release_date).getFullYear();
}

Movie.prototype.toggleFavorite = function(){
  this.isFavorite = !this.isFavorite;
  this.trigger('change', this);
}
