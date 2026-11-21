import { ShopProvider } from "@/components/providers/ShopProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/ui/Cursor";
import { Nav } from "@/components/layout/Nav";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { BagDrawer } from "@/components/layout/BagDrawer";
import { ProductDrawer } from "@/components/layout/ProductDrawer";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/sections/Preloader";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Collection } from "@/components/sections/Collection";
import { Anatomy } from "@/components/sections/Anatomy";
import { Ledger } from "@/components/sections/Ledger";
import { Instrument } from "@/components/sections/Instrument";
import { Night } from "@/components/sections/Night";
import { Fittings } from "@/components/sections/Fittings";

export default function Home() {
  return (
    <ShopProvider>
      <SmoothScroll />
      <a
        href="#main"
        className="label sr-only z-[120] rounded-full bg-bone px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Preloader />
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        <Collection />
        <Anatomy />
        <Ledger />
        <Instrument />
        <Night />
        <Fittings />
      </main>
      <Footer />
      <MenuOverlay />
      <BagDrawer />
      <ProductDrawer />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </ShopProvider>
  );
}
