import React from 'react'
import Image from 'next/image'
import { WORK_CONTENTS, WorkContent } from '@/data/WorkContents'


// Shared styles
const getTextColorClass = (textColor: 'white' | 'black') =>
  textColor === 'white' ? 'text-white' : 'text-gray-900'

const getDescColorClass = (textColor: 'white' | 'black') =>
  textColor === 'white' ? 'text-white/90' : 'text-gray-700'

// Desktop Card Component
const DesktopCard: React.FC<WorkContent & { index: number }> = ({
  title, desc, img, bgColor, gridArea, textColor, index
}) => {
  const layouts = {
    0: { // Contact Agent
      container: "p-6 flex flex-row items-center justify-between h-[277px]",
      content: "flex flex-col justify-between h-full z-10 flex-1 pr-8 py-5",
      titleClass: "heading text-xl md:text-[36px] mb-3",
      descClass: "md:text-[16px] md:leading-[19px]",
      imageWrapper: "shrink-0 flex justify-end items-center w-[50%]",
      imageClass: "w-full max-w-7xl h-[450px] object-cover mt-20 translate-x-8"
    },
    1: { // Choose Number
      container: "p-5 flex flex-col h-[303px] mt-3",
      content: "flex flex-col z-10",
      titleClass: "heading text-xl md:text-[36px] mb-2",
      descClass: "md:text-[16px] md:leading-[19px] mt-auto",
      imageWrapper: "absolute inset-0 -right-15 flex items-start justify-end z-5",
      imageClass: "w-[90%] h-auto object-cover"
    },
    2: { // Place Bids
      container: "px-4 py-2 flex flex-col mt-3 h-[303px]",
      content: "flex flex-col z-10 mt-auto",
      titleClass: "heading text-xl md:text-[36px] mb-2",
      descClass: "md:text-[16px] md:leading-[19px]",
      imageWrapper: "absolute top-0 left-1/2 transform -translate-x-1/2 z-10 w-[50%]",
      imageClass: "w-full h-auto object-contain"
    },
    3: { // Wait for Draw
      container: "p-6 flex flex-col h-[590px]",
      content: "flex flex-col z-10",
      titleClass: "heading text-xl md:text-[36px] mb-3",
      descClass: "md:text-[16px] md:leading-[19px]",
      imageWrapper: "flex-1 flex items-end justify-center mt-4",
      imageClass: "w-[650px] h-auto object-contain"
    }
  }

  const layout = layouts[index as keyof typeof layouts]

  return (
    <div
      className={`rounded-2xl transition-transform duration-300 hover:scale-[1.02] overflow-hidden relative w-full ${layout.container}`}
      style={{ backgroundColor: bgColor, gridArea }}
    >
      <div className={layout.content}>
        <h2 className={`${layout.titleClass} ${getTextColorClass(textColor)}`}>
          {title}
        </h2>
        {(index === 0 || index === 3) && (
          <p className={`${layout.descClass} ${getDescColorClass(textColor)}`}>
            {desc}
          </p>
        )}
      </div>
      <div className={layout.imageWrapper}>
        <Image
          src={img}
          alt={title}
          width={index === 2 ? 500 : 1000}
          height={index === 2 ? 500 : 1000}
          className={layout.imageClass}
          priority={index === 0}
        />
      </div>
      {(index === 1 || index === 2) && (
        <p className={`${layout.descClass} ${getDescColorClass(textColor)}`}>
          {desc}
        </p>
      )}
    </div>
  )
}

// Mobile Card Component
const MobileCard: React.FC<WorkContent & { index: number }> = ({
  title, desc, img, bgColor, textColor, index
}) => {
  const layouts = {
    0: { // Contact Agent
      container: "min-h-[320px] sm:min-h-[360px]",
      titleClass: "text-2xl sm:text-3xl mb-3",
      descClass: "text-sm sm:text-base leading-relaxed",
      imageWrapper: "flex-1 flex items-end justify-center",
      imageClass: "w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain",
      imageSize: 600
    },
    1: { // Choose Number
      container: "min-h-[340px] sm:min-h-[380px]",
      titleClass: "text-2xl sm:text-3xl mb-3",
      descClass: "text-sm sm:text-base leading-relaxed",
      imageWrapper: "absolute top-12 right-0 w-[65%] sm:w-[60%] h-[200px] sm:h-[240px] z-5",
      imageClass: "w-full h-full object-cover",
      imageSize: 800
    },
    2: { // Place Bids
      container: "min-h-[340px] sm:min-h-[380px]",
      titleClass: "text-2xl sm:text-3xl mb-3",
      descClass: "text-sm sm:text-base leading-relaxed",
      imageWrapper: "absolute top-0 left-1/2 transform -translate-x-1/2 w-[55%] sm:w-[50%] z-5",
      imageClass: "w-full h-auto object-contain",
      imageSize: 600
    },
    3: { // Wait for Draw
      container: "min-h-[400px] sm:min-h-[440px]",
      titleClass: "text-2xl sm:text-3xl mb-3",
      descClass: "text-sm sm:text-base leading-relaxed",
      imageWrapper: "flex-1 flex items-end justify-center mt-6",
      imageClass: "w-full max-w-[300px] sm:max-w-[350px] h-auto object-contain",
      imageSize: 800
    }
  }

  const layout = layouts[index as keyof typeof layouts]

  return (
    <div
      className={`rounded-2xl p-6 flex flex-col transition-transform duration-300 active:scale-[0.98] overflow-hidden relative ${layout.container}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className={`flex flex-col z-10 ${index === 1 ? 'relative' : index === 2 ? 'mt-auto' : 'mb-4'}`}>
        <h2 className={`heading ${layout.titleClass} ${getTextColorClass(textColor)}`}>
          {title}
        </h2>
        {(index === 0 || index === 3) && (
          <p className={`${layout.descClass} ${getDescColorClass(textColor)}`}>
            {desc}
          </p>
        )}
      </div>

      <div className={layout.imageWrapper}>
        <Image
          src={img}
          alt={title}
          width={layout.imageSize}
          height={layout.imageSize}
          className={layout.imageClass}
        />
      </div>

      {(index === 1 || index === 2) && (
        <div className={`${index === 1 ? 'mt-auto' : ''} z-10 ${index === 1 ? 'pt-4' : ''}`}>
          <p className={`${layout.descClass} ${getDescColorClass(textColor)}`}>
            {desc}
          </p>
        </div>
      )}
    </div>
  )
}

// Main Component
const Work: React.FC = () => {
  return (
    <section id="how-it-works" className="w-full py-8 md:py-20 px-4 md:px-0">
      <h1 className="heading text-3xl md:text-4xl lg:text-5xl text-center mb-8 md:mb-12">
        How Lucky Draw will <span className="text-primary">Work?</span>
      </h1>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-5 grid-rows-4 gap-6 w-full h-[550px]">
        {WORK_CONTENTS.map((content, idx) => (
          <DesktopCard key={content.title} {...content} index={idx} />
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden flex-col gap-4 w-full">
        {WORK_CONTENTS.map((content, idx) => (
          <MobileCard key={content.title} {...content} index={idx} />
        ))}
      </div>
    </section>
  )
}

export default Work