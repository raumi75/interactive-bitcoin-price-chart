import React, { Component } from 'react';

export default class ExplainGrowth extends Component {

render() {
  return (
    <div>
      <h2>That parabolic curve - seriously?</h2>
      <p>
        When you zoom out, the curve gets steeper and steeper.
        Relax! Growth curves look like that. Take the Dow Jones, a savings account
        with interest or bacteria growing in a petri dish.
      </p>
      <p>
        With a fixed percentage per time, rising from 1 to 10 takes as long as
        from 100,000 to 1,000,000. Both is the growth by a factor of 10.
      </p>
      <p>
        That is why many analysts like to look at charts with a <strong>logarithmic
        scale</strong> where the y-axis scales in orders of magnitude.
      </p>
    </div>
    );
  }
}
