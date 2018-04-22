import React, {Component} from "react";
import { FormGroup, Radio} from 'react-bootstrap';

class RadioLinLog extends Component {

  handleScaleChange = (changeEvent) => {
    this.props.onChange(this.validScaleString(changeEvent.target.value));
  }

  render() {
    const scale = this.validScaleString(this.props.scale);
    return (
      <FormGroup>
        <Radio name="radioGroup" value="lin" checked={scale === 'lin'} onChange={this.handleScaleChange} >
          Linear scale (1, 2, 3)
        </Radio>{' '}
        <Radio name="radioGroup" value="log" checked={scale === 'log'} onChange={this.handleScaleChange} >
          Logarithmic scale (1, 10, 100)
        </Radio>
      </FormGroup>
    );
  }

  validScaleString(scale) {
    if (scale === 'log') {
      return 'log';
    } else if (scale === 'lin') {
      return 'lin';
    } else {
      console.log ('WARNING: invalid scale in RadioLinLog.js.');
      return 'lin';
    }

  }
}

export default RadioLinLog;
