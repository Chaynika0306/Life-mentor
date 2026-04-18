import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CTA from "../components/CTA";
import Testimonials from "../components/Testimonials";
import Blog from "../components/Blog";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import CrisisHelp from "../components/CrisisHelp";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CTA />
      <Testimonials />
      <Blog />
      <FAQ />
      <Footer />
      <CrisisHelp />
    </>
  );
}

export default Home;
