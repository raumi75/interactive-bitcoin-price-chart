import React, { Component } from 'react';
import moment from 'moment';
import { Grid, Row , Col, Image, FormGroup, InputGroup, FormControl, Radio, Panel, Tabs, Tab } from 'react-bootstrap';
import './App.css';
import LineChart from './LineChart';
import ToolTip from './ToolTip';
import InfoBox from './InfoBox';
// eslint-disable-next-line
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import {formatDollar} from './formatting.js';
import {getDataBoundaries} from './chartDataBoundaries.js';

const predictionDays = 1263;
const donate_btc_address = "3B19wMMJD7Xjf9ajW2oRcfVfKjRprWmGrG";
var predictionCount = 1263;
var offsetPrediction = 0;
const minSliderDistance = 29;
const minHistoricalStart = '2011-01-01';  // Coindesk API requires historicalStart >= 2010-07-17
const defaultRangeMin = moment('2017-01-01').diff(moment(minHistoricalStart), 'days'); // left slider can go

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
      activeTabKey: 2,
      rangeMin: defaultRangeMin,
      todayCount: 0,
      sliderMarks: {},
      historicalStart: minHistoricalStart, //'2017-01-01',
      historicalEnd: moment().format('YYYY-MM-DD'),
      scale: 'lin',
      growthRate: this.props.growthRate
    }
  }

  handleChartHover(hoverLoc, activePoint){
    this.setState({
      hoverLoc: hoverLoc,
      activePoint: activePoint
    })
  }

  componentDidMount(){
    this.loadData();
    this.refresh = setInterval(() => this.reloadData(), 60*60*5000);
  }

  // If the chart was last updated yesterday, reload it.
  reloadData = () => {
    if (this.chartDataAge() > 25) { // hours
      // console.log('Chart data was last updated yesterday. reloading it now.');
      this.loadData();
    }
  }

  chartDataAge = () => {
    const {historicalEnd}    = this.state;
    return moment().utc().diff(moment(historicalEnd + ' 00:00 +0000', 'YYYY-MM-DD HH:mm Z'), 'hours', true);
  }

  loadData = () => {
    const {tweetDate} = this.props;
    const {targetDate} = this.props;
    const {historicalStart}  = this.state;
    const {historicalEnd}    = this.state;
    offsetPrediction = moment(historicalStart).diff(moment(tweetDate),'days');
    const url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+historicalStart+'&end='+historicalEnd;
    fetch(url).then( r => r.json())
      .then((bitcoinData) => {

      const sortedData = [];
      let count = 0;

      for (let date in bitcoinData.bpi){
        sortedData.push({
          d: moment(date).format('YYYY-MM-DD'),
          x: count, //previous days
          s: (count + offsetPrediction), // Days since McAfee Tweet
          y: {p: bitcoinData.bpi[date], // historical price on date
              m: this.getMcAfeeRate(count + offsetPrediction) } // predicted price for date
        });
        count++;
      }

      // Labels on range-slider below chart
      predictionCount = predictionDays-offsetPrediction;
      var mark = {};
      mark[0] = moment(historicalStart).format('YYYY-MM-DD');;
      mark[0-offsetPrediction] = moment(tweetDate).format('YYYY-MM-DD');;
      mark[count-1] = 'yesterday';
      mark[predictionCount] = moment(targetDate).format('YYYY-MM-DD');

      this.setState({
        todayCount: count,
        countRange: [Math.max(-offsetPrediction,0), count-1],
        sliderMarks: mark,
        historicalEnd: moment().format('YYYY-MM-DD')
      });

      for (count; count <= predictionCount; count++) {
        sortedData.push({
          d: moment(historicalStart).add(count, 'days').format('YYYY-MM-DD'),
          x: count, //previous days
          s: (count + offsetPrediction), // Days since McAfee Tweet
          y: {p: 0, // historical price on date
              m: this.getMcAfeeRate(count + offsetPrediction)}
        });
      }

      this.setState({
        dataComplete: sortedData,
        data: sortedData,
        fetchingData: false
      });

      this.cutData(this.state.countRange);

    })
    .catch((e) => {
      console.log(e);
    });
  }

  handleLineChartLength = (pos) => {

    if (pos[0] < 0) { pos[0] = 0; }
    if (pos[1] < 1) { pos[1] = this.state.todayCount; }
    if (pos[0] >= (pos[1]-minSliderDistance)) {
      pos[0] = offsetPrediction;
      pos[1] = this.state.todayCount;
    }

    this.setState({
      countRange: [pos[0], pos[1]],
    }, this.cutData([pos[0], pos[1]]));
  };

  cutData(pos) {
    var dataCut = this.state.dataComplete.slice(pos[0],pos[1]+1);

    if (pos[0]>0) {
        dataCut = dataCut.map(function(val) {
        return {
          d: val.d,
          y: val.y,
          x: val.x-pos[0], //previous days
          s: val.s, // Days since McAfee Tweet
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

  handleSelectRangeTab = (key) => {
    switch (key) {
      case 1:
        this.handleRangeExtend();
        break;
      case 2:
        this.handleRangeReset();
        break;
      case 3:
        this.handleRange1m();
        break;
      case 4:
        this.handleRange3m();
        break;
      case 5:
        this.handleRange1y();
        break;
      default:

    }
  }

  handleRangeReset = () => {
    var cr = [Math.max(-offsetPrediction,0), this.state.todayCount-1]
    this.setState({
      rangeMin: defaultRangeMin,
      countRange: cr,
      scale: 'lin',
      activeTabKey: 2
    });
    this.cutData(cr);
  }

  handleRangeExtend = () => {
    var cr = [0, this.state.todayCount-1];
    this.setState( {
      rangeMin: 0,
      countRange: cr,
      scale: 'log',
      activeTabKey: 1
      }
    );
    this.cutData(cr);
  }

  handleRange1m = () => {
    var cr = [this.state.todayCount-32, this.state.todayCount-1];
    this.setState( {
      rangeMin: defaultRangeMin,
      countRange: cr,
      scale: 'lin',
      activeTabKey: 3
      }
    );
    this.cutData(cr);
  }

  handleRange3m = () => {
    var cr = [this.state.todayCount-92, this.state.todayCount-1];
    this.setState( {
      rangeMin: defaultRangeMin,
      countRange: cr,
      scale: 'lin',
      activeTabKey: 4
      }
    );
    this.cutData(cr);
  }

  handleRange1y = () => {
    var cr = [this.state.todayCount-367, this.state.todayCount-1];
    this.setState( {
      rangeMin: defaultRangeMin,
      countRange: cr,
      scale: 'lin',
      activeTabKey: 5
      }
    );
    this.cutData(cr);
  }

  handleGrowthRateChange = (e) => {
    this.setState(
      {
        growthRate: e.target.value
      }
      , () => this.addMcAfeeRates()
    );
  }

  // USD/BTC according to John McAfee's Tweet (1.000.000 by 2020)
  getMcAfeeRate = (s) => {
    const goalRate = 1+(this.state.growthRate/100);
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet
    if (s >= 0) {
      return Math.pow(goalRate, s) * tweetPrice;
    } else {
      return 0;
    }
  }

  // Add predicted priced to sortedData Array
  addMcAfeeRates = () => {
    var newDataComplete = this.state.dataComplete.map(
      (val) => {
      return {
        d: val.d,
        x: val.x, //previous days
        s: val.s, // Days since McAfee Tweet
        y: {p: val.y.p,
            m: this.getMcAfeeRate(val.s) }
      }
    });
    this.setState ({ dataComplete: newDataComplete },
      () => this.cutData(this.state.countRange)
    );

  }

  getDaysSincePrediction(d) {
    const {tweetDate} = this.props;
    return moment(d).diff(moment(tweetDate),'days')
  }

  // Text that explains how to calculate the price on given day
  explainPriceOn(d) {
    const growthRate = this.state.growthRate/100;
    const {tweetPrice} = this.props;   // start rate USD/BTC at day of tweet

    return (
      <Panel className="panelFormula">
        <Panel.Heading>By the end of {moment(d).format('YYYY-MM-DD')}, the prediction is {this.getDaysSincePrediction(d)} days old</Panel.Heading>
        <Panel.Body>{1+growthRate}<sup><strong>{this.getDaysSincePrediction(d)}</strong></sup> * { formatDollar(tweetPrice, 3) } = { formatDollar(this.getMcAfeeRate(this.getDaysSincePrediction(d)),2) }</Panel.Body>
      </Panel>
    );

  }

  render() {
    const growthRate = this.state.growthRate/100;
    const {tweetPrice} = this.props;

    return (

      <Grid fluid={true} >

        <Row className="header">
          <Col xs={12}>
            <h1>Bitcoin Price Prediction Tracker</h1>
            <p>John McAfee says: By the end of 2020 Bitcoin will be worth $&nbsp;1&nbsp;Million. Is he losing his bet?</p>
          </Col>
        </Row>

        { !this.state.fetchingData ?
        <InfoBox data={this.state.data} growthRate={this.state.growthRate} />
        : 'Loading data from Coindesk ... ' }

        <Row>
          <Col xs={12}>
            <Tabs activeKey={this.state.activeTabKey}
                  onSelect={this.handleSelectRangeTab}
                  id="rangeTab" >
              <Tab eventKey={1} title="all (log)"></Tab>
              <Tab eventKey={2} title="prediction"></Tab>
              <Tab eventKey={3} title="1m"></Tab>
              <Tab eventKey={4} title="3m"></Tab>
              <Tab eventKey={5} title="1y"></Tab>
            </Tabs>
          </Col>
        </Row>

        <Row>
          <div className='popup'>
            {this.state.hoverLoc ? <ToolTip hoverLoc={this.state.hoverLoc} activePoint={this.state.activePoint}/> : null}
          </div>
        </Row>

        <Row>
            { !this.state.fetchingData ?
              <div className='chart'>

              <LineChart data={this.state.data} scale={this.state.scale} boundaries={getDataBoundaries(this.state.data)} onChartHover={ (a,b) => this.handleChartHover(a,b) }/>

              <Col xs={12} className='range'>
                <Range
                  allowCross={false}
                  min={this.state.rangeMin}
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

              </div>

              : null }
        </Row>

        <Row>
          <Col xs={12} lg={6}>
            <p className="lead redlineExplanation">The red line steadily grows to { formatDollar(1000000) } per BTC. Move the slider to zoom.</p>
          </Col>
          <Col xs={12} lg={6}>
            <p id="coindesk" className="text-right">Data kindly provided by <a href="http://www.coindesk.com/price/">CoinDesk</a></p>
            <p id="acknowledgement"  className="text-right">Chart based on Brandon Morellis <a href="https://codeburst.io/how-i-built-an-interactive-30-day-bitcoin-price-graph-with-react-and-an-api-6fe551c2ab1d">Tutorial</a></p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={2}>
          <label>Tinker with parameter</label>
          </Col>
          <Col xs={12} md={8}>
            <FormGroup>
              <InputGroup>
              <InputGroup.Addon>growth rate</InputGroup.Addon>
              <FormControl type="number"
                           value={this.state.growthRate}
                           onChange={this.handleGrowthRateChange}
                            />
              <InputGroup.Addon>% per day</InputGroup.Addon>
              </InputGroup>
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={6}>
            <h2>It started with a tweet</h2>
            <p className="lead explanation">
              John McAfee made a bet on July 17th 2017: One single Bitcoin would be worth { formatDollar(500000) } in three years. The closing price according to CoinDesk was { formatDollar(tweetPrice, 3) } that day. He later revised his bet and <a href="https://twitter.com/officialmcafee/status/935900326007328768">predicted $ 1 million by the end of 2020</a>.
            </p>
          </Col>
          <Col xs={12} md={6}>
            <p><a href="https://twitter.com/officialmcafee/status/935900326007328768"><Image src="tweet20171129.png" responsive /></a></p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2 id="explainmath">The math behind it</h2>

            <p>Is this really possible? Bitcoin needs to grow at a rate of <strong>{ growthRate*100 } % per day</strong>. That is the red line on the above chart. As long as the blue line is above the red line, we are on target. Hover over the chart to get daily prices.</p>
            <p>Compared to the enormous price changes, half a percent does not sound like much to you? This is the magic of exponential growth.</p>

            <p>Grab a calculator and try it yourself:</p>

            <p>Today,</p>
            {this.explainPriceOn(Date.now())}
            {this.explainPriceOn('2018-12-31')}
            {this.explainPriceOn('2019-12-31')}
            <p>Still does not look like it is on target?</p>
            {this.explainPriceOn('2020-06-01')}
            <p>And finally,</p>
            {this.explainPriceOn('2020-12-31')}

          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Similar sites</h2>
            <p>You probably know the popular site <a href="https://diegorod.github.io/WillMcAfeeEatHisOwnDick/">diegorod.github.io/WillMcAfeeEatHisOwnDick/</a>.</p>
            <p>I was asked why my prediction is different.
            The reason is, that DiegoRod counts to $ 1 million by <em>July 17th 2020</em>, but McAfee wrote 'by the end of 2020'.</p>
            <p>If you change the <em>end date to 2020-12-31</em>
            by calling <a href="https://diegorod.github.io/Bitcoin-Price-Predictor/?startDate=2017-07-17&endDate=2020-12-31&bpiPrediction=1000000">diegorod.github.io/Bitcoin-Price-Predictor/?startDate=2017-07-17&endDate=2020-12-31&bpiPrediction=1000000</a>,
            his red predicted price should match the one for today by midnight: { formatDollar(this.getMcAfeeRate(this.getDaysSincePrediction(Date.now())),2) } (see explanation above).</p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Why would it grow?</h2>
            <p>Bitcoin is scarce. There will only be 21 Million BTC. If every Millionaire in the world wants one, there are not enough for every one to have a whole BTC.</p>
            <p>More people adopting and buying bitcoin will raise the price.</p>
            <p>This technology is still at a relatively early stage. Think the internet in the mid-nineties when the majority thought it was only for nerds and had no real use.</p>
            <p>The market capitalization of bitcoin is still tiny, <a href="http://money.visualcapitalist.com/worlds-money-markets-one-visualization-2017/">compared to</a> gold, credit cards or the stock market.</p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>That parabolic curve - seriously?</h2>
            <p>When you zoom out, the curve gets steeper and steeper.
            Relax! Growth curves look like that. Take the Dow Jones, a savings account
            with interest or bacteria growing in a petri dish.</p>
            <p>With a fixed percentage per time, rising from 1 to 10 takes as long as
            from 100,000 to 1,000,000. Both is the growth by a factor of 10.</p>
            <p>That is why many analysts like to look at charts with a <strong>logarithmic
            scale</strong> where the y-axis scales in orders of magnitude.</p>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Such an expensive currency!</h2>
            <p>You can buy and spend fractions of a bitcoin.</p>
            <p>Sooner or later, it will make sense to use a <a href="https://en.bitcoin.it/wiki/Units">unit</a> like microbitcoin aka bits (One Millionth of a Bitcoin) and Satoshis (One hundredth of a bit). Then a bit will be a Dollar and a Satoshi will be a Cent.</p>
            <p>How does something like <quote>'1 μBTC is {formatDollar(1.07)}'</quote> or <quote>'1 Satoshi is {formatDollar(0.01)}'</quote> sound to you? A lot less expensive, right?</p>
            <p>Maybe people will start calling a microbitcoin just bitcoin. No big deal. When we say calorie, we actually mean a kilocalorie.</p>
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

        <Row className="footer">
          <Col xs={12}>
            <p>Source: <a href="https://github.com/raumi75/mcafeetracker">raumi75@github</a></p>
            <p>Get in touch: <a href="https://reddit.com/u/raumi75/">/u/raumi75</a>, <a href="https://twitter.com/raumi75">@raumi75</a></p>
            <p>Spread the word:
              <a href="https://twitter.com/raumi75/status/964468501657391104">retweet</a>,
              share <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A//fnordprefekt.de">on Facebook</a>,
              or on <a href="https://plus.google.com/share?url=https%3A//fnordprefekt.de">Google Plus</a>
            </p>
            <p>Do you like this site? Buy my kids some ice cream!</p>
            <p><a href={"bitcoin:"+donate_btc_address}><Image src="/donate_qr.png" alt="QR-Code Donate Bitcoin" /></a></p>
            <p><a href={"bitcoin:"+donate_btc_address}>{donate_btc_address}</a></p>
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
  growthRate:  0.484095703431026  // daily growth rate to goal of 1.000.000 USD/BTC
}

export default App;
