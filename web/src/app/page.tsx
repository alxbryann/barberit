import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Barbers from "@/components/Barbers";
import FlowCTA from "@/components/FlowCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Barbers />
        <FlowCTA />
      </main>
      <Footer />
    </>
  );
}
