import { getAuctionClosingPriceMessage, getAuctionEndingMessage } from './messages';
import { getAuctionInfo, getClosingPrices } from './auctionHouseSubscriber';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import TwitterApi from 'twitter-api-v2';

dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || '',
  appSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
})

const MILLISECONDS_IN_23_HOURS = (23 * 60 * 60 * 1000);
const CACHE_PATH = path.resolve(__dirname, "../store/cache.json")

// async function tweet() {
//   const tweet = await twitterClient.v1.tweet('messing with twtr api');
//   console.log("tweet: ", tweet.id_str, tweet.full_text);
//   const deletedTweet = await twitterClient.v1.deleteTweet(tweet.id_str);
//   console.log('Deleted tweet', deletedTweet.id_str, ':', deletedTweet.full_text);
// }



async function botTick() {
  console.log("bot awakens")

  let cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));

  const { minutesLeft, wizardIds } = await getAuctionInfo();
  console.log("minutesLeft: ", minutesLeft);
  console.log("wizardIds: ", wizardIds);

  // Make sure this tweet hasn't already been sent for this auction (> 23hrs ago)
  const timeSinceLastAuctionEndingTweet = (new Date()).getTime() - cache.lastTimeSentAuctionEndingSoon;
  console.log("time since last auction ending tweet", timeSinceLastAuctionEndingTweet);

  if (minutesLeft <= 15 && timeSinceLastAuctionEndingTweet > MILLISECONDS_IN_23_HOURS) {
    console.log('Tweeting auction ending soon');
    // DEV: uncomment 
    twitterClient.v1.tweet(getAuctionEndingMessage());

    // Update the last time this tweet was sent 
    cache.lastTimeSentAuctionEndingSoon = (new Date()).getTime();
    console.log(cache);
  }

  // If the wizardIds are different than what's in the cache, send out closing price tweet 
  if (JSON.stringify(wizardIds.sort()) !== JSON.stringify(cache.wizardIds.sort())) {
    console.log("new auction has started. sending out closing prices tweet");

    const closingPrices = await getClosingPrices();
    console.log("closing prices: ", closingPrices);
    const closingPricesMsg = getAuctionClosingPriceMessage(wizardIds[0], closingPrices);

    // DEV: uncomment 
    twitterClient.v1.tweet(getAuctionEndingMessage());
    cache.lastTimeSentClosingPrices = (new Date()).getTime();
    cache.wizardIds = wizardIds;
  }


  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));

}

// botTick();

// DEV: uncomment 
setInterval(async () => botTick(), 3000);
