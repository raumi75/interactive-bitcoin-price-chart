import React, { Component } from 'react';
import moment from 'moment';
import { Grid, Row , Col, Image, FormGroup, Radio, Button } from 'react-bootstrap';
import './App.css';
import LineChart from './LineChart';
import ToolTip from './ToolTip';
import InfoBox from './InfoBox';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

const predictionCount = 1263;
const minSliderDistance = 29;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingData: true,
      data: null,
      sortedData: null,
      hoverLoc: null,
      activePoint: null,
      countRange: [0, predictionCount],
      todayCount: 0,
      sliderMarks: {},
      scale: 'lin'
    }
  }

  handleChartHover(hoverLoc, activePoint){
    this.setState({
      hoverLoc: hoverLoc,
      activePoint: activePoint
    })
  }
  componentDidMount(){
    const {tweetDate} = this.props;
    const {targetDate} = this.props;

    const getData = () => {
      const url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+tweetDate+'&end='+targetDate;

      fetch(url).then( r => r.json())
        .then((bitcoinData) => {
          const sortedData = [];
          let count = 0;
          for (let date in bitcoinData.bpi){
            sortedData.push({
              d: moment(date).format('YYYY-MM-DD'),
              p: bitcoinData.bpi[date].toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }),
              x: count, //previous days
              y: bitcoinData.bpi[date], // numerical price
              s: moment(date).diff(moment(tweetDate),'days'), // Days since McAfee Tweet
              m: this.getMcAfeeRate(count)
            });
            count++;
          }

          var mark = {};
          mark[0] = moment(tweetDate).format('YYYY-MM-DD');
          mark[count-1] = 'yesterday';
          mark[predictionCount] = moment(targetDate).format('YYYY-MM-DD');

          this.setState({
            todayCount: count,
            countRange: [0, count-1],
            sliderMarks: mark
          });


          for (count; count <= predictionCount ; count++) {
            sortedData.push({
              d: moment(tweetDate).add(count, 'days').format('YYYY-MM-DD'),
              p: 0,
              x: count, //previous days
              y: 0,
              s: count, // Days since McAfee Tweet
              m: this.getMcAfeeRate(count)
            });
          }

          this.setState({
            dataComplete: sortedData,
            data: sortedData.slice(0,this.state.todayCount),
            fetchingData: false
          })
        })
        .catch((e) => {
          console.log(e);
        });
    }
    getData();
  }

  handleLineChartLength = (pos) => {

    if (pos[0] < 0) { pos[0] = 0; }
    if (pos[1] < 1) { pos[1] = this.state.todayCount; }
    if (pos[0] >= (pos[1]-minSliderDistance)) {
      pos[0] = 0;
      pos[1] = this.state.todayCount;
    }

    this.setState({
      countRange: [pos[0], pos[1]],
    });

    this.cutData([pos[0], pos[1]]);
  };

  cutData(pos) {
    var dataCut = this.state.dataComplete.slice(pos[0],pos[1]+1);

    if (pos[0]>0) {
        dataCut = dataCut.map(function(val) {
        return {
          d: val.d,
          p: val.p,
          x: val.x-pos[0]+1, //previous days
          y: val.y,
          s: val.s, // Days since McAfee Tweet
          m: val.m
        }
      });
    }

    this.setState({
      data: dataCut
    });

  }
  handleScaleChange = (changeEvent) => {
    this.setState({
      scale: changeEvent.target.value
    });
  }

  handleRangeReset = () => {
    this.setState({
      countRange: [0, this.state.todayCount-1],
      scale: 'lin'
    });
    this.cutData([0, this.state.todayCount-1]);
  }

  // USD/BTC according to John McAfee's Tweet (1.000.000 by 2020)
  getMcAfeeRate(s){
    const goalRate = 1+this.props.growthRate;
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet
    return Math.pow(goalRate, s) * tweetPrice;
  }

  getDaysSincePrediction(d) {
    const {tweetDate} = this.props;
    return moment(d).diff(moment(tweetDate),'days')
  }

  // Text that explains how to calculate the price on given day
  explainPriceOn(d) {
    const {growthRate} = this.props;
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet

    return ( <span> {moment(d).format('YYYY-MM-DD')}, the prediction is {this.getDaysSincePrediction(d)} days old, so the target-price is:
    <br />{1+growthRate}<sup><strong>{this.getDaysSincePrediction(d)}</strong></sup> * {tweetPrice.toLocaleString('us-EN',{ style: 'currency', currency: 'USD', minimumFractionDigits: 3 })} = { this.getMcAfeeRate(this.getDaysSincePrediction(d)).toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) } </span> );

  }

  render() {
    const {growthRate} = this.props;
    const {tweetPrice} = this.props;

    return (

      <Grid fluid={true} >

        <Row>
          <Col xs={12}>
            <h1 className="text-center">Bitcoin Price Prediction Tracker</h1>
            <p className="text-center">John McAfee says: By the end of 2020 Bitcoin will be worth $1 Million. Is he losing his bet?</p>
          </Col>
        </Row>

        { !this.state.fetchingData ?
        <InfoBox data={this.state.data} />
        : null }

        <Row>
          <div className='popup'>
            {this.state.hoverLoc ? <ToolTip hoverLoc={this.state.hoverLoc} activePoint={this.state.activePoint}/> : null}
          </div>
        </Row>

        <Row>
            { !this.state.fetchingData ?
              <div className='chart'>

              <LineChart data={this.state.data} scale={this.state.scale} onChartHover={ (a,b) => this.handleChartHover(a,b) }/>

              <Col xs={12} className='range'>
                <Range
                  allowCross={false}
                  min={0}
                  max={predictionCount}
                  marks={this.state.sliderMarks}
                  onChange={this.handleLineChartLength}
                  value={this.state.countRange}
                  pushable={minSliderDistance+1} />
                  <br />
              </Col>

              <Col xs={9} sm={5} smOffset={1}>
                <FormGroup>
                  <Radio name="radioGroup" value="lin" checked={this.state.scale === 'lin'} onChange={this.handleScaleChange} >
                    Linear scale (1, 2, 3)
                  </Radio>{' '}
                  <Radio name="radioGroup" value="log" checked={this.state.scale === 'log'} onChange={this.handleScaleChange} >
                    Logarithmic scale (1, 10, 100)
                  </Radio>
                </FormGroup>
              </Col>

              <Col xs={3} sm={6} >
                <Button onClick={this.handleRangeReset}>Reset</Button>
              </Col>
              </div>

              : null }
        </Row>

        <Row>
          <Col xs={12}>
            <p className="lead redlineExplanation">The red line steadily grows to 1 Mio $/BTC. Move the slider to zoom.</p>
            <p id="coindesk" className="text-right"> Powered by <a href="http://www.coindesk.com/price/">CoinDesk</a></p>
            <p id="acknowledgement"  className="text-right"> Based on Brandon Morellis <a href="https://codeburst.io/how-i-built-an-interactive-30-day-bitcoin-price-graph-with-react-and-an-api-6fe551c2ab1d">30 Day Bitcoin Price Graph</a></p>
          </Col>
        </Row>


        <Row>
          <Col xs={12} md={6}>
            <h2>It started with a tweet</h2>
            <p className="lead explanation">
              John McAfee made a bet on July 17th 2017: One single Bitcoin would be worth 500.000 US$ in three years. The price was {tweetPrice.toLocaleString('us-EN',{ style: 'currency', currency: 'USD', minimumFractionDigits: 3 }) } at the time. He later revised his bet and <a href="https://twitter.com/officialmcafee/status/935900326007328768">predicted one Million US$ by the end of 2020</a>.
            </p>
          </Col>
          <Col xs={12} md={6}>
            <p><a href="https://twitter.com/officialmcafee/status/935900326007328768"><Image src="tweet20171129.png" responsive /></a></p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2 id="explainmath">The math behind it</h2>

            <p>Is this really possible? Bitcoin needs to grow at a rate of <strong>{ growthRate*100 } % per day</strong>. That is the red line on the above chart. As long as the blue line is above the red line, we are on target and John McAfee will not have to eat his own dick. Hover over the graph to get daily prices.</p>
            <p>The growth rate of less than half a percent does not sound like much to you? That´s because we all suck at grasping the concept of exponential growth. This is the magic behind compound interest.</p>

            <p>Grab a calculator and try it yourself:</p>

            <p>Today, {this.explainPriceOn(Date.now())}</p>
            <p>{this.explainPriceOn('2018-12-31')}</p>
            <p>{this.explainPriceOn('2019-12-31')}</p>
            <p>Still does not look like it is on target?</p>
            <p>{this.explainPriceOn('2020-06-01')}</p>
            <p>And finally, {this.explainPriceOn('2020-12-31')}</p>

          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Why would it grow?</h2>
            <p>Bitcoin is scarce. There will only be 21 Million BTC. If every Millionaire in the world wants one, there are not enough for every one to have a whole BTC.</p>
            <p>More people adopting and buying bitcoin will raise the price.</p>
            <p>This technology is still at an early. Think the internet in the mid-nineties when the majority thought it was only for nerds and had no real use.</p>
            <p>The market capitalization of bitcoin is still tiny, <a href="http://money.visualcapitalist.com/worlds-money-markets-one-visualization-2017/">compared to</a> gold, credit cards or the stock market.</p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Such an expensive currency!</h2>
            <p>You can buy and spend fractions of a bitcoin.</p>
            <p>Sooner or later, it will make sense to use a <a href="https://en.bitcoin.it/wiki/Units">unit</a> like microbitcoin aka bits (One Millionth of a Bitcoin) and Satoshis (One hundredth of a bit). Then a bit will be a Dollar and a Satoshi will be a Cent.</p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>What can go wrong?</h2>
            <p>Though bitcoin has proven to be secure and many people put their trust in it, there is still a
            lot that can go wrong. Do not invest more than you can afford to lose!</p>
            <p>Bitcoin could go to zero and <a href="https://99bitcoins.com/bitcoinobituaries/">many people think so.</a></p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Who is that John McAfee guy?</h2>
            <p>The founder of McAfee Antivirus. Some say he is a genius. Some say he is a lunatic. But that does not matter.</p>
            <p className="lead">This is not about McAfee. It is about comparing the price to a prediction that sounds too good to be true.</p>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div id="source">
              <p className="text-center">Source: <a href="https://github.com/raumi75/mcafeetracker">github</a></p>
              <p className="text-center">User: <a href="https://reddit.com/u/raumi75/">/u/raumi75</a>, <a href="https://twitter.com/raumi75">@raumi75</a></p>
            </div>
          </Col>
        </Row>
      </Grid>
    );
  }
}

// DEFAULT PROPS
App.defaultProps = {
  tweetDate:  '2017-07-17',         // Date of first McAfee Tweet
  tweetPrice:  2244.265,            // USD/BTC on TweetDate
  targetDate:  '2020-12-31',        // Day McAfee predicted the price
  targetPrice: 1000000,             // revised prediction (1Million)
  growthRate:  0.00484095703431026  // daily growth rate to goal of 1.000.000 USD/BTC
}

export default App;
