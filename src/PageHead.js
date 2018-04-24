import React, { Component } from 'react';
import moment from 'moment';
import { Row , Col } from 'react-bootstrap';
import {formatDollar} from './formatting.js';
import './PageHead.css';

class PageHead extends Component {

  render() {
    const {customPrediction, targetPrice, targetDate} = this.props;

    return (
    <div>
    <Row className="about">
      <Col xs={12}>
        <small>made by a bitcoin fan - <a href="#pagefoot">Feedback or tips</a>.</small>
      </Col>
    </Row>

    <Row className="header">
      <Col xs={12}>
        <h1 className="header">Bitcoin Price Prediction Tracker</h1>
        { customPrediction ?
          <p>Will bitcoin be {formatDollar(targetPrice)} on {moment(targetDate).format('MMMM Do YYYY')}?</p>
        :
          <p>John McAfee says: By the end of 2020 Bitcoin will be worth $&nbsp;1&nbsp;Million. Is he losing his bet?</p>
        }
      </Col>
    </Row>
    </div>
    );
  }

}

export default PageHead;
