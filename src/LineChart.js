import React, {Component} from "react";
import "./LineChart.css";
import formatDollar from './formatting.js';

const chartRatio = 3;
let stopHoverTimer;

const stopHoverMilliseconds = 2000;
class LineChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverLoc: null,
      activePoint: null,
      svgWidth: window.innerWidth,
      svgHeight: window.innerWidth/chartRatio
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
    this.setState({ svgWidth: window.innerWidth, svgHeight: window.innerWidth/chartRatio });
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
    const {minX, maxX, firstPoint, lastPoint, maxPoint} = this.props.boundaries;

    return(
      <g className="linechart_label">
        { (maxPoint.p === 0) ? null : this.makeLabelPrice(maxPoint.p.y.p, 'left', 'p') }

        { (typeof(firstPoint.p) === 'undefined') ? null : this.makeLabelPrice(firstPoint.p.y.p, 'left', 'p') }
        { (typeof(firstPoint.m) === 'undefined') ? null : this.makeLabelPrice(firstPoint.m.y.m, 'left', 'm') }

        { (typeof(lastPoint.p.y) === 'undefined') ? null : this.makeLabelPrice(lastPoint.p.y.p, 'right', 'p') }
        { (typeof(lastPoint.m.y) === 'undefined') ? null : this.makeLabelPrice(lastPoint.m.y.m, 'right', 'm') }

        { this.makeLabelDate(minX) }
        { this.makeLabelDate(maxX-1) }
      </g>
    )
  }

  // Label on X-Axis (Date)
  makeLabelDate(count) {
    const {data, xLabelSize, yLabelSize} = this.props;
    const {svgHeight} = this.state;
    if ((count < data.length) && (count >= 0)) {
      return(
        <g>
          <rect x={this.getSvgX(data[count].x)-yLabelSize/2}
                y={svgHeight-xLabelSize+5}
                height={xLabelSize}
                width={yLabelSize}
                className='linechart_label_x'
                />
          <text transform={`translate(${this.getSvgX(data[count].x)},
                                      ${svgHeight -2})`}
                                      textAnchor="middle">
            { data[count].d }
          </text>
        </g>
      );
    } else {
      return null;
    }
  }

  // Label on Y-Axis (Date)
  makeLabelPrice(y, position, pricetype) {
    const {xLabelSize, yLabelSize} = this.props;
    const {maxX} = this.props.boundaries;
    var xpos = 0;

    if (position === 'right') {
      xpos = this.getSvgX(maxX);
    }

    if (y > 0) {
      return(
        <g>
          <rect x={xpos}
                y={this.getSvgY(y)-xLabelSize+5}
                height={xLabelSize}
                width={yLabelSize}
                className={'linechart_label_' + pricetype}
                />
          <text transform={`translate(${xpos},
                                      ${this.getSvgY(y)})`}
                                      fill="red"
                                      className={'linechart_label_' + pricetype} >
            {formatDollar(y)}
          </text>
        </g>
      );
    } else {
      return '';
    }
  }

  getTouchCoords(e) {
    e.preventDefault();
    clearTimeout(stopHoverTimer);
    stopHoverTimer = setTimeout(function() { this.stopHover(); }.bind(this), stopHoverMilliseconds);
    this.getCoords(e.touches[0].pageX);
  }

  getMouseCoords(e) {
    this.getCoords(e.pageX);
  }

  // FIND CLOSEST POINT TO MOUSE
  getCoords(relativeLoc) {
    const {data, yLabelSize} = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();
    const chartMarginLeft = yLabelSize;
    const chartMarginRight = yLabelSize;
    const chartWidth = svgLocation.width-chartMarginLeft-chartMarginRight;
    const chartRightBounding = svgLocation.width-chartMarginRight;

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

    if ( (chartMarginLeft < relativeLoc) && (relativeLoc < chartRightBounding) ) {
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
      <line className='hoverLine'
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
      <line className='hoverLine'
        x1={yLabelSize}            y1={svgY}
        x2={svgWidth - yLabelSize} y2={svgY} />
    )
  }

  // MAKE HOVER LINE
  makeActiveDate(){
    return (this.makeLabelDate(this.state.activePoint.x));
  }

  makeActiveLabelPrice(pricetype, position){
    return ( this.makeLabelPrice(this.state.activePoint.y[pricetype], position, pricetype) );
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
      <svg  width={this.state.svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className={'linechart'}
            onMouseLeave= { () => this.stopHover() }
            onMouseMove = { (e) => this.getMouseCoords(e) }
            onTouchMove = { (e) => this.getTouchCoords(e) }
            onTouchStart= { (e) => this.getTouchCoords(e) }
            onMouseDown = { (e) => this.getMouseCoords(e) } >

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
  xLabelSize: 20,
  yLabelSize: 80
}

export default LineChart;
