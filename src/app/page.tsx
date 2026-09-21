import Hero from '@/components/sections/Hero';
import PromoBanner from '@/components/sections/PromoBanner';
import Collections from '@/components/sections/Collections';
import HorizontalScroll from '@/components/sections/HorizontalScroll';
import BestSellers from '@/components/sections/BestSellers';
import HeritageStory from '@/components/sections/HeritageStory';
import Craftsmanship from '@/components/sections/Craftsmanship';
import NavratriSpecial from '@/components/sections/NavratriSpecial';
import VideoShowcase from '@/components/sections/VideoShowcase';
import Testimonials from '@/components/sections/Testimonials';
import Newsletter from '@/components/sections/Newsletter';
import MegaDiscount from '@/components/sections/MegaDiscount';

export default function Home() {
  return (
    <>
      <Hero />
      <PromoBanner />
      <Collections />
      <HorizontalScroll />
      <MegaDiscount />
      <BestSellers />
      <HeritageStory />
      <Craftsmanship />
      <NavratriSpecial />
      {/* <VideoShowcase /> Hidden temporarily until video assets are ready */}
      <Testimonials />
      <Newsletter />
    </>
  );
}
