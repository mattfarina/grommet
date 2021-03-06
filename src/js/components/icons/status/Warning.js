// (C) Copyright 2014-2015 Hewlett-Packard Development Company, L.P.

var React = require('react');

var Warning = React.createClass({

  render: function() {
    var className = 'status-icon status-icon-warning';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    return (
      <svg className={className} viewBox="0 0 27 24" version="1.1">
        <g className={"status-icon__base"}>
          <path d="M12,0 L0,22 L24,22 L12,0 L12,0 Z" stroke="none"></path>
        </g>
        <g className={"status-icon__detail"} strokeWidth="2" transform="translate(11.000000, 8.000000)">
          <path d="M1,0 L1,6" fill="none"></path>
          <path d="M1,8 L1,10" fill="none"></path>
        </g>
      </svg>
    );
  }

});

module.exports = Warning;
