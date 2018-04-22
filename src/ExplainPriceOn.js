import React, { Component } from 'react';
import moment from 'moment';
import { Panel } from 'react-bootstrap';
import { formatDollar } from './formatting.js';

// Text that explains how to calculate the price on given day
class ExplainPriceOn extends Component {
  render() {
    const growthRate = this.props.growthRate/100;
    const {date, startPrice} = this.props;   // start rate USD/BTC at day of tweet

    return (
      <Panel className="panelFormula">
        <Panel.Heading>By the end of {moment(date).format('YYYY-MM-DD')}, the prediction is {this.getDaysSincePrediction(date)} days old</Panel.Heading>
        <Panel.Body>{1+growthRate}<sup><strong>{this.getDaysSincePrediction(date)}</strong></sup> * { formatDollar(startPrice, 3) } = { formatDollar(this.getMcAfeeRate(this.getDaysSincePrediction(date)),2) }</Panel.Body>
      </Panel>
    );
  }

  getDaysSincePrediction(d) {
    const {startDate} = this.props;
    return moment(d).diff(moment(startDate),'days')
  }

  getMcAfeeRate = (s) => {
    const goalRate = 1+(this.props.growthRate/100);
    const {startPrice} = this.props;   // start rate USD/BTC at day of tweet
    if (s >= 0) {
      return Math.pow(goalRate, s) * startPrice;
    } else {
      return 0;
    }
  }
}

export default ExplainPriceOn;
