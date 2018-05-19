const FQDN = 'https://fnordprefekt.de';

export const getUrl = function(growthRate, startDate, targetDate, startPrice) {
  return FQDN + '?percent=' + growthRate + '&startdate=' + startDate + '&targetdate=' + targetDate + '&startprice=' + startPrice;
}

export const getUrlDraper = function() {
  return getUrl(0.200779493, '2018-04-13', '2022-12-31', 7889.23);
}

export const getUrlMcAfee = function() {
  return FQDN;
}
