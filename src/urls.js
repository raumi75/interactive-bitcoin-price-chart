const FQDN = 'https://fnordprefekt.de';

export const getUrl = function(growthRate, startDate, targetDate, startPrice) {
  return FQDN + '?percent=' + growthRate + '&startdate=' + startDate + '&targetdate=' + targetDate + '&startprice=' + startPrice;
}

export const getUrlMcAfee = function() {
  return FQDN;
}
