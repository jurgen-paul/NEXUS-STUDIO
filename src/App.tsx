import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ChevronRight, 
  Code2, 
  Cpu, 
  Globe, 
  Layers, 
  Menu, 
  MousePointer2, 
  Sparkles, 
  X,
  LogOut,
  User as UserIcon,
  Loader2,
  Mail,
  Send,
  CheckCircle2,
  Quote
} from "lucide-react";
import { useAuth } from "./lib/AuthContext";
import { auth, db } from "./lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with placeholder or environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");


// Firestore Error Handler as per integration guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const TESTIMONIALS = [
  {
    quote: "Nexus transformed our digital presence from a standard site to an editorial experience. Their technical precision is unmatched.",
    author: "Elena Vance",
    role: "CDO, Ether Real Estate"
  },
  {
    quote: "The intersection of art and engineering is where Nexus lives. They didn't just build a site; they built a brand legacy.",
    author: "Marcus Thorne",
    role: "Founder, Vortex Analytics"
  },
  {
    quote: "Performance was our top priority. Nexus delivered sub-second load times without compromising on visual complexity.",
    author: "Sasha Grey",
    role: "Head of Engineering, Aura"
  }
];

const CLIENTS = [
  "Ether", "Vortex", "Aura", "Zenith", "Quantum", "Eon", "Nova"
];

const PROJECTS = [
  {
    id: 1,
    title: "Ether Real Estate",
    category: "Web 3.0 / Luxury",
    description: "A decentralized platform for high-end property transactions, featuring smart contract integration and immersive 3D walkthroughs.",
    technologies: ["Solidity", "React", "Three.js", "Firebase"],
    link: "https://ether-luxury.io",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
    color: "#E2FF45"
  },
  {
    id: 2,
    title: "Aura Fragrances",
    category: "E-Commerce / Branding",
    description: "An ultra-premium e-commerce experience for a luxury fragrance house, focusing on multisensory storytelling through digital design.",
    technologies: ["Next.js", "Shopify headless", "Motion", "Tailwind"],
    link: "https://aura-essence.com",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000",
    color: "#FF4E00"
  },
  {
    id: 3,
    title: "Vortex Analytics",
    category: "Fintech / SaaS",
    description: "Real-time data visualization engine for high-frequency trading firms, processing millions of events per second with sub-millisecond latency.",
    technologies: ["D3.js", "WebSockets", "Rust", "TypeScript"],
    link: "https://vortex-app.dev",
    image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1000",
    color: "#00FF00"
  },
  {
    id: 4,
    title: "Zenith Architecture",
    category: "Minimal / Portfolio",
    description: "A minimalist digital monograph for an award-winning architectural firm, emphasizing whitespace and structured typography.",
    technologies: ["Gatsby", "GraphQL", "Contentful", "Motion"],
    link: "https://zenith-arch.build",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
    color: "#007AFF"
  }
];

