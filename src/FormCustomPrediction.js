import React, { Component } from 'react';
import moment from 'moment';
import { Col, Form, FormGroup, InputGroup, FormControl, ControlLabel, } from 'react-bootstrap';
import './FormCustomPrediction.css';
import './katex.css'; // https://github.com/Khan/KaTeX/releases/tag/v0.8.3
var Latex = require('react-latex');
var DatePicker = require("react-bootstrap-date-picker");

class FormCustomPrediction extends Component {

  render() {
    const {startDate, startPrice, growthRate, targetDate, maxTargetDate, historicalEnd, historicalStart} = this.props;

    return(
    <Form horizontal>
      <h3>Make your own prediction</h3>

      <FormGroup controlId="formStartDate">
        <Col componentClass={ControlLabel} sm={2}>
          Start Date
        </Col>
        <Col sm={8} md={5} lg={3}>
          <InputGroup>
          <DatePicker id="startdatepicker"
            value={startDate}
            onChange={this.props.onStartDateChange}
            minDate={historicalStart}
            maxDate={moment(historicalEnd).subtract(1, 'week').format('YYYY-MM-DD')}
            showClearButton={false}
            dateFormat="YYYY-MM-DD"
            />
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formStartPrice">
        <Col componentClass={ControlLabel} sm={2}>
          Start Price
        </Col>
        <Col sm={8} md={5} lg={3}>
          <InputGroup>
          <InputGroup.Addon>US$</InputGroup.Addon>
          <FormControl type="number"
                       value={startPrice}
                       onChange={this.props.onStartPriceChange}
                        />
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formGrowthRate">
        <Col componentClass={ControlLabel} sm={2}>
          percent per day
        </Col>
        <Col sm={8} md={5} lg={3}>
          <InputGroup>
          <FormControl type="number"
                       value={growthRate}
                       onChange={this.props.onGrowthRateChange}
                        />
          <InputGroup.Addon>%</InputGroup.Addon>
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formTargetDate">
        <Col componentClass={ControlLabel} sm={2}>
          Target Date
        </Col>
        <Col sm={8} md={5} lg={3}>
          <InputGroup>
          <DatePicker id="targetdatepicker"
            value={targetDate}
            onChange={this.props.onTargetDateChange}
            minDate={moment(historicalEnd).add(1, 'month').format('YYYY-MM-DD')}
            maxDate={maxTargetDate}
            showClearButton={false}
            dateFormat="YYYY-MM-DD"
            />
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formAnnual">
        <Col componentClass={ControlLabel} sm={2}>
          annual growth
        </Col>
        <Col sm={10}>
          <FormControl.Static>
            <strong>{(Math.pow((1+growthRate/100),365)-1).toLocaleString('en-us', {style: 'percent', maximumSignificantDigits: 5}) } per year</strong>
            <Latex>{this.latexMathAnnualGrowth()}</Latex>
          </FormControl.Static>
        </Col>
      </FormGroup>

      <FormGroup controlId="formDoublingTime">
        <Col componentClass={ControlLabel} sm={2}>
          doubling time
        </Col>
        <Col sm={10}>
          <FormControl.Static>
            <strong>{Math.round(Math.log10(2)/Math.log10(1+growthRate/100))} days</strong>
            <Latex>{this.latexMathDoublingTime(2)}</Latex>
          </FormControl.Static>
        </Col>
      </FormGroup>

      <FormGroup controlId="formDoublingTime">
        <Col componentClass={ControlLabel} sm={2}>
          10-times after
        </Col>
        <Col sm={10}>
          <FormControl.Static>
            <strong>{Math.round(Math.log10(10)/Math.log10(1+growthRate/100))} days</strong>
            <Latex>{this.latexMathDoublingTime(10)}</Latex>
          </FormControl.Static>
        </Col>
      </FormGroup>
    </Form>
    );
  }

  latexMathAnnualGrowth() {
    const {growthRate} = this.props;
    return `$\\left( (1+\\frac{`+ growthRate + `}{100})^{365}-1 \\right)*100$`;
  }

  latexMathDoublingTime(factor) {
    const {growthRate} = this.props;
    return `$\\frac{\\log_{10}(`+factor+`)}{\\log_{10}(1+\\frac{`+ growthRate + `}{100})}$`;
  }
}

export default FormCustomPrediction;
