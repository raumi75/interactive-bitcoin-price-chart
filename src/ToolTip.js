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

    return (
      <div className='hover' style={ placementStyles }>
        <div className='date'>{ activePoint.d }</div>
        <div className='price'>{activePoint.p.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }</div>
        <div className='mcafee'>{ activePoint.m.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' }) }</div>
        <div className='mcafee'>{(activePoint.p/activePoint.m-1).toLocaleString('en-us', { style: 'percent', maximumSignificantDigits: 3})}</div>
      </div>
    )
  }
}

export default ToolTip;
