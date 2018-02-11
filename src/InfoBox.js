import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col, Panel } from 'react-bootstrap';

import './InfoBox.css';

class InfoBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPrice: null,
      monthChangeD: null,
      monthChangeP: null,
      updatedAt: null
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
            monthChangeD: change.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }),
            monthChangeP: changeP.toFixed(2) + '%',
            updatedAt: bitcoinData.time.updated
          })
        })
        .catch((e) => {
          console.log(e);
        });
    }
    this.getData();
    this.refresh = setInterval(() => this.getData(), 60000);
  }
  componentWillUnmount(){
    clearInterval(this.refresh);
  }

  // No Paramter because this is realtime
  getDaysSincePrediction() {
    const {tweetDate} = this.props;
    return moment().diff(moment(tweetDate),'days', true)
  }

  // No Paramter because this is realtime
  getMcAfeeRate(){
    const {targetDate} = this.props;
    const {growthRate} = this.props;
    const goalRate = 1+growthRate;
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet
    return Math.pow(goalRate, this.getDaysSincePrediction()) * tweetPrice;
  }

  getAheadOrBehind() {
    if (this.state.currentPrice>this.getMcAfeeRate())
    { return ('ahead'); } else { return 'behind' ; }
  }

  render(){
    return (
      <Row>
        { this.state.currentPrice ?
          <Col xs={12} sm={4} lg={3} lgOffset={1}>
            <Panel height={"4em"} >
              <Panel.Body>
                <div className="subtext">Bitcoin rollercoaster price <br /> { moment(this.state.updatedAt).format('YYYY-MM-DD hh:mm:ss')} </div>
                <div className="heading">{this.state.currentPrice.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' })}</div>
              </Panel.Body>
            </Panel>
          </Col>
        : null}
          <Col xs={12} sm={4} lg={3} >
            <Panel height={"4em"}>
              <Panel.Body>
                <div className="subtext">If it were a smooth ride to 1 Million $, Bitcoin would be at:</div>
                <div className="heading">{this.getMcAfeeRate().toLocaleString('us-EN',{ style: 'currency', currency: 'USD' })}</div>
              </Panel.Body>
            </Panel>
          </Col>
          <Col xs={12} sm={4} lg={3} >
            <Panel height={"4em"}>
              <Panel.Body>
                <div className="subtext">So right now, Bitcoin is</div>
                <div className="heading">{(this.state.currentPrice/this.getMcAfeeRate()-1).toLocaleString('en-us', {style: 'percent', maximumSignificantDigits: 4})}</div>
                <div className="subtext">{this.getAheadOrBehind()} of his prediction</div>
              </Panel.Body>
            </Panel>
          </Col>
      </Row>
    );
  }
}

// DEFAULT PROPS
InfoBox.defaultProps = {
  tweetDate:  '2017-07-17 00:00:00',         // Date of first McAfee Tweet
  tweetPrice:  2244.265,            // USD/BTC on TweetDate
  targetDate:  '2020-12-31',        // Day McAfee predicted the price
  targetPrice: 1000000,             // revised prediction (1Million)
  growthRate:  0.00484095703431026  // daily growth rate to goal of 1.000.000 USD/BTC
}

export default InfoBox;
