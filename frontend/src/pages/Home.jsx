import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CTA from "../components/CTA";
import Blog from "../components/Blog";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

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
    </>
  );
}

export default Home;
