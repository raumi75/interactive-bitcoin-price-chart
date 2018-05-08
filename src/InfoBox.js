import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import formatDollar from './formatting.js';
import './InfoBox.css';

class InfoBox extends Component {

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
  getStrPercent() {
    return this.getPercent().toLocaleString('en-us', {style: 'percent', maximumSignificantDigits: 4});
  }

  render(){
    const {predictionPriceNow, actualUpdatesIn, actualPriceNow, predictionUpdatesIn,predictionUpdatesMax} = this.props;
    const aboveOrBelow = this.getAboveOrBelow();

    document.title = formatDollar(actualPriceNow) + "/BTC ("
              + this.getStrPercent() + " " + aboveOrBelow + " prediction)";

    return (
      <Row>
        <Col xs={4} md={2} mdOffset={3} className="infobox">
          <div className="subtext">Predicted</div>
          <div className="heading predicted">{formatDollar(predictionPriceNow)}</div>
          <ProgressBar className="actualupdatesin" bsStyle="danger" now={predictionUpdatesIn} max={predictionUpdatesMax} />
        </Col>

        <Col xs={4} md={2} className="infobox">
          <div className="subtext"><a href="https://www.coindesk.com/price/" title="Powered by coindesk">Actual</a></div>
          <div className="heading actual"><a href="https://www.coindesk.com/price/" title="Powered by coindesk">{formatDollar(actualPriceNow)}</a></div>
          <ProgressBar className="actualupdatesin" now={actualUpdatesIn} max={60} />
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
  actualPriceNow: 10,
  updatedAt: null,
  predictionPriceNow: 10
}

export default InfoBox;
