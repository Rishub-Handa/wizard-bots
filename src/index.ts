import { getAuctionClosingPriceMessage, getAuctionEndingMessage, getNewAuctionMsg, getNewBidMsg } from './messages';
import { getAuctionInfo, getClosingPrices } from './auctionHouseSubscriber';
import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import TwitterApi from 'twitter-api-v2';

dotenv.config();

// const twitterClient = new TwitterApi({
//   appKey: process.env.TWITTER_API_KEY || '',
//   appSecret: process.env.TWITTER_API_SECRET || '',
//   accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
//   accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
// })

const MILLISECONDS_IN_23_HOURS = (23 * 60 * 60 * 1000);
const CACHE_PATH = path.resolve(__dirname, "../store/cache.json")
const BID_DIFFERENCE_THRESHOLD = .2; // 20 percent
var botTickInterval = 300000; // 5 minutes
// async function tweet() {
//   const tweet = await twitterClient.v1.tweet('messing with twtr api');
//   console.log("tweet: ", tweet.id_str, tweet.full_text);
//   const deletedTweet = await twitterClient.v1.deleteTweet(tweet.id_str);
//   console.log('Deleted tweet', deletedTweet.id_str, ':', deletedTweet.full_text);
// }



async function botTick() {
  console.log("bot awakens")

  let cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));

  const { minutesLeft, newWizardIds, newBids } = await getAuctionInfo();
  console.log("minutesLeft: ", minutesLeft);
  console.log("wizardIds: ", newWizardIds);
  console.log("bids: ", newBids);

  
  // Make sure this tweet hasn't already been sent for this auction (> 23hrs ago)
  const timeSinceLastAuctionEndingTweet = (new Date()).getTime() - cache.lastTimeSentAuctionEndingSoon;
  console.log("time since last auction ending tweet", timeSinceLastAuctionEndingTweet);


  // by default the bot should run every 5 minutes
  botTickInterval = 300000;
  if (minutesLeft <= 15 && timeSinceLastAuctionEndingTweet > MILLISECONDS_IN_23_HOURS) {
    console.log('Tweeting auction ending soon');
    // DEV: uncomment 
    console.log(await getAuctionEndingMessage());
    // await twitterClient.v1.tweet(getAuctionEndingMessage());

    // Update the last time this tweet was sent 
    cache.lastTimeSentAuctionEndingSoon = (new Date()).getTime();
    console.log(cache);

    // speed up the bot to run every 30 seconds
    botTickInterval = 30000;
  }

  // If the wizardIds are different than what's in the cache, send out closing price tweet and start a new auction tweet
  if (JSON.stringify(newWizardIds.sort()) !== JSON.stringify(cache.wizardIds.sort())) {
    console.log("new auction has started. sending out closing prices tweet and sending out new auction tweet");

    const { bidAmounts, oldWizardIds } = await getClosingPrices();
    console.log("closing prices: ", bidAmounts);
    console.log("settled wizards: ", oldWizardIds); 
    const auctionNumber = ((oldWizardIds[0]-1)/6) + 1; 
    console.log("auction number: ", auctionNumber); 

    const closingPricesMsg = getAuctionClosingPriceMessage(auctionNumber, oldWizardIds[0], bidAmounts);

    // If no closing prices tweet ID, tweet the message directly 
    // NOTE: I feel like this isn't break-proof. If we have to tweet it manually once, it will break the thread since the bot will reply to the previous tweet 
    if(cache.closingPricesTweetID === "") {
      // Save tweet ID
      console.log("creating tweet thread"); 
      // DEV: uncomment 
      console.log(closingPricesMsg);
      // const closingPricesTweet = await twitterClient.v1.tweet(closingPricesMsg);
      // cache.closingPricesTweetID = closingPricesTweet.id_str; 
    } else {
      console.log("replying to tweet thread"); 
      // Otherwise reply to existing message and save tweet ID 
      // DEV: uncomment
      console.log(closingPricesMsg);
      // const closingPricesTweet = await twitterClient.v1.reply(closingPricesMsg, cache.closingPricesTweetID);
      // cache.closingPricesTweetID = closingPricesTweet.id_str; 
    }

    cache.lastTimeSentClosingPrices = (new Date()).getTime();
    cache.wizardIds = newWizardIds;

    // New Auction Tweet
    const newAuctionMsg = getNewAuctionMsg(auctionNumber, cache.wizardIds);
    // DEV: uncomment
    console.log(newAuctionMsg);
    // const newAuctionTweet = await twitterClient.v1.tweet(newAuctionMsg);
    // Save tweet ID so thread
    // cache.newAuctionTweetID = newAuctionMsg.id_str;
    // save 0s for all the new bids
    cache.bids = newWizardIds.map(bid => 0);
  }

  // If the bids are different than what's in the cache, send out a new bid tweet
  if (cache.newAuctionTweetID !== "") {
    for (let i = 0; i < newWizardIds.length; i++) {
        // if our bid is different than the cached bid by more than 20 percent, tweet it
        if (Math.abs(newBids[i] - cache.bids[i]) > (newBids[i] * BID_DIFFERENCE_THRESHOLD)) {
          const newBidMsg = getNewBidMsg(newWizardIds[i], newBids[i]);
          // DEV: uncomment
          console.log(newBidMsg);
          // const newBidTweet = await twitterClient.v1.reply(newBidMsg, cache.newAuctionTweetID);
          cache.bids[i] = newBids[i];

          // update the new tweet id to make thread
          // cache.newAuctionTweetID = newBidTweet.id_str;
        }
    }
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));

}

// DEV: uncomment 
(async function repeat() {
  botTick();
  setTimeout(repeat, botTickInterval);
})();
