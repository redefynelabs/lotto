
import { Agent, Coins, LottoMachineRed, Pool } from "@/components/Reusable/Images"
import { StaticImageData } from "next/image"

export interface WorkContent {
  title: string
  desc: string
  img: StaticImageData
  bgColor: string
  gridArea: string
  textColor: 'white' | 'black'
}

// Constants
export const WORK_CONTENTS: readonly WorkContent[] = [
  {
    title: 'Contact an Agent',
    desc: 'Contact an authorized agent to place your bids securely and get guidance.',
    img: Agent,
    bgColor: '#C54C4C',
    gridArea: '1 / 1 / 3 / 5',
    textColor: 'white',
  },
  {
    title: 'Choose Your Number',
    desc: 'Select any number between 0 and 32. Each number can receive a total of 80 bids only.',
    img: Pool,
    bgColor: '#FF6B6B',
    gridArea: '3 / 1 / 5 / 3',
    textColor: 'white',
  },
  {
    title: 'Place Your Bids',
    desc: 'You can bid up to 80 times on a single number. Once all 80 bids for a number are taken, no further bids can be placed on it.',
    img: Coins,
    bgColor: '#FFE5E5',
    gridArea: '3 / 3 / 5 / 5',
    textColor: 'black',
  },
  {
    title: 'Wait for the Draw',
    desc: 'When the winning number is drawn, everyone who placed a bid on that number wins.',
    img: LottoMachineRed,
    bgColor: '#8B0000',
    gridArea: '1 / 5 / 5 / 12',
    textColor: 'white',
  }
] as const
