"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { C1, C2, C3, C4, C5 } from "./Images";

const staticConfetti = [
  { id: 1, img: C1, x: "5vw", y: "10vh", rotation: -20 },
  { id: 2, img: C2, x: "20vw", y: "5vh", rotation: 15 },
  { id: 3, img: C3, x: "80vw", y: "8vh", rotation: -10 },
  { id: 4, img: C4, x: "90vw", y: "15vh", rotation: 25 },
  { id: 5, img: C5, x: "10vw", y: "50vh", rotation: 30 },
  { id: 6, img: C1, x: "5vw", y: "80vh", rotation: -15 },
  { id: 7, img: C2, x: "90vw", y: "75vh", rotation: 10 },
  { id: 8, img: C3, x: "80vw", y: "60vh", rotation: 5 },
  { id: 9, img: C4, x: "10vw", y: "30vh", rotation: 15 },
  { id: 10, img: C5, x: "85vw", y: "40vh", rotation: -25 },
  { id: 11, img: C1, x: "45vw", y: "20vh", rotation: 35 },
  { id: 12, img: C2, x: "55vw", y: "65vh", rotation: -30 },
  { id: 13, img: C3, x: "35vw", y: "45vh", rotation: 20 },
  { id: 14, img: C4, x: "65vw", y: "35vh", rotation: -5 },
  { id: 15, img: C5, x: "25vw", y: "70vh", rotation: 40 },
];

const ConfettiBurst: React.FC = () => {
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBurst(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-9999 pointer-events-none overflow-hidden overflow-x-hidden">
      {staticConfetti.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            x: "50vw",
            y: "-10vh",
            scale: 0.3,
            opacity: 0,
            rotate: 0,
            z: Math.random() * 300 - 150, // depth
          }}
          animate={
            burst
              ? {
                x: item.x,
                y: item.y,
                scale: 1 + Math.random() * 0.5,
                opacity: 1,
                rotate: item.rotation + Math.random() * 45 - 20,
                transition: {
                  type: "spring",
                  stiffness: 60,
                  damping: 15,
                  duration: 2.2,
                  delay: Math.random() * 0.1,
                  ease: [0.34, 1.56, 0.64, 1],
                },
              }
              : {}
          }
          whileHover={{
            scale: 1.15,
            rotate: item.rotation + 15,
          }}
          className="absolute"
        >
          <motion.div
            animate={{
              rotate: [
                item.rotation,
                item.rotation + 10,
                item.rotation - 10,
                item.rotation,
              ],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 4 + Math.random() * 3,
              ease: "easeInOut",
            }}
          >
            <Image
              src={item.img}
              alt="confetti"
              width={40}
              height={40}
              className="opacity-90 object-contain select-none"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default ConfettiBurst;