import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
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
  Quote,
  Zap
} from "lucide-react";
import { useAuth } from "./lib/AuthContext";
import { auth, db } from "./lib/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification 
} from "firebase/auth";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
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
    color: "#E2FF45",
    code: `// Ether Real Estate - Smart Contract Integration
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';

export const PropertyViewer = ({ modelPath }) => {
  return (
    <Canvas shadows camera={{ position: [0, 0, 150], fov: 40 }}>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.6}>
          <Model path={modelPath} />
        </Stage>
      </Suspense>
      <OrbitControls autoRotate />
    </Canvas>
  );
};`
  },
  {
    id: 2,
    title: "Aura Fragrances",
    category: "E-Commerce / Branding",
    description: "An ultra-premium e-commerce experience for a luxury fragrance house, focusing on multisensory storytelling through digital design.",
    technologies: ["Next.js", "Shopify headless", "Motion", "Tailwind"],
    link: "https://aura-essence.com",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000",
    color: "#FF4E00",
    code: `// Aura Fragrances - Animations
import { motion } from "framer-motion";

export const FragranceCard = ({ item }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="p-8 border border-neutral-100 bg-white"
    >
      <div className="overflow-hidden mb-6">
         <motion.img 
            whileHover={{ scale: 1.05 }}
            src={item.image} 
            alt={item.name} 
         />
      </div>
      <h3 className="font-serif text-2xl mb-2">{item.name}</h3>
      <p className="text-sm uppercase tracking-widest text-[#FF4E00]">
        Explore the notes
      </p>
    </motion.div>
  );
};`
  },
  {
    id: 3,
    title: "Vortex Analytics",
    category: "Fintech / SaaS",
    description: "Real-time data visualization engine for high-frequency trading firms, processing millions of events per second with sub-millisecond latency.",
    technologies: ["D3.js", "WebSockets", "Rust", "TypeScript"],
    link: "https://vortex-app.dev",
    image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1000",
    color: "#00FF00",
    code: `// Vortex Analytics - Real-time Visualization
import * as d3 from 'd3';

export const StreamGraph = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (!data) return;
    
    const svg = d3.select(chartRef.current);
    const stack = d3.stack().offset(d3.stackOffsetWiggle);
    const layers = stack(data);

    // Dynamic scale calculations here
    // High-performance SVG manipulation...
  }, [data]);

  return <svg ref={chartRef} className="w-full h-full" />;
};`
  },
  {
    id: 4,
    title: "Zenith Architecture",
    category: "Minimal / Portfolio",
    description: "A minimalist digital monograph for an award-winning architectural firm, emphasizing whitespace and structured typography.",
    technologies: ["Gatsby", "GraphQL", "Contentful", "Motion"],
    link: "https://zenith-arch.build",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
    color: "#007AFF",
    code: `// Zenith Architecture - Structured Typography
import React from 'react';

export const EditorialSection = ({ title, content }) => {
  return (
    <section className="px-container py-40 grid lg:grid-cols-12 gap-24">
      <div className="lg:col-span-5">
        <h2 className="text-editorial text-8xl font-black uppercase">
          {title}
        </h2>
      </div>
      <div className="lg:col-span-1 border-r border-black/10" />
      <div className="lg:col-span-6">
        <p className="text-2xl font-light leading-relaxed">
           {content.longText}
        </p>
      </div>
    </section>
  );
};`
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

export function VerificationBanner({ 
  user, 
  handleSendVerification, 
  checkVerification,
  isVerificationSent 
}: { 
  user: any; 
  handleSendVerification: () => void; 
  checkVerification: () => void;
  isVerificationSent: boolean;
}) {
  if (!user || user.emailVerified) return null;

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-brand-accent text-brand-primary py-2 px-6 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-[60] shadow-md"
    >
      <div className="flex items-center gap-2">
        <Mail className="w-3 h-3" />
        <span>Identity Registry unverified. Link your address to secure your account.</span>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={handleSendVerification}
          disabled={isVerificationSent}
          className="underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity disabled:opacity-50"
        >
          {isVerificationSent ? "Link Transmitted" : "Send Link"}
        </button>
        <button 
          onClick={checkVerification}
          className="bg-brand-primary text-white px-3 py-1 hover:bg-brand-primary/80 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </motion.div>
  );
}

