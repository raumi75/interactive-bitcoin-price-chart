export default function getDataBoundaries(data) {

  let getFirstPoint = function(data, pricetype) {
    return data.find( function (v) { return v.y[pricetype] > 0; })
  };

  let getMaxPoint = function(data, pricetype) {
    if (typeof(getFirstPoint(data, pricetype)) === 'undefined') {
      return 0;
    } else {
      return data.reduce((max,  d) => d.y[pricetype] > max.y[pricetype] ? d : max,  getFirstPoint(data, pricetype) );
    }
  };

  let getMinPoint = function(data, pricetype) {
    if (getMaxPoint(data, pricetype) === 0) {
      return 0;
    } else {
      return data.reduce((min,  d) => d.y[pricetype] < min.y[pricetype] ? d : min,  getMaxPoint(data, pricetype) );
    }
  };

  let getLastPoint= function(data, pricetype) {
    return data.reduce((last, d) => d.y[pricetype] > 0   ? d : last, getMaxPoint(data, pricetype) )
  };

  let getFirstPoints = function(data) {
    return {
      p: getFirstPoint(data, 'p'),
      m: getFirstPoint(data, 'm'),
    };
  };

  let getLastPoints = function(data) {
    return {
      p: getLastPoint(data, 'p'),
      m: getLastPoint(data, 'm')
    };
  };

  let getMaxPoints = function(data) {
    return {
      p: getMaxPoint(data, 'p'),
      m: getMaxPoint(data, 'm')
    };
  };

  let getMinPoints = function(data) {
    return {
      p: getMinPoint(data, 'p'),
      m: getMinPoint(data, 'm')
    };
  };

  let firstPoints = getFirstPoints(data);
  let lastPoints  = getLastPoints(data);
  let minPoints   = getMinPoints(data);
  let maxPoints   = getMaxPoints(data);

  let getMinX = function(data) {
    return 0;
  };

  let getMaxX = function(data) {
    return data.length-1;
  };

  let getMaxY = function() {
    if (maxPoints.m === 0) {
      return maxPoints.p.y.p;
    }
    if (maxPoints.p === 0) {
      return maxPoints.m.y.m;
    }
    return Math.max(maxPoints.p.y.p, maxPoints.m.y.m);
  };

  let getMinY = function(data) {
    var yMins = [];
    yMins = data.map((d) => {
      if (d.y.p === 0) {
        return d.y.m;
      } else if (d.y.m === 0) {
        return d.y.p;
      } else {
        return Math.min (d.y.p, d.y.m);
      }
    });

    return yMins.reduce((min,  y) =>
    (y > 0 && y < min) ? y : min
    ,  1000000 );

  };

  let minX = getMinX(data);
  let maxX = getMaxX(data);

  return {
    firstPoint: firstPoints,
    firstPrices: {
      p: ((typeof(firstPoints.p) === 'undefined') ? 0 : firstPoints.p.y.p),
      m: ((typeof(firstPoints.m) === 'undefined') ? 0 : firstPoints.m.y.m)
    },
    lastPoint:  lastPoints,
    lastPrices: {
      p: ((typeof(lastPoints.p.y) === 'undefined') ? 0 : lastPoints.p.y.p),
      m: ((typeof(lastPoints.m.y) === 'undefined') ? 0 : lastPoints.m.y.m)
    },
    minDate:  data[0].d,
    maxDate:   data[maxX].d,
    minPoint:   minPoints,
    maxPoint:   maxPoints,
    minX:       minX,
    maxX:       maxX,
    maxY:       getMaxY(data),
    minY:       getMinY(data),
  }
}
