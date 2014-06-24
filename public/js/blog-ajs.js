/* global angular:false, rdf:false */
'use strict';

/**
 * Get property as array
 *
 * Returns an empty array if the property doesn't exist or is null. If the property isn't an array return a new array
 * with the object as a the only element. Returns the property if it's already an array.
 *
 * @param object
 * @param property
 * @returns {Array}
 */
var getArray = function (object, property) {
  if (property in object) {
    var value = object[property];

    if (value == null) {
      return [];
    }

    if (!Array.isArray(value)) {
      return [value];
    }

    return value;
  }

  return [];
};

/**
 * Generic sort by property
 *
 * @param key property the array should be sorted by
 * @param order order (1 = ascending, -1 = descending)
 * @returns {number}
 */
var sortByProperty = function (key, order) {
  if (order == null) {
    order = 1;
  }

  return function (a, b) {
    if (a[key] > b[key]) {
      return order;
    }

    if (a[key] < b[key]) {
      return -order;
    }

    return 0;
  };
};


// application parameters
var
  baseIri = 'https://localhost:8443/blog',
  blogIri = baseIri + '#blog',
  jsonify = new rdf.JSONify(new rdf.promise.Store(new rdf.LdpStore())),
  cachedJsonify = new rdf.CachedJSONify(null, {'corsProxy': 'https://localhost:8443/cors'});

jsonify.addContext(baseIri, {'@vocab': 'http://schema.org/'});


/**
 * blog app
 * @type {*|module}
 */
var App = angular.module('BlogApp', ['ui.bootstrap']);

/**
 * format timestamp via filter
 */
App.filter('timestamp', function () {
  return function (dateString) {
    var date = new Date(dateString);

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
});

/**
 * FOAF link using name property as label
 */
App.directive('foafNameLink', function () {
  return {
    restrict: 'E',
    scope: {
      href: '=href'
    },
    controller: function ($scope) {
      var
        context = {'@vocab': 'http://xmlns.com/foaf/0.1/'},
        profile;

      profile = cachedJsonify.get($scope.href, context, function (profile) {
        $scope.$apply(function () {
          $scope.name = profile.name;
        });
      });

      if (profile == null) {
        $scope.name = $scope.href;
      }
    },
    template: '<a href="{{href}}">{{name}}</a>'
  };
});

/**
 * form to create a new post
 */
App.controller('PostForm', function ($scope) {
  $scope.show = false;

  $scope.toggle = function () { $scope.show = !$scope.show; };

  $scope.post = function () {
    var
      creationDate = new Date(),
      iri = baseIri + '#post-' + encodeURIComponent(creationDate.toISOString()),
      post;

    post = {
      '@id': iri,
      '@type': 'http://schema.org/BlogPosting',
      articleBody: $scope.text,
      datePublished: creationDate.toISOString(),
      headline: $scope.title
    };

    return window.navigator.id.get.agent()
      .then(function (agent) {
        post.author = {'@id': agent};

        return $scope.$parent.addPost(post);
      })
      .then(function () {
        $scope.$apply(function () {
          $scope.title = '';
          $scope.text = '';
          $scope.show = false;
        });
      });
  };
});

/**
 * post
 */
App.controller('Post', function ($scope) {
  $scope.addComment = function (comment) {
    var
      postCommentLink;

    postCommentLink = {
      '@id': $scope.post['@id'],
      'comment': {'@id': comment['@id']}
    };

    return jsonify.patch(baseIri, postCommentLink, comment)
      .then(function () {
        $scope.$apply(function () {
          $scope.post.comments.push(comment);
        });
      });
  };
});

/**
 * form to create a new comment
 */
App.controller('CommentForm', function ($scope) {
  $scope.focus = false;

  $scope.gotFocus = function () { $scope.focus = true; };

  $scope.lostFocus = function () {
    // workaround for missing click event after moving/hiding comment button
    setTimeout(function () {
      $scope.$apply(function () {
        $scope.focus = false;
      });
    }, 500);
  };

  $scope.comment = function () {
    var
      creationDate = new Date(),
      iri = baseIri + '#comment-' + encodeURIComponent(creationDate.toISOString()),
      comment;

    comment = {
      '@id': iri,
      '@type': 'http://schema.org/UserComments',
      commentText: $scope.text,
      commentTime: creationDate.toISOString()
    };

    window.navigator.id.get.agent()
      .then(function (agent) {
        comment.creator = {'@id': agent};

        return $scope.$parent.addComment(comment);
      })
      .then(function () {
        $scope.$apply(function () {
          $scope.focus = false;
          $scope.text = '';
        });
      });
  };
});

/**
 * main blog controller
 */
App.controller('Blog', function ($scope) {
  $scope.header = {
    name: '',
    description: ''
  };
  $scope.posts = [];

  jsonify.get(blogIri)
    .then(function (blog) {
      $scope.$apply(function () {
        $scope.header.name = blog.name;
        $scope.header.description = blog.description;
        $scope.posts = getArray(blog, 'blogPost')
          .sort(sortByProperty('datePublished', -1))
          .map(function (post) {
            post.comments = getArray(post, 'comment')
              .sort(sortByProperty('commentTime'))
              .map(function (comment) {
                return comment;
              });

            return post;
          });
      });
    });

  $scope.addPost = function (post) {
    var
      blogPostLink;

    blogPostLink = {
      '@id': blogIri,
      'blogPost': {'@id': post['@id']}
    };

    return jsonify.patch(baseIri, blogPostLink, post)
      .then(function () {
        $scope.$apply(function () {
          $scope.posts.unshift(post);
        });
      });
  };
});