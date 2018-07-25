import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Row , Col } from 'react-bootstrap';
import {formatDollar} from './formatting.js';
import './PageHead.css';

export default class PageHead extends Component {

  predictionTitle() {
    const {customPrediction, targetPrice, targetDate} = this.props;

    if (customPrediction) {
      return (
        <p>
          Will bitcoin be {formatDollar(targetPrice)} on {targetDate.format('MMMM Do YYYY')}?
        </p>
      )
    } else {
      return (
        <p>
          John McAfee says:
          1 BTC will be worth $&nbsp;1&nbsp;million by the end of 2020.
          Is he losing his bet?
        </p>
      );
    }
  }

  render() {
    return (
      <div>
        <Row className="about">
          <Col xs={12}>
            <small>made by a bitcoin fan - <a href="#pagefoot">donations keep it <strong>ad free</strong></a>.</small>
          </Col>
        </Row>

        <Row className="header">
          <Col xs={12}>
            <h1 className="header">Bitcoin Price Prediction Tracker</h1>
            {this.predictionTitle()}
          </Col>
        </Row>
      </div>
    );
  }
}

PageHead.propTypes = {
  customPrediction: PropTypes.bool,
  targetPrice: PropTypes.number,
  targetDate: PropTypes.instanceOf(moment)
}
