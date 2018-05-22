import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';

// Image and text link to QR-Address
// caveat: donate_gr.png needs to be adjusted when address changes
export default class DonateQr extends Component {
  render() {
    const {btc_address} = this.props;

    return (
      <div>
        <p>
          <a href={"bitcoin:"+btc_address}>
            <Image src="/donate_qr.png" alt="QR-Code Donate Bitcoin" />
          </a>
        </p>
        <p><a href={"bitcoin:"+btc_address}>{btc_address}</a></p>
      </div>
    );
  }
}

DonateQr.propTypes = {
  btc_address: PropTypes.string
}
