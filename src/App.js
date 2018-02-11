import React, { Component } from 'react';
import moment from 'moment';
import './App.css';
import LineChart from './LineChart';
import ToolTip from './ToolTip';
import InfoBox from './InfoBox';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingData: true,
      data: null,
      hoverLoc: null,
      activePoint: null
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
              m: this.getMcAfeeRate(moment(date).diff(moment(tweetDate),'days'))
            });
            count++;
          }
          this.setState({
            data: sortedData,
            fetchingData: false
          })
        })
        .catch((e) => {
          console.log(e);
        });
    }
    getData();
  }

  // USD/BTC according to John McAfee's Tweet (1.000.000 by 2020)
  getMcAfeeRate(s){
    const {targetDate} = this.props;
    const {growthRate} = this.props;
    const goalRate = 1+growthRate;
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet
    return Math.round(Math.pow(goalRate, s) * tweetPrice);
  }

  getDaysSincePrediction(d) {
    const {tweetDate} = this.props;
    return moment(d).diff(moment(tweetDate),'days')
  }

  // Text that explains how to calculate the price on given day
  explainPriceOn(d) {
    const {growthRate} = this.props;
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet

    return ( <div> {moment(d).format('YYYY-MM-DD')}, the prediction is {this.getDaysSincePrediction(d)} days old, so the target-price is:
    <br />{1+growthRate}<sup><strong>{this.getDaysSincePrediction(d)}</strong></sup> * {tweetPrice.toLocaleString('us-EN',{ style: 'currency', currency: 'USD', minimumFractionDigits: 3 })} = { this.getMcAfeeRate(this.getDaysSincePrediction(d)).toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }
 </div> );

  }

  render() {
    const {growthRate} = this.props;
    const {tweetPrice} = this.props;

    return (

      <div className='container'>
        <div className='row'>
          <h1>bircoin.top</h1>
        </div>
        <div className='row'>
          <h2>The McAfee Prediction Tracker</h2>
        </div>
        <div className='row'>
          <p>Bitcoiners turn typos into jargon. So HODL on tight to your BIRCOIN! By the end of 2020 it will be worth $1 Million.</p>
        </div>
        <div className='row'>
          <p className="redlineExplanation">The red line steadily grows to 1 Mio $/BTC.</p>
        </div>

        <div className='row'>
          <div className='popup'>
            {this.state.hoverLoc ? <ToolTip hoverLoc={this.state.hoverLoc} activePoint={this.state.activePoint}/> : null}
          </div>
        </div>
        <div className='row'>
          <div className='chart'>
            { !this.state.fetchingData ?
              <LineChart data={this.state.data} onChartHover={ (a,b) => this.handleChartHover(a,b) }/>
              : null }
          </div>
        </div>
        <div className='row'>
          <div id="coindesk"> Powered by <a href="http://www.coindesk.com/price/">CoinDesk</a></div>
        </div>
        <div className='row'>
          <div id="acknowledgement"> Based on Brandon Morellis <a href="https://codeburst.io/how-i-built-an-interactive-30-day-bitcoin-price-graph-with-react-and-an-api-6fe551c2ab1d">30 Day Bitcoin Price Graph</a></div>
        </div>


        <div className='row'>
          <p className="explanation">
            <br />John McAfee made a bet on July 17th 2017: One single Bitcoin would be worth 500.000 US$ in three years. The price was {tweetPrice.toLocaleString('us-EN',{ style: 'currency', currency: 'USD', minimumFractionDigits: 3 }) } at the time. He later revised his bet and <a href="https://twitter.com/officialmcafee/status/935900326007328768">predicted one Million US$ by the end of 2020</a>.
          </p>
        </div>
        <div className='row'>
          <a href="https://twitter.com/officialmcafee/status/935900326007328768"><img src="tweet20171129.png" /></a>
        </div>
        <div className='row'>
        <p className="explanation">
            <br />Is this really possible? Bitcoin needs to grow at a rate of <strong>{ growthRate*100 } % per day</strong>. That is the red line on the above chart. As long as the blue line is above the red line, we are on target and John McAfee will not have to eat his own dick. Hover over the graph to get daily prices.
            <br />
            <br />The growth rate of less than half a percent does not sound like much to you? That´s because we all suck at grasping the concept of exponential growth. This is the magic behind compound interest.
            <br />
            <p>Grab a calculator and try it yourself:</p>
            <br />
            Today, {this.explainPriceOn(Date.now())}

            <br />{this.explainPriceOn('2018-12-31')}

            <br />{this.explainPriceOn('2019-12-31')}


            <br />Still does not look like it is on target?

            {this.explainPriceOn('2020-06-01')}

            <br />And finally, {this.explainPriceOn('2020-12-31')}

            <br />Of course, this growth has limits, but remember that there will only be 21 Million BTC. If every Millionaire in the world wants one, there are not enough for every one to have a whole BTC.
            <br />
            <br />It will make sense to use a <a href="https://en.bitcoin.it/wiki/Units">unit</a> like microbitcoin aka bits (One Millionth of a Bitcoin) and Satoshis (One hundredth of a bit). Then a bit will be a Dollar and a Satoshi will be a Cent.
          </p>
        </div>

        <div className='row'>
          <div id="source">Source: <a href="https://github.com/raumi75/mcafeetracker">github</a>.</div>
        </div>
      </div>

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
