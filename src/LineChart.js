import React, {Component} from "react";
import "./LineChart.css";
import formatDollar from './formatting.js';
import moment from 'moment';
import niceScale from './LineChartNiceScale.js';
import getDataBoundaries from './chartDataBoundaries.js';
const chartRatio = 3; // Chart's height is 1/3 of width
let stopHoverTimer;
let scaleMaxY = 0;
let scaleMinY = 0;
let tickSpacing = 0;
const stopHoverMilliseconds = 2000; // Hover Tooltip disappears after 2 seconds (touch displays)

function log_ZeroPossible(n) {
  // It is mathematically impossible to find an exponent that will result in zero
  // We assume that the smallest order of magnitude we want to deal with is
  // 0.10 which is 10 Cents.
  return Math.log(Math.max(n,0.1));
}

class LineChart extends Component {
  constructor(props) {
    super(props);

    //this.boundaries = getDataBoundaries(this.props.data);

    this.state = {
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
    const {maxX} = this.boundaries;
    const {svgWidth} = this.state;
    return yLabelSize + (x / maxX * (svgWidth - 2*yLabelSize));
  }

  getSvgY(y) {
    const {xLabelSize, scale} = this.props;
    const {svgHeight} = this.state;

    if (scale === 'lin') {
      return (
              (svgHeight - 2*xLabelSize) * scaleMaxY
            - (svgHeight - 2*xLabelSize) * y) / (scaleMaxY - scaleMinY)
            + xLabelSize;
    } else {
      // scale === 'log'
      return (
              (svgHeight - 2*xLabelSize) * Math.log(scaleMaxY)
            - (svgHeight - 2*xLabelSize) * log_ZeroPossible(y) ) / (Math.log(scaleMaxY) - log_ZeroPossible(scaleMinY))
            + xLabelSize;
    }
  }

  // BUILD SVG PATH
  // for the pricetype (p = historical price / m = mcafee prediction)
  makePath(pricetype, isArea) {
    const {data} = this.props;
    const {firstPoint, lastPoint} = this.boundaries;
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
      pathD += "L " + this.getSvgX(lastPoint[pricetype].x)  + " " + this.getSvgY(scaleMinY) + " "
             + "L " + this.getSvgX(firstPoint[pricetype].x) + " " + this.getSvgY(scaleMinY) + " ";

      classNames = "linechart_area_"+pricetype;
    }

    return (
      <path className={classNames} d={pathD} />
    );
  }

  // dashed line from highest price to the point
  makeLineMaxYP() {
    const {minX, maxPoint} = this.boundaries;

    if (maxPoint.p === 0) {
      return null;
    } else {
      return (
        <g>
          <line
            x1={this.getSvgX(minX)} y1={this.getSvgY(maxPoint.p.y.p)}
            x2={this.getSvgX(maxPoint.p.x)} y2={this.getSvgY(maxPoint.p.y.p)}
            strokeDasharray="9"
            className="tickline"
          />
        </g>
      )
    }
  }

  makeLabels(){
    const {minX, maxX, firstPrices, lastPrices, maxPoint} = this.boundaries;

    return(
      <g className="linechart_label">
        { (maxPoint.p === 0) ? null : this.makeLabelPricePoint(maxPoint.p.y, 'left', 'p', '') }

        { (typeof(firstPrices.p) === 'undefined') ? null : this.makeLabelPricePoint(firstPrices, 'left', 'p', '') }
        { (typeof(firstPrices.m) === 'undefined') ? null : this.makeLabelPricePoint(firstPrices, 'left', 'm', '') }

        { (typeof(lastPrices.p) === 'undefined') ? null : this.makeLabelPricePoint(lastPrices, 'right', 'p', '') }
        { (typeof(lastPrices.m) === 'undefined') ? null : this.makeLabelPricePoint(lastPrices, 'right', 'm', '') }

        { this.makeLabelDate(minX, '') }
        { this.makeLabelDate(maxX-1, '') }
      </g>
    )
  }

  makeLabelDateTicks() {
    const {minDate, maxDate, minX} = this.boundaries;
    const {svgWidth} = this.state;
    const {yLabelSize} = this.props;
    const periods = ['week', 'month', 'quarter', 'year'];
    let maxTickSpacing = yLabelSize*2;
    let maxTicksX = svgWidth/(maxTickSpacing);
    let ticksXvalues = [];
    let ticks = [];
    //count weeks, months, years and decide which to use as ticks
    periods.some(function(period){
      if (maxTicksX >= moment(maxDate).diff(moment(minDate), period+'s')) {
        for (
          var d = moment(minDate).startOf(period);
          d.isBefore(moment(maxDate));
          d = d.add(1, period)
             )
             {
               ticksXvalues.push (Math.max(minX,d.diff(moment(minDate), 'days')));
        }
        return true; // don't try the next periods
      } else {
        return false; // try the next periods
      }
    });

    ticksXvalues.map( (x) =>{
      ticks.push(this.makeLabelDate(x, 'datetick'))
      return null;
    });

    return (
      <g className="linechart_labeldate">
        {ticks}
      </g>
    );
  }

