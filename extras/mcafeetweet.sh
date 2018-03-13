#!/bin/bash

# One day later than tweetDate because we want yesterdays price
LC_NUMERIC="en_US.UTF-8" 
predictedprice=$(echo "scale=2; 1.0048409570343102^"$(( ($(date +%s) - $(date --date="2017-07-18" +%s) )/(60*60*24) ))"*224426.5/100" | bc)
closingprice=$(printf %.2f $(curl -s https://api.coindesk.com/v1/bpi/historical/close.json?for=yesterday | jq '.bpi' | jq '.[] | tonumber'))
percentage=$(printf %.2f $(echo "scale=4; $float($closingprice / $predictedprice -1)*100" | bc -l))
# No idea why this is negated.
if ($(echo $predictedprice > $closingprice | bc -l));
then
  aheadorbehind='ahead';
else
  aheadorbehind='behind';
fi;

predictedprice_formatted=$(printf "%'.2f" $predictedprice)
closingprice_formatted=$(printf "%'.2f" $closingprice)

tweettext=$(echo 'The McAfee-Curve was $' $predictedprice_formatted 'at midnight UTC. #bitcoin closing price was $' $closingprice_formatted ' ('$percentage '%' $aheadorbehind'). See the chart and learn more on https://fnordprefekt.de')

/home/jan/.rbenv/shims/t update "$tweettext"

echo $tweettext
