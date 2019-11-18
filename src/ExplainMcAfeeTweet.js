import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row , Col, Image } from 'react-bootstrap';
import formatDollar from './formatting.js';

export default class ExplainMcAfeeTweet extends Component {

  render() {
    const {startPrice} = this.props;
    return (
      <Row>
        <Col xs={12}>
          <h2>It started with a tweet</h2>
        </Col>
        <Col xs={12} md={6}>
          <p className="lead explanation">
            John McAfee made a bet on July 17th 2017: One single Bitcoin would be worth { formatDollar(500000) } in three years.
            The closing price according to CoinDesk was { formatDollar(startPrice) } that day.
            <strong> Look what is at stake:</strong>
            <a href="https://twitter.com/officialmcafee/status/887024683379544065"><Image src="tweet20170717.png" responsive /></a>
          </p>
        </Col>
        <Col xs={12} md={6}>
          <p className="lead">
            He later <strong>revised</strong> his bet
            and <a href="https://twitter.com/officialmcafee/status/935900326007328768">predicted
            $ 1 million by the end of 2020</a>.
          </p>
          <p><a href="https://twitter.com/officialmcafee/status/935900326007328768"><Image src="tweet20171129.png" responsive /></a></p>
        </Col>
      </Row>
    );
  }
}

ExplainMcAfeeTweet.propTypes = {
  startPrice: PropTypes.number.isRequired
};
