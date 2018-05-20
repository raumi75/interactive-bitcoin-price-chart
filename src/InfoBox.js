import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';
import formatDollar from './formatting.js';
import './InfoBox.css';
import Progress from './Progress.js';

import {timerMilliseconds} from './App.js';

class InfoBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      predictionUpdatesIn: this.props.predictionUpdatesMax,  // seconds
      predictionLastPrice: this.props.predictionPriceNow,
      actualUpdatesIn: 60,  // seconds
      actualLastPrice: this.props.actualPriceNow
    }
  }

  componentDidMount() {
    this.timerCoundown = setInterval(() => this.refreshProgressbar(), timerMilliseconds);
  }

  componentWillUnmount() {
    clearInterval(this.timerCoundown);
  }

  refreshProgressbar() {
    this.refreshPredictionProgressbar();
    this.refreshActualProgressbar();
  }

  refreshPredictionProgressbar = () => {
    if (this.state.predictionLastPrice !== this.props.predictionPriceNow) {
      this.setState({
        predictionUpdatesIn: this.props.predictionUpdatesMax,
        predictionLastPrice: this.props.predictionPriceNow
       });
    } else {
      this.setState({
        predictionUpdatesIn: this.state.predictionUpdatesIn - timerMilliseconds/1000
       });
    }
  }

  refreshActualProgressbar = () => {
    if (this.state.actualLastPrice !== this.props.actualPriceNow) {
      this.setState({
        actualUpdatesIn: 60,
        actualLastPrice: this.props.actualPriceNow
       });
    } else {
      this.setState({
        actualUpdatesIn: this.state.actualUpdatesIn - timerMilliseconds/1000
       });
    }
  }

  // @return string
  getAboveOrBelow() {
    if (this.props.actualPriceNow>=this.props.predictionPriceNow)
    { return ('above'); } else { return 'below' ; }
  }

  // percentage
  // @return unsigned float
  getPercent() {
    return (Math.round(Math.abs(this.props.actualPriceNow/this.props.predictionPriceNow-1)*100000)/100000);
  }

  // formatted percentage
  // @return string
  getStrPercent() {
    return this.getPercent().toLocaleString('en-us', {style: 'percent', maximumSignificantDigits: 4});
  }

  render(){
    const {predictionPriceNow, actualUpdatedAt, actualPriceNow,predictionUpdatesMax, loadingActualPrice} = this.props;
    const {predictionUpdatesIn, actualUpdatesIn} = this.state;
    const aboveOrBelow = this.getAboveOrBelow();
    const PriceAgeSeconds = moment().diff(actualUpdatedAt, 'seconds');

    document.title = formatDollar(actualPriceNow) + "/BTC ("
              + this.getStrPercent() + " " + aboveOrBelow + " prediction)";

    return (
      <Row>
        <Col xs={4} md={2} mdOffset={3} className="infobox">
          <div className="subtext">Predicted</div>
          <div className="heading predicted">{formatDollar(predictionPriceNow)}</div>
          <Progress max={predictionUpdatesMax} value={predictionUpdatesIn} type="prediction" />
        </Col>

        <Col xs={4} md={2} className="infobox">
          <div className="subtext"><a href="https://www.coindesk.com/price/" title="Powered by coindesk">Actual</a></div>
          <div className="heading actual"><a href="https://www.coindesk.com/price/" title="Powered by coindesk">{formatDollar(actualPriceNow)}</a></div>
          {(!navigator.onLine || (60*60*24*7 > PriceAgeSeconds > 120))
            ?
              <div className="subtext"><small>{moment(actualUpdatedAt).fromNow()}. { (loadingActualPrice) ? 'loading...' : '(now offline)' }</small></div>
            :
            <Progress max="60" value={actualUpdatesIn} type="actual" />
          }

        </Col>

        <Col xs={4} md={2} className="infobox">
          <div className="subtext">Bitcoin is</div>
          <div className={"heading "+aboveOrBelow }>{this.getStrPercent()}</div>
          <div className={"subtext "+aboveOrBelow }>{aboveOrBelow}</div>
        </Col>
      </Row>
    );
  }
}

// DEFAULT PROPS
InfoBox.defaultProps = {
  actualUpdatedAt: null,
  actualPriceNow: 10,
  predictionPriceNow: 10,
  predictionUpdatesMax: 20
}

export default InfoBox;
