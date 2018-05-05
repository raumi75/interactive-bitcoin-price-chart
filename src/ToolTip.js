import React, { Component } from 'react';
import './ToolTip.css';

class ToolTip extends Component {

  render() {
    const {hoverLoc, activePoint} = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();

    let placementStyles = {};
    let width = 140; // pixels
    placementStyles.width = width + 'px';
    placementStyles.left = hoverLoc + svgLocation.left - (width/2);

    if (typeof(activePoint.y) === 'undefined') {
      return null;
    }

    if (activePoint.y.p>0 && activePoint.y.m>0) {
      return (
        <div className={'hover hover-'+this.getAboveOrBelow()} style={ placementStyles }>
          <div className="hover-percent">{(Math.abs(activePoint.y.p/activePoint.y.m-1)).toLocaleString('en-us', { style: 'percent', maximumSignificantDigits: 3})} {this.getAboveOrBelow()}</div>
          <div>{Math.abs(this.props.daysPredictionAhead)} days {this.getAheadOrBehind()}</div>
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

export default ToolTip;
