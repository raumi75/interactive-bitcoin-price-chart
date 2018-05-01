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
    return (
      <Row>
        <Col xs={4} md={2} mdOffset={3} height={"5em"}>
          <div className="subtext">Predicted</div>
          <div className="heading predicted">{formatDollar(predictionPriceNow)}</div>
          <ProgressBar className="actualupdatesin" bsStyle="danger" now={predictionUpdatesIn} max={predictionUpdatesMax} />
        </Col>

        <Col xs={4} md={2} height={"5em"}>
          <div className="subtext">Actual</div>
          <div className="heading actual">{formatDollar(actualPriceNow)}</div>
          <ProgressBar className="actualupdatesin" now={actualUpdatesIn} max={60} />

        </Col>

        <Col xs={4} md={2} height={"5em"}>
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