export function UserProfile({ 
  user, 
  isProfileOpen, 
  setIsProfileOpen, 
  handleUpdateProfile, 
  newDisplayName, 
  setNewDisplayName, 
  isUpdatingProfile, 
  activeProfileTab, 
  setActiveProfileTab,
  stripeSessionId,
  handlePortal,
  isCheckoutLoading
}: { 
  user: any; 
  isProfileOpen: boolean; 
  setIsProfileOpen: (open: boolean) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  newDisplayName: string;
  setNewDisplayName: (name: string) => void;
  isUpdatingProfile: boolean;
  activeProfileTab: 'identity' | 'subscription';
  setActiveProfileTab: (tab: 'identity' | 'subscription') => void;
  stripeSessionId: string | null;
  handlePortal: () => void;
  isCheckoutLoading: boolean;
}) {
  return (
    <AnimatePresence>
      {isProfileOpen && user && (
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
            className="bg-brand-bg border-2 border-brand-primary max-w-3xl w-full relative overflow-hidden flex flex-col md:flex-row shadow-[0_0_80px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 -scale-x-125 transform translate-x-1/2 -translate-y-1/2 rounded-full" />
            
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-neutral-100 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sidebar / Profile Meta */}
            <div className="md:w-72 bg-neutral-50 p-10 border-b-2 md:border-b-0 md:border-r-2 border-brand-primary flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-accent mb-6 relative group">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt={user.displayName || ''} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-xl font-serif font-black uppercase tracking-tight truncate w-full">{user.displayName || 'Architect'}</h2>
              
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-brand-accent animate-pulse'}`} />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40">
                  {user.emailVerified ? 'Verified Nexus Registry' : 'Unverified Registry'}
                </span>
              </div>

              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-400 mt-6">Member Since</p>
              <p className="text-[10px] font-mono mt-1 opacity-60 italic">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'N/A'}</p>
              
              <div className="mt-12 w-full space-y-2">
                {[
                  { id: 'identity', label: 'Identity Registry', icon: <UserIcon className="w-3 h-3" /> },
                  { id: 'subscription', label: 'Subscriptions', icon: <Cpu className="w-3 h-3" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all border-l-2 ${
                      activeProfileTab === tab.id 
                        ? 'border-brand-accent bg-white text-brand-primary shadow-sm' 
                        : 'border-transparent text-neutral-400 hover:text-brand-primary'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 md:p-14 min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeProfileTab === 'identity' ? (
                  <motion.div
                    key="identity"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-12"
                  >
                    <div className="space-y-2 text-editorial">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-px bg-brand-accent" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Core Meta</h3>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tighter">Edit Identity.</h4>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block px-1">Global Handle</label>
                        <input 
                          type="text" 
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          className="w-full bg-white border border-brand-primary/10 py-4 px-4 outline-none focus:border-brand-accent focus:ring-0 transition-all font-medium text-lg tracking-tight"
                          placeholder="Assign a new handle..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block px-1">Registry Address</label>
                        <div className="w-full bg-neutral-100/30 border border-brand-primary/10 py-4 px-4 text-neutral-500 font-mono text-xs">
                          {user.email}
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="w-full bg-brand-primary text-white py-5 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-brand-accent transition-all disabled:opacity-50"
                      >
                        {isUpdatingProfile ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Authorize Changes
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="subscription"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-12"
                  >
                    <div className="space-y-2 text-editorial">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-px bg-brand-accent" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Nexus Access</h3>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tighter">Your Pipeline.</h4>
                    </div>

                    <div className="space-y-8">
                      {stripeSessionId ? (
                        <div className="bg-white border border-brand-primary/10 p-8 space-y-6">
                          <div className="flex justify-between items-center border-b border-brand-primary/5 pb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Current Status</span>
                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase tracking-widest">Active</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed italic font-serif">
                            You have an active architectural subscription linked to this account. You can manage billing, invoices, and plan details via the secure portal.
                          </p>
                          <button 
                            onClick={handlePortal}
                            disabled={isCheckoutLoading}
                            className="w-full border-2 border-brand-primary py-4 font-bold uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-brand-primary hover:text-white transition-all disabled:opacity-50"
                          >
                            {isCheckoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                            Manage Billing Portal
                          </button>
                        </div>
                      ) : (
                        <div className="bg-neutral-50/50 border border-dashed border-brand-primary/20 p-10 text-center space-y-6">
                           <div className="p-4 bg-brand-primary/5 inline-block rounded-full">
                             <Cpu className="w-8 h-8 opacity-20" />
                           </div>
                           <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 max-w-xs mx-auto">No active subscription sequence detected in this workspace.</p>
                           <a href="#premium" onClick={() => setIsProfileOpen(false)} className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-accent hover:underline decoration-2 underline-offset-4">Browse Access Tiers &rarr;</a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  const [projectTab, setProjectTab] = useState<'overview' | 'code'>('overview');
  const [activeProfileTab, setActiveProfileTab] = useState<'identity' | 'subscription'>('identity');
  
  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Stripe State
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(localStorage.getItem('stripe_session_id'));
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Profile Edit State
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { scrollY } = useScroll();
  const bgCircleY1 = useTransform(scrollY, [0, 800], [0, 150]);
  const bgCircleY2 = useTransform(scrollY, [0, 800], [0, -100]);

  useEffect(() => {
    if (user) {
      setNewDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDisplayName.trim()) return;

    setIsUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName: newDisplayName });
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { displayName: newDisplayName });
      setNotification({ message: "Profile registry updated successfully.", type: 'success' });
    } catch (error) {
      console.error("Profile update failed", error);
      setNotification({ message: "Failed to update profile registry.", type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      setStripeSessionId(sessionId);
      localStorage.setItem('stripe_session_id', sessionId);
    }

    if (urlParams.get('success')) {
      setNotification({ message: "Subscription activated! Welcome to Nexus Studio.", type: 'success' });
      window.history.replaceState({}, document.title, "/");
    }
    if (urlParams.get('canceled')) {
      setNotification({ message: "Checkout canceled. Let us know if you have questions.", type: 'info' });
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Login failed", error);
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setIsVerificationSent(true);
        setNotification({ message: "Account created. Verification link sent to your registry.", type: 'success' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsAuthModalOpen(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error("Auth failed", error);
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setIsVerificationSent(true);
      setNotification({ message: "Verification link re-transmitted successfully.", type: 'success' });
    } catch (error: any) {
      console.error("Verification failed", error);
      setNotification({ message: "Failed to transmit verification link.", type: 'error' });
    }
  };

  const checkVerification = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    // Force a re-render by letting AuthContext handle it or just using the reloaded user if possible
    window.location.reload(); // Simplest way to refresh auth state in context
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

  const handleSubscribe = async (planType: 'starter' | 'studio' = 'studio') => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      
      const session = await response.json();
      if (session.error) throw new Error(session.error);

      const stripe = await stripePromise;
      const { error } = await (stripe as any).redirectToCheckout({ sessionId: session.id });
      
      if (error) console.error(error);
    } catch (err) {
      console.error("Checkout failed:", err);
      setNotification({ message: "Checkout failed. Please check your credentials.", type: 'error' });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!stripeSessionId) return;
    setIsCheckoutLoading(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: stripeSessionId }),
      });
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err) {
      console.error("Portal redirect failed:", err);
      setNotification({ message: "Failed to open billing portal.", type: 'error' });
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
    <div className="min-h-screen font-sans selection:bg-brand-accent selection:text-white relative">
      <VerificationBanner 
        user={user} 
        handleSendVerification={handleSendVerification} 
        checkVerification={checkVerification}
        isVerificationSent={isVerificationSent} 
      />
      <div className="fixed inset-0 grain-bg z-[1000] pointer-events-none" />
      
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[200] px-8 py-4 border-2 border-brand-primary font-bold uppercase text-[10px] tracking-widest flex items-center gap-4 bg-white shadow-2xl ${
              notification.type === 'error' ? 'text-brand-accent' : 
              notification.type === 'success' ? 'text-green-600' : 'text-brand-primary'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : 
             notification.type === 'error' ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-4 opacity-40 hover:opacity-100 italic font-serif">Close</button>
          </motion.div>
        )}
      </AnimatePresence>

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
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 group hover:text-brand-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-primary group-hover:border-brand-accent transition-colors">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="hidden lg:inline">{user.displayName}</span>
                </button>
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
                  <>
                    <button 
                      onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }}
                      className="text-left hover:text-brand-accent transition-colors border-t border-brand-primary/10 pt-6"
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="text-left hover:text-brand-accent transition-colors border-t border-brand-primary/10 pt-3"
                    >
                      Logout
                    </button>
                  </>
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
              className="bg-brand-bg border-2 border-brand-primary p-10 md:p-14 max-w-lg w-full relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 -scale-x-125 transform translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" />

              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-neutral-100 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-10 relative z-10">
                <div className="space-y-4 text-center">
                  <h2 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter">
                    {authMode === 'login' ? 'Access Nexus.' : 'Join Studio.'}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                    {authMode === 'login' ? 'Authentication Required' : 'Initialize Membership Sequence'}
                  </p>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 px-1">Registry Email</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-brand-primary/10 py-4 px-4 outline-none focus:border-brand-accent transition-all font-medium"
                      placeholder="email@nexus.io"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 px-1">Access Cipher</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-brand-primary/10 py-4 px-4 outline-none focus:border-brand-accent transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>

                  {authError && (
                    <div className="text-[9px] font-bold uppercase tracking-widest text-red-500 bg-red-50 p-4 border border-red-100">
                      {authError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full bg-brand-primary text-white py-5 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-brand-accent transition-all disabled:opacity-50"
                  >
                    {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {authMode === 'login' ? 'Authorize Access' : 'Register Identity'}
                  </button>
                </form>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-brand-primary/10" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300">OR</span>
                  <div className="flex-1 h-px bg-brand-primary/10" />
                </div>

                <button 
                  onClick={handleLogin}
                  className="w-full border-2 border-brand-primary py-4 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-neutral-50 transition-all"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
                  Continue with Google
                </button>

                <div className="text-center">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-accent transition-colors"
                  >
                    {authMode === 'login' ? "Don't have an account? Register" : "Already registered? Login"}
                  </button>
                </div>

                <p className="text-[9px] font-medium opacity-30 leading-relaxed uppercase tracking-widest text-center max-w-xs mx-auto">
                  Nexus Studio adheres to zero-trust encryption protocols for all identity registries.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserProfile 
        user={user}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        handleUpdateProfile={handleUpdateProfile}
        newDisplayName={newDisplayName}
        setNewDisplayName={setNewDisplayName}
        isUpdatingProfile={isUpdatingProfile}
        activeProfileTab={activeProfileTab}
        setActiveProfileTab={setActiveProfileTab}
        stripeSessionId={stripeSessionId}
        handlePortal={handlePortal}
        isCheckoutLoading={isCheckoutLoading}
      />

      {/* Hero Section */}
      <section className="min-h-screen pt-40 pb-20 flex flex-col justify-center overflow-hidden relative">
        {/* Abstract Background Element */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            style={{ y: bgCircleY1 }}
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] border border-brand-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" 
          />
          <motion.div 
            style={{ y: bgCircleY2 }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] border border-brand-primary/5 rounded-full translate-x-1/2 translate-y-1/2" 
          />
        </div>

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
 
          <div className="grid md:grid-cols-2 gap-px bg-brand-primary border border-brand-primary overflow-hidden">
            {PROJECTS.map((project, i) => (
              <motion.div
                key={project.id}
                layoutId={`card-${project.id}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.33, 1, 0.68, 1] }}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer bg-brand-bg p-8 md:p-12 hover:bg-neutral-50 transition-all duration-500 relative flex flex-col justify-between"
              >
                {/* Hover Noise Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity grain-bg" />
                
                <div className="relative aspect-[4/3] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 mb-10 border border-brand-primary/5 shadow-sm group-hover:shadow-2xl">
                  <motion.img 
                    layoutId={`image-${project.id}`}
                    src={project.image} 
                    alt={project.title}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-brand-primary/40 backdrop-blur-[2px] flex items-center justify-center p-10"
                  >
                    <div className="bg-brand-bg text-brand-primary px-8 py-4 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                       Full Case Study <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div className="space-y-6">
                    <motion.div layoutId={`number-${project.id}`} className="font-serif italic text-5xl text-brand-accent/30 group-hover:text-brand-accent transition-colors duration-700">{String(i + 1).padStart(2, '0')}</motion.div>
                    <div>
                      <motion.h4 layoutId={`title-${project.id}`} className="text-4xl font-bold uppercase tracking-tighter leading-[0.9] mb-3">{project.title}</motion.h4>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-px bg-brand-primary/20" />
                        <motion.p layoutId={`cat-${project.id}`} className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400">{project.category}</motion.p>
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 45 }}
                    className="p-5 border border-brand-primary/10 rounded-full group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-white transition-all duration-700"
                  >
                    <ArrowUpRight className="w-8 h-8" />
                  </motion.div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              className="bg-brand-bg w-full max-w-7xl h-fit max-h-[95vh] overflow-y-auto relative border-2 border-brand-primary shadow-[0_0_100px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row"
            >
              <button 
                onClick={() => { setSelectedProject(null); setProjectTab('overview'); }}
                className="absolute top-8 right-8 z-30 p-4 bg-brand-bg border border-brand-primary hover:bg-brand-primary hover:text-white transition-all transform hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="lg:w-[55%] aspect-square lg:aspect-auto h-[50vh] lg:h-auto sticky top-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-brand-primary flex flex-col">
                <div className="p-8 border-b border-brand-primary bg-neutral-50 flex items-center justify-between">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setProjectTab('overview')}
                      className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${projectTab === 'overview' ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-brand-primary'}`}
                    >
                      Visuals
                    </button>
                    <button 
                      onClick={() => setProjectTab('code')}
                      className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${projectTab === 'code' ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-brand-primary'}`}
                    >
                      <Code2 className="w-3 h-3" />
                      Source Code
                    </button>
                  </div>
                  {projectTab === 'code' && (
                    <div className="hidden md:flex items-center gap-2 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       Read-Only Preview
                    </div>
                  )}
                </div>

                <div className="flex-1 relative overflow-hidden bg-neutral-900">
                  <AnimatePresence mode="wait">
                    {projectTab === 'overview' ? (
                      <motion.div
                        key="visuals"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                      >
                        <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none z-10" />
                        <motion.img 
                          layoutId={`image-${selectedProject.id}`}
                          src={selectedProject.image}
                          alt={selectedProject.title}
                          className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-1000 scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="code"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                      >
                        <Editor
                          height="100%"
                          defaultLanguage="typescript"
                          theme="vs-dark"
                          value={selectedProject.code}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 20 }
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="lg:w-[45%] p-10 md:p-20 flex flex-col justify-between bg-white relative">
                {/* Decorative BG element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                
                <div className="space-y-16">
                  <div className="space-y-6">
                    <motion.div layoutId={`number-${selectedProject.id}`} className="font-serif italic text-6xl text-brand-accent">
                      {String(PROJECTS.indexOf(selectedProject) + 1).padStart(2, '0')}
                    </motion.div>
                    
                    <div className="space-y-4">
                      <motion.h4 layoutId={`title-${selectedProject.id}`} className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tighter leading-[0.85]">
                        {selectedProject.title}
                      </motion.h4>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-px bg-brand-accent" />
                        <motion.p layoutId={`cat-${selectedProject.id}`} className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                          {selectedProject.category}
                        </motion.p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-brand-primary/10 pb-4">Project Architecture</h5>
                      <p className="text-xl font-medium leading-relaxed font-sans uppercase tracking-tight">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-brand-primary/10 pb-4">Systems Utilized</h5>
                      <div className="flex flex-wrap gap-3">
                        {selectedProject.technologies.map(tech => (
                          <span key={tech} className="px-6 py-3 border border-brand-primary/10 text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-brand-primary hover:text-white transition-colors cursor-default bg-neutral-50/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-20 border-t border-brand-primary/5 mt-auto">
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={selectedProject.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-between bg-brand-primary text-white px-10 py-6 font-bold uppercase text-[10px] tracking-[0.3em] transition-all w-full md:w-auto min-w-[280px]"
                  >
                    Deploy Live Viewer
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </motion.a>
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
      <section id="premium" className="py-40 px-6 bg-white border-y-2 border-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/[0.02] -skew-y-3 transform scale-110 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-24 items-start mb-20">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-brand-accent" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400">Membership Tiers</h2>
                </div>
                <h3 className="text-7xl md:text-9xl font-serif font-black uppercase tracking-tighter leading-[0.8]">
                  SELECT YOUR<br />
                  <span className="text-brand-accent italic font-normal tracking-tight">FREQUENCY.</span>
                </h3>
              </div>
              <p className="text-xl font-medium leading-relaxed max-w-md opacity-70">
                Nexus Studio offers two distinct tiers of digital acceleration. Whether you are bootstrapping a new monument or scaling an enterprise monolith, we have the infrastructure.
              </p>

              {stripeSessionId && (
                <div className="pt-10 border-t border-brand-primary/10">
                  <button 
                    onClick={handlePortal}
                    disabled={isCheckoutLoading}
                    className="group inline-flex items-center gap-6 bg-brand-accent text-white px-10 py-5 font-bold uppercase text-[11px] tracking-[0.25em] transition-all hover:bg-brand-primary disabled:opacity-50"
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Accessing Portal...
                      </>
                    ) : (
                      <>
                        Manage Subscription
                        <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* Starter Plan */}
              <div className="bg-brand-bg border-2 border-brand-primary p-10 flex flex-col justify-between group hover:border-brand-accent transition-colors">
                <div className="space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-brand-primary text-brand-accent">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 14 16" fill="currentColor">
                        <path d="M127,50 L126,50 C123.238576,50 121,47.7614237 121,45 C121,42.2385763 123.238576,40 126,40 L135,40 L135,56 L133,56 L133,42 L129,42 L129,56 L127,56 L127,50 Z M127,48 L127,42 L126,42 C124.343146,42 123,43.3431458 123,45 C123,46.6568542 124.343146,48 126,48 L127,48 Z" transform="translate(-121, -40)"/>
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-serif font-black">$20.00</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Monthly</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold uppercase tracking-tighter mb-2">Starter Plan</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Essential Tier</p>
                  </div>
                  <div className="space-y-3">
                    {["Standard CI/CD", "Component Library", "Community Support", "Basic AI Hooks"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3 text-brand-accent" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleSubscribe('starter')}
                  disabled={isCheckoutLoading}
                  className="mt-12 w-full border-2 border-brand-primary py-4 font-bold uppercase text-[10px] tracking-widest hover:bg-brand-primary hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Select Starter"
                  )}
                </button>
              </div>

              {/* Studio Plan */}
              <div className="bg-brand-primary text-brand-bg p-10 flex flex-col justify-between relative overflow-hidden group border-t-8 border-brand-accent">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                  <Cpu className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-brand-accent text-brand-primary">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-serif font-black text-brand-accent">$69.95</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Pro Tier</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold uppercase tracking-tighter mb-2 text-white">The Studio Plan</h4>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-bg/40">Scale Tier</p>
                  </div>
                  <div className="space-y-3">
                    {["Bespoke Components", "Priority CI/CD", "Direct Consulting", "Custom AI Models", "Full Ownership"].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3 text-brand-accent" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleSubscribe('studio')}
                  disabled={isCheckoutLoading}
                  className="relative z-10 mt-12 w-full bg-brand-bg text-brand-primary py-4 font-bold uppercase text-[10px] tracking-widest hover:bg-brand-accent hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Select Studio"
                  )}
                </button>
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
