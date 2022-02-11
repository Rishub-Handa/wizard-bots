import { Interface } from "ethers/lib/utils";

export interface IAuction {
  wizardId: number,
  aId: number,
  startTime: number,
  endTime: number,
  oneOfOne: boolean,
  isWhitelistDay: boolean
}

export interface IBids {
  wizardId: number,
  aId: number,
  sender: string,
  value: number,
  extended: boolean
}


// TODO: these types aren't correct 
export interface ISettledAuction {
  wizardId: number,
  aId: number,
  winner: string,
  amount: number
}