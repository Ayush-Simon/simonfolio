import Preloader from "@/components/Preloader";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StoryScroll from "@/components/StoryScroll";
import Tracklist from "@/components/Tracklist";
import DJSection from "@/components/DJSection";
import Pillars from "@/components/Pillars";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Hero />
        <StoryScroll />
        <Tracklist />
        <DJSection />
        <Pillars />
        <Contact />
      </main>
    </>
  );
}
