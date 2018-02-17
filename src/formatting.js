export function formatDollar(value, decimals) {
  var c = isNaN(decimals) ? 2 : Math.abs(decimals);
  return ( '$\u00A0'+value.toFixed(c).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') );
};

export default formatDollar;
