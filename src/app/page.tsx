import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Fasilitas from "@/components/DesignedFor";
import Fitur from "@/components/Fitur";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#030712',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
      <Navbar />
      <Hero />
      <Fasilitas />
      <Fitur />
      <Footer />
    </div>
  );
}