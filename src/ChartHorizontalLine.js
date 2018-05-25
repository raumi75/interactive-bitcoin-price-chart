import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {yLabelSize} from './LineChart.js';

export default class ChartHorizontalLine extends Component {
  render() {
    const {y, width, className} = this.props;

    return (
      <line
        className={className}
        x1={yLabelSize}       y1={y}
        x2={width-yLabelSize} y2={y}
      />
    )
  }
}

ChartHorizontalLine.defaultProps = {
  className: 'hoverline'
}

ChartHorizontalLine.propTypes = {
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  className: PropTypes.string
}
