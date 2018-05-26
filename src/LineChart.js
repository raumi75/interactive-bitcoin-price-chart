import React, {Component} from "react";
import PropTypes from 'prop-types';
import "./LineChart.css";
import moment from 'moment';
import niceScale from './LineChartNiceScale.js';
import getDataBoundaries from './chartDataBoundaries.js';
import ChartLabelPrice from './ChartLabelPrice.js';
import ChartLabelPricePair from './ChartLabelPricePair.js';
import ChartActivePoint from './ChartActivePoint.js';
import ChartVerticalLine from './ChartVerticalLine.js';
import ChartHorizontalLine from './ChartHorizontalLine.js';
import {dateFormat} from './App.js';
import ToolTip from './ToolTip';
const chartRatio = 3; // Chart's height is 1/3 of width
let stopHoverTimer;
let scaleMaxY = 0;
let scaleMinY = 0;
let tickSpacing = 0;
const stopHoverMilliseconds = 2000; // Hover Tooltip disappears after 2 seconds (touch displays)
export const xLabelSize = 20;
export const yLabelSize = 80;
export const labelRadius = 5;

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
      svgHeight: document.documentElement.clientWidth/chartRatio,
      hoverLoc: null,
      activePoint: null
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
    this.setState({
      svgWidth: document.documentElement.clientWidth,
      svgHeight: document.documentElement.clientWidth/chartRatio,
      hoverLoc: null,
      activePoint: null
    });
  }


  // GET SVG COORDINATES
  getSvgX(x) {
    const {maxX} = this.boundaries;
    const {svgWidth} = this.state;
    return yLabelSize + (x / maxX * (svgWidth - 2*yLabelSize));
  }

  getSvgY(y) {
    const {scale} = this.props;
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
        return "L " + this.getSvgX((point.x)-1) + " " + (this.state.svgHeight - xLabelSize) + " ";
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

  makeLabels() {
    const {minX, maxX, maxPoint} = this.boundaries;
    const {svgWidth} = this.state;
    const getSvgForPoint = (pricePoint) => {
        pricePoint.svgY = {
          p: (pricePoint.p ? this.getSvgY(pricePoint.p) : 0),
          m: (pricePoint.m ? this.getSvgY(pricePoint.m) : 0)
        };
        pricePoint.y = {
          p: pricePoint.p,
          m: pricePoint.m
        };
        return pricePoint;
      }
    const firstPrices = getSvgForPoint(this.boundaries.firstPrices);
    const lastPrices  = getSvgForPoint(this.boundaries.lastPrices);

    return(
      <g className="linechart_label">
        { (maxPoint.p === 0) ? null :
        <ChartLabelPrice price={maxPoint.p.y.p} yPos={this.getSvgY(maxPoint.p.y.p)} priceType='p' />
        }
        <ChartLabelPricePair activePoint={firstPrices} />
        <ChartLabelPricePair activePoint={lastPrices} xPos={svgWidth-yLabelSize} />
        { this.makeLabelDate(minX, '') }
        { this.makeLabelDate(maxX, '') }
      </g>
    )
  }

  makeLabelDateTicks() {
    const {minDate, maxDate, minX} = this.boundaries;
    const {svgWidth} = this.state;
    const periods = ['week', 'month', 'quarter', 'year'];
    let maxTickSpacing = yLabelSize*2;
    let maxTicksX = svgWidth/(maxTickSpacing);
    let ticksXvalues = [];
    let ticks = [];
    //count weeks, months, years and decide which to use as ticks

    const maxDateMoment = moment(maxDate);
    const minDateMoment = moment(minDate);

    periods.some(function(period){
      if (maxTicksX >= maxDateMoment.diff(minDateMoment, period+'s')) {
        for (
          var d = moment(minDateMoment).startOf(period);
          d.isBefore(maxDateMoment);
          d = d.add(1, period)
             )
             {
               ticksXvalues.push (Math.max(minX,d.diff(minDateMoment, 'days')));
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
    const {svgWidth} = this.state;
    const offset = 4; // pixel
    let ticks = [];
    let tickY = 0;
    let tickSvgY = 0;
    let maxTickCount = this.getMaxYTickCount();

    // i starts at -1 to start at $ 0.10 on a log scale
    for (var i = -1; i <= maxTickCount ; i++) {
      if (scale === 'lin') {
        tickY = scaleMinY+tickSpacing*i;
      } else {
        // scale === 'log'
        // dont worry about tick spacing.  Just label magnitudes
        tickY = Math.pow(10,i);
      }
      tickSvgY = this.getSvgY(tickY);
      ticks.push (<ChartLabelPrice price={tickY} yPos={tickSvgY+offset} priceType='s' key={'lp'+i} /> );
      ticks.push (<ChartLabelPrice price={tickY} xPos={svgWidth-yLabelSize} yPos={tickSvgY+offset} priceType='s' key={'rp'+i} /> );
      ticks.push (<ChartHorizontalLine y={tickSvgY} width={svgWidth} className='tickline' key={'l'+i} />);
    }

    return (
      <g className="linechart_label">
        {ticks}
      </g>
    );
  }

  /**
   * How many Labels fit on the Y-Scale at most?
   * @return integer
   */
  getMaxYTickCount() {
    const {scale} = this.props;

    if (scale === 'lin') {
      return (scaleMaxY-scaleMinY)/tickSpacing;
    } else {
      // on a log scale:
      // how many orders of magnitude to the maximum price?
      return Math.ceil(Math.log(scaleMaxY));
    }
  }

  // Label on X-Axis (Date)
  makeLabelDate(count, cssExtra) {
    const {data} = this.props;
    const {svgHeight} = this.state;
    const tickHeight = 10; // px
    if ((count < data.length) && (count >= 0)) {
      let dateText = data[count].d;
      let svgX = this.getSvgX(data[count].x);

      if (dateText === moment().utc().format(dateFormat) ) {
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

  getTouchCoords = (e) => {
    clearTimeout(stopHoverTimer);

    if (this.areCoordsOnChart(e.touches[0].pageX)) {
      e.preventDefault();
      this.getCoords(e.touches[0].pageX);
      stopHoverTimer = setTimeout(function() { this.stopHover(); }.bind(this), stopHoverMilliseconds);
    } else {
      this.stopHover();
    }
  }

  getMouseCoords(e) {
    clearTimeout(stopHoverTimer);
    this.getCoords(e.pageX);
    stopHoverTimer = setTimeout(function() { this.stopHoverIfOut(); }.bind(this), stopHoverMilliseconds);
  }

  areCoordsOnChart(relativeLoc) {
    const chartRightBounding = this.state.svgWidth-yLabelSize;

    return ( (yLabelSize < relativeLoc) && (relativeLoc < chartRightBounding) )
  }

  // FIND CLOSEST POINT TO MOUSE
  getCoords(relativeLoc) {
    const {data} = this.props;
    const chartWidth = this.state.svgWidth-yLabelSize*2;

    let svgData = [];
    data.map((point) => {
      svgData.push({
        svgX: this.getSvgX(point.x),
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

    closestPoint.svgY = {
      p: this.getSvgY(closestPoint.y.p),
      m: this.getSvgY(closestPoint.y.m)
    }

    if (this.areCoordsOnChart(relativeLoc)) {
      this.handleChartHover( relativeLoc, closestPoint);
    } else {
      // Pointer is outside of chart
      this.stopHover();
    }

  }
  // STOP HOVER
  stopHover() {
    this.handleChartHover(null, null);
  }

  // Only stop the hover display if mouse is out.
  // Mouse could have left wiithout triggering onMouseLeave
  // (e.g. when scrolling the page)
  stopHoverIfOut() {
    if (!(document.getElementById('chart').querySelector(':hover'))) {
      this.stopHover();
    } else {
      // check again later
      stopHoverTimer = setTimeout(function() { this.stopHoverIfOut(); }.bind(this), stopHoverMilliseconds);
    }
  }

  handleChartHover(hoverLoc, activePoint) {
    let daysPredictionAhead = null;
    if (hoverLoc > 0) {
      daysPredictionAhead = this.getDaysAheadPoint(activePoint);
    }
    this.setState({
      hoverLoc: hoverLoc,
      activePoint: activePoint,
      daysPredictionAhead: daysPredictionAhead
    })
  }



  // horizontal line between hover point price and prediction curve price
  // to visualize how many days price is ahead or behind
  createHoverLineAhead() {
    const {svgHeight, daysPredictionAhead, activePoint} = this.state;

    if (activePoint.y.m === 0 || activePoint.y.p === 0) {
      return (null);
    } else {
      return (
      <g>
        <line
          className={'hoverline_'+this.getAboveOrBelow()}
          x1={activePoint.svgX} y1={activePoint.svgY.p}
          x2={this.getSvgX(activePoint.x+daysPredictionAhead)} y2={activePoint.svgY.p}
          strokeDasharray="9"
        />

        <line
          className={'hoverline'}
          x1={this.getSvgX(activePoint.x+daysPredictionAhead)} y1={activePoint.svgY.p}
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
    const {activePoint} = this.state;

    if (activePoint.y.m === 0 || activePoint.y.p === 0) {
      return (null);
    } else {
      return (
        <line
          className={'hoverline_'+this.getAboveOrBelow()}
          x1={activePoint.svgX} y1={activePoint.svgY.m}
          x2={activePoint.svgX} y2={activePoint.svgY.p}
          strokeDasharray="9"
        />
      )
    }
  }

  // is the price above or below the prediction.
  // css className will color the percentage accordingly
  getAboveOrBelow() {
    const {activePoint} = this.state;

    if (activePoint.y.p>=activePoint.y.m)
    { return ('above'); } else { return 'below' ; }
  }

  // Label Date for HOVER LINE
  makeActiveDate(){
    const {activePoint} = this.state;
    return (this.makeLabelDate(activePoint.x, '_hover'));
  }

  // how many days does it take to reach this price?
  getDaysAfterStart(price) {
    const goalRate = 1+(this.props.growthRate/100);
    const {startPrice} = this.props;
    return Math.ceil(Math.log(price/startPrice)/Math.log(goalRate));
  }

  // How many days between given price point and the prediction curve
  getDaysAhead(price, date) {
    const {startDate} = this.props;
    return this.getDaysAfterStart(price) - (moment(date).diff(startDate, 'days'));
  }

  // How many days between given price point and the prediction curve
  getDaysAheadPoint(pricePoint) {
    return this.getDaysAhead(pricePoint.y.p, pricePoint.d);
  }

  makeHover() {
    const {hoverLoc, activePoint, svgHeight, svgWidth} = this.state;

    return (
          <g id="hoverData">
            <ChartVerticalLine x={hoverLoc} height={svgHeight} />
            <ChartActivePoint activePoint={activePoint} priceType='p' />
            <ChartActivePoint activePoint={activePoint} priceType='m' />
            { (activePoint.y.p) ? <ChartHorizontalLine y={activePoint.svgY.p} width={svgWidth} /> : null }
            { (activePoint.y.m) ? <ChartHorizontalLine y={activePoint.svgY.m} width={svgWidth} /> : null }

            {this.createHoverLineAhead()}
            {this.createHoverLineAbove()}
            {this.makeActiveDate()}
            <ChartLabelPricePair activePoint={activePoint}                           cssExtra='_hover' />
            <ChartLabelPricePair activePoint={activePoint} xPos={svgWidth - yLabelSize} cssExtra='_hover' />
          </g>
         );
  }

  // calculate Y-Boundaries and Ticks for Labeling the Y-Axis
  setScale() {
    const {minY, maxY} = this.boundaries;
    const {svgHeight} = this.state;

    let maxTickSpacing = 2* xLabelSize;
    let maxTicks = Math.min(10,Math.floor(svgHeight /maxTickSpacing));
    let scale = new niceScale(minY, maxY, maxTicks);

    scaleMinY = scale.getNiceLowerBound();
    scaleMaxY = scale.getNiceUpperBound();
    tickSpacing = scale.getTickSpacing();
  }

  render() {
    const {svgHeight, svgWidth, hoverLoc, activePoint, daysPredictionAhead} = this.state;
    this.boundaries = getDataBoundaries(this.props.data);

    this.setScale();
    return (
      <div
        id="chart"
        onMouseLeave= { () => this.stopHover() }
      >
        <div className="popup">
          {hoverLoc ?
            <ToolTip
              hoverLoc={hoverLoc}
              activePoint={activePoint}
              daysPredictionAhead={daysPredictionAhead}
            />
          : null
          }
        </div>

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
      </div>
    );
  }
}
// DEFAULT PROPS
LineChart.defaultProps = {
  data: [],
  scale: 'lin'
}

export default LineChart;

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  scale: PropTypes.oneOf(['lin', 'log']).isRequired,

  // for calculating days ahead and behind
  startPrice: PropTypes.number.isRequired,
  startDate: PropTypes.instanceOf(moment).isRequired,
  growthRate: PropTypes.number.isRequired
}
