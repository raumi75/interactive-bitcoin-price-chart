import React, { Component } from 'react';
import moment from 'moment';
import { Col, Form, FormGroup, InputGroup, FormControl, ControlLabel, ButtonGroup, Button, Well } from 'react-bootstrap';
import './FormCustomPrediction.css';
import getGrowthRate from './growthRate.js';
import './katex.css'; // https://github.com/Khan/KaTeX/releases/tag/v0.8.3
import DatePicker from "react-bootstrap-date-picker";
import Latex from 'react-latex';
import {getUrlDraper, getUrlMcAfee} from './urls.js';

class FormCustomPrediction extends Component {
  render() {
    const {startDate, startPrice, growthRate, targetPrice, targetDate, maxTargetDate, historicalEnd, historicalStart} = this.props;

    return(
  <Well>
    <Form horizontal>
      <h2>Parameters <small>change them to make your own prediction</small></h2>
      <FormGroup controlId="formStartDate">
        <Col componentClass={ControlLabel} sm={2}>
          Start Date
        </Col>
        <Col sm={8} md={5}>
          <DatePicker id="startdatepicker"
            value={startDate}
            onChange={this.props.onStartDateChange}
            onFocus={this.props.pauseEvents}
            onBlur={this.props.resumeEvents}
            minDate={historicalStart}
            maxDate={moment(historicalEnd).subtract(1, 'week').format('YYYY-MM-DD')}
            showClearButton={false}
            dateFormat="YYYY-MM-DD"
          />
        </Col>
      </FormGroup>

      <FormGroup controlId="formStartPrice">
        <Col componentClass={ControlLabel} sm={2}>
          Start Price
        </Col>
        <Col sm={8} md={5}>
          <InputGroup>
            <InputGroup.Addon>US$</InputGroup.Addon>
            <FormControl type="number"
              value={startPrice}
              onChange={this.props.onStartPriceChange}
              autoComplete="off"
            />
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formGrowthRate">
        <Col componentClass={ControlLabel} sm={2}>
          % per day
        </Col>
        <Col sm={8} md={5}>
          <InputGroup>
            <FormControl type="number"
              value={growthRate}
              onChange={this.props.onGrowthRateChange}
              autoComplete="off"
            />
            <InputGroup.Addon>%</InputGroup.Addon>
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formTargetDate">
        <Col componentClass={ControlLabel} sm={2}>
          Target Date
        </Col>
        <Col sm={8} md={5}>
          <DatePicker id="targetdatepicker"
            value={targetDate}
            onChange={this.props.onTargetDateChange}
            minDate={moment(historicalEnd).add(1, 'month').format('YYYY-MM-DD')}
            maxDate={maxTargetDate}
            onFocus={this.props.pauseEvents}
            onBlur={this.props.resumeEvents}
            showClearButton={false}
            dateFormat="YYYY-MM-DD"
          />
        </Col>
      </FormGroup>

      <FormGroup controlId="formTargetPrice">
        <Col componentClass={ControlLabel} sm={2}>
          Target Price
        </Col>
        <Col sm={8} md={5}>
          <InputGroup>
            <InputGroup.Addon>US$</InputGroup.Addon>
            <FormControl
              type="number"
              value={targetPrice}
              onChange={this.onTargetPriceChange}
              autoComplete="off"
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

    <ButtonGroup justified>
      <Button href={getUrlDraper()}>Draper<span className="hidden-xs"> Prediction (250k by 2022)</span></Button>
      <Button href={getUrlMcAfee()}>McAfee<span className="hidden-xs"> Prediction (1 million by 2020)</span></Button>
    </ButtonGroup>
  </Well>
    );
  }

  // Calculate the growthRate (percent value)  in the Form
  onTargetPriceChange = (e) => {
    const {startPrice} = this.props;
    const targetPrice = Number(e.target.value);
    let gR = 0
    if ( targetPrice === 0 || isNaN(targetPrice) ) {
      // input was deleted or 0
    } else {
      gR = getGrowthRate(startPrice, targetPrice, this.predictionDays())*100;
    }
    let fakeEvent = {target: {value: gR} };
    this.props.onGrowthRateChange(fakeEvent);
  }

  predictionDays() {
    return moment(this.props.targetDate).diff(moment(this.props.startDate), 'days');
  }

  latexMathAnnualGrowth() {
    const {growthRate} = this.props;
    return `$\\left( (1+\\frac{`+ growthRate + `}{100})^{365}-1 \\right)*100$`;
  }

  latexMathDoublingTime(factor) {
    const {growthRate} = this.props;
    return `$\\frac{\\log(`+factor+`)}{\\log(1+\\frac{`+ growthRate + `}{100})}$`;
  }
}

export default FormCustomPrediction;
