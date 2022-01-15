const emoji = require('node-emoji')

export const getAuctionEndingMessage = () =>
  "The auction is ending soon! Get your bid in at https://wizardsdao.com";

const wizardEmoji = emoji.get('mage')
export const getAuctionClosingPriceMessage = (wizStartId: number, p1: number, p2: number, p3: number, p4: number, p5: number) =>
  `AUCTION FINAL RESULTS
  
  ${wizardEmoji} #${wizStartId}: ${p1} ETH
  ${wizardEmoji} #${wizStartId + 1}: ${p2} ETH
  ${wizardEmoji} #${wizStartId + 2}: ${p3} ETH
  ${wizardEmoji} #${wizStartId + 3}: ${p4} ETH
  ${wizardEmoji} #${wizStartId + 4}: ${p5} ETH
  `