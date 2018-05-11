import React, { Component } from 'react';
import moment from 'moment';
import { Grid, Row , Col, Tabs, Tab} from 'react-bootstrap';
import './bootstrap.css';
import './App.css';
import LineChart from './LineChart';
import ToolTip from './ToolTip';
import InfoBox from './InfoBox';
// eslint-disable-next-line
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import formatDollar from './formatting.js';
import {getParameterByName} from './getparameter.js';
import RadioLinLog from './RadioLinLog.js';
import FormCustomPrediction from './FormCustomPrediction.js';
import FormPredictionDateForPrice from './FormPredictionDateForPrice.js';
import FormPredictionPriceForDate from './FormPredictionPriceForDate.js';

import ExplainMcAfeeTweet from './ExplainMcAfeeTweet.js';
import ExplainMath from './ExplainMath.js';
import ExplainSupply from './ExplainSupply.js';
import ExplainGrowth from './ExplainGrowth.js';
import ExplainUnit from './ExplainUnit.js';
import ExplainRisk from './ExplainRisk.js';
import ExplainEnergy from './ExplainEnergy.js';
import ExplainMcAfeePerson from './ExplainMcAfeePerson.js';

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
      loadingActualPrice: false,
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
      predictionUpdatesMax: 10,
      predictionUpdatesIn: 10,
      predictionPriceNow: 1,
      actualPriceNow: 1,
      updatedChartAt: moment('2011-01-01 00:00:00'),
      loadedChartAt:  moment('2011-01-01 00:00:00'),
      lastHistoricalDate: moment('2011-01-01 00:00:00'),
      loadedActualAt: moment('2011-01-01 00:00:00'),
      updatedAt:      moment('2011-01-01 00:00:00'),
      startDate:  getParameterByName('startdate')  || this.props.startDate,
      targetDate: getParameterByName('targetdate') || this.props.targetDate,
      pausedAt: null
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
    // update prices if necessary ever second
  }

  componentWillUnmount(){
    clearInterval(this.timerRefreshPrices);
  }

  pauseTimer = () => {
    this.setState({pausedAt: moment() });
  }

  resumeTimer = () => {
    this.setState({pausedAt: null});
  }

  // Should historical prices in the chart be refreshed?
  // if the lastHistoricalDate is day before yesterday
  //  todo maybe: (and chartdata is older than 24 hours and 5 minutes)
  // @return boolean
  isChartDataStale = () => {
    const {lastHistoricalDate} = this.state;
    const expectedReleaseTime = 'T02:00:00+0000';
    const historicalAgeHours = moment().utc().diff(lastHistoricalDate + expectedReleaseTime, 'hours');
    //console.log (lastHistoricalDate + ' historicalAgeHours ' + historicalAgeHours);
    return (historicalAgeHours > 48);
  }

  loadData = () => {
    const {startDate, targetDate, historicalStart, historicalEnd}  = this.state;
    const waitMinutesBeforeReload = 10;

    // no refreshing prices while loading
    clearInterval(this.timerRefreshPrices);

    predictionCount = moment(maxTargetDate).diff(moment(startDate),'days');
    offsetPrediction = moment(historicalStart).diff(moment(startDate),'days');
    const url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+historicalStart+'&end='+historicalEnd;
    if (moment().diff(this.state.loadedChartAt, 'minutes') < waitMinutesBeforeReload ) {
      // we do not load if an attempt has been made in the last 10 minutes
      console.log('not reloading historical prices to prevent abusing coindesk');
      return null;
    } else {
      // register the timestamp of this load
      this.setState({loadedChartAt: moment()});
    }
    fetch(url).then( r => r.json())
      .then((bitcoinData) => {

      let sortedData = [];
      let count = 0;

      this.setState({updatedChartAt: bitcoinData.time.updatedISO});

      // load historical prices
      for (let date in bitcoinData.bpi){
        sortedData.push({
          d: moment(date).format('YYYY-MM-DD'),
          x: count, //previous days
          y: {p: Math.round(bitcoinData.bpi[date]*100)/100, // historical price on date
              m: 0} // predicted price for date
        });
        count++;
      }

      // Labels on range-slider below chart
      predictionCount = predictionCount-offsetPrediction;

      this.setState({
        todayCount: count,
        countRange: [Math.max(-offsetPrediction,0), count],
        lastHistoricalDate: sortedData[count-1].d,
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
      },
        () => {
          this.addMcAfeeRates();
          this.timerRefreshPrices = setInterval(() => this.refreshPrices(), 1000);
          this.setSliderMarks();
        }
      );
    })
    .catch((e) => {
      console.log('Error when loading price data from coindesk. Will try again in 61 seconds.' + e);
      // try again in 61 seconds
      setTimeout( this.loadData(), 61000 );
    });
  }

  refreshPrices = () => {
    const {loadingActualPrice} = this.state;
    const PriceAgeSeconds = moment().utc().diff(this.state.updatedAt, 'seconds');

    // Don't refresh anything if paused because of user input
    if (this.state.pausedAt !== null ) {
      if (moment().diff(this.state.pausedAt, 'second') > 30) {
        // force resume after 30 seconds
        this.setState({pausedAt: null});
      } else {
        return null;
      }
    }

    this.refreshPredictionPriceNow();

    if (loadingActualPrice) {
      this.setState({updatesIn: 0});
    } else {
      this.setState({updatesIn: 90-PriceAgeSeconds});

      // Do not refresh right when the price is 60 seconds old,
      // because it is not ready yet. Refreshing 90 seconds old prices will
      // effectively refresh every 60 seconds.
      if (PriceAgeSeconds > 90) {
        this.refreshActualPriceNow();
      }
    }

    // reload the chart when it is 25 hours old to get the
    // latest closing price
    if (this.isChartDataStale()) {
      // console.log('Chart data was last updated yesterday. reloading it now.');
      console.log('reloading chart after midnight');
      this.loadData();
    }
  }

  // Load current bitcoin price from coindesk
  // and update the state
  refreshActualPriceNow = () => {
    const url = 'https://api.coindesk.com/v1/bpi/currentprice.json';
    const waitSecondsBeforeReload = 30;

    if (moment().diff(this.state.loadedActualAt, 'seconds') < waitSecondsBeforeReload) {
      //console.log("waiting. don't abuse Coindesk");
      return null;
    }

    this.setState({
      loadedActualAt: moment(),
      loadingActualPrice: true,
    }); // don't call me twice

    fetch(url).then(r => r.json())
      .then((bitcoinData) => {
        this.setActualPriceNow(bitcoinData.bpi.USD.rate_float);

        this.setState({
          actualPriceNow: Math.round(bitcoinData.bpi.USD.rate_float*100)/100,
          updatedAt: bitcoinData.time.updatedISO,
          loadingActualPrice: false
        });
      })
      .catch((e) => {
        console.log('error when loading current price ' + e);
        this.setState({
          loadedActualAt: moment(),
          loadingActualPrice: false
        });
      });
  }

  setActualPriceNow = (pNow) => {
    let newDataComplete = this.state.dataComplete;
    newDataComplete[this.state.todayCount].y.p = pNow;

    this.setState ({ dataComplete: newDataComplete },
      () => this.cutData(this.state.countRange)
    );
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
    mark[(moment(Date.now()).diff(moment(historicalStart),'days'))] = 'now';
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
    var cr = [Math.max(-offsetPrediction,0), this.state.todayCount]
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
    var cr = [this.state.todayCount-31, this.state.todayCount];
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
    var cr = [this.state.todayCount-91, this.state.todayCount];
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
    var cr = [this.state.todayCount-366, this.state.todayCount];
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
            this.addMcAfeeRates();
          }
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
  // @return float with 2 decimal digits
  getMcAfeeRate = (s) => {
    const goalRate = 1+(this.state.growthRate/100);
    const {startPrice} = this.state;   // start rate USD/BTC at day of tweet
    if (s >= 0) {
      return Math.round(Math.pow(goalRate, s) * startPrice*100)/100;
    } else {
      return 0;
    }
  }

  // how many days does it take to reach this price?
  getDaysAfterStart(price) {
    const goalRate = 1+(this.state.growthRate/100);
    const {startPrice} = this.state;
    return Math.ceil(Math.log(price/startPrice)/Math.log(goalRate));
  }

  // How many days between given price point and the prediction curve
  getDaysAhead(price, date) {
    const {startDate} = this.state;
    return this.getDaysAfterStart(price) - (date.diff(moment(startDate), 'days'));
  }

  // How many days between given price point and the prediction curve
  getDaysAheadPoint(pricePoint) {
    return this.getDaysAhead(pricePoint.y.p, moment(pricePoint.d));
  }

  // How many days between given price point and the prediction curve
  getDaysAheadNow() {
    const {actualPriceNow} = this.state;
    return this.getDaysAhead(actualPriceNow, moment());
  }

  refreshPredictionPriceNow() {
    const predictionNow = this.getPredictionPriceNow();
    let predictionUpdatesMax = this.state;
    if (this.state.dataComplete[this.state.todayCount].y.m !== predictionNow) {
      let newDataComplete = this.state.dataComplete;
      predictionUpdatesMax = this.secondsPredictionOneCent();
      newDataComplete[this.state.todayCount].y.m = predictionNow;
      this.setState({
        dataComplete: newDataComplete,
        predictionUpdatesMax: predictionUpdatesMax,
        predictionUpdatesIn: predictionUpdatesMax
      },
        () => this.cutData(this.state.countRange)
      );
    } else {
      // count down to next prediction Price change
      this.setState({
        predictionUpdatesIn: this.state.predictionUpdatesIn-1
      });
    }

    this.setState({
      predictionPriceNow: predictionNow
    });
  }

  secondsPredictionOneCent() {
    const updateThreshold = 0.01; // One Cent
    // Time it takes for prediciton to rise 1 Cent
    return Math.ceil(updateThreshold/(this.state.predictionPriceNow*(this.state.growthRate/100)/60/60/24));
  }

  // No Paramter because this is realtime
  // The price will be calculated for this moment.
  getPredictionPriceNow(){
    return this.getMcAfeeRate(this.getDaysFloatSincePrediction());
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

    newDataComplete[this.state.todayCount].y.m = this.getPredictionPriceNow();

    this.setState ({ dataComplete: newDataComplete },
      () => this.cutData(this.state.countRange)
    );

  }

  // count days between given date and prediction
  // @return integer
  getDaysSincePrediction(d) {
    const {startDate} = this.state;
    return moment(d).diff(moment(startDate),'days')
  }

  // Days (with decimals) between prediction and now
  // @return float
  getDaysFloatSincePrediction() {
    const {startDate} = this.state;
    return moment().utc().diff(moment(startDate + ' 00:00 +0000', 'YYYY-MM-DD HH:mm Z'),'days', true) -1;
  }

  getUrl() {
    const FQDN = 'https://fnordprefekt.de';
    const {growthRate, startDate, targetDate, startPrice} = this.state;
    return FQDN + '?percent=' + growthRate + '&startdate=' + startDate + '&targetdate=' + targetDate + '&startprice=' + startPrice;
  }

  render() {
    const {fetchingData, targetDate, startDate, startPrice, growthRate,
      customPrediction,
      predictionPriceNow, actualPriceNow,
      updatesIn, predictionUpdatesIn, predictionUpdatesMax,
      data, scale,
      activeTabKey, hoverLoc, activePoint,
      rangeMin, sliderMarks, countRange,
      historicalStart, historicalEnd
    } = this.state;
    const targetPrice = this.getTargetPrice();
    return (
      <div>
        <Grid fluid={false} >

          <PageHead
            customPrediction={customPrediction}
            targetDate={targetDate}
            targetPrice={targetPrice}
          />

          { !fetchingData ?
            <InfoBox
              predictionPriceNow = {predictionPriceNow }
              actualPriceNow={actualPriceNow}
              daysAhead={this.getDaysAheadNow()}
              actualUpdatesIn={updatesIn}

              predictionUpdatesMax ={predictionUpdatesMax}
              predictionUpdatesIn  ={predictionUpdatesIn}
            />
          :
          <div className="pleasewait text-center">
            <h1>Powered by coindesk</h1>
            <p>Loading data from coindesk ...</p>
          </div>
          }
        </Grid>

        { !fetchingData ?

          <Grid fluid={true}>
            <Row>
              <Col xs={12}>
                <Tabs
                  activeKey={activeTabKey}
                  onSelect={this.handleSelectRangeTab}
                  id="rangeTab"
                >
                  <Tab eventKey={1} title="all (log)"></Tab>
                  <Tab eventKey={2} title="prediction"></Tab>
                  <Tab eventKey={3} title="1m"></Tab>
                  <Tab eventKey={4} title="3m"></Tab>
                  <Tab eventKey={5} title="1y"></Tab>
                </Tabs>
              </Col>
            </Row>

            <Row className="popup">
              {hoverLoc ?
                <ToolTip
                  hoverLoc={hoverLoc}
                  activePoint={activePoint}
                  daysPredictionAhead={this.getDaysAheadPoint(activePoint)}
                />
              : null
              }
            </Row>

            <Row className='chart'>

              <LineChart
                data={data}
                scale={scale}
                daysPredictionAhead={hoverLoc ? this.getDaysAheadPoint(activePoint) : 0}
                onChartHover={ (a,b) => this.handleChartHover(a,b) }
              />

              <Col xs={12} className='range'>
                <Range
                  allowCross={false}
                  min={rangeMin}
                  max={predictionCount}
                  marks={sliderMarks}
                  onChange={this.handleLineChartLength}
                  value={countRange}
                  pushable={minSliderDistance+1} />
                <br />
              </Col>


              <Col xs={9} sm={5} smOffset={1}>
                <RadioLinLog
                  scale={scale}
                  onChange={ (scaleNew) => this.handleScaleChange(scaleNew) } />
              </Col>

              <Col xs={3} md={6} className="text-right acknowledge-coindesk">
                <span className="hidden-xs">price data </span>powered by <a href="https://www.coindesk.com/price/">coindesk</a>
              </Col>

            </Row>

            <Row>
              <Col xs={12}>
                <p className="lead redlineExplanation">The red line steadily grows to { formatDollar(targetPrice) } per BTC. Move the slider to zoom.</p>
              </Col>
            </Row>
          </Grid>
        : null }


        <Grid fluid={false}>

          { !fetchingData ?

            <Row>
              <Col xs={12} lg={8} lgOffset={2}>
                <FormCustomPrediction
                  startDate={startDate}
                  onStartDateChange={this.handleStartDateChange}

                  historicalStart={historicalStart}
                  historicalEnd={historicalEnd}
                  maxTargetDate={maxTargetDate}

                  startPrice={startPrice}
                  onStartPriceChange={this.handleStartPriceChange}

                  growthRate={growthRate}
                  onGrowthRateChange={this.handleGrowthRateChange}

                  targetDate={targetDate}
                  onTargetDateChange={this.handleTargetDateChange}

                  targetPrice={growthRate !== 0 ? targetPrice : ''}

                  pauseEvents={this.pauseTimer}
                  resumeEvents={this.resumeTimer}
                />
              </Col>
            </Row>
          :
            null
          }
          { !customPrediction ?
            <ExplainMcAfeeTweet startPrice={startPrice} />
          :
          <Row>
            <Col xs={12}>
              <p className="lead">Share or bookmark this link to your prediction: <br />
                <a href={this.getUrl()}>{this.getUrl()}</a></p>
            </Col>
          </Row>
          }

          { !fetchingData ?

            <Row>
              <Col xs={12}>
                <h2>Explore the prediction curve</h2>
              </Col>

              <Col xs={12} md={6}>
                <FormPredictionDateForPrice
                  startDate={startDate}
                  startPrice={startPrice}
                  growthRate={growthRate}
                  targetPrice={targetPrice}
                />
              </Col>

              <Col xs={12} md={6}>
                <FormPredictionPriceForDate
                  startDate={startDate}
                  startPrice={startPrice}
                  targetDate={targetDate}
                  growthRate={growthRate}

                  pauseEvents={this.pauseTimer}
                  resumeEvents={this.resumeTimer}
                />
              </Col>

              <Col xs={12} md={10} lg={8}>
                <ExplainMath
                  growthRate={growthRate}
                  startPrice={startPrice}
                  startDate={startDate}
                  targetDate={targetDate}
                  targetPrice={targetPrice}

                />
              </Col>


            </Row>
          : null }

          <Row>
            <Col xs={12} md={10} lg={8}>
              <ExplainSupply />
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={10} lg={8}>
              <ExplainGrowth />
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={10} lg={8}>
              <ExplainUnit />
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={10} lg={8}>
              <ExplainRisk />
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={10} lg={8}>
              <ExplainEnergy />
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={10} lg={8}>
              <ExplainMcAfeePerson customPrediction={customPrediction} />
            </Col>
          </Row>
        </Grid>
        <Grid fluid={true}>
          <PageFoot />
        </Grid>
      </div>
    );
  }
}

// DEFAULT PROPS
App.defaultProps = {
  startDate:  '2017-07-17',         // Date of first McAfee Tweet
  targetDate:  '2020-12-31',        // Day McAfee predicted the price
  growthRate:  0.484095526          // daily growth rate to goal of 1.000.000 USD/BTC
}

export default App;
