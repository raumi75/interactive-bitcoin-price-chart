import React, { Component } from 'react';
import moment from 'moment';
import { Col, Form, FormGroup, InputGroup, FormControl, ControlLabel, Well } from 'react-bootstrap';
//import './katex.css'; // https://github.com/Khan/KaTeX/releases/tag/v0.8.3
//import Latex from 'react-latex';

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

  getDateForPrice = () => {
    const {startDate, startPrice, growthRate} = this.props;
    let price = this.props.targetPrice;
    if (this.state.price !== 'default') {
      price = this.state.price;
    }
    if (this.isPriceInRange()) {
      return moment(startDate).add(Math.floor(Math.log(price/startPrice)/Math.log(1+growthRate/100)), 'days').format('YYYY-MM-DD, dddd');
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
    let price = this.props.targetPrice;
    if (this.state.price !== 'default') {
      price = this.state.price;
    }
    return (targetPrice >= price && price >= startPrice);
  }

  render() {
    const {price} = this.state;
    const {targetPrice} = this.props;

    return(
  <Well>
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
              value={price !== 'default' ? price : targetPrice}
              onChange={this.handlePriceChange}
              autoComplete="off"
            />
          </InputGroup>
        </Col>
      </FormGroup>

      <FormGroup controlId="formDateForPrice">
        <Col componentClass={ControlLabel} sm={2}>
          Date
        </Col>
        <Col sm={6}>
          <FormControl.Static>
            <strong>{this.getDateForPrice()}</strong>
          </FormControl.Static>
        </Col>
      </FormGroup>

    </Form>
  </Well>
    );
  }
}
