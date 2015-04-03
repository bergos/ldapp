'use strict';


var
  Events = require('crab-event').Events;


var EventStore = function (rdf, store) {
  var self = this;

  this.store = new rdf.promise.Store(store);

  Events.mixin(self);

  this.graph = function (iri, callback, options) {
    self.trigger('beforeGraph', iri, options)
      .then(function () { return self.store.graph(iri, options); })
      .then(function (result) {
        return self.trigger('afterGraph', iri, options)
          .then(function () { callback(result); });
      })
      .catch(function (error) {
        //console.error(error.stack);
        callback(null, error);
      });
  };

  this.match = function (iri, subject, predicate, object, callback, limit, options) {
    self.trigger('beforeMatch', iri, subject, predicate, object, limit, options)
      .then(function () { return self.store.match(iri, subject, predicate, object, limit, options); })
      .then(function (result) {
        return self.trigger('afterMatch', iri, subject, predicate, object, limit, options)
          .then(function () { callback(result); });
      })
      .catch(function (error) {
        callback(null, error);
      });
  };

  this.add = function (iri, graph, callback, options) {
    self.trigger('beforeAdd', iri, graph, options)
      .then(function () { return self.store.add(iri, graph, options); })
      .then(function (result) {
        return self.trigger('afterAdd', iri, graph, options)
          .then(function () { self.trigger('changed', iri, options); })
          .then(function () { callback(result); });
      })
      .catch(function (error) {
        callback(null, error);
      });
  };

  this.merge = function (iri, graph, callback, options) {
    self.trigger('beforeMerge', iri, graph, options)
      .then(function () { return self.store.merge(iri, graph, options); })
      .then(function (result) {
        return self.trigger('afterMerge', iri, graph, options)
          .then(function () { self.trigger('changed', iri, options); })
          .then(function () { callback(result); });
      })
      .catch(function (error) {
        callback(null, error);
      });
  };

  this.remove = function (iri, graph, callback, options) {
    self.trigger('beforeRemove', iri, graph, options)
      .then(function () { return self.store.remove(iri, graph, options); })
      .then(function (result) {
        return self.trigger('afterRemove', iri, graph, options)
          .then(function () { self.trigger('changed', iri, options); })
          .then(function () { callback(result); });
      })
      .catch(function (error) {
        callback(null, error);
      });
  };

  this.removeMatches = function (iri, subject, predicate, object, callback, options) {
    self.trigger('beforeRemoveMatches', iri, subject, predicate, object, options)
      .then(function () { return self.store.removeMatches(iri, subject, predicate, object, options); })
      .then(function (result) {
        return self.trigger('afterRemoveMatches', iri, subject, predicate, object, options)
          .then(function () { self.trigger('changed', iri, options); })
          .then(function () { callback(result); });
      })
      .catch(function (error) {
        callback(null, error);
      });
  };

  this.delete = function (iri, callback, options) {
    self.trigger('beforeDelete', iri, options)
      .then(function () { return self.store.delete(iri, options); })
      .then(function (result) {
        return self.trigger('afterDelete', iri, options)
          .then(function () { self.trigger('changed', iri, options); })
          .then(function () { callback(result); });
      })
      .catch(function (error) {
        callback(null, error);
      });
  };
};


module.exports = function (rdf) {
  return EventStore.bind(null, rdf);
};
