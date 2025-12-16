import React from 'react'
import Image from 'next/image'

interface CardContent {
  id: number
  title: string
  desc: string
  img: any
  bgColor: string
  variant: 'standard' | 'inverted' | 'floating' | 'noBottom'
}

interface JackpotCardsProps {
  title?: string
  highlightText?: string
  contents: CardContent[]
}

const JackpotCards: React.FC<JackpotCardsProps> = ({
  title = '',
  highlightText = '',
  contents
}) => {
  const variantStyles = {
    standard: {
      container: 'flex-col',
      imageWrapper: 'flex items-center justify-center flex-1 pt-6 sm:pt-10 ',
      imageClass: 'w-full max-w-[200px] sm:max-w-none h-auto object-contain',
      contentWrapper: 'flex flex-col justify-center flex-1 p-4 sm:p-6 text-start',
    },
    inverted: {
      container: 'flex-col relative',
      imageWrapper: 'flex items-end justify-center flex-1 pb-0 sm:pb-6 relative',
      imageClass: 'absolute -bottom-22 sm:-bottom-40 w-[280px] sm:w-[350px] object-contain',
      contentWrapper: 'flex flex-col justify-start flex-1 p-4 sm:p-3 pt-6 sm:pt-3 text-start z-10',
    },
    noBottom: {
      container: 'flex-col relative border',
      imageWrapper: 'flex items-end justify-center flex-1 pb-0 sm:pb-6 shadow-lg relative ',
      imageClass: 'absolute -bottom-16 sm:-bottom-13 w-[380px] md:w-[500px] h-[200px] object-contain border-none',
      contentWrapper: 'flex flex-col justify-start flex-1 p-4 sm:p-3 pt-6 sm:pt-3 text-start z-10',
    },
    floating: {
      container: 'flex-col relative overflow-visible sm:col-span-2 md:col-span-1',
      imageWrapper: 'absolute -top-5 xl:-top-24 lg:-top-10 md:-top-13 left-1/2 transform -translate-x-1/2 w-[280px] sm:w-[380px] h-[200px] sm:h-[280px] pointer-events-none',
      imageClass: 'w-full h-full object-contain',
      contentWrapper: 'flex flex-col justify-end flex-1 p-4 sm:p-6 text-center mt-auto',
    },
  }

  return (
    <section className="w-full md:py-20 py-10">
      <h1 className="heading text-3xl sm:text-4xl md:text-5xl text-center mb-8 md:mb-10 px-4">
        {title} <span className="text-primary">{highlightText}</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 px-4 md:px-0">
        {contents.map((content) => {
          const { title, desc, img, bgColor, variant } = content
          const isLight = bgColor === '#FFFFFF'
          const textColor = isLight ? 'text-primary' : 'text-white'
          const styles = variantStyles[variant]

          return (
            <div
              key={content.id}
              className={`flex ${styles.container} rounded-2xl h-[280px] sm:h-[303px] overflow-hidden transition-transform duration-300 hover:scale-[1.02]`}
              style={{ backgroundColor: bgColor }}
            >
              {variant === 'inverted' && (
                <>
                  <div className={styles.contentWrapper}>
                    <h2 className={`heading text-2xl sm:text-3xl mb-1 ${textColor}`}>
                      {title}
                    </h2>
                    <p className={`${textColor} text-base sm:text-[18px] leading-relaxed`}>
                      {desc}
                    </p>
                  </div>
                  <div className={styles.imageWrapper}>
                    <Image
                      width={1000}
                      height={1000}
                      src={img.src}
                      alt={title}
                      className={styles.imageClass}
                    />
                  </div>
                </>
              )}


              {variant === 'noBottom' && (
                <>
                  <div className={styles.contentWrapper}>
                    <h2 className={`heading text-2xl sm:text-3xl mb-1 ${textColor}`}>
                      {title}
                    </h2>
                    <p className={`${textColor} text-base sm:text-[18px] leading-relaxed`}>
                      {desc}
                    </p>
                  </div>
                  <div className={styles.imageWrapper}>
                    <Image
                      width={1000}
                      height={1000}
                      src={img.src}
                      alt={title}
                      className={styles.imageClass}

                    />
                  </div>
                </>
              )}

              {variant === 'floating' && (
                <>
                  <div className={styles.imageWrapper}>
                    <Image
                      width={1000}
                      height={1000}
                      src={img.src}
                      alt={title}
                      className={styles.imageClass}
                    />
                  </div>
                  <div className={styles.contentWrapper}>
                    <h2 className={`heading text-2xl sm:text-3xl mb-1 sm:mb-2 ${textColor}`}>
                      {title}
                    </h2>
                    <p className={`${isLight ? 'text-primary' : 'text-white/90'} text-sm sm:text-base leading-relaxed`}>
                      {desc}
                    </p>
                  </div>
                </>
              )}

              {variant === 'standard' && (
                <>
                  <div className={styles.imageWrapper}>
                    <Image
                      width={1000}
                      height={1000}
                      src={img.src}
                      alt={title}
                      className={styles.imageClass}
                      priority
                    />
                  </div>
                  <div className={styles.contentWrapper}>
                    <h2 className={`heading tracking-normal text-2xl sm:text-3xl mb-1 sm:mb-2 ${textColor}`}>
                      {title}
                    </h2>
                    <p className={`${isLight ? 'text-primary' : 'text-white/90'} text-base sm:text-[18px] leading-relaxed`}>
                      {desc}
                    </p>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default JackpotCards