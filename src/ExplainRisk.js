import React, { Component } from 'react';

export default class ExplainRisk extends Component {

render() { return (
  <div>
    <h2>What can go wrong?</h2>
    <p>
      Though bitcoin has proven to be secure and many people put their trust in
      it, there is still a lot that can go wrong. Do not invest more than
      you can afford to lose!
    </p>
    <p>
      Bitcoin could go to zero and <a
      href="https://99bitcoins.com/bitcoinobituaries/">many people think so.</a>
    </p>

    <h2>Not your keys not your coins!</h2>
    <p>
      Many have lost bitcoin when exchanges shut down or got hacked. Exchanges
      are not for storing your coins, wallets are.
    </p>
    <p>
      Chose wallet-software you trust and use it on hardware you
      trust. <strong>Know your secret keys or your seed phrase and keep them
      secret.</strong>
    </p>
    <p>
      There are different levels of secuity and usability. You might want to
      start with a trustworthy wallet on your phone. Once you feel comfortable
      sending, receiving bitcoin and recovering your wallet from your seed
      phrase or backup, you might want to get a hardware wallet
      like <em>ledger</em> or <em>trezor</em>.
    </p>
    <p>
      <a href="https://en.bitcoin.it/wiki/Storing_bitcoins">Storing
      bitcoins</a> in the bitcoin-wiki is a nice article.
    </p>
  </div>
    );
  }
}
