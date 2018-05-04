#!/bin/bash

# One day later than tweetDate because we want yesterdays price
LC_NUMERIC="en_US.UTF-8"
predictedprice=$(echo "scale=2; 1.00484095526^"$(( ($(date +%s) - $(date --date="2017-07-18" +%s) )/(60*60*24) ))"*224427/100" | bc)

closingprice=$(printf %.2f $(curl -s https://api.coindesk.com/v1/bpi/historical/close.json?for=yesterday | jq '.bpi' | jq '.[] | tonumber'))
percentage=$(printf %.2f $(echo "scale=4; $float($closingprice / $predictedprice -1)*100" | bc -l))
# No idea why this is negated.
if (( $(echo "$predictedprice < $closingprice" | bc -l) ));
  then aboveorbelow='above';
  else aboveorbelow='below';
fi;

predictedprice_formatted=$(printf "%'.2f" $predictedprice)
closingprice_formatted=$(printf "%'.2f" $closingprice)

tweettext=$(echo "Daily update: McAfee #dickline was $" $predictedprice_formatted 'at midnight UTC while #bitcoin price was $' $closingprice_formatted ' ('${percentage#-}'%' $aboveorbelow'). See the chart and learn more on https://dickline.info $btc')

/home/jan/.rbenv/shims/t update "$tweettext"

echo $tweettext
