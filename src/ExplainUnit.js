import React, { Component } from 'react';
import {formatDollar} from './formatting.js';

export default class ExplainUnit extends Component {

render() { return (
  <div>
    <h2>Such an expensive currency!</h2>
    <p>You can buy and spend fractions of a bitcoin.</p>
    <p>Sooner or later, it will make sense to use a <a href="https://en.bitcoin.it/wiki/Units">unit</a> like microbitcoin aka bits (One Millionth of a Bitcoin) and Satoshis (One hundredth of a bit). Then a bit will be a Dollar and a Satoshi will be a Cent.</p>
    <p>How does something like <em>'1 μBTC is {formatDollar(1.07)}'</em> or <em>'1 Satoshi is {formatDollar(0.01)}'</em> sound to you? A lot less expensive, right?</p>
    <p>Maybe people will start calling a microbitcoin just bitcoin. No big deal. When we say calorie, we actually mean a kilocalorie.</p>
  </div>
    );
  }
}
