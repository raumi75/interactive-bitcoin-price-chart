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
      const url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+mcAfeeStartDate+'&end=2020-02-07';

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
    const goalRate = 0.88297529; // Growth Rate to goal of 1.000.000 USD/BTC
    const tweetBPI = 2244.265;   // start rate USD/BTC at day of tweet
    return Math.round(Math.pow(10, goalRate * (s/365)) * tweetBPI);
  }

  render() {
    return (

      <div className='container'>
        <div className='row'>
          <h1>McAfee Tracker</h1>
        </div>
        <div className='row'>
          <p>Will Bitcoin be worth 1 Million Dollars on 2020-07-17 or will John McAfee eat his own dick?</p>
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
            John McAfee made a bet on Juli 17th 2017: One single Bitcoin would be worth 500.000 USD in three years. The price was 2,244.265 USD/BTC. He later revised it <a href="https://twitter.com/officialmcafee/status/935900326007328768">and predicted one Million</a>.

            Is this really possible? Bitcoin needs to grow at a rate of <strong>0.88297529 % per day</strong>. That is the red line on the above chart. As long as the blue line is above the red line, we are on target and John McAfee will not have to eat his own dick.

            Hover over the graph to get daily prices.
          </p>
        </div>

        <div className='row'>
          <div id="source">Source: <a href="https://github.com/raumi75/interactive-bitcoin-price-chart">github</a>.</div>
        </div>
      </div>

    );
  }
}

export default App;
