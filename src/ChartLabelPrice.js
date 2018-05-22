import React, { Component } from 'react';
import {xLabelSize, yLabelSize, labelRadius} from './LineChart.js';
import formatDollar from './formatting.js';

export default class ChartLabelPrice extends Component {
  render(){
    const {price, xPos, yPos, priceType, cssExtra, key} = this.props;

    if (price > 0) {
      return(
        <g key={key}>
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


ChartLabelPrice.defaultProps = {
  price: 10,
  xPos: 0,
  yPos: 0,
  priceType: 'p',
  cssExtra: '',
  key: 1
}
