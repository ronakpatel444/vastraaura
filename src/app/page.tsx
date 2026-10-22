import Hero from '@/components/sections/Hero';
import PromoBanner from '@/components/sections/PromoBanner';
import Collections from '@/components/sections/Collections';
import NewArrivalsSlider from '@/components/sections/NewArrivalsSlider';
import HorizontalScroll from '@/components/sections/HorizontalScroll';
import BestSellers from '@/components/sections/BestSellers';
import HeritageStory from '@/components/sections/HeritageStory';
import Craftsmanship from '@/components/sections/Craftsmanship';
import DiwaliSpecial from '@/components/sections/DiwaliSpecial';
import VideoShowcase from '@/components/sections/VideoShowcase';
import Testimonials from '@/components/sections/Testimonials';
import FaqSection from '@/components/sections/FaqSection';
import Newsletter from '@/components/sections/Newsletter';
import MegaDiscount from '@/components/sections/MegaDiscount';
import WelcomeOfferPopup from '@/components/ui/WelcomeOfferPopup';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <>
      <WelcomeOfferPopup />
      <Hero />
      <PromoBanner />
      <ScrollReveal><DiwaliSpecial /></ScrollReveal>
      <Collections />
      <ScrollReveal><NewArrivalsSlider /></ScrollReveal>
      <HorizontalScroll />
      <ScrollReveal><MegaDiscount /></ScrollReveal>
      <ScrollReveal><BestSellers /></ScrollReveal>
      <ScrollReveal><HeritageStory /></ScrollReveal>
      <ScrollReveal><Craftsmanship /></ScrollReveal>
      <ScrollReveal><Testimonials /></ScrollReveal>
      <ScrollReveal><FaqSection /></ScrollReveal>
      <ScrollReveal><Newsletter /></ScrollReveal>
    </>
  );
}
