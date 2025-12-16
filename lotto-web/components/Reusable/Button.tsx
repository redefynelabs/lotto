"use client";
import Image from "next/image";
import Link from "next/link";
import buttonStar from "@/assets/Home/buttonStar.svg";

export default function MakeBidButton() {
  return (
    <div className="flex items-center justify-center pt-15">
      {/* Glowing red outer aura */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-3xl bg-red-600/80 opacity-10 animate-pulse"></div>

        {/* Outer border ring */}
        <div className="flex border border-primary rounded-full pt-2 pb-2  px-2">
          <div className="flex border border-primary rounded-full pt-2 pb-4 px-2">
            
            {/* Main Button (3D depth only inside) */}
            <Link href="/bid">
              <button
  className="relative px-14 py-5 rounded-full border-2 border-white bg-[#e70000] text-white font-bold text-3xl tracking-wide flex items-center justify-center transition-all duration-300 active:scale-95 shadow-[0_9px_0_0_#b50000,0_20px_35px_-5px_#e70000] overflow-hidden cursor-pointer"
>
              {/* Inner gradient shine */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full opacity-60 pointer-events-none"></div>

              {/* Subtle bottom depth overlay (inside only) */}
              <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-b from-transparent to-[#7a0000]/70 rounded-b-full pointer-events-none"></div>

              {/* Text */}
              <span className="relative z-10">Make a Bid</span>

              {/* Sparkles */}
              <div className="absolute left-6 top-3 animate-sparkle">
                <Image src={buttonStar} alt="star" width={18} height={18} />
              </div>
              <div className="absolute left-10 bottom-3 animate-sparkle delay-1000">
                <Image src={buttonStar} alt="star" width={16} height={16} />
              </div>
              <div className="absolute right-6 top-3 animate-sparkle delay-500">
                <Image src={buttonStar} alt="star" width={18} height={18} />
              </div>
            </button>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
