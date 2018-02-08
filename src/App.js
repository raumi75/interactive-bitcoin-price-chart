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
    const mcAfeeStartDate = '2017-07-17'; // Date of Tweet
    const getData = () => {
      const url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+mcAfeeStartDate+'&end=2020-12-31';

      fetch(url).then( r => r.json())
        .then((bitcoinData) => {
          const sortedData = [];
          let count = 0;
          for (let date in bitcoinData.bpi){
            sortedData.push({
              d: moment(date).format('YYYY-MM-DD'),
              p: bitcoinData.bpi[date],
              x: count, //previous days
              y: bitcoinData.bpi[date], // numerical price
              s: moment(date).diff(moment(mcAfeeStartDate),'days'), // Days since McAfee Tweet
              m: this.getMcAfeeRate(moment(date).diff(moment(mcAfeeStartDate),'days'))
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
    const goalRate = 1+this.getGrowthRate(); // daily growth rate to goal of 1.000.000 USD/BTC
    const tweetBPI = 2244.265;   // start rate USD/BTC at day of tweet
    return Math.round(Math.pow(goalRate, s) * tweetBPI);
  }

  getGrowthRate() { return 0.00484095703431026; }

  getDaysSincePrediction(d) {
    return moment(d).diff(moment('2017-07-17'),'days')
  }

  render() {
    return (

      <div className='container'>
        <div className='row'>
          <h1>McAfee Tracker</h1>
        </div>
        <div className='row'>
          <p>Will Bitcoin be worth 1 Million Dollars on 2020-12-31 or will John McAfee eat his own dick?</p>
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
          <p id="explanation">
            John McAfee made a bet on July 17th 2017: One single Bitcoin would be worth 500.000 US$ in three years. The price was 2,244.265 US$/BTC at the time. He later revised his bet and <a href="https://twitter.com/officialmcafee/status/935900326007328768">predicted one Million US$ by the end of 2020</a>.
            <br />
            <br />Is this really possible? Bitcoin needs to grow at a rate of <strong>{ this.getGrowthRate()*100 } % per day</strong>. That is the red line on the above chart. As long as the blue line is above the red line, we are on target and John McAfee will not have to eat his own dick. Hover over the graph to get daily prices.
            <br />
            <br />The growth rate of less than half a percent does not sound like much to you? That´s because we all suck at grasping the concept of exponential growth. This is the magic behind compound interest.
            <br />
            <br />Grab a calculator and try it yourself:
            <br />
            <br />Today, the prediction is { this.getDaysSincePrediction(Date.now()) } days old, so the target-price is
            <br />{1+this.getGrowthRate()}<sup><strong>{this.getDaysSincePrediction(Date.now())}</strong></sup> * 2,244.265 $ = { this.getMcAfeeRate(this.getDaysSincePrediction(Date.now())).toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }
            <br />

            <br />
            <br />By 2018-12-31, the prediction will be {this.getDaysSincePrediction('2018-12-31')} days old
            <br />{1+this.getGrowthRate()}<sup><strong>{this.getDaysSincePrediction('2018-12-31')}</strong></sup> * 2,244.265 $ = { this.getMcAfeeRate(this.getDaysSincePrediction('2018-12-31')).toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }

            <br />
            <br />By 2019-12-31, the prediction will be {this.getDaysSincePrediction('2019-12-31')} days old
            <br />{1+this.getGrowthRate()}<sup><strong>{this.getDaysSincePrediction('2019-12-31')}</strong></sup> * 2,244.265 $ = { this.getMcAfeeRate(this.getDaysSincePrediction('2019-12-31')).toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }

            <br />
            <br />Still does not look like it is on target?
            <br />
            <br />By 2020-06-01, the prediction will be {this.getDaysSincePrediction('2020-06-01')} days old
            <br />{1+this.getGrowthRate()}<sup><strong>{this.getDaysSincePrediction('2020-06-01')}</strong></sup> * 2,244.265 $ = { this.getMcAfeeRate(this.getDaysSincePrediction('2020-06-01')).toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }
            <br />
            <br />By 2020-12-31, the prediction will be {this.getDaysSincePrediction('2020-12-31')} days old and <strong>BAM!</strong>
            <br />{1+this.getGrowthRate()}<sup><strong>{this.getDaysSincePrediction('2020-12-31')}</strong></sup> * 2,244.265 $ = { this.getMcAfeeRate(this.getDaysSincePrediction('2020-12-31')).toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }
            <br />
            <br />

            <br />Of course, this growth has limits, but remember that there will only be 21 Million BTC. If every Millionaire in the world wants one, there are not enough for every one to have a whole BTC.
            <br />
          </p>
        </div>

        <div className='row'>
          <div id="source">Source: <a href="https://github.com/raumi75/mcafeetracker">github</a>.</div>
        </div>
      </div>

    );
  }
}

export default App;
