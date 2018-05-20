import React, { Component } from 'react';
import './Progress.css';

export default class Progress extends Component {
  render() {
    const divStyle = {
      width: Math.ceil(this.props.value/this.props.max*100) + '%'
    };

    return (
      <div className="progress_container">
        <div style={divStyle} className={"progress_bar progress_"+this.props.type}></div>
      </div>
    );
  }
}
