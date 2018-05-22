import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {xLabelSize, yLabelSize, labelRadius} from './LineChart.js';
import formatDollar from './formatting.js';

export default class ChartLabelPrice extends Component {
  render(){
    const {price, xPos, yPos, priceType, cssExtra} = this.props;

    if (price > 0) {
      return(
        <g>
          <rect
            x={xPos}
            y={yPos-xLabelSize+5}
            height={xLabelSize}
            width={yLabelSize}
            rx={labelRadius}
            ry={labelRadius}
            className={'linechart_label_' + priceType + cssExtra}
          />
          <text
            transform={`translate(${xPos+yLabelSize/2},
                                      ${yPos})`}
            fill="red"
            textAnchor="middle"
            className={'linechart_label_' + priceType+cssExtra}
          >
            {formatDollar(price)}
          </text>
        </g>
      );
    } else {
      return '';
    }
  }
}

ChartLabelPrice.propTypes = {
  price: PropTypes.number,
  xPos: PropTypes.number,
  yPos: PropTypes.number,
  priceType: PropTypes.oneOf(['p','m','s']),
  cssExtra: PropTypes.oneOf(['', '_hover'])
}

ChartLabelPrice.defaultProps = {
  price: 10,
  xPos: 0,
  yPos: 0,
  priceType: 'p',
  cssExtra: ''
}
