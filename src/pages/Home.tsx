import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Code2, 
  Cpu, 
  Globe, 
  Menu, 
  Sparkles, 
  Search,
  X,
  LogOut,
  User as UserIcon,
  Loader2,
  Mail,
  CheckCircle2,
  Zap,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { fetchProjects, CmsProject } from "../services/cms";
import { auth, db } from "../lib/firebase";
import Tooltip from "../components/Tooltip";
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
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_live_51QexFCQZffAQWpOy18h0MW5ILt5dWWgHtxPu4Of9VWCJnwJL0zsny7caL0C9rmJy9aDLq16srE4sLfzvEytPBFnn00FlLS6VGJ");

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

const CLIENTS = ["Ether", "Vortex", "Aura", "Zenith", "Quantum", "Eon", "Nova"];

const FALLBACK_PROJECTS: CmsProject[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
      className="bg-brand-accent text-brand-primary py-3 px-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-[60] shadow-md text-center sm:text-left"
    >
      <div className="flex items-center gap-2">
        <Mail className="w-3 h-3 flex-shrink-0" />
        <span>Identity Registry unverified. Link your address to secure your account.</span>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <button 
          onClick={handleSendVerification}
          disabled={isVerificationSent}
          className="underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity disabled:opacity-50"
        >
          {isVerificationSent ? "Link Transmitted" : "Send Link"}
        </button>
        <button 
          onClick={checkVerification}
          className="bg-brand-primary text-white px-3 py-1 hover:bg-brand-primary/80 transition-colors whitespace-nowrap"
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
  isCheckoutLoading,
  setNotification
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
  setNotification: (notif: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
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
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-neutral-100 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

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

            <div className="flex-1 p-6 md:p-14 min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeProfileTab === 'identity' ? (
                  <motion.div key="identity" className="space-y-12">
                    <h4 className="text-3xl font-serif font-black uppercase tracking-tighter">Edit Identity.</h4>
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
                      <button type="submit" disabled={isUpdatingProfile} className="w-full bg-brand-primary text-white py-5 font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-brand-accent disabled:opacity-50">
                        {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 inline mr-2" />}
                        Authorize Changes
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="subscription" className="space-y-12">
                    <h4 className="text-3xl font-serif font-black uppercase tracking-tighter">Your Pipeline.</h4>
                    {stripeSessionId ? (
                         <div className="bg-white border border-brand-primary/10 p-8 space-y-6">
                            <button onClick={handlePortal} disabled={isCheckoutLoading} className="w-full border-2 border-brand-primary py-4 font-bold uppercase text-[9px] hover:bg-brand-primary hover:text-white disabled:opacity-50">
                                Manage Billing Portal
                            </button>
                         </div>
                    ) : (
                        <div className="space-y-10">
                            <Elements stripe={stripePromise}>
                                <CheckoutForm onSuccess={() => setNotification({ message: "Authorized.", type: 'success' })} />
                            </Elements>
                        </div>
                    )}
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

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projects, setProjects] = useState<CmsProject[]>(FALLBACK_PROJECTS);
  const [cmsError, setCmsError] = useState<{ status: number; message: string; cause?: string } | null>(null);

  useEffect(() => {
    async function loadCmsContent() {
      const result = await fetchProjects();
      if (result.items.length > 0) {
        setProjects(result.items);
      }
      if (result.error) {
        setCmsError(result.error);
      }
    }
    loadCmsContent();
  }, []);

  const [activeProfileTab, setActiveProfileTab] = useState<'identity' | 'subscription'>('identity');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(localStorage.getItem('stripe_session_id'));
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const { scrollY } = useScroll();
  const bgCircleY1 = useTransform(scrollY, [0, 800], [0, 150]);
  const bgCircleY2 = useTransform(scrollY, [0, 800], [0, -100]);

  useEffect(() => {
    if (user) setNewDisplayName(user.displayName || '');
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDisplayName.trim()) return;
    setIsUpdatingProfile(true);
    try {
      await updateProfile(user, { displayName: newDisplayName });
      await updateDoc(doc(db, 'users', user.uid), { displayName: newDisplayName });
      setNotification({ message: "Profile updated.", type: 'success' });
    } catch (error) {
      setNotification({ message: "Update failed.", type: 'error' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      setIsAuthModalOpen(false);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setIsVerificationSent(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsAuthModalOpen(false);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const checkVerification = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    window.location.reload();
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'messages'), { ...contactForm, createdAt: serverTimestamp() });
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePortal = async () => {
    if (!stripeSessionId) return;
    setIsCheckoutLoading(true);
    try {
      const resp = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: stripeSessionId }),
      });
      const { url } = await resp.json();
      window.location.href = url;
    } catch (err) {
      setNotification({ message: "Portal error.", type: 'error' });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent selection:text-white relative">
      <VerificationBanner 
        user={user} 
        handleSendVerification={() => sendEmailVerification(auth.currentUser!)} 
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
            className="fixed bottom-10 left-1/2 z-[200] px-8 py-4 border-2 border-brand-primary bg-white shadow-2xl text-[10px] uppercase font-bold"
          >
            {notification.message}
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
          <span className="font-serif font-bold text-2xl tracking-tighter uppercase cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Nexus Studio.</span>

          <div className="hidden md:flex items-center gap-12 font-bold text-[11px] tracking-[0.25em] uppercase">
            {["Work", "Studio", "Services", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-brand-accent transition-all">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center bg-white border border-brand-primary/10 px-4 py-2 gap-3">
            <Search className="w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-40"
            />
          </div>

          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-brand-primary text-white px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-accent transition-all">
                Log In
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 group hover:text-brand-primary">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-primary group-hover:border-brand-accent">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="" className="w-full h-full object-cover" />
                  </div>
                </button>
                <button onClick={logout} className="p-2 hover:text-brand-accent transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CMS Error Notification & Troubleshooting Guide */}
      {cmsError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[91vw] max-w-3xl bg-brand-primary border-2 border-brand-accent p-8 shadow-[0_0_80px_rgba(226,255,69,0.3)]">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-brand-accent animate-pulse" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">CMS Sync Blocked (Error {cmsError.status})</h4>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-white leading-relaxed font-medium">
                  {cmsError.status === 404 
                    ? "The application was unable to locate your Contentful repository. This typically originates from using a 'Space Name' instead of the alphanumeric 'Space ID'."
                    : cmsError.message
                  }
                </p>
                
                <div className="bg-white/5 p-5 border border-white/10 space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Diagnostic Reason:</p>
                  <p className="text-[11px] text-white opacity-90 leading-relaxed font-mono">
                    {cmsError.cause || "Undefined connection timeout or invalid protocol."}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-6">
                <button 
                  onClick={() => setCmsError(null)}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-accent hover:underline underline-offset-8 decoration-2"
                >
                  Dismiss & Run Local Mode &rarr;
                </button>
              </div>
            </div>

            <div className="md:w-64 space-y-6 border-l md:border-l-2 border-white/10 pl-0 md:pl-10">
              <h5 className="text-[9px] font-bold uppercase tracking-[0.3em] text-brand-accent">Actionable Fixes</h5>
              <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <li className="flex gap-3">
                  <span className="text-brand-accent">01</span>
                  <span>Visit Settings &gt; API keys</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-accent">02</span>
                  <span>Copy "Space ID" (Short CID)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-accent">03</span>
                  <span>Verify Environment ID (master)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-accent">04</span>
                  <span>Update .env Variables</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen pt-40 pb-20 flex flex-col justify-center overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 w-full relative">
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(2.5rem,10vw,10rem)] font-serif font-black leading-[0.85] tracking-[-0.04em] uppercase"
          >
            CRAFTING<br />DIGITAL<br />
            <span className="text-brand-accent italic font-normal tracking-wide">PRECISION.</span>
          </motion.h1>
        </div>
      </section>

      {/* Project Grid */}
      <section id="work" className="py-20 md:py-32 px-6 border-t-2 border-brand-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-primary border border-brand-primary">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group cursor-pointer bg-brand-bg p-12 hover:bg-neutral-50 transition-all duration-500 relative"
              >
                <div className="aspect-[4/3] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 mb-10">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <h4 className="text-4xl font-bold uppercase tracking-tighter leading-[0.9] mb-3">{project.title}</h4>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400">{project.category}</p>
                <div className="absolute top-12 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-8 h-8 text-brand-accent" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

       {/* Auth Modal Overlay */}
       <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-primary/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-brand-bg border-2 border-brand-primary p-14 max-w-lg w-full relative">
              <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-6 right-6 p-2"><X className="w-5 h-5"/></button>
              <form onSubmit={handleEmailAuth} className="space-y-6">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-brand-primary/10 p-4" placeholder="Email" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-brand-primary/10 p-4" placeholder="Password" />
                <button type="submit" className="w-full bg-brand-primary text-white py-5 font-bold uppercase text-[10px] tracking-[0.3em]">Authorize</button>
              </form>
              <button onClick={handleLogin} className="w-full border-2 border-brand-primary py-4 mt-6 font-bold uppercase text-[10px] flex items-center justify-center gap-4">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
                Continue with Google
              </button>
            </motion.div>
          </div>
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
        setNotification={setNotification}
      />
    </div>
  );
}
