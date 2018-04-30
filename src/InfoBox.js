import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';
import formatDollar from './formatting.js';
import './InfoBox.css';

class InfoBox extends Component {

  getAboveOrBelow() {
    if (this.props.actualPriceNow>this.props.predictionPriceNow)
    { return ('above'); } else { return 'below' ; }
  }

  // percentage
  // @return unsigned float
  getPercent() {
    return (Math.abs(this.props.actualPriceNow/this.props.predictionPriceNow-1));
  }

  // formatted percentage
  getStrPercent() {
    return this.getPercent().toLocaleString('en-us', {style: 'percent', maximumSignificantDigits: 4});
  }
  
  render(){
    const {predictionPriceNow, updatedAt, actualPriceNow} = this.props;
    return (
      <Row>
        <Col xs={4} md={2} mdOffset={3} height={"5em"}>
          <div className="subtext">Predicted</div>
          <div className="heading predicted">{formatDollar(predictionPriceNow)}</div>
          <div className="subtext">steady growth</div>
        </Col>

        <Col xs={4} md={2} height={"5em"}>
          <div className="subtext">Actual</div>
          <div className="heading actual">{formatDollar(actualPriceNow)}</div>
          <div className="subtext">{moment(updatedAt).format('YYYY-MM-DD hh:mm A')}</div>
        </Col>

        <Col xs={4} md={2} height={"5em"}>
          <div className="subtext">Bitcoin is</div>
          <div className={"heading "+this.getAboveOrBelow() }>{this.getStrPercent()}</div>
          <div className={"subtext "+this.getAboveOrBelow() }>{this.getAboveOrBelow()}</div>
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
