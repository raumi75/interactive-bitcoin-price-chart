import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ChartActivePoint extends Component {
  render() {
    const {activePoint, color, pointRadius, priceType} = this.props;
    if (activePoint.y[priceType]>0) {
      return (
        <circle
          className='linechart_point'
          style={{stroke: color}}
          r={pointRadius}
          cx={activePoint.svgX}
          cy={activePoint.svgY[priceType]}
        />
      );
    } else {
      return (null);
    }
  }
}

ChartActivePoint.defaultProps = {
  activePoint: {
    x:0,
    svgX:0,
    d:'2017-07-24',
    y: {m: 0, p: 0},
    svgY: {m: 0, p: 0}
  },
  pointRadius: 5,
  color: 'grey',
  priceType: 'p'
}

ChartActivePoint.propTypes = {
  pointRadius: PropTypes.number,
  color: PropTypes.string,
  activePoint: PropTypes.array.isRequired,
  priceType: PropTypes.oneOf['p', 'm']
}
