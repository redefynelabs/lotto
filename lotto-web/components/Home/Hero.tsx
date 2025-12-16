import { HERO_CONTENTS } from "../../data/HeroContent"
import MakeBidButton from "../Reusable/Button"
import JackpotCards from "./JackpotCards"


const Hero = () => {
  return (
    <div className='w-full pt-20'>
      <div className='heading md:text-[88px] text-[40px] md:leading-[100%] leading-[100%] text-center'>Your <span className='text-primary'>Lucky Number</span> <br /> Could Change Everything</div>
      <MakeBidButton />
      <JackpotCards contents={HERO_CONTENTS} />
    </div>
  )
}

export default Hero