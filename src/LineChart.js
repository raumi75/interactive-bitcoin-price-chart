import React, {Component} from "react";
import "./LineChart.css";

const chartRatio = 3

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
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
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
      max: data.reduce((max, p) => p.y > max ? p.y : max, data[0].y)
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
      return ((this.state.svgHeight - xLabelSize) * gY.max
            - (this.state.svgHeight - xLabelSize) * y) / (gY.max - gY.min);
    } else {
      // scale === 'log'
      return ((this.state.svgHeight - xLabelSize) * Math.log(gY.max)
            - (this.state.svgHeight - xLabelSize) * Math.log(y) ) / (Math.log(gY.max) - Math.log(gY.min));
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
        return "L " + this.getSvgX(data[i-1].x) + " " + (this.state.svgHeight - this.props.xLabelSize) + " ";
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
      </g>
    );
  }
  makeLabels(){
    const p = this.getP();

    const {xLabelSize, yLabelSize} = this.props;
    return(
      <g className="linechart_label">
        {/* Highest price */}
        <text transform={`translate(0, ${this.getSvgY(p.max)+xLabelSize/4})`} textAnchor="left">
          {p.max.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' })}
        </text>

        { this.makeLabelPrice(0, 'left', 'p') }

        { this.makeLabelPrice(this.props.data.length - 1, 'right', 'p') }
        { this.makeLabelPrice(this.props.data.length - 1, 'right', 'm') }

        { this.makeLabelDate(0) }
        { this.makeLabelDate(this.props.data.length - 1) }
      </g>
    )
  }

  // Label on X-Axis (Date)
  makeLabelDate(count) {
    const {yLabelSize} = this.props;

    return(
      <text transform={`translate(${this.getSvgX(this.props.data[count].x)},
                                  ${this.state.svgHeight})`}
                                  textAnchor="middle">
        { this.props.data[count].d }
      </text>
    );
  }

  // Label on Y-Axis (Date)
  makeLabelPrice(count, position, pricetype) {
    const {xLabelSize, yLabelSize} = this.props;

    var xpos = 0;
    var y = 0;
    var anchor = 'right';
    var className = '';

    if (pricetype === 'p') { pricetype = 'y'; }

    if (pricetype === 'm') { className='linechart_label_prediction'; }

    y = this.props.data[count][pricetype];

    if (position === 'left') {
      xpos = 0;
      anchor = 'left';
    } else {
      xpos = this.getSvgX(this.props.data[this.props.data.length - 1].x);
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
    const adjustment = (svgLocation.width - this.state.svgWidth) / 2; //takes padding into consideration
    const relativeLoc = e.clientX - svgLocation.left - adjustment;

    let svgData = [];
    data.map((point, i) => {
      svgData.push({
        svgX: this.getSvgX(point.x),
        svgY: this.getSvgY(point.y),
        y: point.y,
        d: point.d,
        p: point.p,
        m: point.m
      });
      return null;
    });

    let closestPoint = {};
    for(let i = 0, c = 500; i < svgData.length; i++){
      if ( Math.abs(svgData[i].svgX - this.state.hoverLoc) <= c ){
        c = Math.abs(svgData[i].svgX - this.state.hoverLoc);
        closestPoint = svgData[i];
      }
    }

    if(relativeLoc - yLabelSize < 0){
      this.stopHover();
    } else {
      this.setState({
        hoverLoc: relativeLoc,
        activePoint: closestPoint
      })
      this.props.onChartHover(relativeLoc, closestPoint);
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
    return (
      <circle
        className='linechart_point'
        style={{stroke: color}}
        r={pointRadius}
        cx={this.state.activePoint.svgX}
        cy={this.state.activePoint.svgY}
      />
    );
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

  render() {
    return (
      <svg  width={this.state.svgWidth} height={this.state.svgHeight} viewBox={`0 0 ${this.state.svgWidth} ${this.state.svgHeight}`} className={'linechart'}
            onMouseLeave={ () => this.stopHover() }
            onMouseMove={ (e) => this.getCoords(e) } >

        <g>
          {this.makeAxis()}
          {this.makePath()}
          {this.makePathMcAfee()}
          {this.makeArea()}
          {this.makeLabels()}
          {this.state.hoverLoc ? this.createLine() : null}
          {this.state.hoverLoc ? this.makeActivePoint() : null}
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
