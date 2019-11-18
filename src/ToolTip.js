import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ToolTip.css';

export default class ToolTip extends Component {

  render() {
    const {hoverLoc, activePoint} = this.props;
    const svgLocation = document.getElementById('linechart').getBoundingClientRect();

    let placementStyles = {};
    let width = 140; // pixels
    placementStyles.width = width + 'px';
    placementStyles.left = hoverLoc + svgLocation.left - (width/2);

    if (typeof(activePoint.y) === 'undefined') {
      return null;
    }

    if (activePoint.y.p>0 && activePoint.y.m>0) {
      return (
        <div
          className={'unselectable hover hover-'+this.getAboveOrBelow()}
          unselectable="yes"
          style={ placementStyles }
        >
          <div className="hover-percent">{(Math.abs(activePoint.y.p/activePoint.y.m-1)).toLocaleString('en-us', { style: 'percent', maximumSignificantDigits: 3})} {this.getAboveOrBelow()}</div>
          <div>{Math.abs(activePoint.daysPredictionAhead)} days {this.getAheadOrBehind()}</div>
        </div>
      );
    } else {
      return (null);
    }

  }

  // is the price above or below the prediction.
  // css className will color the percentage accordingly
  getAboveOrBelow() {
    const {activePoint} = this.props;

    if (activePoint.y.p>=activePoint.y.m)
    { return ('above'); } else { return 'below' ; }
  }

  getAheadOrBehind() {
    if (this.getAboveOrBelow() === "above") { return 'ahead'; } else { return 'behind'; }
  }
}

ToolTip.propTypes = {
  hoverLoc: PropTypes.number.isRequired,
  activePoint: PropTypes.object.isRequired
};
