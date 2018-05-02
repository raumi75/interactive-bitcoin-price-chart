import React, {Component} from "react";
import "./LineChart.css";
import formatDollar from './formatting.js';
import moment from 'moment';

const chartRatio = 3; // Chart's height is 1/3 of width
let stopHoverTimer;
const stopHoverMilliseconds = 2000; // Hover Tooltip disappears after 2 seconds (touch displays)

class LineChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverLoc: null,     // x-location of the hovering mouse
      activePoint: null,  // the data point closest to hovering mouse
      svgWidth: document.documentElement.clientWidth,
      svgHeight: document.documentElement.clientWidth/chartRatio
    }
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    window.addEventListener('orientationchange', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
    window.removeEventListener('orientationchange', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ svgWidth: document.documentElement.clientWidth, svgHeight: document.documentElement.clientWidth/chartRatio });
  }


  // GET SVG COORDINATES
  getSvgX(x) {
    const {yLabelSize} = this.props;
    const {maxX} = this.props.boundaries;
    const {svgWidth} = this.state;
    return yLabelSize + (x / maxX * (svgWidth - 2*yLabelSize));
  }

  getSvgY(y) {
    const {xLabelSize, scale} = this.props;
    const {maxY, minY} = this.props.boundaries;
    const {svgHeight} = this.state;

    if (scale === 'lin') {
      return (
              (svgHeight - 2*xLabelSize) * maxY
            - (svgHeight - 2*xLabelSize) * y) / (maxY - minY)
            + xLabelSize;
    } else {
      // scale === 'log'
      return (
              (svgHeight - 2*xLabelSize) * Math.log(maxY)
            - (svgHeight - 2*xLabelSize) * Math.log(y) ) / (Math.log(maxY) - Math.log(minY))
            + xLabelSize;
    }
  }

  // BUILD SVG PATH
  // for the pricetype (p = historical price / m = mcafee prediction)
  makePath(pricetype, isArea) {
    const {data} = this.props;
    const {firstPoint, lastPoint, minY} = this.props.boundaries;
    let classNames = 'linechart_path linechart_path_'+pricetype;

    if (typeof(firstPoint[pricetype]) === 'undefined') {
      return null;
    }

    let pathD = "M " + this.getSvgX(firstPoint[pricetype].x) + " " + this.getSvgY(firstPoint[pricetype]['y'][pricetype]) + " ";

    pathD += data.map((point, i) => {
      if (point.y[pricetype]>0) {
        return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y[pricetype]) + " ";
      } else if (isArea) {
        return "L " + this.getSvgX((point.x)-1) + " " + (this.state.svgHeight - this.props.xLabelSize) + " ";
      } else {
        return null;
      }
    }).join("");

    if (isArea) {
      pathD += "L " + this.getSvgX(lastPoint[pricetype].x)  + " " + this.getSvgY(minY) + " "
             + "L " + this.getSvgX(firstPoint[pricetype].x) + " " + this.getSvgY(minY) + " ";

      classNames = "linechart_area_"+pricetype;
    }

    return (
      <path className={classNames} d={pathD} />
    );
  }

  // BUILD GRID AXIS
  makeAxis() {
    const {yLabelSize} = this.props;
    const {minX, minY, maxX, maxY} = this.props.boundaries;

    return (
      <g className="linechart_axis">
        <line
          x1={this.getSvgX(minX) - yLabelSize} y1={this.getSvgY(minY)}
          x2={this.getSvgX(maxX)} y2={this.getSvgY(minY)}
          strokeDasharray="5"
        className="linechart_axis_low" />
        {this.makeLineMaxYP()}
        <line
          x1={this.getSvgX(minX)} y1={this.getSvgY(maxY)}
          x2={this.getSvgX(maxX)} y2={this.getSvgY(maxY)}
          strokeDasharray="9"
        className="linechart_axis_x" />
      </g>
    );
  }

  makeLineMaxYP() {
    const {minX, maxX, maxPoint} = this.props.boundaries;

    if (maxPoint.p === 0) {
      return null;
    } else {
      return (
        <line
          x1={this.getSvgX(minX)} y1={this.getSvgY(maxPoint.p.y.p)}
          x2={this.getSvgX(maxX)} y2={this.getSvgY(maxPoint.p.y.p)}
          strokeDasharray="9"
        className="linechart_axis_high" />
      )
    }
  }

  makeLabels(){
    const {minX, maxX, firstPrices, lastPrices, maxPoint} = this.props.boundaries;

    return(
      <g className="linechart_label">
        { (maxPoint.p === 0) ? null : this.makeLabelPrice(maxPoint.p.y, 'left', 'p', '') }

        { (typeof(firstPrices.p) === 'undefined') ? null : this.makeLabelPrice(firstPrices, 'left', 'p', '') }
        { (typeof(firstPrices.m) === 'undefined') ? null : this.makeLabelPrice(firstPrices, 'left', 'm', '') }

        { (typeof(lastPrices.p) === 'undefined') ? null : this.makeLabelPrice(lastPrices, 'right', 'p', '') }
        { (typeof(lastPrices.m) === 'undefined') ? null : this.makeLabelPrice(lastPrices, 'right', 'm', '') }

        { this.makeLabelDate(minX, '') }
        { this.makeLabelDate(maxX-1, '') }
      </g>
    )
  }

  // Label on X-Axis (Date)
  makeLabelDate(count, cssExtra) {
    const {data, xLabelSize, yLabelSize, labelRadius} = this.props;
    const {svgHeight} = this.state;
    if ((count < data.length) && (count >= 0)) {
      let dateText = data[count].d;
      if (dateText === moment().utc().format('YYYY-MM-DD') ) {
        dateText = 'now';
      }
      return(
        <g>
          <rect
            x={this.getSvgX(data[count].x)-yLabelSize/2-2}
            y={svgHeight-xLabelSize+5}
            height={xLabelSize-5}
            width={yLabelSize}
            rx={labelRadius}   ry={labelRadius}
            className={'linechart_label_x'+cssExtra}
          />
          <text
            transform={`translate(${this.getSvgX(data[count].x)-2},
                                  ${svgHeight -3})`}
            className={'linechart_label_x'+cssExtra}
            textAnchor="middle"
          >
            { dateText }
          </text>
        </g>
      );
    } else {
      return null;
    }
  }

  otherPricetype(pricetype) {
    if (pricetype === 'm') { return 'p'; } else { return 'm'; }
  }

  // If pricelabels are too close together, move them up or down a little
  getOffsetLabelPrice(prices, pricetype) {
    const {xLabelSize} = this.props;
    var otherPricetype = this.otherPricetype(pricetype);
    var distanceY      = 0;

    if (prices[otherPricetype] > 0) {
      distanceY = this.getSvgY(prices[pricetype])-this.getSvgY(prices[otherPricetype]);
    }

    if (distanceY === 0) {return 0;}

    if (Math.abs(distanceY) < xLabelSize) {
      // prices are too close
      if (distanceY < 0) {
        // this price is above the other
        return xLabelSize*(-0.5);
      } else {
        // this price is below the other
        return xLabelSize*0.25;
      }
    } else {
      return 0;
    }
  }

  // Label on Y-Axis (Date)
  makeLabelPrice(prices, position, pricetype, cssExtra) {
    const {xLabelSize, yLabelSize, labelRadius} = this.props;
    const {maxX} = this.props.boundaries;
    var xpos = 0;
    var ypos = this.getSvgY(prices[pricetype])+this.getOffsetLabelPrice(prices, pricetype);

    if (position === 'right') {
      xpos = this.getSvgX(maxX);
    }

    if (prices[pricetype] > 0) {
      return(
        <g>
          <rect
            x={xpos}
            y={ypos-xLabelSize+5}
            height={xLabelSize}
            width={yLabelSize}
            rx={labelRadius}   ry={labelRadius}
            className={'linechart_label_' + pricetype + cssExtra}
          />
          <text
            transform={`translate(${xpos+yLabelSize/2},
                                      ${ypos})`}
            fill="red"
            textAnchor="middle"
            className={'linechart_label_' + pricetype+cssExtra}
          >
            {formatDollar(prices[pricetype])}
          </text>
        </g>
      );
    } else {
      return '';
    }
  }

  getTouchCoords = (e) => {
    if (this.areCoordsOnChart(e.touches[0].pageX)) {
      e.preventDefault();
      clearTimeout(stopHoverTimer);
      stopHoverTimer = setTimeout(function() { this.stopHover(); }.bind(this), stopHoverMilliseconds);
      this.getCoords(e.touches[0].pageX);
    } else {
      this.stopHover();
    }
  }

  getMouseCoords(e) {
    this.getCoords(e.pageX);
  }

  areCoordsOnChart(relativeLoc) {
    const {yLabelSize} = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();
    const chartRightBounding = svgLocation.width-yLabelSize;

    return ( (yLabelSize < relativeLoc) && (relativeLoc < chartRightBounding) )
  }

  // FIND CLOSEST POINT TO MOUSE
  getCoords(relativeLoc) {
    const {data, yLabelSize} = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();
    const chartWidth = svgLocation.width-yLabelSize*2;

    let svgData = [];
    data.map((point, i) => {
      svgData.push({
        svgX: this.getSvgX(point.x),
        svgY: this.getSvgY(point.y.p),
        x: point.x,
        d: point.d,
        y: point.y
      });
      return null;
    });

    var resolution = (chartWidth/svgData.length) // Optimize within this range. Just for speed.

    let closestPoint = svgData[0];
    for(let i = 0, c = resolution*2; i < svgData.length; i++){
      if ( Math.abs(svgData[i].svgX - relativeLoc) <= c ){
        c = Math.abs(svgData[i].svgX - relativeLoc);
        closestPoint = svgData[i];
      }
    }

    if (this.areCoordsOnChart(relativeLoc)) {
      this.setState({
        hoverLoc: relativeLoc,
        activePoint: closestPoint
      });
      this.props.onChartHover(relativeLoc, closestPoint);
    } else {
      // Pointer is outside of chart
      this.stopHover();
    }

  }
  // STOP HOVER
  stopHover(){
    this.setState({hoverLoc: null, activePoint: null});
    this.props.onChartHover(null, null);
  }

  // MAKE ACTIVE POINT
  makeActivePoint(){
    const {color, pointRadius} = this.props;
    const {activePoint} = this.state;
    if (activePoint.y['p']>0) {
      return (
        <circle
          className='linechart_point'
          style={{stroke: color}}
          r={pointRadius}
          cx={activePoint.svgX}
          cy={activePoint.svgY}
        />
      );
    } else {
      return (null);
    }
  }

  // MAKE HOVER LINE
  createLine(){
    const {xLabelSize} = this.props;
    return (
      <line
        className='hoverLine'
        x1={this.state.hoverLoc} y1={-8}
        x2={this.state.hoverLoc} y2={this.state.svgHeight - xLabelSize} />
    )
  }

  // MAKE HOVER LINE
  createHorizontalLine(pricetype){
    const {yLabelSize} = this.props;
    const {activePoint, svgWidth} = this.state;

    if (activePoint.y[pricetype] === 0)
    { return (null); }
    var svgY = this.getSvgY(activePoint.y[pricetype]);

    return (
      <line
        className='hoverLine'
        x1={yLabelSize}            y1={svgY}
        x2={svgWidth - yLabelSize} y2={svgY} />
    )
  }

  // MAKE HOVER LINE
  makeActiveDate(){
    return (this.makeLabelDate(this.state.activePoint.x, '_hover'));
  }

  makeActiveLabelPrice(pricetype, position){
    return ( this.makeLabelPrice(this.state.activePoint.y, position, pricetype, '_hover') );
  }

  makeHover() {
    return (
          <g id="hoverData">
            {this.createLine()}
            {this.makeActivePoint()}
            {this.makeActiveDate()}
            {this.createHorizontalLine('p')}
            {this.createHorizontalLine('m')}
            {this.makeActiveLabelPrice('p', 'left')}
            {this.makeActiveLabelPrice('m', 'left')}
            {this.makeActiveLabelPrice('p', 'right')}
            {this.makeActiveLabelPrice('m', 'right')}
          </g>
         );
  }

  render() {
    const {svgHeight, svgWidth, hoverLoc} = this.state
    return (
      <svg
        width={this.state.svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className={'linechart'}
        onMouseLeave= { () => this.stopHover() }
        onMouseMove = { (e) => this.getMouseCoords(e) }
        onTouchMove = { (e) => this.getTouchCoords(e) }
        onTouchStart= { (e) => this.getTouchCoords(e) }
        onMouseDown = { (e) => this.getMouseCoords(e) }
      >
        <g>
          {this.makeAxis()}
          {this.makePath('p', false)}
          {this.makePath('m', false)}
          {this.makePath('p', true)}
          {this.makeLabels()}
          {hoverLoc ? this.makeHover() : null}
        </g>
      </svg>
    );
  }
}
// DEFAULT PROPS
LineChart.defaultProps = {
  data: [],
  pointRadius: 5,
  labelRadius: 5,
  xLabelSize: 20,
  yLabelSize: 80
}

export default LineChart;
