import React, { Component } from 'react';

export default class ExplainMcAfeePerson extends Component {
  render() {
    if (!this.props.customPrediction)  {
      return(
        <div>
          <h2>Who is that John McAfee guy?</h2>
          <p>
            The founder of McAfee Antivirus. Some say he is a genius. Some say
            he is a lunatic. But that does not matter.
          </p>
          <p className="lead">
            This is not about McAfee. It is about comparing the price to a
            prediction that sounds too good to be true.
          </p>
        </div>
      );
    } else {
      return(
        <div>
          <h2>McAfee prediction</h2>
          <p>
            The founder of McAfee Antivirus, John McAfee bets his dick that
            bitcoin will be $1 million on December 31st 2020. <a
            href="https://fnordprefekt.de" className="btn btn-primary">See
            how the McAfee Prediction plays out.</a>
          </p>
        </div>
      );
    }
  }
}
