import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Progress.css';

export default class Progress extends Component {
  styleWidthPercent() {
    const { value, max } = this.props;
    return { width: Math.min(100,Math.ceil(value/max*100)) + '%' }
  }

  render() {
    const {type} = this.props;
    return (
      <div className="progress_container">
        <div
          style={this.styleWidthPercent()}
          className={"progress_bar progress_"+type}
        ></div>
      </div>
    );
  }
}

Progress.propTypes = {
  value: PropTypes.number.isRequired,
  max:   PropTypes.number.isRequired,
  type:  PropTypes.oneOf(['actual', 'prediction']).isRequired
}
