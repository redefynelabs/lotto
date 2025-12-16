import { JACKPOT_CONTENTS } from "@/data/JackpontContent";
import Hero from "@/components/Home/Hero";
import JackpotCards from "@/components/Home/JackpotCards";
import Jackpot from "@/components/Home/JackpotCards";
import MakeaBid from "@/components/Home/MakeaBid";
import Participate from "@/components/Home/Participate";
import Work from "@/components/Home/Work";
import ContainerLayout from "@/layout/ContainerLayout";

export default function Home() {
  return (
    <ContainerLayout>
      <Hero />
      <Participate />
      <MakeaBid />
      <Work />
      <JackpotCards title="Want to Win"
        highlightText="Jackpot?" contents={JACKPOT_CONTENTS} />
    </ContainerLayout>
  );
}
