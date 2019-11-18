import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChartLabelPrice from './ChartLabelPrice.js';
import {xLabelSize} from './LineChart.js';

export default class ChartLabelPricePair extends Component {

  makeChartLabelPrice(priceType) {
    const {activePoint, xPos, cssExtra} = this.props;

    return (
      <ChartLabelPrice
        price={activePoint.y[priceType]}
        xPos={xPos}
        yPos={activePoint.svgY[priceType]+getOffsetLabelPrice(activePoint, priceType)}
        priceType={priceType}
        cssExtra={cssExtra}
      />
    );
  }

  render() {
    const {activePoint} = this.props;
    return (
      <g>
        { activePoint.y.m ? this.makeChartLabelPrice('m')  : null }
        { activePoint.y.p ? this.makeChartLabelPrice('p')  : null }
      </g>
    );
  }
}

ChartLabelPricePair.defaultProps = {
  xPos: 0,
  cssExtra: ''
};

ChartLabelPricePair.propTypes = {
  activePoint: PropTypes.object.isRequired,
  xPos: PropTypes.number,
  cssExtra: PropTypes.oneOf(['', '_hover'])
};



// If pricelabels are too close together, move them up or down a little
function getOffsetLabelPrice(prices, pricetype) {
  var otherPricetype = getOtherPricetype(pricetype);
  var distanceY      = 0;

  if (prices.svgY[otherPricetype] > 0) {
    distanceY = prices.svgY[pricetype]-prices.svgY[otherPricetype];
  }

  if (distanceY === 0) {return 0;}

  if (Math.abs(distanceY) < xLabelSize) {
    // prices are too close
    if (distanceY < 0) {
      // this price is above the other
      return xLabelSize*(-0.5);
    } else {
      // this price is below the other
      return xLabelSize*0.25;
    }
  } else {
    return 0;
  }
}

const getOtherPricetype = function(pricetype) {
  if (pricetype === 'm') { return 'p'; } else { return 'm'; }
};
