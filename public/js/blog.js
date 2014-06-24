/* global rdf:false, React:false */
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


/**
 * Generic FOAF profile components
 */
var Foaf = {
  cachedJsonify: new rdf.CachedJSONify()
};


/**
 * profile link with name lookup
 */
Foaf.Name = React.createClass({
  displayName: 'FoafName',
  getInitialState: function () {
    var
      self = this,
      context = {'@vocab': 'http://xmlns.com/foaf/0.1/'},
      profile;

    profile = Foaf.cachedJsonify.get(this.props.iri, context, function (profile) {
      self.setState({name: profile.name});
    });

    if (profile == null) {
      return {name: this.props.iri};
    }

    return {name: profile.name};
  },
  'render': function () {
    return React.DOM.a({href: this.props.iri}, this.state.name);
  }
});




/**
 * Generic Timestamp span tag
 */
var Timestamp = React.createClass({
  displayName: 'Timestamp',
  render: function () {
    var
      date = new Date(this.props.date),
      attr = {};

    if ('rel' in this.props) {
      attr.rel = this.props.rel;
    }

    return React.DOM.span(attr, date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
  }
});


var BlogApp = function (baseIri, blogIri) {
  var jsonify = new rdf.JSONify();

  /**
   * title + description
   */
  var Header = React.createClass(
    {displayName: 'BlogHeader',
    getInitialState: function () {
      return {name: this.props.name, description: this.props.description};
    },
    render: function () {
      return React.DOM.div(null,
        React.DOM.h1(null, this.state.name),
        React.DOM.p(null, this.state.description)
      );
    }
  });

  /**
   * list of posts + form to create new post
   */
  var Posts = React.createClass({
    displayName: 'BlogPosts',
    getInitialState: function () {
      return {blogPosts: getArray(this.props, 'blogPost')};
    },
    render: function () {
      return React.DOM.div(
        {},
        new PostForm({posts: this}),
        this.state.blogPosts
          .sort(sortByProperty('datePublished', -1))
          .map(function (post) {
            post.key = post['@id'];

            return new Post(post);
          }
        )
      );
    },
    addPost: function (post) {
      var
        self = this,
        blogPostLink;

      blogPostLink = {
        '@id': this.props['@id'],
        'blogPost': {'@id': post['@id']}
      };

      return jsonify.patch(baseIri, blogPostLink, post)
        .then(function () {
          self.setState({blogPosts: self.state.blogPosts.concat([post])});
        });
    }
  });

  /**
   * form to create new post
   */
  var PostForm = React.createClass({
    displayName: 'BlogPostForm',
    getInitialState: function () {
      return {text: '', title: '', visible: false};
    },
    textChange: function (event) {
      this.setState({text: event.target.value});
    },
    titleChange: function (event) {
      this.setState({title: event.target.value});
    },
    submit: function (event) {
      var
        self = this,
        creationDate = new Date(),
        iri = baseIri + '#post-' + encodeURIComponent(creationDate.toISOString()),
        post;

      event.preventDefault();

      post = {
        '@id': iri,
        '@type': 'http://schema.org/BlogPosting',
        articleBody: this.state.text,
        datePublished: creationDate.toISOString(),
        headline: this.state.title
      };

      window.navigator.id.get.agent()
        .then(function (agent) {
          post.author = {'@id': agent};

          return self.props.posts.addPost(post);
        })
        .then(function () {
          self.setState({text: '', title: '', visible: false});
        });
    },
    render: function () {
      var self = this;

      var form = React.DOM.form(
        {role: 'form'},
        React.DOM.div(
          {className: 'form-group'},
          React.DOM.input({
            className: 'form-control',
            placeholder: 'Title',
            onChange: self.titleChange,
            value: self.state.title
          }),
          React.DOM.textarea({
            className: 'form-control',
            placeholder: 'Text',
            rows: 5,
            style: {resize: 'none'},
            onChange: self.textChange,
            value: self.state.commentText
          })
        ),
        React.DOM.button({
          className: 'btn btn-xs btn-primary',
          onClick: this.submit
        }, 'post')
      );

      var toggle = React.DOM.span({
        className: self.state.visible ? 'glyphicon glyphicon-chevron-left': 'glyphicon glyphicon-chevron-right',
        style: {cursor: 'pointer'},
        onClick: function () { self.setState({visible: !self.state.visible}); }
      });

      return React.DOM.div(
        {},
        toggle,
        this.state.visible ? form : null
      );
    }
  });

  /**
   * post
   */
  var Post = React.createClass({
    displayName: 'BlogPost',
    getInitialState: function () {
      return {comments: getArray(this.props, 'comment')};
    },
    render: function () {
      var
        post,
        comments;

      post =
        React.DOM.div({className: 'blog-post'},
          React.DOM.h2(null, this.props.headline),
          React.DOM.p(null, this.props.articleBody),
          React.DOM.small(null,
            new Timestamp({date: this.props.datePublished}),
            ' by ',
            new Foaf.Name({iri: this.props.author['@id']})
          )
        );

      comments = this.state.comments
        .sort(sortByProperty('commentTime'))
        .map(function (comment) {
          comment.key = comment['@id'];

          return new Comment(comment);
        }
      );

      return React.DOM.div(
        {},
        post,
        comments,
        new CommentForm({post: this})
      );
    },
    addComment: function (comment) {
      var
        self = this,
        postCommentLink;

      postCommentLink = {
        '@id': this.props['@id'],
        'comment': {'@id': comment['@id']}
      };

      return jsonify.patch(baseIri, postCommentLink, comment)
        .then(function () {
          self.setState({comments: self.state.comments.concat([comment])});
        });
    }
  });

  /**
   * comment
   */
  var Comment = React.createClass({
    displayName: 'Comment',
    render: function () {
      return React.DOM.blockquote(
        { className: 'blog-post blog-post-comment' },
        React.DOM.p(null, this.props.commentText),
        React.DOM.small(null,
          new Timestamp({date: this.props.commentTime}),
          ' by ',
          new Foaf.Name({iri: this.props.creator['@id']}))
      );
    }
  });

  /**
   * form to create a new comment
   */
  var CommentForm = React.createClass({
    displayName: 'BlogPostCommentForm',
    getInitialState: function () {
      return {focus: false, text: ''};
    },
    focus: function () {
      this.setState({focus: true});
    },
    blur: function () {
      if (this.state.text === '') {
        this.setState({focus: false});
      }
    },
    change: function (event) {
      this.setState({text: event.target.value});
    },
    submit: function (event) {
      var
        self = this,
        creationDate = new Date(),
        iri = baseIri + '#comment-' + encodeURIComponent(creationDate.toISOString()),
        comment;

      event.preventDefault();

      comment = {
        '@id': iri,
        '@type': 'http://schema.org/UserComments',
        commentText: this.state.text,
        commentTime: creationDate.toISOString()
      };

      window.navigator.id.get.agent()
        .then(function (agent) {
          comment.creator = {'@id': agent};

          return self.props.post.addComment(comment);
        })
        .then(function () {
          self.setState({focus: false, text: ''});
        });
    },
    render: function () {
      var
        button = null;

      if (this.state.focus) {
        button =
          React.DOM.button({
            className: 'btn btn-xs btn-primary',
            onClick: this.submit
          }, 'comment');
      }

      return React.DOM.form(
        {role: 'form'},
        React.DOM.div(
          {className: 'form-group'},
          React.DOM.textarea({
            className: 'form-control',
            rows: (!this.state.focus ? 1 : 5),
            style: {resize: 'none'},
            onFocus: this.focus,
            onBlur: this.blur,
            onChange: this.change,
            value: this.state.text
          })
        ),
        button
      );
    }
  });

  /**
   * init blog app
   */
  jsonify.addContext(baseIri, {'@vocab': 'http://schema.org/'});

  jsonify.get(blogIri, {'@vocab': 'http://schema.org/'})
    .then(function (blog) {
      React.renderComponent(new Header(blog), document.getElementById('blog-header'));
      React.renderComponent(new Posts(blog), document.getElementById('blog-posts'));
    }
  );
};



Foaf.cachedJsonify = new rdf.CachedJSONify(null, {'corsProxy': 'https://localhost:8443/cors'});


var
  baseIri = 'https://localhost:8443/blog',
  blogIri = baseIri + '#blog';

var app = new BlogApp(baseIri, blogIri);