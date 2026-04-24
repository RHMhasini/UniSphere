import Navbar from "../../components/common/Navbar/Navbar";
import Hero from "../../components/landingPage/Hero/Hero";
import Features from "../../components/landingPage/Features/Features";
import HowItWorks from "../../components/landingPage/HowItWorks/HowItWorks";
import CtaBanner from "../../components/landingPage/CtaBanner/CtaBanner";
import Footer from "../../components/common/Footer/Footer";

function LandingPage({ theme, toggleTheme }) {
  return (
    <div>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
