"use client";
import Image from "next/image";
import { GoldenBalls, Sparkles } from "../Reusable/Images";

const Participate = () => {
  return (
    <div className="relative w-full lg:my-20">
      <div className="relative w-full bg-primary rounded-[23px] flex flex-col md:flex-row items-start justify-between p-3 md:p-0 md:pl-8 xl:py-4 md:py-10  overflow-hidden">
        {/* Text section */}
        <div className="flex flex-col text-center md:text-left max-w-md z-10">
          <h1 className="text-white text-[32px] sm:text-[40px] md:text-[50px] mb-3">
            Participate in Jackpot!
          </h1>
          <p className="text-white text-[16px] sm:text-[18px] md:text-[22px] leading-snug">
            Choose your 6 lucky numbers out of 0 - 32 and wait for the result to
            win the jackpot.
          </p>
        </div>

        {/* Image section */}
        <div className="relative flex justify-center items-center mt-9 md:mt-0">
          <Image
            src={GoldenBalls}
            alt="Golden Balls"
            className="object-contain w-[480px] sm:w-[220px] md:w-[300px] lg:w-[650px] md:pb-0 pb-10"
          />
        </div>
      </div>

      {/* Jackpot Button - positioned outside but centered */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 ">
        <button className="cursor-pointer bg-primary border-10 sm:border-8 border-white rounded-full text-white font-semibold text-[18px] sm:text-[22px] md:text-[26px] px-8 sm:px-12 py-1 sm:py-2 flex items-center justify-center  hover:scale-105 transition-transform duration-300 relative">
          {/* Left sparkle */}
          <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 animate-sparkle">
            <Image src={Sparkles} alt="sparkle" width={18} height={18} />
          </div>
          {/* Right sparkle */}
          <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 animate-sparkle delay-1200">
            <Image src={Sparkles} alt="sparkle" width={18} height={18} />
          </div>
          Jackpot
        </button>
      </div>
    </div>
  );
};

export default Participate;