import React, { Component } from 'react';
import './ToolTip.css';

class ToolTip extends Component {

  render() {
    const {hoverLoc, activePoint} = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();

    let placementStyles = {};
    let width = 100;
    placementStyles.width = width + 'px';
    placementStyles.left = hoverLoc + svgLocation.left - (width/2);

    if (typeof(activePoint.y) === 'undefined') {
      return null;
    }

    if (activePoint.y.p>0 && activePoint.y.m>0) {
      return (
        <div className={'hover hover-'+this.getAheadOrBehind()} style={ placementStyles }>
          <div className='mcafee'>{(activePoint.y.p/activePoint.y.m-1).toLocaleString('en-us', { style: 'percent', maximumSignificantDigits: 3})}</div>
        </div>
      );
    } else {
      return (null);
    }

  }

  // is the price ahead or behind the prediction.
  // css className will color the percentage accordingly
  getAheadOrBehind() {
    const {activePoint} = this.props;

    if (activePoint.y.p>activePoint.y.m)
    { return ('ahead'); } else { return 'behind' ; }
  }

}

export default ToolTip;
