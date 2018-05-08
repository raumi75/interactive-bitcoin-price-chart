import React, { Component } from 'react';
import moment from 'moment';
import { Col, Form, FormGroup, FormControl, ControlLabel, Well } from 'react-bootstrap';
import DatePicker from "react-bootstrap-date-picker";
import formatDollar from './formatting.js';

//import './katex.css'; // https://github.com/Khan/KaTeX/releases/tag/v0.8.3
//import Latex from 'react-latex';

export default class FormPredictionPriceForDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment().format('YYYY-MM-DD')
    }
  }

  handleDateChange = (value) => {
    if (typeof(value) !== 'undefined') {
      this.setState({date: moment(value).format('YYYY-MM-DD') });
    }
  }

  getPriceForDate() {
    const {startDate, startPrice, growthRate} = this.props;
    const {date} = this.state;

    if (this.isDateInRange()) {
      return formatDollar(Math.pow(1+growthRate/100, moment(date).diff(moment(startDate), 'days'))*startPrice);
    } else {
      return 'not on prediction curve';
    }
  }

  formDateValidationState() {
    if (!this.isDateInRange()) {
      return 'error';
    }
  }

  isDateInRange() {
    const {startDate, targetDate} = this.props;
    const {date} = this.state;
    return moment(date).isBetween(moment(startDate).add(-1, 'days'), moment(targetDate).add(1, 'days'));
  }

  render() {
    const {date} = this.state;
    const {startDate, targetDate} = this.props;

    return(
  <Well>
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
            value={date}
            onChange={this.handleDateChange}
            onFocus={this.props.pauseEvents}
            onBlur={this.props.resumeEvents}
            minDate={startDate}
            maxDate={targetDate}
            showClearButton={false}
            dateFormat="YYYY-MM-DD"
          />
        </Col>
      </FormGroup>

      <FormGroup controlId="formPriceForDate">
        <Col componentClass={ControlLabel} sm={2}>
          Price
        </Col>
        <Col sm={6}>
          <FormControl.Static>
            <strong>{this.getPriceForDate()}</strong>
          </FormControl.Static>
        </Col>
      </FormGroup>

    </Form>
  </Well>
    );
  }
}
