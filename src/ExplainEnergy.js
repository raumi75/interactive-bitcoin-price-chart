import React, { Component } from 'react';

export default class ExplainEnergy extends Component {

render() { return (
  <div>
    <h2>Is bitcoin wasting electricity?</h2>
    
    <p>
      Mining bitcoin is hard <strong>on purpose</strong>.
      The so called <strong>proof of work</strong> is what controls the money supply
      and what makes the ledger tamper resistant.
    </p>

    <p>
      Bitcoin is both a currency and a ledger for storing all transactions.
      Gold would not have much value if it were easy to find or if it were cheap to create.
      A ledger that was easy to tamper with would not be trustworthy.
    </p>

    <p>
      The bitcoin ledger is called blockchain and the entries are bundled into so
      called blocks. Supercomputers all over the world are competing to find the next block.
    </p>

    <p>
      All these miners do not trust each other and reject invalid blocks.
      Someone trying to tamper with the blockchain would
      need an incredible amount of computing power and electricity to overpower
      all the others.
    </p>

    <p>
      What about CO<sub>2</sub>-emissions? Many miners are located in places with a
      surplus of electricity (geothermal power in Iceland, hydroelectric or solar power
      in the middle of nowhere). It is cheaper to send a bitcoin-block over the internet
      than building more power lines.
    </p>

    <p>
      Still not convinced? Think for a minute how complicated the current
      fiat banking system is and you will agree that bitcoin is a lot more efficient.
    </p>
  </div>
    );
  }
}
