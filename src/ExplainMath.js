import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import formatDollar from './formatting.js';
import {dateFormat} from './App.js';

export default class ExplainMath extends Component {

  render() {
    const {startDate, growthRate, startPrice, targetDate, targetPrice} = this.props;

    return (
      <div>
        <h2 id="explainmath">The math behind it</h2>
        <p>
          Is this really possible? Bitcoin needs to grow at a rate
          of <strong>{ growthRate } % per
          day</strong> from {startDate.format(dateFormat)} to {targetDate.format(dateFormat)} to get
          from {formatDollar(startPrice)} to {formatDollar(targetPrice)}.
          That is the red line on the above chart. As long as the blue line is
          above the red line, we are on target. Hover over the chart to get
          daily prices.
        </p>
        <p>
          Compared to the enormous price changes, half a percent does not sound
          like much to you? This is the magic of exponential growth.
        </p>
      </div>
    );
  }
}

ExplainMath.propTypes = {
  startDate: PropTypes.instanceOf(moment),
  targetDate: PropTypes.instanceOf(moment),
  startPrice: PropTypes.number,
  targetPrice: PropTypes.number,
  growthRate: PropTypes.number
};
