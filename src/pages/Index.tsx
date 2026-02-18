import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";
import Packages from "@/components/Packages";
import AboutSection from "@/components/AboutSection";
import Testimonials from "@/components/Testimonials";
import ContactAgents from "@/components/ContactAgents";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Destinations />
      <Packages />
      <AboutSection />
      <Testimonials />
      <ContactAgents />
      <Footer />
    </div>
  );
};

export default Index;
