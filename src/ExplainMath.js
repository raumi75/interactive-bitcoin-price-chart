import React, { Component } from 'react';
import ExplainPriceOn from './ExplainPriceOn.js';

class ExplainMath extends Component {

  render() {
    const {startDate, growthRate, startPrice, targetDate} = this.props;

    return (
      <div>
        <h2 id="explainmath">The math behind it</h2>

        <p>Is this really possible? Bitcoin needs to grow at a rate of <strong>{ growthRate } % per day</strong>.
        That is the red line on the above chart. As long as the blue line is above the red line, we are on target.
        Hover over the chart to get daily prices.</p>

        <p>Compared to the enormous price changes, half a percent does not sound like much to you? This is the magic of exponential growth.</p>

        <p>Grab a calculator and try it yourself:</p>

        <p>Today,</p>
        <ExplainPriceOn date={Date.now()} startDate={startDate} growthRate={growthRate} startPrice={startPrice} />
        <ExplainPriceOn date='2018-12-31' startDate={startDate} growthRate={growthRate} startPrice={startPrice} />
        <ExplainPriceOn date={'2019-12-31'} startDate={startDate} growthRate={growthRate} startPrice={startPrice} />
        <p>Still does not look like it is on target?</p>
        <ExplainPriceOn date={'2020-06-01'} startDate={startDate} growthRate={growthRate} startPrice={startPrice} />
        <p>And finally,</p>
        <ExplainPriceOn date={targetDate} startDate={startDate} growthRate={growthRate} startPrice={startPrice} />
      </div>
    );
  }
}

export default ExplainMath;
