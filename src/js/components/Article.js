// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

var React = require('react');
var merge = require('lodash/object/merge');
var pick = require('lodash/object/pick');
var keys = require('lodash/object/keys');
var Box = require('./Box');
var KeyboardAccelerators = require('../mixins/KeyboardAccelerators');
var DOM = require('../utils/DOM');

var CLASS_ROOT = "article";
var SCROLL_STEPS = 25;

var Article = React.createClass({

  propTypes: merge({
    scrollStep: React.PropTypes.bool
  }, Box.propTypes),

  mixins: [KeyboardAccelerators],

  getDefaultProps: function () {
    return {
      pad: 'none',
      direction: 'column'
    };
  },

  _easeInOutQuad: function (t) {
    return (t < .5 ?  2 * t * t : -1 + (4 - 2 * t) * t);
  },

  _scrollTo: function (delta) {
    clearInterval(this._scrollToTimer);
    var start = this._scrollParent.scrollTop;
    var position = start + delta;
    var step = 1;
    this._scrollToTimer = setInterval(function () {
      var next;
      var easing = this._easeInOutQuad(step / SCROLL_STEPS);
      if (position > start) {
        next = Math.min(position, Math.max(this._scrollParent.scrollTop,
          Math.round(start + ((position - start) * easing))));
      } else {
        next = Math.max(position, Math.min(this._scrollParent.scrollTop,
          Math.round(start - ((start - position) * easing))));
      }
      this._scrollParent.scrollTop = next;
      step += 1;
      if (step > SCROLL_STEPS) {
        // we're done
        clearInterval(this._scrollToTimer);
      }
    }.bind(this), 8);
  },

  _markInactive: function () {
    var articleElement = this.refs.component.getDOMNode();
    var sections = articleElement.querySelectorAll('.section.box--full');
    for (var i = 0; i < sections.length; i += 1) {
      var section = sections[i];
      var rect = section.getBoundingClientRect();
      if (rect.top > (window.innerHeight - 10)) {
        section.classList.add('section--inactive');
      } else {
        section.classList.remove('section--inactive');
      }
    }
  },

  _onScroll: function (event) {
    clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(this._markInactive, 50);
  },

  _onWheel: function (event) {
    if (Math.abs(event.deltaY) > 100) {
      clearInterval(this._scrollTimer);
    } else if (event.deltaY > 5) {
      this._onDown();
    } else if (event.deltaY < -5) {
      this._onUp();
    }
  },

  _onDown: function (event) {
    if (event) {
      event.preventDefault();
    }
    var articleElement = this.refs.component.getDOMNode();
    var sections = articleElement.querySelectorAll('.section.box--full');
    for (var i = 0; i < sections.length; i += 1) {
      var section = sections[i];
      var rect = section.getBoundingClientRect();
      // 10 is for fuzziness
      if (rect.bottom > 10 && (event || rect.bottom < window.innerHeight)) {
        this._scrollTo(rect.bottom);
        break;
      }
    }
  },

  _onUp: function (event) {
    if (event) {
      event.preventDefault();
    }
    var articleElement = this.refs.component.getDOMNode();
    var sections = articleElement.querySelectorAll('.section.box--full');
    for (var i = 0; i < sections.length; i += 1) {
      var section = sections[i];
      var rect = section.getBoundingClientRect();
      // -10 is for fuzziness
      if ((rect.top >= -10 || i === (sections.length - 1)) &&
        (event || rect.top < window.innerHeight)) {
        if (i > 0) {
          section = sections[i - 1];
          rect = section.getBoundingClientRect();
          this._scrollTo(rect.top);
        }
        break;
      }
    }
  },

  getInitialState: function () {
    return {scrollTop: 0};
  },

  componentDidMount: function () {
    if (this.props.scrollStep) {
      this._markInactive();
      var articleElement = this.refs.component.getDOMNode();
      this._scrollParent = DOM.findScrollParents(articleElement)[0];
      document.addEventListener('wheel', this._onWheel);
      this._scrollParent.addEventListener('scroll', this._onScroll);
      this.startListeningToKeyboard({
        up: this._onUp,
        down: this._onDown
      });
    }
  },

  componentWillUnmount: function () {
    if (this.props.scrollStep) {
      document.removeEventListener('wheel', this._onWheel);
      clearInterval(this._scrollToTimer);
      this._scrollParent.removeEventListener('scroll', this._onScroll);
      clearTimeout(this._scrollTimer);
      this.stopListeningToKeyboard({
        up: this._onUp,
        down: this._onDown
      });
    }
  },

  render: function() {
    var classes = [CLASS_ROOT];
    var other = pick(this.props, keys(Box.propTypes));
    if (this.props.scrollStep) {
      classes.push(CLASS_ROOT + "--scroll-step");
    }

    return (
      <Box ref="component" tag="article" {...other} className={classes.join(' ')}>
        {this.props.children}
      </Box>
    );
  }
});

module.exports = Article;
