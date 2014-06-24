'use strict';

var events = require('events');


var EventStore = function (store) {
  var self = this;

  events.EventEmitter.call(self);

  self.graph = function (iri, callback, agent, application) {
    self.emit('beforeGraph', iri, agent, application);

    store.graph(iri, function (result) {
      self.emit('afterGraph', iri, agent, application);

      callback(result);
    }, agent, application);
  };

  self.match = function (iri, subject, predicate, object, callback, limit, agent, application) {
    self.emit('beforeMatch', iri, subject, predicate, object, limit, agent, application);

    store.match(iri, subject, predicate, object, function (result) {
      self.emit('afterMatch', iri, subject, predicate, object, limit, agent, application);

      callback(result);
    }, limit, agent, application);
  };

  self.add = function (iri, graph, callback, agent, application) {
    self.emit('beforeAdd', iri, graph, agent, application);

    store.add(iri, graph, function (result) {
      self.emit('afterAdd', iri, graph, agent, application);
      self.emit('changed', iri);

      callback(result);
    }, agent, application);
  };

  self.merge = function (iri, graph, callback, agent, application) {
    self.emit('beforeMerge', iri, graph, agent, application);

    store.merge(iri, graph, function (result) {
      self.emit('afterMerge', iri, graph, agent, application);
      self.emit('changed', iri);

      callback(result);
    }, agent, application);
  };

  self.remove = function (iri, graph, callback, agent, application) {
    self.emit('beforeRemove', iri, graph, agent, application);

    store.remove(iri, graph, function (result) {
      self.emit('afterRemove', iri, graph, agent, application);
      self.emit('changed', iri);

      callback(result);
    }, agent, application);
  };

  self.removeMatches = function (iri, subject, predicate, object, callback, agent, application) {
    self.emit('beforeRemoveMatches', iri, subject, predicate, object, agent, application);

    store.removeMatches(iri, subject, predicate, object, function (result) {
      self.emit('afterRemoveMatches', iri, subject, predicate, object, agent, application);
      self.emit('changed', iri);

      callback(result);
    }, agent, application);
  };

  self.delete = function (iri, callback, agent, application) {
    self.emit('beforeDelete', iri, agent, application);

    store.delete(iri, function (result) {
      self.emit('afterDelete', iri, agent, application);
      self.emit('changed', iri);

      callback(result);
    }, agent, application);
  };
};


EventStore.prototype.__proto__ = events.EventEmitter.prototype;


module.exports = EventStore;