import React, {Component} from "react";
import "./LineChart.css";

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverLoc: null,
      activePoint: null,
      svgWidth: window.innerWidth
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
    this.setState({ svgWidth: window.innerWidth, svgHeight: window.innerWidth/3 });
  }

  // GET X & Y || MAX & MIN
  getX(){
    const {data} = this.props;
    return {
      min: data[0].x,
      max: data[data.length - 1].x
    }
  }
  getY(){
    const {data} = this.props;
    return {
      min: 0,
      max: Math.max(data.reduce((max, p) => p.y > max ? p.y : max, data[0].y), data.reduce((max, m) => m.m > max ? m.m : max, data[0].m))
    }
  }

  // GET SVG COORDINATES
  getSvgX(x) {
    const {yLabelSize} = this.props;
    return yLabelSize + (x / this.getX().max * (this.state.svgWidth - 2*yLabelSize));
  }
  getSvgY(y) {
    const {xLabelSize} = this.props;
    const gY = this.getY();
    return ((this.state.svgHeight - xLabelSize) * gY.max - (this.state.svgHeight - xLabelSize) * y) / (gY.max - gY.min);
  }
  // BUILD SVG PATH
  makePath() {
    const {data, color} = this.props;
    let pathD = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].y) + " ";

    pathD += data.map((point, i) => {
      if (point.y>0) {return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";}
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
      return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";
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

    return (
      <g className="linechart_axis">
        <line
          x1={this.getSvgX(x.min) - yLabelSize} y1={this.getSvgY(y.min)}
          x2={this.getSvgX(x.max)} y2={this.getSvgY(y.min)}
          strokeDasharray="5" />
        <line
          x1={this.getSvgX(x.min) - yLabelSize} y1={this.getSvgY(y.max)}
          x2={this.getSvgX(x.max)} y2={this.getSvgY(y.max)}
          strokeDasharray="5" />
      </g>
    );
  }
  makeLabels(){
    const {xLabelSize, yLabelSize} = this.props;
    const padding = 5;
    return(
      <g className="linechart_label">
        {/* Y AXIS LABELS left*/}
        <text transform={`translate(${yLabelSize/2}, 20)`} textAnchor="middle">
          {this.getY().max.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' })}
        </text>
        <text transform={`translate(${yLabelSize/2}, ${this.getSvgY(this.props.data[0].y)}) `} textAnchor="middle">
          {this.props.data[0].p}
        </text>
        {/* Y AXIS LABELS right*/}
        <text transform={`translate(${this.getSvgX(this.props.data[this.props.data.length - 1].x)+yLabelSize/2},
                                    ${this.getSvgY(this.props.data[this.props.data.length - 1].y)})`} textAnchor="middle">
          {this.props.data[this.props.data.length - 1].p}
        </text>
        <text transform={`translate(${this.getSvgX(this.props.data[this.props.data.length - 1].x)+yLabelSize/2},
                                    ${this.getSvgY(this.props.data[this.props.data.length - 1].m)+xLabelSize/4 })`}
                                    fill="red" textAnchor="middle">
          {this.props.data[this.props.data.length - 1].m.toLocaleString('us-EN',{ style: 'currency', currency: 'USD' })}
        </text>
        {/* X AXIS LABELS */}
        <text transform={`translate(${yLabelSize/2}, ${this.state.svgHeight})`} textAnchor="start">
          { this.props.data[0].d }
        </text>
        <text transform={`translate(${this.state.svgWidth-yLabelSize/2}, ${this.state.svgHeight})`} textAnchor="end">
          { this.props.data[this.props.data.length - 1].d }
        </text>
      </g>
    )
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
