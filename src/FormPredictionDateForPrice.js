import React, { Component } from 'react';
import moment from 'moment';
import { Col, Form, FormGroup, InputGroup, FormControl, ControlLabel, Well } from 'react-bootstrap';
import './katex.css'; // https://github.com/Khan/KaTeX/releases/tag/v0.8.3
import Latex from 'react-latex';

export default class FormPredictionDateForPrice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      price: 'default'
    }
  }

  handlePriceChange = (e) => {
    this.setState({price: e.target.value });
  }

  getDaysForPrice = () => {
    const {startPrice, growthRate} = this.props;
    const price = this.getPrice();
    if (this.isPriceInRange()) {
      return Math.ceil(Math.log(price/startPrice)/Math.log(1+growthRate/100)-1);
    }
  }

  getDateForPrice() {
    const {startDate} = this.props;
    const daysForPrice = this.getDaysForPrice();

    if (this.isPriceInRange() >= 0) {
      return moment(startDate).add(daysForPrice, 'days').format('YYYY-MM-DD, dddd');
    } else {
      return 'not on prediction curve';
    }
  }

  formPriceValidationState() {
    if (!this.isPriceInRange()) {
      return 'error';
    }
  }

  isPriceInRange() {
    const {startPrice, targetPrice} = this.props;
    const price = this.getPrice();
    return (targetPrice >= price && price >= startPrice);
  }

  getPrice = () => {
    let price = this.props.targetPrice;
    if (this.state.price !== 'default') {
      price = this.state.price;
    }
    return price;
  }

  latexMathDaysFromPrice() {
    const {startDate, startPrice, growthRate} = this.props;
    const price = this.getPrice();
    const daysForPrice = this.getDaysForPrice();
    if (daysForPrice > 0) {
      return `$\\frac{\\log\\left(\\frac{`+price+`}{`+startPrice+`}\\right)}{\\log\\left(1+\\frac{`+ growthRate + `}{100}\\right)} = ` + daysForPrice + `\\ days\\ from\\ `+ moment(startDate).format('YYYY/MM/DD') +`$`;
    }
  }

  render() {
    return(
  <Well className="explore-prediction">
    <Form horizontal>
      <FormGroup
        controlId="formPrice"
        validationState={this.formPriceValidationState()}
      >
        <Col componentClass={ControlLabel} sm={2}>
          Price
        </Col>
        <Col sm={6}>
          <InputGroup>
            <InputGroup.Addon>US$</InputGroup.Addon>
            <FormControl
              type="number"
              value={this.getPrice()}
              onChange={this.handlePriceChange}
              autoComplete="off"
            />
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formDateForPrice" bsSize="large">
        <Col componentClass={ControlLabel} sm={2}>
          Date
        </Col>
        <Col sm={10}>
          <FormControl.Static>
            <strong>{this.getDateForPrice()}</strong>
          </FormControl.Static>
        </Col>
        <Col className="latex-formula"><Latex>{this.latexMathDaysFromPrice()}</Latex></Col>
      </FormGroup>

    </Form>
  </Well>
    );
  }
}
