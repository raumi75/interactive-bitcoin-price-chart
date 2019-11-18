import React, {Component} from "react";
import PropTypes from 'prop-types';
import { FormGroup, Radio} from 'react-bootstrap';

export default class RadioLinLog extends Component {

  handleScaleChange = (e) => {
    this.props.onChange(e.target.value === 'lin' ? 'lin' : 'log');
  };

  render() {
    const {scale} = this.props;
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
}
RadioLinLog.propTypes = {
  scale: PropTypes.oneOf(['lin', 'log']),
  onChange: PropTypes.func.isRequired
};
