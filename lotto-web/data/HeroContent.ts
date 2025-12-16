import { GoldenChest, Lotto_Balls, Shield } from "../components/Reusable/Images";

interface Content {
  id: number
  title: string
  desc: string
  img: any
  bgColor: string
  variant: 'standard' | 'inverted' | 'floating' | 'noBottom'
}

export const HERO_CONTENTS: Content[] = [
  {
    id: 0,
    title: 'Play with Confidence',
    desc: 'Every agent is verified - your bids are always safe',
    img: Shield,
    bgColor: '#AF0505',
    variant: 'floating',
  },
  {
    id: 1,
    title: 'Transparent & Instant Results',
    desc: 'Every draw is fair, fast, and easy to track.',
    img: Lotto_Balls,
    bgColor: '#FFFFFF',
    variant: 'noBottom',
  },
  {
    id: 2,
    title: 'Bigger Wins, Zero Hassle',
    desc: 'Enjoy seamless payouts and stress-free bidding.',
    img: GoldenChest,
    bgColor: '#FF5959',
    variant: 'floating',
  }
]
