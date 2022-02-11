const emoji = require("node-emoji");

export const getAuctionEndingMessage = () =>
  "The auction is ending soon! Get your bid in at https://wizardsdao.com";

const wizardEmoji = emoji.get("male_mage");
export const getAuctionClosingPriceMessage = (
  auctionNumber: number,
  wizStartId: number,
  bids: number[]
) =>
  `AUCTION ${auctionNumber} FINAL RESULTS
  
  ${wizardEmoji} #${wizStartId}: ${bids[0]} ETH
  ${wizardEmoji} #${wizStartId + 1}: ${bids[1]} ETH
  ${wizardEmoji} #${wizStartId + 2}: ${bids[2]} ETH
  ${wizardEmoji} #${wizStartId + 3}: ${bids[3]} ETH
  ${wizardEmoji} #${wizStartId + 4}: ${bids[4]} ETH
  `;

export const getNewAuctionMsg = (
  auctionNumber: number,
  wizStartIds: number[]
) =>
  `A auction #${auctionNumber} has started!\n\nWizards for bids are:\n\n` +
  wizStartIds.map((wizId) => `  ${wizardEmoji} #${wizId}`).join("\n") +
  `\n\nGet your bids in at https://wizardsdao.com`;

export const getNewBidMsg = (wizardId: number, bid: number) =>
  `${wizardEmoji} #${wizardId} has gotten a bid ${bid} ETH!`;
