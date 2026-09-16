import Hero from "../components/pages/home/Hero";
import FeaturedProfessionals from "../components/pages/home/FeaturedProfessionals";
import HowItWorks from "../components/pages/home/HowItWorks";

export default function page() {
  return (
    <div>
      <Hero />
      <FeaturedProfessionals />
      <HowItWorks />
    </div>
  );
}
