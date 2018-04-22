import React, { Component } from 'react';
import { Row , Col, Image } from 'react-bootstrap';
import './PageFoot.css';

class PageFoot extends Component {

  render() {
    const donate_btc_address = "3B19wMMJD7Xjf9ajW2oRcfVfKjRprWmGrG";

    return (
    <Row className="footer">
      <Col xs={12}>
        <p>Source: <a href="https://github.com/raumi75/mcafeetracker">raumi75@github</a></p>
        <p>Get in touch: <a href="https://reddit.com/u/raumi75/">/u/raumi75</a>, <a href="https://twitter.com/raumi75">@raumi75</a></p>
        <p>Spread the word:
          <a href="https://twitter.com/raumi75/status/964468501657391104">retweet</a>,
          share <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A//fnordprefekt.de">on Facebook</a>,
          or on <a href="https://plus.google.com/share?url=https%3A//fnordprefekt.de">Google Plus</a>
        </p>
        <p>Do you like this site? Buy my kids some ice cream!</p>
        <p><a href={"bitcoin:"+donate_btc_address}><Image src="/donate_qr.png" alt="QR-Code Donate Bitcoin" /></a></p>
        <p><a href={"bitcoin:"+donate_btc_address}>{donate_btc_address}</a></p>
      </Col>
    </Row>
    );
  }
}

export default PageFoot;
