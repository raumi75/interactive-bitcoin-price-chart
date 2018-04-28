import React, { Component } from 'react';
import { Image } from 'react-bootstrap';

// Image and text link to QR-Address
// caveat: donate_gr.png needs to be adjusted when address changes
export default class DonateQr extends Component {
  render() {
    return (
      <div>
        <p>
          <a href={"bitcoin:"+this.props.btc_address}>
            <Image src="/donate_qr.png" alt="QR-Code Donate Bitcoin" />
          </a>
        </p>
        <p><a href={"bitcoin:"+this.props.btc_address}>{this.props.btc_address}</a></p>
      </div>
    );
  }
}
