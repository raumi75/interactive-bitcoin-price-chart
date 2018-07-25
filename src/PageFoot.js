import React, { Component } from 'react';
import { Row , Col } from 'react-bootstrap';
import DonateQr from './DonateQr.js';

import './PageFoot.css';

class PageFoot extends Component {

  render() {
    return (
    <Row className="footer" id="pagefoot">
      <Col xs={12}>
        <p>Data-Source: <strong>Powered by <a href="https://www.coindesk.com/price/">CoinDesk</a></strong></p>
        <p>Chart based on Brandon Morelli's <a href="https://codeburst.io/how-i-built-an-interactive-30-day-bitcoin-price-graph-with-react-and-an-api-6fe551c2ab1d">Tutorial</a></p>
        <p>Source: <a href="https://github.com/raumi75/mcafeetracker">raumi75@github</a></p>
        <p><strong>Suggestions, Feedback, Ideas?</strong> Get in touch: <a href="https://reddit.com/u/raumi75/">/u/raumi75</a>, <a href="https://twitter.com/raumi75">@raumi75</a></p>
        <p>
          Spread the word:
          share on <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A//fnordprefekt.de">Facebook</a>,
          or on <a href="https://plus.google.com/share?url=https%3A//fnordprefekt.de">Google Plus</a>
        </p>
        <p>Follow me on <a href="https://twitter.com/raumi75">Twitter (@raumi75)</a> for daily price updates.</p>
        <p>Do you love this site? It's open-source, ad-free, anonymous, cookie-free and tracker-free. Tips are welcome.</p>
        <DonateQr btc_address="3B19wMMJD7Xjf9ajW2oRcfVfKjRprWmGrG" />
      </Col>
    </Row>
    );
  }
}

export default PageFoot;
