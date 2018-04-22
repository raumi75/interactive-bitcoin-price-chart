import React, { Component } from 'react';
import { Row , Col, Image } from 'react-bootstrap';
import formatDollar from './formatting.js';

class ExplainMcAfeeTweet extends Component {

  render() {
    const {startPrice} = this.props;
    return (
      <Row>
        <Col xs={12} md={6}>
          <h2>It started with a tweet</h2>
          <p className="lead explanation">
            John McAfee made a bet on July 17th 2017: One single Bitcoin would be worth { formatDollar(500000) } in three years. The closing price according to CoinDesk was { formatDollar(startPrice, 3) } that day. He later revised his bet and <a href="https://twitter.com/officialmcafee/status/935900326007328768">predicted $ 1 million by the end of 2020</a>.
          </p>
        </Col>
        <Col xs={12} md={6}>
          <p><a href="https://twitter.com/officialmcafee/status/935900326007328768"><Image src="tweet20171129.png" responsive /></a></p>
        </Col>
      </Row>
    );
  }
}

export default ExplainMcAfeeTweet;
