import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Destinations from "@/components/Destinations";
import Packages from "@/components/Packages";
import AboutSection from "@/components/AboutSection";
import Testimonials from "@/components/Testimonials";
import ContactAgents from "@/components/ContactAgents";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAffiliateCapture } from "@/hooks/useAffiliateCapture";

const Index = () => {
  useAffiliateCapture();

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
      <WhatsAppButton />
    </div>
  );
};

export default Index;