  makeLabelTicks() {
    const {scale} = this.props;
    const offset = 4; // pixel
    let ticks = [];
    let tickY = 0;
    let maxTicks = 0;
    if (scale === 'lin') {
      maxTicks = (scaleMaxY-scaleMinY)/tickSpacing;
    } else {
      // on a log scale:
      // how many orders of magnitude to the maximum price?
      maxTicks = Math.ceil(Math.log(scaleMaxY));
    }

    // i starts at -1 to start at $ 0.10 on a log scale
    for (var i = -1; i <= maxTicks ; i++) {
      if (scale === 'lin') {
        tickY = scaleMinY+tickSpacing*i;
      } else {
        // scale === 'log'
        tickY = Math.pow(10,i);
      }

      ticks.push (this.makeLabelPrice(tickY, offset, 'left',  's', '', 'p'+i));
      ticks.push (this.makeLabelPrice(tickY, offset, 'right', 's', '', 'r'+i));
      ticks.push (this.createHorizontalLine(tickY, 'tickline', 'l'+i));
    }
    return (
      <g className="linechart_label">
        {ticks}
      </g>
    );
  }
  // Label on X-Axis (Date)
  makeLabelDate(count, cssExtra) {
    const {data, xLabelSize, yLabelSize, labelRadius} = this.props;
    const {svgHeight} = this.state;
    const tickHeight = 10; // px
    if ((count < data.length) && (count >= 0)) {
      let dateText = data[count].d;
      let svgX = this.getSvgX(data[count].x);

      if (dateText === moment().utc().format('YYYY-MM-DD') ) {
        dateText = 'now';
      }
      return(
        <g key={cssExtra+count}>
          <rect
            x={svgX-yLabelSize/2-2}
            y={svgHeight-xLabelSize+5}
            height={xLabelSize-5}
            width={yLabelSize}
            rx={labelRadius}   ry={labelRadius}
            className={'linechart_label_x'+cssExtra}
          />
          <text
            transform={`translate(${svgX -2},
                                  ${svgHeight -3})`}
            className={'linechart_label_x'+cssExtra}
            textAnchor="middle"
          >
            { dateText }
          </text>
          <line
            className='tickline'
            x1={svgX} y1={svgHeight - xLabelSize}
            x2={svgX} y2={svgHeight - xLabelSize - tickHeight}
          />
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

  // Label on Y-Axis for given Data-point
  makeLabelPricePoint(prices, position, pricetype, cssExtra) {
    return (
      this.makeLabelPrice(
        prices[pricetype],
        this.getOffsetLabelPrice(prices, pricetype),
        position, pricetype, cssExtra
      )
    );
  }

  // Label on Y-Axis (Price)
  makeLabelPrice(price, offset, position, pricetype, cssExtra, key) {
    const {xLabelSize, yLabelSize, labelRadius} = this.props;
    const {maxX} = this.boundaries;
    var xpos = 0;
    var ypos = this.getSvgY(price)+offset;

    if (position === 'right') {
      xpos = this.getSvgX(maxX);
    }

    if (price > 0) {
      return(
        <g key={key}>
          <rect
            x={xpos}
            y={ypos-xLabelSize+5}
            height={xLabelSize}
            width={yLabelSize}
            rx={labelRadius}
            ry={labelRadius}
            className={'linechart_label_' + pricetype + cssExtra}
          />
          <text
            transform={`translate(${xpos+yLabelSize/2},
                                      ${ypos})`}
            fill="red"
            textAnchor="middle"
            className={'linechart_label_' + pricetype+cssExtra}
          >
            {formatDollar(price)}
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
      this.props.onChartHover(  relativeLoc, closestPoint);
    } else {
      // Pointer is outside of chart
      this.stopHover();
    }

  }
  // STOP HOVER
  stopHover(){
    this.props.onChartHover(null, null);
  }

  // MAKE ACTIVE POINT
  makeActivePoint(){
    const {color, pointRadius, activePoint} = this.props;
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

  // MAKE vertical HOVER LINE
  createLine(){
    const {xLabelSize, hoverLoc} = this.props;
    const {svgHeight} = this.state;
    return (
      <line
        className='hoverline'
        x1={hoverLoc} y1={0-xLabelSize}
        x2={hoverLoc} y2={svgHeight - xLabelSize} />
    )
  }

  // MAKE horizontal HOVER LINE
  createHorizontalHoverLine(pricetype){
    const {activePoint} = this.props;

    if (activePoint.y[pricetype] === 0) {
      return (null);
    } else {
      return (this.createHorizontalLine(activePoint.y[pricetype], 'hoverline'));
    }
  }

  // horizontal line between hover point price and prediction curve price
  // to visualize how many days price is ahead or behind
  createHoverLineAhead(){
    const {svgHeight} = this.state;
    const {daysPredictionAhead, xLabelSize, activePoint} = this.props;

    if (activePoint.y.m === 0 || activePoint.y.p === 0) {
      return (null);
    } else {
      let svgY = this.getSvgY(activePoint.y.p);
      return (
      <g>
        <line
          className={'hoverline_'+this.getAboveOrBelow()}
          x1={this.getSvgX(activePoint.x)} y1={svgY}
          x2={this.getSvgX(activePoint.x+daysPredictionAhead)} y2={svgY}
          strokeDasharray="9"
        />

        <line
          className={'hoverline'}
          x1={this.getSvgX(activePoint.x+daysPredictionAhead)} y1={svgY}
          x2={this.getSvgX(activePoint.x+daysPredictionAhead)} y2={svgHeight - xLabelSize}
          strokeDasharray="9"
        />

        {this.makeLabelDate(activePoint.x+daysPredictionAhead, '')}
      </g>
      )
    }  }

  // vertical line between hover point price and prediction curve price
  // to visualize how the price is above or below
  createHoverLineAbove(){
    const {activePoint} = this.props;

    if (activePoint.y.m === 0 || activePoint.y.p === 0) {
      return (null);
    } else {
      let svgX = this.getSvgX(activePoint.x);
      return (
        <line
          className={'hoverline_'+this.getAboveOrBelow()}
          x1={svgX} y1={this.getSvgY(activePoint.y.m)}
          x2={svgX} y2={this.getSvgY(activePoint.y.p)}
          strokeDasharray="9"
        />
      )
    }
  }

  // is the price above or below the prediction.
  // css className will color the percentage accordingly
  getAboveOrBelow() {
    const {activePoint} = this.props;

    if (activePoint.y.p>=activePoint.y.m)
    { return ('above'); } else { return 'below' ; }
  }

  createHorizontalLine(price, className, key) {
    const {yLabelSize} = this.props;
    const {svgWidth} = this.state;
    var svgY = this.getSvgY(price);

    return (
      <line
        className={className}
        x1={yLabelSize}            y1={svgY}
        x2={svgWidth - yLabelSize} y2={svgY}
        key={key}
      />
    )
  }

  // Label Date for HOVER LINE
  makeActiveDate(){
    const {activePoint} = this.props;
    return (this.makeLabelDate(activePoint.x, '_hover'));
  }

  // Label Price for Hover Line
  makeActiveLabelPrice(pricetype, position){
    const {activePoint} = this.props;

    return ( this.makeLabelPricePoint(activePoint.y, position, pricetype, '_hover') );
  }

  makeHover() {
    return (
          <g id="hoverData">
            {this.createLine()}
            {this.makeActivePoint()}
            {this.createHorizontalHoverLine('p')}
            {this.createHorizontalHoverLine('m')}
            {this.createHoverLineAhead()}
            {this.createHoverLineAbove()}
            {this.makeActiveDate()}
            {this.makeActiveLabelPrice('p', 'left')}
            {this.makeActiveLabelPrice('m', 'left')}
            {this.makeActiveLabelPrice('p', 'right')}
            {this.makeActiveLabelPrice('m', 'right')}
          </g>
         );
  }

  // calculate Y-Boundaries and Ticks for Labeling the Y-Axis
  setScale() {
    const {minY, maxY} = this.boundaries;
    const {xLabelSize} = this.props;
    const {svgHeight} = this.state;

    let maxTickSpacing = 2* xLabelSize;
    let maxTicks = Math.min(10,Math.floor(svgHeight /maxTickSpacing));
    let scale = new niceScale(minY, maxY, maxTicks);

    scaleMinY = scale.getNiceLowerBound();
    scaleMaxY = scale.getNiceUpperBound();
    tickSpacing = scale.getTickSpacing();
  }

  render() {
    const {svgHeight, svgWidth} = this.state;
    const {hoverLoc} = this.props;
    this.boundaries = getDataBoundaries(this.props.data);

    this.setScale();
    return (
      <svg
        id='linechart'
        width={svgWidth}
        height={svgHeight}
        viewBox={"0 0 " + svgWidth + ' ' + svgHeight}
        className='linechart unselectable'
        onMouseLeave= { () => this.stopHover() }
        onMouseMove = { (e) => this.getMouseCoords(e) }
        onTouchMove = { (e) => this.getTouchCoords(e) }
        onTouchStart= { (e) => this.getTouchCoords(e) }
        onMouseDown = { (e) => this.getMouseCoords(e) }
        unselectable="yes"
      >
        <g>
          {this.makeLineMaxYP()}

          {this.makeLabelDateTicks()}
          {this.makeLabelTicks()}

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
  activePoint: null,
  hoverLoc: null,
  pointRadius: 5,
  labelRadius: 5,
  xLabelSize: 20,
  yLabelSize: 80
}

export default LineChart;
