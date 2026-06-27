import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Phone, MapPin, Clock, Star, Leaf, Heart, Dog, Sparkles,
  Coffee, CreditCard, Apple, Salad, Menu as MenuIcon, X,
  ChevronRight, Utensils, Baby, Wifi, Camera, ExternalLink,
} from "lucide-react";

import heroImg from "@/assets/hero-panini.jpg";
import wrapImg from "@/assets/wrap.jpg";
import interiorImg from "@/assets/cafe-interior.jpg";
import paniniImg from "@/assets/panini-feature.jpg";
import gallery1 from "@/assets/gallery/il-panino-gallery-1.jpg.asset.json";
import gallery2 from "@/assets/gallery/il-panino-gallery-2.jpg.asset.json";
import gallery3 from "@/assets/gallery/il-panino-gallery-3.jpg.asset.json";
import gallery4 from "@/assets/gallery/il-panino-gallery-4.jpg.asset.json";
import gallery5 from "@/assets/gallery/il-panino-gallery-5.jpg.asset.json";
import gallery6 from "@/assets/gallery/il-panino-gallery-6.jpg.asset.json";
import gallery7 from "@/assets/gallery/il-panino-gallery-7.jpg.asset.json";
import gallery8 from "@/assets/gallery/il-panino-gallery-8.jpg.asset.json";
import gallery9 from "@/assets/gallery/il-panino-gallery-9.jpg.asset.json";
import gallery10 from "@/assets/gallery/il-panino-gallery-10.jpg.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Il Panino — Artisan Paninis & Fresh Wraps in Central London" },
      { name: "description", content: "Fresh ingredients, homemade recipes and highly rated local favourites served daily in the heart of London. 21 Newton St, Holborn WC2B 5EL." },
      { property: "og:title", content: "Il Panino — Artisan Paninis & Fresh Wraps in Central London" },
      { property: "og:description", content: "Homemade paninis, wraps, salads and great coffee. 4.9★ from 240+ reviews." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

/* ----------------------------- MENU DATA ----------------------------- */

type Item = { name: string; desc?: string; price?: string };
type Category = { id: string; title: string; blurb: string; items: Item[] };

const MENU: Category[] = [
  {
    id: "breakfast", title: "Breakfast", blurb: "Start your morning the artisan way",
    items: [
      { name: "Sandwich or Roll", price: "£2.80" },
      { name: "Baguette", price: "£3.50" },
    ],
  },
  {
    id: "lunch", title: "Lunch", blurb: "Hearty homemade plates",
    items: [
      { name: "Beef Pasta Bechamel", desc: "With chips or salad", price: "£7.00" },
      { name: "Beef Pasta Bechamel", desc: "With chips & salad", price: "£8.00" },
      { name: "Chilli Con Carne Chips", price: "£5.50" },
      { name: "Cheesy Chips", price: "£6.00" },
      { name: "Sausage, Chips & Beans", price: "£7.00" },
    ],
  },
  {
    id: "panini", title: "Hot Grilled Panini", blurb: "Pressed warm, golden and crisp",
    items: [
      { name: "Ham, Cheese & Tomato", price: "£5.00" },
      { name: "Chicken, Pesto & Cheese", price: "£5.00" },
      { name: "Bacon, Cheese & Tomato", price: "£5.00" },
      { name: "Tuna Mayo, Sweetcorn & Cheese", price: "£5.00" },
      { name: "Mozzarella, Pesto, Olives & Sundried Tomatoes", price: "£5.00" },
      { name: "Chicken Escalope, Ham & Cheese", price: "£5.60" },
      { name: "Halloumi, Sweet Pepper & Sundried Tomatoes", price: "£6.00" },
      { name: "Feta, Tomato, Cucumber, Onions & Olive Oil", price: "£5.00" },
    ],
  },
  {
    id: "wraps", title: "Wraps", blurb: "Our signature handheld creations",
    items: [
      { name: "Egyptian", desc: "Organic falafel, homemade hummus, hot/sweet chilli sauce & mixed salad", price: "£5.50" },
      { name: "Roman", desc: "Mozzarella, green pesto, grilled mediterranean vegetables, sundried tomatoes & lettuce", price: "£6.00" },
      { name: "Mexican", desc: "Spicy mixed beans, avocado, grilled vegetables, grated cheddar & lettuce", price: "£6.00" },
      { name: "Hangover", desc: "Free-range egg, bacon, sausage, mustard, ketchup, lettuce & tomato", price: "£7.00" },
      { name: "Norwegian", desc: "Dolphin friendly tuna mayonnaise, sweetcorn & mixed salad", price: "£6.50" },
      { name: "Pentoville", desc: "Honey roasted ham, mature cheddar, wholegrain mustard/branston, coleslaw, red onion & lettuce", price: "£7.00" },
      { name: "Gladiator", desc: "Sliced free-range egg, mayonnaise & mixed salad", price: "£7.00" },
      { name: "Danish", desc: "Crispy bacon, free-range egg mayonnaise, sundried tomatoes, lettuce & cucumber", price: "£7.00" },
      { name: "Mount Edna", desc: "Chicken breast, mozzarella, green pesto, grilled vegetables & mixed salad", price: "£7.00" },
      { name: "Persian", desc: "Chicken tikka, authentic Greek tzatziki & mixed salad", price: "£7.00" },
      { name: "Ottoman", desc: "Chicken kebab, homemade hummus, hot/sweet chilli, grilled vegetables & mixed salad", price: "£7.00" },
      { name: "Swiss", desc: "Homemade chicken escalope, mayonnaise, avocado & mixed salad", price: "£7.00" },
      { name: "Goswell", desc: "Meatballs, mozzarella, green pesto & mixed salad", price: "£7.00" },
      { name: "Sultan", desc: "Grilled lamb kofta, hummus, hot/sweet chilli, grilled vegetables & mixed salad", price: "£7.00" },
      { name: "Superman", desc: "Homemade peri-peri chicken, grated mature cheddar & mixed salad", price: "£7.00" },
    ],
  },
  {
    id: "jacket", title: "Oven Baked Jacket Potatoes", blurb: "Fluffy, comforting, baked to order",
    items: [
      { name: "Cheese or Beans", price: "£4.00" },
      { name: "Cheese & Beans", price: "£4.50" },
      { name: "Cheese & Coleslaw", price: "£4.50" },
      { name: "Tuna Mayo Sweetcorn", price: "£4.00" },
      { name: "Tuna Mayo & Cheese", price: "£4.50" },
      { name: "Chilli Con Carne", price: "£4.50" },
      { name: "Chilli Con Carne with Cheese", price: "£5.00" },
    ],
  },
  {
    id: "salad", title: "Salad Box", blurb: "Build your own at the salad bar",
    items: [
      { name: "Salad Box", desc: "Choose your salad, choose your protein, choose your dressing" },
    ],
  },
  {
    id: "omelette", title: "Omelette", blurb: "Made with free-range eggs",
    items: [
      { name: "Plain", desc: "Made with free-range eggs" },
      { name: "Ham or Cheese", desc: "Made with free-range eggs" },
      { name: "Mixed", desc: "Made with free-range eggs" },
    ],
  },
  {
    id: "others", title: "Others", blurb: "Extras & protein add-ons",
    items: [
      { name: "Falafel" }, { name: "Egg" }, { name: "Cheese" },
      { name: "Ham" }, { name: "Cheese and Ham" }, { name: "Chicken" },
      { name: "Chicken Tikka" }, { name: "Chicken Escalope" },
      { name: "Tuna" }, { name: "Halloumi" },
    ],
  },
];

const SIGNATURE = [
  { name: "Ottoman", desc: "Chicken kebab, hummus, hot/sweet chilli & grilled vegetables", price: "£7.00", img: wrapImg },
  { name: "Persian", desc: "Chicken tikka, authentic Greek tzatziki & mixed salad", price: "£7.00", img: wrapImg },
  { name: "Swiss", desc: "Homemade chicken escalope, mayonnaise, avocado & mixed salad", price: "£7.00", img: wrapImg },
  { name: "Sultan", desc: "Grilled lamb kofta, hummus, chilli & grilled vegetables", price: "£7.00", img: wrapImg },
  { name: "Roman", desc: "Mozzarella, green pesto, grilled mediterranean veg & sundried tomatoes", price: "£6.00", img: paniniImg },
  { name: "Mexican", desc: "Spicy mixed beans, avocado, grilled vegetables & cheddar", price: "£6.00", img: wrapImg },
  { name: "Superman", desc: "Homemade peri-peri chicken, mature cheddar & mixed salad", price: "£7.00", img: wrapImg },
  { name: "Mount Edna", desc: "Chicken breast, mozzarella, pesto, grilled vegetables & salad", price: "£7.00", img: wrapImg },
  { name: "Goswell", desc: "Meatballs, mozzarella, green pesto & mixed salad", price: "£7.00", img: paniniImg },
];

const FEATURES = [
  { icon: Heart, title: "Family Friendly", text: "A warm welcome for everyone" },
  { icon: Baby, title: "Good for Kids", text: "Little ones love our wraps" },
  { icon: Dog, title: "Pets Allowed", text: "Bring your four-legged friend" },
  { icon: Salad, title: "Healthy Options", text: "Fresh, balanced & wholesome" },
  { icon: Leaf, title: "Vegetarian & Vegan", text: "Plant-based favourites daily" },
  { icon: Sparkles, title: "Trendy Atmosphere", text: "Cosy, modern London cafe" },
  { icon: Apple, title: "Organic Ingredients", text: "Quality you can taste" },
  { icon: Wifi, title: "NFC Payments", text: "Tap, pay & go in seconds" },
];

const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/place/Il+Panino,+21+Newton+St,+London+WC2B+5EL,+United+Kingdom/data=!4m2!3m1!1s0x48761b34f3dfa263:0xca2d01dee6180b01!18m1!1e1";

const GALLERY = [
  { src: gallery2.url, alt: "Il Panino exterior with dark green frontage on Newton Street", span: "sm:col-span-2" },
  { src: gallery5.url, alt: "Fresh toasted sandwich held outside Il Panino", span: "sm:row-span-2" },
  { src: gallery9.url, alt: "Fresh wrap cut open inside takeaway bag", span: "" },
  { src: gallery1.url, alt: "Compact seating corner inside Il Panino cafe", span: "" },
  { src: gallery10.url, alt: "Prepared ingredients and bread at the Il Panino counter", span: "sm:col-span-2" },
  { src: gallery8.url, alt: "Salad bar and snack display inside the cafe", span: "" },
  { src: gallery6.url, alt: "Hot grill and menu board inside Il Panino", span: "" },
  { src: gallery7.url, alt: "Drinks fridge and interior wall details inside Il Panino", span: "" },
  { src: gallery3.url, alt: "Street view of Il Panino on Newton Street in London", span: "sm:col-span-2" },
  { src: gallery4.url, alt: "Il Panino signage beside the street entrance", span: "" },
];


/* ----------------------------- COMPONENT ----------------------------- */

function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(MENU[0].id);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header navOpen={navOpen} setNavOpen={setNavOpen} scrolled={scrolled} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Artisan grilled panini with mozzarella and sundried tomatoes" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/85 via-forest-deep/70 to-forest-deep/95" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
          <div className="reveal max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cream/90 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brass" />
              Holborn · London · Since day one
            </div>
            <h1 className="font-display text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
              Artisan Paninis<br />
              <span className="italic text-brass">& Fresh Wraps</span><br />
              in Central London
            </h1>
            <p className="reveal reveal-delay-1 mt-6 max-w-xl text-base text-cream/85 sm:text-lg">
              Fresh ingredients, homemade recipes and highly rated local favourites
              served daily in the heart of London.
            </p>

            <div className="reveal reveal-delay-2 mt-8 flex flex-wrap gap-3">
              <a href="#menu" className="group inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 text-sm font-medium text-forest-deep transition hover:bg-brass hover:text-forest-deep">
                View Menu
                <ChevronRight size={16} className="transition group-hover:translate-x-0.5" />
              </a>
              <a href="tel:+442074053825" className="inline-flex items-center gap-2 rounded-full border border-cream/40 px-7 py-3.5 text-sm font-medium text-cream backdrop-blur transition hover:bg-cream/10">
                <Phone size={16} /> Call Now
              </a>
            </div>

            <div className="reveal reveal-delay-3 mt-12 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-2">
              <HeroBadge icon={<Star size={14} className="fill-brass text-brass" />} label="4.9 Rating" />
              <HeroBadge label="240+ Reviews" />
              <HeroBadge icon={<Heart size={14} />} label="Family Friendly" />
              <HeroBadge icon={<Leaf size={14} />} label="Vegetarian Options" />
              <HeroBadge icon={<Dog size={14} />} label="Pets Allowed" />
              <HeroBadge icon={<Coffee size={14} />} label="Breakfast & Lunch" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* QUICK INFO BAR */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: MapPin, t: "Find us", v: "21 Newton St, WC2B 5EL" },
            { icon: Clock, t: "Open today", v: "Mon–Fri · 07:00–15:00" },
            { icon: Phone, t: "Call", v: "+44 20 7405 3825" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-4 px-6 py-5">
              <x.icon size={20} className="text-primary" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{x.t}</div>
                <div className="text-sm font-medium">{x.v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="experience" className="mx-auto max-w-6xl px-5 py-24 lg:py-32">
        <SectionHeading eyebrow="The experience" title="A small London corner with big heart" />
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-20px_rgba(45,80,55,0.25)]">
              <f.icon size={22} className="text-primary transition group-hover:text-accent" />
              <div className="mt-5 font-display text-xl text-foreground">{f.title}</div>
              <div className="mt-1.5 text-sm text-muted-foreground">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNATURE WRAPS */}
      <section id="signature" className="relative bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="text-[11px] uppercase tracking-[0.24em] text-brass">Signature creations</div>
              <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">The wraps that built our reputation</h2>
            </div>
            <p className="max-w-md text-sm text-cream/75">
              Nine of our most-loved recipes — each one homemade, generously filled and grilled to order.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SIGNATURE.map((s) => (
              <article key={s.name} className="group overflow-hidden rounded-2xl bg-cream/[0.04] ring-1 ring-cream/10 backdrop-blur transition hover:ring-brass/40">
                <div className="relative h-48 overflow-hidden">
                  <img src={s.img} alt={s.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <h3 className="font-display text-2xl text-cream">{s.name}</h3>
                    <span className="rounded-full bg-brass px-3 py-1 text-xs font-medium text-forest-deep">{s.price}</span>
                  </div>
                </div>
                <p className="px-5 py-5 text-sm leading-relaxed text-cream/75">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FULL MENU */}
      <section id="menu" className="mx-auto max-w-6xl px-5 py-24 lg:py-32">
        <SectionHeading eyebrow="The full menu" title="Made fresh, served daily" subtitle="Every item is prepared in-house using quality ingredients sourced for flavour." />

        {/* Category tabs */}
        <div className="mt-12 -mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2">
            {MENU.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCat(c.id);
                  document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm transition ${
                  activeCat === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 space-y-20">
          {MENU.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-28">
              <div className="flex items-baseline justify-between gap-6 border-b border-border pb-5">
                <div>
                  <h3 className="font-display text-3xl text-primary sm:text-4xl">{cat.title}</h3>
                  <p className="mt-1 text-sm italic text-muted-foreground">{cat.blurb}</p>
                </div>
                <Utensils size={20} className="hidden text-accent sm:block" />
              </div>

              <ul className="mt-6 divide-y divide-border">
                {cat.items.map((it) => (
                  <li key={it.name + (it.desc ?? "")} className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-5">
                    <div className="min-w-0">
                      <div className="font-display text-lg text-foreground">{it.name}</div>
                      {it.desc && (
                        <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.desc}</div>
                      )}
                    </div>
                    {it.price && (
                      <div className="self-start text-base font-medium text-primary tabular-nums">{it.price}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="mx-auto max-w-6xl px-5 py-24 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Photo gallery"
            title="A closer look at Il Panino"
            subtitle="Inside the cafe, at the counter, and out on Newton Street — all from your uploaded photos."
          />
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium transition hover:border-primary/40 hover:text-primary"
          >
            <Camera size={16} /> View on Google <ExternalLink size={14} />
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 auto-rows-[220px]">
          {GALLERY.map((image) => (
            <figure key={image.src} className={`group overflow-hidden rounded-2xl border border-border bg-card ${image.span}`}>
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </figure>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="bg-secondary">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-accent">Google reviews</div>
              <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">Rated 4.9 by 240+ customers</h2>
              <div className="mt-6 flex items-center gap-1.5">
                {[0,1,2,3,4].map((i) => <Star key={i} size={22} className="fill-brass text-brass" />)}
              </div>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                Read the latest customer feedback directly on Google Maps, where locals regularly praise the fresh fillings, warm service and generous portions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-forest-deep"
                >
                  Read Google reviews <ExternalLink size={14} />
                </a>
                <a
                  href={`${GOOGLE_REVIEWS_URL}&review=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium hover:border-primary/40"
                >
                  Leave a review <Star size={14} />
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { q: "The freshest sandwiches in Holborn — and the staff are wonderful.", n: "Google reviewer" },
                { q: "Healthy lunch options that actually taste great. Huge portions too.", n: "Google reviewer" },
                { q: "A proper hidden gem. I bring every visitor here.", n: "Google reviewer" },
                { q: "Excellent service, beautiful little spot. The Ottoman wrap is unreal.", n: "Google reviewer" },
              ].map((r, index) => (
                <figure key={`${r.n}-${index}`} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex gap-1">
                    {[0,1,2,3,4].map((i) => <Star key={i} size={12} className="fill-brass text-brass" />)}
                  </div>
                  <blockquote className="mt-3 font-display text-lg leading-snug text-foreground">"{r.q}"</blockquote>
                  <figcaption className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">— {r.n}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <img src={interiorImg} alt="Inside Il Panino cafe — dark green walls, brass lighting, wooden counter" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-primary px-6 py-5 text-primary-foreground shadow-xl sm:block">
              <div className="font-display text-3xl">07:00</div>
              <div className="text-xs uppercase tracking-[0.18em] text-cream/70">Doors open</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-accent">Our story</div>
            <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">A neighbourhood cafe, made with care</h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Tucked away on Newton Street, Il Panino is the kind of place that London regulars
              keep to themselves. Every panini is pressed to order, every wrap rolled by hand
              and every salad built from ingredients prepped that morning.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We feed Holborn's office crowd at lunch, welcome tourists who wander in from the
              West End, and host families on weekday mornings over coffee and warm baguettes.
              Healthy, homemade and genuinely independent — that's the whole idea.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { v: "4.9★", l: "Google" },
                { v: "240+", l: "Reviews" },
                { v: "100%", l: "Homemade" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-card p-5">
                  <div className="font-display text-2xl text-primary">{s.v}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="visit" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-24 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-brass">Visit us</div>
              <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">Find us in Holborn</h2>
              <p className="mt-5 max-w-md text-cream/75">
                Two minutes from Holborn station, on quiet Newton Street.
                Drop in for breakfast, lunch or just a great coffee.
              </p>

              <div className="mt-10 space-y-6">
                <InfoRow icon={MapPin} title="Address">
                  21 Newton St<br />London WC2B 5EL<br />United Kingdom
                </InfoRow>
                <InfoRow icon={Clock} title="Hours">
                  Monday – Friday · 07:00 – 15:00<br />
                  <span className="text-cream/60">Saturday & Sunday · Closed</span>
                </InfoRow>
                <InfoRow icon={Phone} title="Phone">
                  <a href="tel:+442074053825" className="underline-offset-4 hover:underline">+44 20 7405 3825</a>
                </InfoRow>
                <InfoRow icon={CreditCard} title="Payments">
                  Credit & debit cards · NFC mobile payments
                </InfoRow>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="tel:+442074053825" className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest-deep hover:bg-brass">
                  <Phone size={16} /> Call to reserve
                </a>
                <a href="https://www.google.com/maps/search/?api=1&query=Il+Panino+21+Newton+St+London+WC2B+5EL" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/40 px-6 py-3 text-sm hover:bg-cream/10">
                  <MapPin size={16} /> Get directions
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 text-xs text-cream/60">
                <span className="rounded-full border border-cream/15 px-3 py-1">Dine-in</span>
                <span className="rounded-full border border-cream/15 px-3 py-1">Takeaway</span>
                <span className="rounded-full border border-cream/15 px-3 py-1">Counter service</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-cream/10">
              <iframe
                title="Map of Il Panino, 21 Newton St, London"
                src="https://www.google.com/maps?q=21+Newton+St,+London+WC2B+5EL&output=embed"
                className="h-full min-h-[420px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-5 py-24 text-center lg:py-32">
        <div className="text-[11px] uppercase tracking-[0.24em] text-accent">Come hungry</div>
        <h2 className="mt-4 font-display text-4xl text-primary sm:text-6xl">
          Lunch break,<br /><span className="italic">elevated.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
          Grab a quick takeaway, settle in for a slow lunch, or treat the office to something
          better. We're waiting for you on Newton Street.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#menu" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground hover:bg-forest-deep">
            Browse the menu <ChevronRight size={16} />
          </a>
          <a href="tel:+442074053825" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium hover:border-primary/40">
            <Phone size={16} /> Order by phone
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ----------------------------- SMALL UI ----------------------------- */

function Header({ navOpen, setNavOpen, scrolled }: { navOpen: boolean; setNavOpen: (v: boolean) => void; scrolled: boolean }) {
  const links = [
    { href: "#experience", label: "Experience" },
    { href: "#signature", label: "Signature" },
    { href: "#gallery", label: "Gallery" },
    { href: "#menu", label: "Menu" },
    { href: "#reviews", label: "Reviews" },
    { href: "#visit", label: "Visit" },
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-border/60 bg-background/85 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className={`font-display text-2xl tracking-wide transition ${scrolled ? "text-primary" : "text-cream"}`}>
          Il <span className="italic">Panino</span>
        </a>
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`text-sm transition ${scrolled ? "text-foreground hover:text-primary" : "text-cream/85 hover:text-cream"}`}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <a href="tel:+442074053825" className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition ${scrolled ? "bg-primary text-primary-foreground hover:bg-forest-deep" : "border border-cream/40 text-cream hover:bg-cream/10"}`}>
            <Phone size={14} /> Call
          </a>
        </div>
        <button onClick={() => setNavOpen(!navOpen)} className={`lg:hidden ${scrolled ? "text-foreground" : "text-cream"}`} aria-label="Menu">
          {navOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {navOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="space-y-1 px-5 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setNavOpen(false)} className="block rounded-lg px-3 py-3 font-display text-lg text-foreground hover:bg-secondary">
                {l.label}
              </a>
            ))}
            <a href="tel:+442074053825" className="mt-3 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground">
              <Phone size={14} /> +44 20 7405 3825
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroBadge({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-cream/[0.06] px-3 py-1.5 text-xs text-cream/90 backdrop-blur">
      {icon} {label}
    </span>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-[11px] uppercase tracking-[0.24em] text-accent">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function InfoRow({ icon: Icon, title, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.04]">
        <Icon size={18} className="text-brass" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-cream/60">{title}</div>
        <div className="mt-1 text-sm leading-relaxed text-cream">{children}</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="font-display text-2xl text-primary">Il <span className="italic">Panino</span></div>
            <p className="mt-3 text-sm text-muted-foreground">Artisan paninis, wraps and salads. Made fresh in Holborn since day one.</p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Visit</div>
            <div className="mt-3 text-sm">21 Newton St<br />London WC2B 5EL</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Contact</div>
            <div className="mt-3 text-sm">
              <a href="tel:+442074053825" className="hover:text-primary">+44 20 7405 3825</a><br />
              Mon–Fri · 07:00–15:00
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Il Panino. All rights reserved.</div>
          <div>Crafted with care in London.</div>
        </div>
      </div>
    </footer>
  );
}
