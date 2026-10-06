import Hero from '@/components/sections/Hero';
import PromoBanner from '@/components/sections/PromoBanner';
import Collections from '@/components/sections/Collections';
import NewArrivalsSlider from '@/components/sections/NewArrivalsSlider';
import HorizontalScroll from '@/components/sections/HorizontalScroll';
import BestSellers from '@/components/sections/BestSellers';
import HeritageStory from '@/components/sections/HeritageStory';
import Craftsmanship from '@/components/sections/Craftsmanship';
import NavratriSpecial from '@/components/sections/NavratriSpecial';
import VideoShowcase from '@/components/sections/VideoShowcase';
import Testimonials from '@/components/sections/Testimonials';
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
      <Collections />
      <ScrollReveal><NewArrivalsSlider /></ScrollReveal>
      <HorizontalScroll />
      <ScrollReveal><MegaDiscount /></ScrollReveal>
      <ScrollReveal><BestSellers /></ScrollReveal>
      <ScrollReveal><HeritageStory /></ScrollReveal>
      <ScrollReveal><Craftsmanship /></ScrollReveal>
      <ScrollReveal><NavratriSpecial /></ScrollReveal>
      <ScrollReveal><Testimonials /></ScrollReveal>
      <ScrollReveal><Newsletter /></ScrollReveal>
    </>
  );
}
