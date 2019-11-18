import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';
import formatDollar from './formatting.js';
import './InfoBox.css';
import Progress from './Progress.js';

export default class InfoBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actualUpdatesIn: 60,  // seconds
    }
  }

  componentDidMount() {
    this.timerCoundown = setInterval(() => this.refreshProgressbar(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerCoundown);
  }

  refreshProgressbar() {
    this.setState({
      actualUpdatesIn: this.props.actualUpdatedAt.diff(moment(), 'seconds', true)+60
     });
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
    const {predictionPriceNow, actualUpdatedAt, actualPriceNow, loadingActualPrice} = this.props;
    const {actualUpdatesIn} = this.state;
    const aboveOrBelow = this.getAboveOrBelow();
    const PriceAgeSeconds = moment().diff(actualUpdatedAt, 'seconds');

    document.title = formatDollar(actualPriceNow) + "/BTC ("
              + this.getStrPercent() + " " + aboveOrBelow + " prediction)";

    return (
      <Row>
        <Col xs={4} md={2} mdOffset={3} className="infobox">
          <div className="subtext">Predicted</div>
          <div className="heading predicted">{formatDollar(predictionPriceNow)}</div>
        </Col>

        <Col xs={4} md={2} className="infobox">
          <div className="subtext"><a href="https://www.coindesk.com/price/" title="Powered by coindesk">Actual</a></div>
          <div className="heading actual"><a href="https://www.coindesk.com/price/" title="Powered by coindesk">{ actualPriceNow!==1 ? formatDollar(actualPriceNow) : <em>loading</em> }</a></div>
          {(!navigator.onLine || (60*60*24*7 > PriceAgeSeconds > 120))
            ?
              <div className="subtext"><small>{moment(actualUpdatedAt).fromNow()}. { (loadingActualPrice) ? 'loading...' : '(now offline)' }</small></div>
            :
            <Progress max={60} value={actualUpdatesIn} type="actual" />
          }

        </Col>

        <Col xs={4} md={2} className="infobox">
          <div className="subtext">Bitcoin is</div>
          <div className={"heading "+aboveOrBelow }>{actualPriceNow !== 1 ? this.getStrPercent() : '...'}</div>
          <div className={"subtext "+aboveOrBelow }>{aboveOrBelow}</div>
        </Col>
      </Row>
    );
  }
}

InfoBox.propTypes = {
  predictionPriceNow: PropTypes.number,
  actualUpdatedAt: PropTypes.instanceOf(moment),
  actualPriceNow: PropTypes.number,
  loadingActualPrice:  PropTypes.bool
};

// DEFAULT PROPS
InfoBox.defaultProps = {
  actualUpdatedAt: null,
  actualPriceNow: 10,

  predictionPriceNow: 10,
};
