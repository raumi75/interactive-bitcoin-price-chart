import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';
import formatDollar from './formatting.js';

import './InfoBox.css';

class InfoBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPrice: null,
      monthChangeD: null,
      monthChangeP: null,
      updatedAt: null,
      mcAfeePrice: null
    }
  }
  componentDidMount(){
    this.getData = () => {
      const {data} = this.props;
      const url = 'https://api.coindesk.com/v1/bpi/currentprice.json';

      fetch(url).then(r => r.json())
        .then((bitcoinData) => {
          const price = bitcoinData.bpi.USD.rate_float;
          const change = price - data[0].y;
          const changeP = (price - data[0].y) / data[0].y * 100;

          this.setState({
            currentPrice: bitcoinData.bpi.USD.rate_float,
            monthChangeD: formatDollar(change),
            monthChangeP: changeP.toFixed(2) + '%',
            updatedAt: bitcoinData.time.updatedISO,
            mcAfeePrice: this.getMcAfeePriceNow()
          })
        })
        .catch((e) => {
          console.log(e);
        });
    }
    this.getData();
    this.refresh = setInterval(() => this.getData(), 60000);
    this.refresh = setInterval(() => this.refreshMcAfeePrice(), 1000);
  }

  componentWillUnmount(){
    clearInterval(this.refresh);
  }

  refreshMcAfeePrice() {
    this.setState({
      mcAfeePrice: this.getMcAfeePriceNow()
    })
  }

  // The chart below the InfoBox shows the
  // historical price at closing and the predicted price at 0:00 AM
  // I know this is inconsitent. This way, the prdicted price will reach the
  // targetPrice on 2020-12-31 at 0:00 am, which is not exactly end of the year, but who cares...
  getDaysSincePrediction() {
    const startDate = this.props.startDate + '+0000';
    return moment().utc().diff(moment(startDate),'days', true)-1;
  }

  // No Paramter because this is realtime
  // The price will be calculated for this moment.
  getMcAfeePriceNow(){
    const goalRate = 1+this.props.growthRate/100;
    const {startPrice} = this.props;   // start rate USD/BTC at day of tweet
    return Math.pow(goalRate, this.getDaysSincePrediction()) * startPrice;
  }

  getAboveOrBelow() {
    if (this.state.currentPrice>this.state.mcAfeePrice)
    { return ('above'); } else { return 'below' ; }
  }

  render(){
    return (
      <Row>
          <Col xs={4} md={2} mdOffset={3} height={"5em"}>
            <div className="subtext">Predicted</div>
            <div className="heading predicted">{ this.state.mcAfeePrice ? formatDollar(this.state.mcAfeePrice) : 'loading...' }</div>
            <div className="subtext">steady growth</div>
          </Col>

          <Col xs={4} md={2} height={"5em"}>
            <div className="subtext">Actual</div>
            <div className="heading actual">{ this.state.currentPrice ? formatDollar(this.state.currentPrice) : 'loading...' }</div>
            <div className="subtext">{ this.state.updatedAt ? moment(this.state.updatedAt).format('YYYY-MM-DD hh:mm A') : null }</div>
          </Col>

          <Col xs={4} md={2} height={"5em"}>
            <div className="subtext">Bitcoin is</div>
            <div className={"heading "+this.getAboveOrBelow() }>{ this.state.currentPrice ? (Math.abs(this.state.currentPrice/this.state.mcAfeePrice-1)).toLocaleString('en-us', {style: 'percent', maximumSignificantDigits: 4}) : '...' }</div>
            <div className={"subtext "+this.getAboveOrBelow() }>{this.getAboveOrBelow()}</div>
          </Col>
      </Row>
    );
  }
}

// DEFAULT PROPS
InfoBox.defaultProps = {
  startPrice: 2000,
  startDate:  '2017-07-17 00:00:00',         // Date of first McAfee Tweet
  data: null
}

export default InfoBox;
