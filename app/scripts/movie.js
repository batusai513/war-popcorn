var Movie = function(options){
  this.url =  'movie/',
  this.isFavorite = false;
  $.extend(true, this, options);
}

Movie.prototype.fetch = function(extra){
  var url = this.url + this.id + (extra || ''),
      respond,
      _this = this;

  respond = request(url);
  respond.done(_this.onSuccess.bind(this))
}

Movie.prototype.onSuccess = function(data){
  $.extend(this, data);
  this.trigger('model/fetch', [this]);
}

Movie.prototype.getYear = function(){
  return new Date(this.release_date).getFullYear();
}

Movie.prototype.toggleFavorite = function(){
  this.isFavorite = !this.isFavorite;
  this.trigger('change', [this]);
}

$.extend(Movie.prototype, Events);

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
  $.extend(true, this, Events);
  var view = _view,
      model,
      _this = this;

  function getView(){
    return view.getView();
  }

  function setModel(_model){
    $.extend(true, this, Events);
    model = _model;
    view.setModel(model);
    view.addClickHandler(function(e){
        e.preventDefault();
        this.model.trigger('movie/single', [view.model]);
    });
  }

  return {
    getView: getView,
    setModel: setModel,
    model: view.model
  }
}
