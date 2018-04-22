import React, { Component } from 'react';
import moment from 'moment';
import { Grid, Row , Col, Tabs, Tab} from 'react-bootstrap';
import './App.css';
import LineChart from './LineChart';
import ToolTip from './ToolTip';
import InfoBox from './InfoBox';
// eslint-disable-next-line
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import {formatDollar} from './formatting.js';
import {getParameterByName} from './getparameter.js';
import {getDataBoundaries} from './chartDataBoundaries.js';
import RadioLinLog from './RadioLinLog.js';
import FormCustomPrediction from './FormCustomPrediction.js';
import ExplainMcAfeeTweet from './ExplainMcAfeeTweet.js';
import ExplainMath from './ExplainMath.js';
import PageHead from './PageHead.js';
import PageFoot from './PageFoot.js';

var predictionCount = 1263;   // days startDate to targetDate (2020-12-31)
var offsetPrediction = -2389; // days startDate to minHistoricalStart
const minSliderDistance = 29;
const minHistoricalStart = '2011-01-01';     // Coindesk API requires historicalStart >= 2010-07-17
const maxTargetDate = '2030-01-01';
const defaultHistoricalStart = '2017-01-01'; // show historical Data starting this day by default
const defaultRangeMin = moment(defaultHistoricalStart).diff(moment(minHistoricalStart), 'days'); // left slider can go

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
      historicalStart: minHistoricalStart, //'2011-01-01',
      historicalEnd: moment().format('YYYY-MM-DD'),
      scale: 'lin',
      growthRate: getParameterByName('percent') || this.props.growthRate,
      customPrediction: (getParameterByName('percent') !== null),
      startPrice: 0,
      startDate:  getParameterByName('startdate')  || this.props.startDate,
      targetDate: getParameterByName('targetdate') || this.props.targetDate
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
    this.refresh = setInterval(() => this.reloadData(), 60*5000);
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
    const {startDate, targetDate, historicalStart, historicalEnd}  = this.state;
    predictionCount = moment(maxTargetDate).diff(moment(startDate),'days');
    offsetPrediction = moment(historicalStart).diff(moment(startDate),'days');
    const url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+historicalStart+'&end='+historicalEnd;
    fetch(url).then( r => r.json())
      .then((bitcoinData) => {

      const sortedData = [];
      let count = 0;

      // load historical prices
      for (let date in bitcoinData.bpi){
        sortedData.push({
          d: moment(date).format('YYYY-MM-DD'),
          x: count, //previous days
          y: {p: bitcoinData.bpi[date], // historical price on date
              m: 0} // predicted price for date
        });
        count++;
      }

      // Labels on range-slider below chart
      predictionCount = predictionCount-offsetPrediction;

      this.setState({
        todayCount: count,
        countRange: [Math.max(-offsetPrediction,0), count-1],
        historicalEnd: moment().format('YYYY-MM-DD'),
        startPrice: parseFloat(getParameterByName('startprice')) || sortedData.find(function(data) { return data.d === startDate} ).y.p
      });

      for (count; count <= predictionCount; count++) {
        sortedData.push({
          d: moment(historicalStart).add(count, 'days').format('YYYY-MM-DD'),
          x: count, //previous days
          y: {p: 0, // historical price on date
              m: 0}
        });
      }

      predictionCount = moment(targetDate).diff(moment(startDate),'days')-offsetPrediction;

      this.setState({
        dataComplete: sortedData,
        data: sortedData,
        fetchingData: false
      });

      this.addMcAfeeRates();
      this.setSliderMarks();
      this.cutData(this.state.countRange);

    })
    .catch((e) => {
      console.log('Error when loading price data from coinbase' + e);
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

  setSliderMarks = () => {
    const {historicalStart, startDate, targetDate} = this.state;
    var mark = {};
    mark[0] = moment(historicalStart).format('YYYY-MM-DD');;
    mark[(moment(startDate).diff(moment(historicalStart),'days'))] = moment(startDate).format('YYYY-MM-DD');;
    mark[(moment(Date.now()).diff(moment(historicalStart),'days')-1)] = 'yesterday';
    mark[(moment(targetDate).diff(moment(historicalStart),'days'))] = moment(targetDate).format('YYYY-MM-DD');
    this.setState ({
      sliderMarks: mark
    });
  }

  cutData(pos) {
    var dataCut = this.state.dataComplete.slice(pos[0],pos[1]+1);

    if (pos[0]>0) {
        dataCut = dataCut.map(function(val) {
        return {
          d: val.d,
          y: val.y,
          x: val.x-pos[0], //previous days
        }
      });
    }

    this.setState({
      data: dataCut
    });

  }

  // expecting 'lin' or 'log'
  handleScaleChange = (value) => {
    this.setState({
      scale: value
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
    this.setRangeDefault();
    this.setState({
      scale: 'lin',
      activeTabKey: 2});
  }

  setRangeDefault = () => {
    var cr = [Math.max(-offsetPrediction,0), this.state.todayCount-1]
    this.setState({
      rangeMin: Math.min(defaultRangeMin, -offsetPrediction),
      countRange: cr,
    });
    this.cutData(cr);
  }

  handleRangeExtend = () => {
    var cr = [0, predictionCount];
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
        customPrediction: true,
        growthRate: e.target.value
      }
      , () => this.addMcAfeeRates()
    );
  }

  // User entered a new start date
  handleStartDateChange = (value) => {
    const {dataComplete, historicalStart} = this.state;
    let inputDate = moment(value).format('YYYY-MM-DD');
    if (moment(inputDate).isAfter(moment(Date.now()).subtract(1, 'week'))) {
      inputDate = moment(Date.now()).subtract(1, 'week').format('YYYY-MM-DD');
    }
    if (moment(inputDate).isBefore(moment(historicalStart))) {
      inputDate = historicalStart;
    }
    let dataStartDate = dataComplete.find(function(data) { return data.d === inputDate} )
    let price = 0;

    if (typeof(dataStartDate)     !== 'undefined' ||
        typeof(dataStartDate.y.p) !== 'undefined' ) {
      price = dataStartDate.y.p;
      offsetPrediction = moment(historicalStart).diff(moment(inputDate),'days');
      this.setState(
        {
          customPrediction: true,
          startDate: inputDate,
          startPrice: price,
        }
        , () => {
            this.setRangeDefault();
            this.setSliderMarks();
            this.addMcAfeeRates();                  }
      );
    }
  }

  handleTargetDateChange = (value) => {
    const {startDate} = this.state;
    let inputDate = moment(value).format('YYYY-MM-DD');
    if (moment(inputDate).isBefore(moment(Date.now()).add(1, 'month'))) {
      inputDate = moment(Date.now()).add(1, 'month').format('YYYY-MM-DD');
    }
    if (moment(inputDate).isAfter(moment(maxTargetDate))) {
      inputDate = maxTargetDate;
    }
    this.setState(
      {
        customPrediction: true,
        targetDate: inputDate
      }, () => {
          predictionCount = moment(inputDate).diff(moment(startDate),'days')-offsetPrediction;

          this.setRangeDefault();
          this.setSliderMarks();
          this.addMcAfeeRates();                  }
    );
  }



  handleStartPriceChange = (e) => {
    let price = parseFloat(e.target.value);
    this.setState(
      {
        customPrediction: true,
        startPrice: price
      }
      , () => {
          this.setRangeDefault();
          this.setSliderMarks();
          this.addMcAfeeRates();                  }
    );
  }

  // USD/BTC according to John McAfee's Tweet (1.000.000 by 2020)
  getMcAfeeRate = (s) => {
    const goalRate = 1+(this.state.growthRate/100);
    const {startPrice} = this.state;   // start rate USD/BTC at day of tweet
    if (s >= 0) {
      return Math.pow(goalRate, s) * startPrice;
    } else {
      return 0;
    }
  }

  // predicted Price on targetDate
  getTargetPrice() {
    const {startDate, targetDate} = this.state;
    return this.getMcAfeeRate(moment(targetDate).diff(moment(startDate),'days'));
  }

  // Add predicted priced to sortedData Array
  addMcAfeeRates = () => {
    var newDataComplete = this.state.dataComplete.map(
      (val) => {
      return {
        d: val.d,
        x: val.x, //previous days
        y: {p: val.y.p,
            m: this.getMcAfeeRate(val.x+offsetPrediction) }
      }
    });
    this.setState ({ dataComplete: newDataComplete },
      () => this.cutData(this.state.countRange)
    );

  }

  getDaysSincePrediction(d) {
    const {startDate} = this.state;
    return moment(d).diff(moment(startDate),'days')
  }

  getUrl() {
    const FQDN = 'https://fnordprefekt.de';
    const {growthRate, startDate, targetDate, startPrice} = this.state;
    return FQDN + '?percent=' + growthRate + '&startdate=' + startDate + '&targetdate=' + targetDate + '&startprice=' + startPrice;
  }

  render() {
    const {growthRate, startPrice, startDate, targetDate } = this.state;

    return (

      <Grid fluid={true} >

        <PageHead
          customPrediction={this.state.customPrediction}
          targetDate={targetDate}
          targetPrice={this.getTargetPrice()}
        />

        { !this.state.fetchingData ?
        <InfoBox data={this.state.data}
                 growthRate={growthRate}
                 startPrice={startPrice}
                 startDate ={startDate + ' 00:00:00'}
                  />
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

        <Row className="popup">
          {this.state.hoverLoc ?
            <ToolTip hoverLoc={this.state.hoverLoc} activePoint={this.state.activePoint}/>
            : null
          }
        </Row>

        { !this.state.fetchingData ?
          <Row className='chart'>

            <LineChart data={this.state.data}
                       scale={this.state.scale}
                       boundaries={getDataBoundaries(this.state.data)}
                       onChartHover={ (a,b) => this.handleChartHover(a,b) }/>

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
              <RadioLinLog
                scale={this.state.scale}
                onChange={ (scale) => this.handleScaleChange(scale) } />
            </Col>
          </Row>
        : null }

        <Row>
          <Col xs={12}>
            <p className="lead redlineExplanation">The red line steadily grows to { formatDollar(this.getTargetPrice()) } per BTC. Move the slider to zoom.</p>
          </Col>
        </Row>

        <FormCustomPrediction
          startDate={this.state.startDate}
          onStartDateChange={this.handleStartDateChange}

          historicalStart={this.state.historicalStart}
          historicalEnd={this.state.historicalEnd}
          maxTargetDate={maxTargetDate}

          startPrice={this.state.startPrice}
          onStartPriceChange={this.handleStartPriceChange}

          growthRate={this.state.growthRate}
          onGrowthRateChange={this.handleGrowthRateChange}

          targetDate={this.state.targetDate}
          onTargetDateChange={this.handleTargetDateChange}

        />

        { !this.state.customPrediction
        ?
          <ExplainMcAfeeTweet startPrice={this.state.startPrice} />
        :
          <Row>
            <Col xs={12}>
              <p className="lead">Share or bookmark this link to your prediction: <br />
              <a href={this.getUrl()}>{this.getUrl()}</a></p>
            </Col>
          </Row>
        }

        { !this.state.fetchingData ?

        <ExplainMath
          growthRate={this.state.growthRate}
          startPrice={this.state.startPrice}
          startDate={this.state.startDate}
          targetDate={this.state.targetDate}
          />

        : null }

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Similar sites</h2>
            <p>The popular site <a href="https://diegorod.github.io/WillMcAfeeEatHisOwnDick/">diegorod.github.io/WillMcAfeeEatHisOwnDick/</a> does a great job showing the current state of the prediction compared to the McAfee prediction. You can also make your <a href="https://diegorod.github.io/Bitcoin-Price-Predictor/">own predictions</a>.</p>
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
            <p>How does something like <em>'1 μBTC is {formatDollar(1.07)}'</em> or <em>'1 Satoshi is {formatDollar(0.01)}'</em> sound to you? A lot less expensive, right?</p>
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

        { !this.state.customPrediction ?

        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>Who is that John McAfee guy?</h2>
            <p>The founder of McAfee Antivirus. Some say he is a genius. Some say he is a lunatic. But that does not matter.</p>
            <p className="lead">This is not about McAfee. It is about comparing the price to a prediction that sounds too good to be true.</p>
          </Col>
        </Row>
        :
        <Row>
          <Col xs={12} md={10} mdOffset={1} lg={8} lgOffset={2}>
            <h2>McAfee prediction</h2>
            <p>The founder of McAfee Antivirus, John McAfee bets his dick that bitcoin will be $1 million on December 31st 2020.
            <a href="https://fnordprefekt.de" className="btn btn-primary">See how the McAfee Prediction plays out.</a></p>
          </Col>
        </Row>
}
        <PageFoot />
      </Grid>
    );
  }
}

// DEFAULT PROPS
App.defaultProps = {
  startDate:  '2017-07-17',         // Date of first McAfee Tweet
  targetDate:  '2020-12-31',        // Day McAfee predicted the price
  growthRate:  0.4840957035           // daily growth rate to goal of 1.000.000 USD/BTC
}

export default App;