const SERVICES = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Cloud Infrastructure",
    description: "Scale your vision with enterprise-grade cloud solutions optimized for speed and reliability."
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Creative Design",
    description: "Distinctive interfaces that blend art with high-performance engineering."
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "AI Integration",
    description: "Harness the power of LLMs and generative AI to automate and enhance your workflows."
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: "Full-Stack Dev",
    description: "End-to-end development using the most modern tech stacks for maximum future-proofing."
  }
];

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Stripe State
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Handle Stripe Redirection Results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      alert("Subscription activated successfully! Welcome to Nexus Studio.");
      window.history.replaceState({}, document.title, "/");
    }
    if (urlParams.get('canceled')) {
      alert("Checkout canceled. Reach out if you have any questions.");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addDoc(collection(db, 'messages'), {
        ...contactForm,
        createdAt: serverTimestamp()
      });
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleSubscribe = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: "nexus_premium_6995" }),
      });
      
      const session = await response.json();
      if (session.error) throw new Error(session.error);

      const stripe = await stripePromise;
      const { error } = await (stripe as any).redirectToCheckout({ sessionId: session.id });
      
      if (error) console.error(error);
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Please ensure STRIPE_SECRET_KEY is configured in the environment.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent selection:text-white">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? "py-4 bg-brand-bg/90 backdrop-blur-xl border-b-2 border-brand-primary" : "py-8 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-baseline">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="font-serif font-bold text-2xl tracking-tighter uppercase cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Nexus Studio.</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-12 font-bold text-[11px] tracking-[0.25em] uppercase">
            {["Work", "Studio", "Services", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="hover:text-brand-accent transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-accent transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-brand-primary text-white px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-accent transition-all flex items-center gap-2"
              >
                Log In
                <ArrowUpRight className="w-3 h-3" />
              </motion.button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-primary">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="hidden lg:inline">{user.displayName}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 hover:text-brand-accent transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-neutral-100 rounded-none border border-brand-primary"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-bg border-b-2 border-brand-primary overflow-hidden"
            >
              <div className="px-6 py-10 flex flex-col gap-6 font-serif font-bold text-4xl uppercase tracking-tighter">
                {["Work", "Studio", "Services", "Contact"].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:text-brand-accent transition-colors"
                  >
                    {item}
                  </a>
                ))}
                {!user ? (
                  <button 
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="text-left hover:text-brand-accent transition-colors border-t border-brand-primary/10 pt-6"
                  >
                    Login
                  </button>
                ) : (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="text-left hover:text-brand-accent transition-colors border-t border-brand-primary/10 pt-6"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-primary/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-brand-bg border-2 border-brand-primary p-12 max-w-md w-full relative"
            >
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-8 text-center">
                <h2 className="text-4xl font-serif font-black uppercase tracking-tighter">Join Nexus.</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Sign in to explore your personalized dashboard and track projects.</p>
                <button 
                  onClick={handleLogin}
                  className="w-full bg-brand-primary text-white py-4 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-accent transition-all"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
                  Continue with Google
                </button>
                <p className="text-[10px] font-medium opacity-40 leading-relaxed uppercase tracking-widest">
                  By continuing, you agree to our terms of service and privacy policy. 
                  Nexus Studio values your data integrity.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen pt-40 pb-20 flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full relative">
          <div className="absolute -top-20 right-10 w-32 h-32 bg-brand-accent opacity-5 rotate-12 -z-10" />
          
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
            <div className="space-y-12">
              <motion.h1 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                className="text-[clamp(3.5rem,12vw,10rem)] font-serif font-black leading-[0.85] tracking-[-0.04em] uppercase"
              >
                CRAFTING<br />
                DIGITAL<br />
                <span className="text-brand-accent italic font-normal tracking-wide">PRECISION.</span>
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-8"
              >
                <a href="#work" className="group flex items-center gap-4 bg-brand-primary text-white px-10 py-5 rounded-none font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-brand-accent transition-all">
                  View Case Studies
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <a href="#contact" className="border-b-2 border-brand-primary py-2 font-bold uppercase text-[10px] tracking-[0.2em] hover:border-brand-accent hover:text-brand-accent transition-all">
                  Start a Project
                </a>
              </motion.div>
            </div>
 
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="border-l border-brand-primary/10 pl-8 space-y-10"
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Agency Focus</div>
                <div className="text-lg font-medium leading-relaxed">
                  Nexus Studio is a high-performance creative development studio specializing in stunning web experiences.
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Tech Stack</div>
                <div className="text-sm font-medium leading-relaxed font-mono">
                  React 19 / TypeScript / Vite / Motion / Tailwind CSS
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Studio Status</div>
                <div className="text-sm font-bold text-brand-accent uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
                  Active / Accept projects
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="bg-brand-primary py-12 overflow-hidden relative border-y-2 border-brand-primary">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(2).fill("Nexus Studio / Performance Design / Creative Engineering / Web 3.0 Architects / Digital Monuments").map((text, i) => (
            <div key={i} className="flex gap-20 text-brand-bg font-serif font-black italic text-5xl uppercase tracking-tighter mx-10 select-none items-center opacity-80">
              {text.split(' / ').map((word, j) => (
                <span key={j} className="flex items-center gap-10">
                  {word}
                  <div className="w-3 h-3 bg-brand-accent rounded-full" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Clients Logo Strip */}
      <section className="py-20 border-b-2 border-brand-primary bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-12 items-center justify-items-center opacity-40">
            {CLIENTS.map((client, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="font-serif font-black text-2xl tracking-tighter uppercase italic select-none"
              >
                {client}.
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio / Methodology Section */}
      <section id="studio" className="py-40 px-6 bg-brand-bg border-t-2 border-brand-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full border-l border-brand-primary/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
            <div className="sticky top-40">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-brand-accent" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400">Our Studio</h2>
                </div>
                <h3 className="text-7xl md:text-9xl font-serif font-black uppercase tracking-tighter leading-[0.8] mb-12">
                  HOW WE<br />
                  <span className="text-brand-accent italic font-normal tracking-tight">SOLVE.</span>
                </h3>
                <p className="text-xl font-medium leading-relaxed max-w-sm opacity-90 uppercase tracking-tight font-sans">
                  We believe that speed is a design feature. Our methodology combines brutalist technical efficiency with editorial aesthetic grace.
                </p>
                
                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-brand-primary/10">
                  <div>
                    <div className="text-3xl font-serif italic mb-2">99%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Core Web Vitals</div>
                  </div>
                  <div>
                    <div className="text-3xl font-serif italic mb-2">400ms</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Avg. Load Latency</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="space-y-32 lg:pt-10">
               {/* 01 Cloud */}
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative pl-12 md:pl-20"
               >
                  <div className="absolute left-0 top-0 font-serif italic text-6xl md:text-8xl text-brand-accent opacity-10 group-hover:opacity-100 transition-opacity duration-700 select-none">01</div>
                  <div className="relative z-10">
                    <h4 className="text-4xl font-bold uppercase tracking-tighter mb-6">Cloud Infrastructure</h4>
                    <p className="text-neutral-500 font-medium leading-relaxed uppercase tracking-widest text-[12px] max-w-md">
                      Enterprise-grade cloud solutions optimized for speed and reliability. We architect for zero-downtime, edge-cached distribution, and sub-second global persistence.
                    </p>
                  </div>
               </motion.div>

               {/* 02 Design */}
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group relative pl-12 md:pl-20"
               >
                  <div className="absolute left-0 top-0 font-serif italic text-6xl md:text-8xl text-brand-accent opacity-10 group-hover:opacity-100 transition-opacity duration-700 select-none">02</div>
                  <div className="relative z-10">
                    <h4 className="text-4xl font-bold uppercase tracking-tighter mb-6">Creative Design</h4>
                    <p className="text-neutral-500 font-medium leading-relaxed uppercase tracking-widest text-[12px] max-w-md">
                      Distinctive interfaces that blend art with high-performance engineering. We treat design as an editorial discipline, ensuring every interaction reinforces your brand's digital narrative.
                    </p>
                  </div>
               </motion.div>

               {/* 03 AI */}
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group relative pl-12 md:pl-20"
               >
                  <div className="absolute left-0 top-0 font-serif italic text-6xl md:text-8xl text-brand-accent opacity-10 group-hover:opacity-100 transition-opacity duration-700 select-none">03</div>
                  <div className="relative z-10">
                    <h4 className="text-4xl font-bold uppercase tracking-tighter mb-6">AI Integration</h4>
                    <p className="text-neutral-500 font-medium leading-relaxed uppercase tracking-widest text-[12px] max-w-md">
                      Harness the power of LLMs and generative AI to automate and enhance your workflows. We weave intelligence directly into the interface, moving beyond static data to dynamic, agentic interactions.
                    </p>
                  </div>
               </motion.div>

               {/* 04 Dev */}
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group relative pl-12 md:pl-20"
               >
                  <div className="absolute left-0 top-0 font-serif italic text-6xl md:text-8xl text-brand-accent opacity-10 group-hover:opacity-100 transition-opacity duration-700 select-none">04</div>
                  <div className="relative z-10">
                    <h4 className="text-4xl font-bold uppercase tracking-tighter mb-6">Full-Stack Dev</h4>
                    <p className="text-neutral-500 font-medium leading-relaxed uppercase tracking-widest text-[12px] max-w-md">
                      End-to-end development using the most modern tech stacks for maximum future-proofing. From React 19 server components to TypeScript-first backends, we build for the 2030s.
                    </p>
                  </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section id="work" className="py-32 px-6 border-t-2 border-brand-primary">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 mb-4 flex items-center gap-2">
                Selected Work
              </h2>
              <h3 className="text-5xl md:text-6xl font-serif font-black tracking-tighter uppercase italic">The Portfolio.</h3>
            </div>
          </div>
 
          <div className="grid md:grid-cols-2 gap-px bg-brand-primary border border-brand-primary">
            {PROJECTS.map((project, i) => (
              <motion.div
                key={project.id}
                layoutId={`card-${project.id}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer bg-brand-bg p-8 hover:bg-neutral-100 transition-colors relative"
              >
                <div className="relative aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 mb-6 border border-brand-primary/10">
                  <motion.img 
                    layoutId={`image-${project.id}`}
                    src={project.image} 
                    alt={project.title}
                    whileHover={{ scale: 1.1, y: -20 }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-brand-bg text-brand-primary px-6 py-3 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                       Explore Detail <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-4">
                    <motion.div layoutId={`number-${project.id}`} className="font-serif italic text-4xl text-brand-accent">{String(i + 1).padStart(2, '0')}</motion.div>
                    <div>
                      <motion.h4 layoutId={`title-${project.id}`} className="text-3xl font-bold uppercase tracking-tight leading-none mb-2">{project.title}</motion.h4>
                      <motion.p layoutId={`cat-${project.id}`} className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">{project.category}</motion.p>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 45 }}
                    className="p-4 border border-brand-primary/10 rounded-full group-hover:bg-brand-primary group-hover:text-white transition-all duration-500"
                  >
                    <ArrowUpRight className="w-6 h-6" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-brand-primary/60 backdrop-blur-md" 
            />
            
            <motion.div 
              layoutId={`card-${selectedProject.id}`}
              className="bg-brand-bg w-full max-w-6xl h-full max-h-[90vh] overflow-y-auto relative border-2 border-brand-primary shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-brand-bg md:bg-transparent hover:bg-neutral-100 md:hover:bg-brand-primary/10 transition-colors border border-brand-primary md:border-none"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="md:w-1/2 h-80 md:h-full sticky top-0 overflow-hidden">
                <motion.img 
                  layoutId={`image-${selectedProject.id}`}
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-between">
                <div>
                  <motion.div layoutId={`number-${selectedProject.id}`} className="font-serif italic text-4xl mb-4 text-brand-accent">
                    {String(PROJECTS.indexOf(selectedProject) + 1).padStart(2, '0')}
                  </motion.div>
                  
                  <motion.h4 layoutId={`title-${selectedProject.id}`} className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tighter mb-4 leading-none">
                    {selectedProject.title}
                  </motion.h4>
                  
                  <motion.p layoutId={`cat-${selectedProject.id}`} className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-400 mb-10">
                    {selectedProject.category}
                  </motion.p>

                  <div className="space-y-12">
                    <div className="space-y-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Mission Overview</div>
                      <p className="text-lg font-medium leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Technologies Utilized</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map(tech => (
                          <span key={tech} className="px-4 py-2 border border-brand-primary text-[10px] font-bold uppercase tracking-widest">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-16">
                  <a 
                    href={selectedProject.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-4 bg-brand-primary text-white px-10 py-5 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-brand-accent transition-all w-full md:w-auto justify-center"
                  >
                    View Project Live
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Testimonials Section */}
      <section className="py-40 px-6 bg-brand-primary text-brand-bg overflow-hidden relative border-y-2 border-brand-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-accent/10 -skew-x-12 transform translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1fr_2.5fr] gap-24 items-start">
            <div className="space-y-10 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-brand-accent" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-brand-bg/60">Social Proof</h2>
              </div>
              <h3 className="text-7xl md:text-9xl font-serif font-black tracking-tighter uppercase leading-[0.8]">
                VOICES<br />
                OF<br />
                <span className="text-brand-accent italic font-normal tracking-tight">IMPACT.</span>
              </h3>
              <div className="pt-10 opacity-40 group-hover:opacity-100 transition-opacity">
                <Quote className="w-12 h-12 text-brand-accent" />
              </div>
            </div>

            <div className="space-y-px bg-brand-bg/10 border border-brand-bg/10">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-brand-primary p-12 md:p-16 relative group overflow-hidden"
                >
                  <Quote className="absolute -top-4 -left-4 w-32 h-32 text-brand-bg/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  <div className="relative z-10 space-y-8">
                    <p className="text-2xl md:text-3xl font-serif italic leading-relaxed tracking-tight">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-px bg-brand-accent" />
                      <div>
                        <div className="text-sm font-bold uppercase tracking-widest">{t.author}</div>
                        <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mt-1">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-20 space-y-4 text-left">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Our Expertise</h2>
            <h3 className="text-5xl font-serif font-black uppercase tracking-tighter">THE CAPABILITIES.</h3>
          </div>
 
          <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-l border-brand-primary">
            {SERVICES.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-12 border-r border-b border-brand-primary hover:bg-neutral-50 transition-colors group"
              >
                <div className="w-12 h-12 text-brand-accent mb-10 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <div className="font-serif italic text-2xl mb-4 leading-none">{String(i + 1).padStart(2, '0')}</div>
                <h4 className="text-xl font-bold uppercase tracking-tight mb-4">{service.title}</h4>
                <p className="text-neutral-500 text-xs font-medium leading-relaxed uppercase tracking-wider">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="py-40 px-6 bg-white border-y-2 border-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/[0.02] -skew-y-3 transform scale-110 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-brand-accent" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400">Premium Access</h2>
                </div>
                <h3 className="text-7xl md:text-9xl font-serif font-black uppercase tracking-tighter leading-[0.8]">
                  NEXUS<br />
                  <span className="text-brand-accent italic font-normal tracking-tight">UNLIMITED.</span>
                </h3>
              </div>
              <p className="text-xl font-medium leading-relaxed max-w-md opacity-70">
                Unlock our full technological suite, priority creative consultation, and enterprise-grade deployment support. Engineered for those who refuse to compromise.
              </p>
              <div className="space-y-6">
                {[
                  "Unlimited Project Revisions",
                  "Priority CI/CD Pipeline Support",
                  "Direct Access to Lead Architects",
                  "Bespoke Component Library",
                  "Advanced AI Model Integration"
                ].map((feature, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center border border-brand-primary/10 group-hover:border-brand-accent transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em]">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-brand-primary text-brand-bg p-12 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group border-t-8 border-brand-accent">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-1000 rotate-12">
                <Cpu className="w-64 h-64" />
              </div>
              <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-end border-b border-brand-bg/10 pb-12">
                  <div>
                    <h4 className="text-3xl font-bold uppercase tracking-tighter mb-2">The Studio Plan</h4>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-bg/40">Professional Tier</p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-serif font-black">$69.95</div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-40 uppercase">Monthly</div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <button 
                    disabled={isCheckoutLoading}
                    onClick={handleSubscribe}
                    className="w-full bg-brand-bg text-brand-primary py-8 px-10 font-bold uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-6 hover:bg-brand-accent hover:text-white transition-all disabled:opacity-50"
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying Interface...
                      </>
                    ) : (
                      <>
                        Secure Access Now
                        <ArrowUpRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-8 opacity-40">
                    <div className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <Mail className="w-3 h-3" /> Stripe Secure
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3" /> Cancel Anytime
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-40 px-6 bg-brand-bg relative overflow-hidden">
        <div className="absolute bottom-0 right-0 p-20 opacity-5 pointer-events-none">
          <Mail className="w-96 h-96 -rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-brand-accent" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400">Collaborate</h2>
                </div>
                <h3 className="text-7xl md:text-9xl font-serif font-black uppercase tracking-tighter leading-[0.8]">
                  START THE<br />
                  <span className="text-brand-accent italic font-normal tracking-tight">DIALOGUE.</span>
                </h3>
              </div>
              <div className="space-y-12">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6">General Enquiries</div>
                  <a href="mailto:hello@nexus-studio.io" className="text-3xl md:text-4xl font-serif italic border-b border-brand-primary/20 hover:border-brand-accent transition-colors pb-2">
                    hello@nexus-studio.io
                  </a>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-6">Studio Location</div>
                  <address className="text-xl font-medium not-italic uppercase tracking-tight opacity-70 leading-relaxed">
                    22 Baker Street, 4th Floor<br />
                    London, UK NW1 6XE<br />
                    +44 (0) 20 7946 0123
                  </address>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-brand-primary p-12 md:p-16 shadow-2xl relative">
              <form onSubmit={handleContactSubmit} className="space-y-12">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Identify Yourself</label>
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full bg-neutral-50 border-b border-brand-primary/10 py-4 px-2 outline-none focus:border-brand-accent transition-colors font-medium text-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Digital Address</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full bg-neutral-50 border-b border-brand-primary/10 py-4 px-2 outline-none focus:border-brand-accent transition-colors font-medium text-lg"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Project Mission</label>
                  <textarea 
                    rows={4} 
                    placeholder="Tell us about the digital monument you wish to construct..."
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full bg-neutral-50 border-b border-brand-primary/10 py-4 px-2 outline-none focus:border-brand-accent transition-colors font-medium text-lg resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full bg-brand-primary text-white py-6 font-bold uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-6 hover:bg-brand-accent transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Transmitting...
                    </>
                  ) : (
                    <>
                      Send Transmission
                      <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    </>
                  )}
                </button>
                {submitStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 text-green-600 font-bold uppercase text-[10px] tracking-widest justify-center mt-6"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Transmission Received
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-6 border-t-2 border-brand-primary bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-start mb-20">
          <div>
            <div className="font-serif font-bold text-xl uppercase tracking-tighter mb-4">Nexus Studio.</div>
            <p className="text-xs font-medium leading-relaxed opacity-60 max-w-xs uppercase tracking-widest">
              Crafting premium digital experiences through editorial design and technical precision.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Navigation</div>
            {["Work", "Studio", "Services", "Contact"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold hover:text-brand-accent transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Community</div>
            {["Twitter", "Instagram", "LinkedIn", "Dribbble"].map(item => (
              <a key={item} href="#" className="text-xs font-bold hover:text-brand-accent transition-colors uppercase tracking-widest">{item}</a>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 pt-10 border-t border-brand-primary/10">
          <div className="text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase">
            © 2026 NEXUS STUDIO / SYSTEM ID: {auth.currentUser?.uid?.slice(0, 8) || "GUEST"}
          </div>
          <div className="text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase">
            LONDON / SAN FRANCISCO / TOKYO
          </div>
        </div>
      </footer>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 w-full h-10 bg-brand-primary text-brand-bg flex items-center justify-between px-6 z-[60] font-bold text-[9px] tracking-[0.2em] uppercase">
        <div className="flex items-center gap-4">
          <span className="opacity-60">EST. 2026 / NEXUS STUDIO / </span>
          <span className="hidden sm:inline">AUTHENTICATED: {user ? "YES" : "NO"}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 opacity-40">
            <span>MEM: 48GB</span>
            <span>CPU: 08%</span>
          </div>
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            SYS: NOMINAL
          </div>
        </div>
      </div>
    </div>
  );
}
