import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Col, Form, FormGroup, FormControl, ControlLabel, Well } from 'react-bootstrap';
import DatePicker from "react-bootstrap-date-picker";
import formatDollar from './formatting.js';
import './katex.css'; // https://github.com/Khan/KaTeX/releases/tag/v0.8.3
import Latex from 'react-latex';
import {dateFormat} from './App.js';

export default class FormPredictionPriceForDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment()
    }
  }

  handleDateChange = (value) => {
    if (typeof(value) !== 'undefined') {
      this.setState({date: moment(value) });
    }
  };

  getDaysSincePrediction() {
    const {startDate} = this.props;
    const {date} = this.state;
    if (this.isDateInRange()) {
      return date.diff(startDate, 'days');
    }
  }

  getPriceForDate() {
    const {startPrice, growthRate} = this.props;
    const daysSincePrediction = this.getDaysSincePrediction();
    if (this.isDateInRange()) {
      return formatDollar(Math.pow(1+growthRate/100, daysSincePrediction)*startPrice);
    } else {
      return 'not on prediction curve';
    }
  }

  latexMathPriceForDate() {
    const {startPrice, growthRate} = this.props;
    return `$` + startPrice + `\\times\\left(1+\\frac{`+ growthRate + `}{100}\\right)^{`+this.getDaysSincePrediction()+`\\ days} $`;
  }

  formDateValidationState() {
    if (!this.isDateInRange()) {
      return 'error';
    }
  }

  isDateInRange() {
    const {startDate, targetDate} = this.props;
    const {date} = this.state;
    return date.isBetween(startDate, targetDate, 'days', '[]');
  }

  render() {
    const {date} = this.state;
    const {startDate, targetDate} = this.props;

    return(
  <Well className="explore-prediction">
    <Form horizontal>
      <FormGroup
        controlId="formDate"
        validationState={this.formDateValidationState()}
      >
        <Col componentClass={ControlLabel} sm={2}>
          Date
        </Col>
        <Col sm={6}>
          <DatePicker id="datepicker"
            value={date.format(dateFormat)}
            onChange={this.handleDateChange}
            onFocus={this.props.pauseEvents}
            onBlur={this.props.resumeEvents}
            minDate={startDate.format(dateFormat)}
            maxDate={targetDate.format(dateFormat)}
            showClearButton={false}
            dateFormat={dateFormat}
          />
        </Col>
      </FormGroup>

      <FormGroup controlId="formPriceForDate"  bsSize="large">
        <Col componentClass={ControlLabel} sm={2}>
          Price
        </Col>
        <Col sm={10}>
          <FormControl.Static>
            <strong>{this.getPriceForDate()}</strong>
          </FormControl.Static>
        </Col>
        <Col className="latex-formula"><Latex>{this.latexMathPriceForDate()}</Latex></Col>
      </FormGroup>

    </Form>
  </Well>
    );
  }
}

FormPredictionPriceForDate.propTypes = {
  startDate: PropTypes.instanceOf(moment),
  targetDate: PropTypes.instanceOf(moment),
  startPrice: PropTypes.number,
  growthRate: PropTypes.number,
  pauseEvents: PropTypes.func.isRequired,
  resumeEvents: PropTypes.func.isRequired
};
