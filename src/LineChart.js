import React, {Component} from "react";
import "./LineChart.css";

const chartRatio = 3;

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverLoc: null,
      activePoint: null,
      svgWidth: window.innerWidth,
      svgHeight: window.innerWidth/chartRatio
    }
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
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

  updateWindowDimensions() {
    this.setState({ svgWidth: window.innerWidth, svgHeight: window.innerWidth/chartRatio });
  }

  // GET X & Y || MAX & MIN
  getX(){
    const {data} = this.props;
    return {
      min: data[0].x,
      max: data[data.length - 1].x
    }
  }
  getP(){
    const {data} = this.props;
    return {
      min: data.reduce((min, p) => p.y < min ? p.y : min, data[0].y),
      max: data.reduce((max, p) => p.y > max ? p.y : max, data[0].y),
      last: data.reduce((last, p) => p.y > 0 ? p.y : last, data[0].y)
    }
  }
  getM(){
    const {data} = this.props;
    return {
      min: data.reduce((min, m) => m.m < min ? m.m : min, data[0].m),
      max: data.reduce((max, m) => m.m > max ? m.m : max, data[0].m)
    }
  }

  getY() {
    return {
      min: this.getM().min,
      max: Math.max(this.getP().max, this.getM().max)
    }
  }


  // GET SVG COORDINATES
  getSvgX(x) {
    const {yLabelSize} = this.props;
    return yLabelSize + (x / this.getX().max * (this.state.svgWidth - 2*yLabelSize));
  }

  getSvgY(y) {
    const {xLabelSize} = this.props;
    const {scale} = this.props;
    const gY = this.getY();

    if (scale === 'lin') {
      return (
              (this.state.svgHeight - 2*xLabelSize) * gY.max
            - (this.state.svgHeight - 2*xLabelSize) * y) / (gY.max - gY.min)
            + xLabelSize;
    } else {
      // scale === 'log'
      return (
              (this.state.svgHeight - 2*xLabelSize) * Math.log(gY.max)
            - (this.state.svgHeight - 2*xLabelSize) * Math.log(y) ) / (Math.log(gY.max) - Math.log(gY.min))
            + xLabelSize;
    }
  }

  // BUILD SVG PATH
  makePath() {
    const {data, color} = this.props;
    let pathD = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].y) + " ";

    pathD += data.map((point, i) => {
      if (point.y>0) {
        return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";
      } else {
        return null;
      }
    }).join("");

    return (
      <path className="linechart_path" d={pathD} style={{stroke: color}} />
    );
  }

  makePathMcAfee() {
    const {data, mcafeecolor} = this.props;
    let pathD = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].m) + " ";

    pathD += data.map((point, i) => {
      return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.m) + " ";
    }).join("");

    return (
      <path className="linechart_path" d={pathD} style={{stroke: mcafeecolor}} />
    );
  }

  // BUILD SHADED AREA
  makeArea() {
    const {data} = this.props;
    let pathD = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].y) + " ";

    pathD += data.map((point, i) => {
      if (point.y > 0) {
        return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";
      } else {
        return "L " + this.getSvgX((point.x)-1) + " " + (this.state.svgHeight - this.props.xLabelSize) + " ";
      }
    }).join("");

    const x = this.getX();
    const y = this.getY();
    pathD += "L " + this.getSvgX(x.max) + " " + this.getSvgY(y.min) + " "
    + "L " + this.getSvgX(x.min) + " " + this.getSvgY(y.min) + " ";

    return <path className="linechart_area" d={pathD} />
  }
  // BUILD GRID AXIS
  makeAxis() {
    const {yLabelSize} = this.props;
    const x = this.getX();
    const y = this.getY();
    const p = this.getP();

    return (
      <g className="linechart_axis">
        <line
          x1={this.getSvgX(x.min) - yLabelSize} y1={this.getSvgY(y.min)}
          x2={this.getSvgX(x.max)} y2={this.getSvgY(y.min)}
          strokeDasharray="5" />
        <line
          x1={this.getSvgX(x.min)} y1={this.getSvgY(p.max)}
          x2={this.getSvgX(x.max)} y2={this.getSvgY(p.max)}
          strokeDasharray="9" />
        <line
          x1={this.getSvgX(x.min)} y1={this.getSvgY(p.last)}
          x2={this.getSvgX(x.max)} y2={this.getSvgY(p.last)}
          strokeDasharray="9" />
      </g>
    );
  }
  makeLabels(){
    const p = this.getP();
    const data = this.props.data;
    const minCount = 0;
    const maxCount = (this.props.data.length - 1);

    return(
      <g className="linechart_label">
        { this.makeLabelPrice(p.max, 'left', 'p') }

        { this.makeLabelPrice(data[minCount]['y'], 'left', 'p') }
        { this.makeLabelPrice(data[minCount]['m'], 'left', 'm') }

        { this.makeLabelPrice(data[maxCount]['y'], 'right', 'p') }
        { this.makeLabelPrice(data[maxCount]['m'], 'right', 'm') }

        { this.makeLabelDate(minCount) }
        { this.makeLabelDate(maxCount) }
      </g>
    )
  }

  // Label on X-Axis (Date)
  makeLabelDate(count) {
    if ((count < this.props.data.length) && (count >= 0)) {
      return(
        <text transform={`translate(${this.getSvgX(this.props.data[count].x-1)},
                                    ${this.state.svgHeight -2})`}
                                    textAnchor="middle">
          { this.props.data[count].d }
        </text>
      );
    } else {
      return null;
    }

  }

  // Label on Y-Axis (Date)
  makeLabelPrice(y, position, pricetype) {
    var xpos = 0;
    var anchor = 'right';
    var className = '';

    if (pricetype === 'm') { className='linechart_label_prediction'; }

    if (position === 'left') {
      xpos = 0;
      anchor = 'left';
    } else {
      xpos = this.getSvgX(this.props.data.length - 1);
      anchor = 'left';
    }

    if (y > 0) {
      return(
        <text transform={`translate(${xpos},
                                    ${this.getSvgY(y)})`}
                                    textAnchor={anchor}
                                    className={className} >

          {y.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' })}
        </text>
      );
    } else {
      return '';
    }
  }

  // FIND CLOSEST POINT TO MOUSE
  getCoords(e){
    const {data, yLabelSize} = this.props;
    const svgLocation = document.getElementsByClassName("linechart")[0].getBoundingClientRect();
    const chartMarginLeft = yLabelSize;
    const chartMarginRight = yLabelSize;
    const chartWidth = svgLocation.width-chartMarginLeft-chartMarginRight;
    const chartRightBounding = svgLocation.width-chartMarginRight;
    const relativeLoc = e.pageX;

    let svgData = [];
    data.map((point, i) => {
      svgData.push({
        svgX: this.getSvgX(point.x),
        svgY: this.getSvgY(point.y),
        x: point.x,
        y: point.y,
        d: point.d,
        p: point.p,
        m: point.m
      });
      return null;
    });

    var resolution = (chartWidth/svgData.length) // Optimize within this range. Just for speed.

    let closestPoint = {};
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
    if (this.state.activePoint.y>0) {
      return (
        <circle
          className='linechart_point'
          style={{stroke: color}}
          r={pointRadius}
          cx={this.state.activePoint.svgX}
          cy={this.state.activePoint.svgY}
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
    var param = 'm';
    if (pricetype === 'p') { param = 'y'; }
    if (this.state.activePoint[param] === 0)
    { return (null); }
    var svgY = this.getSvgY(this.state.activePoint[param]);

    return (
      <line className='hoverLine'
        x1={yLabelSize}                       y1={svgY}
        x2={this.state.svgWidth - yLabelSize} y2={svgY} />
    )
  }

  // MAKE HOVER LINE
  makeActiveDate(){
    return (this.makeLabelDate(this.state.activePoint.x));
  }

  makeActiveLabelPrice(pricetype, position){
    var param = 'm';
    if (pricetype === 'p') { param = 'y'; }

    return ( this.makeLabelPrice(this.state.activePoint[param], position, pricetype) );
  }

  render() {
    return (
      <svg  width={this.state.svgWidth} height={this.state.svgHeight} viewBox={`0 0 ${this.state.svgWidth} ${this.state.svgHeight}`} className={'linechart'}
            onMouseLeave= { () => this.stopHover() }
            onMouseMove = { (e) => this.getCoords(e) }
            onTouchMove = { (e) => this.getCoords(e) }
            onTouchStart= { (e) => this.getCoords(e) }
            onMouseDown = { (e) => this.getCoords(e) } >

        <g>
          {this.makeAxis()}
          {this.makePath()}
          {this.makePathMcAfee()}
          {this.makeArea()}
          {this.makeLabels()}
          {this.state.hoverLoc ? this.createLine() : null}
          {this.state.hoverLoc ? this.makeActivePoint() : null}
          {this.state.hoverLoc ? this.makeActiveDate() : null}

          {this.state.hoverLoc ? this.createHorizontalLine('p') : null}
          {this.state.hoverLoc ? this.createHorizontalLine('m') : null}

          {this.state.hoverLoc ? this.makeActiveLabelPrice('p', 'left') : null}
          {this.state.hoverLoc ? this.makeActiveLabelPrice('m', 'left') : null}

          {this.state.hoverLoc ? this.makeActiveLabelPrice('p', 'right') : null}
          {this.state.hoverLoc ? this.makeActiveLabelPrice('m', 'right') : null}

        </g>
      </svg>
    );
  }
}
// DEFAULT PROPS
LineChart.defaultProps = {
  data: [],
  color: '#2196F3',
  mcafeecolor: '#FF0000',
  pointRadius: 5,
  xLabelSize: 20,
  yLabelSize: 80
}

export default LineChart;
