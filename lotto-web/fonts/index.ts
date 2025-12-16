import localFont from "next/font/local";

export const foundersGrotesk = localFont({
  src: [
    {
      path: "./Founders_Grotesk/FoundersGrotesk-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Founders_Grotesk/FoundersGrotesk-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Founders_Grotesk/FoundersGrotesk-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Founders_Grotesk/FoundersGrotesk-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./Founders_Grotesk/FoundersGrotesk-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-founders-grotesk",
  display: "swap",
});

export const coolvetica = localFont({
  src: [
    {
      path: "./Coolvetica/Coolvetica_Rg.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Coolvetica/Coolvetica_Rg_It.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./Coolvetica/Coolvetica_Rg_It.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-coolvetica",
  display: "swap",
});