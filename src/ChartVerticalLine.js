import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {xLabelSize} from './LineChart.js';

export default class ChartVerticalLine extends Component {
  render() {
    const {x, height, className} = this.props;
    return (
      <line
        className={className}
        x1={x} y1={0-xLabelSize}
        x2={x} y2={height - xLabelSize}
      />
    )
  }
}

ChartVerticalLine.defaultProps = {
  x: 0,
  height: 0,
  className: 'hoverline'
};

ChartVerticalLine.propTypes = {
  x: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  className: PropTypes.string
};
