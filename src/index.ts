import { getAuctionClosingPriceMessage, getAuctionEndingMessage } from './messages'
import dotenv from 'dotenv';

async function botTick() {
  console.log("bot awakens")

  console.log(getAuctionClosingPriceMessage(1, 2, 3.5, 5, 3, 5));

}


// setInterval(async () => botTick(), 3000);
