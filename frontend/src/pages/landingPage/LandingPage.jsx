import Hero from "../../components/landingPage/Hero/Hero";
import Features from "../../components/landingPage/Features/Features";
import HowItWorks from "../../components/landingPage/HowItWorks/HowItWorks";
import CtaBanner from "../../components/landingPage/CtaBanner/CtaBanner";

function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <CtaBanner />
    </main>
  );
}

export default LandingPage;
