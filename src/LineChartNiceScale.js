// http://codegists.com/snippet/javascript/nice-scalejs_igodorogea_javascript
export default function niceScale (lowerBound, upperBound, _maxTicks) {

  var maxTicks = _maxTicks || 10;
  var tickSpacing;
  var range;
  var niceLowerBound;
  var niceUpperBound;

  calculate();

  this.setMaxTicks = function (_maxTicks) {
    maxTicks = _maxTicks;
    calculate();
  };

  this.getNiceUpperBound = function() {
    return niceUpperBound;
  };

  this.getNiceLowerBound = function() {
    return niceLowerBound;
  };

  this.getTickSpacing = function() {
    return tickSpacing;
  };

  /*
  function setMinMaxPoints (min, max) {
    lowerBound = min;
    upperBound = max;
    calculate();
  }
  */

  function calculate () {
    range = niceNum(upperBound - lowerBound, false);
    tickSpacing = niceNum(range / (maxTicks - 1), true);
    niceLowerBound = Math.floor(lowerBound / tickSpacing) * tickSpacing;
    niceUpperBound = Math.ceil(upperBound / tickSpacing) * tickSpacing;
  }

  function niceNum (range, round) {
    var exponent = Math.floor(Math.log10(range));
    var fraction = range / Math.pow(10, exponent);
    var niceFraction;

    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
  }
}
