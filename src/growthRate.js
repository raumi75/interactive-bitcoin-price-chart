export default function getGrowthRate(startPrice, targetPrice, growthPeriods) {
  let estGrowthRate = estimateGrowthRate(startPrice, targetPrice, growthPeriods);
  return findExactGrowthRate(startPrice, targetPrice, estGrowthRate, growthPeriods);
}

// though mathematically correct, the result is usually not precise
// because javascript does not use big enough numbers, internally
function estimateGrowthRate(startPrice, targetPrice, growthPeriods) {
  return (Math.log(targetPrice)-Math.log(startPrice))/growthPeriods;
}

// recursion to find the exact growthRate (within MaxDeviation)
function findExactGrowthRate(startPrice, targetPrice, growthRate, growthPeriods) {
  const maxDeviationAbsolute = 0.003; // error range 0.3 Cents
  let calcTargetPrice = Math.pow(1+growthRate, growthPeriods)*startPrice;
  let deviationAbsolute = calcTargetPrice-targetPrice;
  let deviationRelative = calcTargetPrice/targetPrice;
  if (Math.abs(deviationAbsolute) < maxDeviationAbsolute) {
    return growthRate;
  } else {
    return (findExactGrowthRate(startPrice, targetPrice, growthRate+(1-deviationRelative)/growthPeriods, growthPeriods));
  }
}
