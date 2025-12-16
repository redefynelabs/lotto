import { GoldenBalls, GoldenChest, LottoMachine } from "../components/Reusable/Images";

interface Content {
  id: number
  title: string
  desc: string
  img: any
  bgColor: string
  variant: 'standard' | 'inverted' | 'floating'
}

export const JACKPOT_CONTENTS: Content[] = [
  {
    id: 0,
    title: 'Choose your 6 Numbers',
    desc: 'Contact agent and choose your six numbers out of 0 - 32',
    img: GoldenBalls,
    bgColor: '#AF0505',
    variant: 'standard',
  },
  {
    id: 1,
    title: 'Place your Bid',
    desc: 'Confirm the bid and wait for result',
    img: LottoMachine,
    bgColor: '#FFFFFF',
    variant: 'inverted',
  },
  {
    id: 2,
    title: 'Win Jackpot and enjoy',
    desc: 'Have a chance to win the jackpot prize',
    img: GoldenChest,
    bgColor: '#FF5959',
    variant: 'floating',
  }
]
