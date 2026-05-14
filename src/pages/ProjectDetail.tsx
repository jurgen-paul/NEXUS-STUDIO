import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  X, 
  ArrowLeft, 
  Code2, 
  Copy, 
  Check, 
  ArrowUpRight,
  Globe,
  Layers,
  Cpu,
  Terminal,
  Activity,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { CmsProject, fetchProjects } from '../services/cms';

// This matches the fallback PROJECTS
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

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<CmsProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'code' | 'specs'>('overview');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function loadProject() {
      const result = await fetchProjects();
      let found = result.items.find(p => p.id === id);
      
      if (!found) {
        found = FALLBACK_PROJECTS.find(p => p.id === id);
      }

      setProject(found || null);
      setLoading(false);
    }
    loadProject();
    window.scrollTo(0, 0);
  }, [id]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code registry', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Cpu className="w-12 h-12 text-brand-primary animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">Initializing Specification...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <X className="w-16 h-16 text-brand-accent mb-8" />
        <h1 className="text-5xl font-serif font-black uppercase tracking-tighter mb-4">Blueprint Missing.</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-12">The requested technical specification does not exist in our registry.</p>
        <Link to="/" className="bg-brand-primary text-white px-10 py-5 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-brand-accent transition-all">
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-brand-bg pb-40"
    >
      {/* Navigation Override */}
      <nav className="fixed top-0 w-full z-50 py-8 bg-brand-bg/80 backdrop-blur-xl border-b-2 border-brand-primary">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Registry
          </Link>
          <span className="font-serif font-bold text-xl tracking-tighter uppercase hidden md:block">Nexus Studio. Tech Specification</span>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
             <span className="text-[9px] font-bold uppercase tracking-widest text-brand-primary">Core Node Active</span>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="bg-brand-bg border-4 border-brand-primary shadow-[40px_40px_0px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row overflow-hidden min-h-[85vh]">
          {/* Visuals / Code Side */}
          <div className="lg:w-[60%] border-b lg:border-b-0 lg:border-r-4 border-brand-primary flex flex-col relative h-[50vh] lg:h-auto overflow-hidden">
             <div className="p-8 border-b-4 border-brand-primary bg-neutral-50 flex items-center justify-between z-10">
                <div className="flex gap-4">
                  {[
                    { id: 'overview', label: 'Visual Interface', icon: <Globe className="w-3 h-3" /> },
                    { id: 'code', label: 'Core Snippet', icon: <Terminal className="w-3 h-3" /> },
                    { id: 'specs', label: 'Technical Infrastructure', icon: <Layers className="w-3 h-3" /> }
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setTab(item.id as any)}
                      className={`px-6 py-3 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${tab === item.id ? 'bg-brand-primary text-white shadow-lg' : 'text-neutral-400 hover:text-brand-primary'}`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 relative bg-neutral-900 overflow-hidden">
                <AnimatePresence mode="wait">
                  {tab === 'overview' && (
                    <motion.div
                      key="visuals"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full"
                    >
                      <img 
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-1000"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  )}

                  {tab === 'code' && (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full relative group/code"
                    >
                      <div className="absolute top-8 right-8 z-20 opacity-0 group-hover/code:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopyCode(project.code)}
                          className="p-4 bg-brand-bg border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-2xl"
                        >
                          {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="h-full overflow-auto bg-[#0d0d0d]">
                        <SyntaxHighlighter
                          language="typescript"
                          style={vscDarkPlus}
                          showLineNumbers={true}
                          lineNumberStyle={{ minWidth: '3.5em', paddingRight: '2em', color: '#444', textAlign: 'right' }}
                          customStyle={{
                            margin: 0,
                            padding: '3rem',
                            fontSize: '14px',
                            lineHeight: '1.8',
                            fontFamily: '"JetBrains Mono", monospace',
                            backgroundColor: 'transparent',
                            minHeight: '100%',
                          }}
                        >
                          {project.code || `// No technical data registered for ${project.title}`}
                        </SyntaxHighlighter>
                      </div>
                    </motion.div>
                  )}

                  {tab === 'specs' && (
                    <motion.div
                      key="specs"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full bg-neutral-900 p-12 md:p-20 overflow-auto"
                    >
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          {[
                            { label: 'Latency Target', value: '< 100ms', icon: <Zap className="w-5 h-5 text-brand-accent" /> },
                            { label: 'Security Layer', value: 'AES-256 / SSL', icon: <Shield className="w-5 h-5 text-brand-accent" /> },
                            { label: 'Uptime Integrity', value: '99.99%', icon: <Activity className="w-5 h-5 text-brand-accent" /> },
                            { label: 'Platform Type', value: 'Progressive Edge', icon: <Info className="w-5 h-5 text-brand-accent" /> }
                          ].map(spec => (
                            <div key={spec.label} className="p-8 border border-white/10 bg-white/5 space-y-4">
                               {spec.icon}
                               <div>
                                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-2">{spec.label}</p>
                                  <p className="text-2xl font-serif font-bold text-white tracking-tight">{spec.value}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                       
                       <div className="mt-12 p-8 bg-brand-accent/10 border border-brand-accent/20">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent mb-4">Architecture Summary</p>
                          <p className="text-sm text-white/70 leading-relaxed font-mono">
                            Systems integration involves a decoupled architecture utilizing edge computing nodes for optimized content delivery. {project.technologies.join(', ')} frameworks are orchestrated via CI/CD pipelines to ensure atomic deployments and state persistence across distributed clusters.
                          </p>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          </div>

          {/* Info Side */}
          <div className="lg:w-[40%] p-10 md:p-16 lg:p-24 bg-white relative flex flex-col justify-between">
            <div className="space-y-20">
              <div className="space-y-8">
                <div className="font-serif italic text-5xl md:text-7xl text-brand-accent flex items-center gap-6">
                   <span className="opacity-10">/</span>
                   {project.id.padStart(2, '0')}
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black uppercase tracking-tighter leading-[0.8]">
                    {project.title}
                  </h1>
                  
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-1 bg-brand-accent" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-neutral-400">
                      {project.category}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-16">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 border-b border-brand-primary/10 pb-4">Executive Summary</h5>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed font-sans uppercase tracking-tight text-brand-primary">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-8">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400 border-b border-brand-primary/10 pb-4">Technology Stack</h5>
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map(tech => (
                      <span key={tech} className="px-6 py-3 border-2 border-brand-primary group hover:bg-brand-primary hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.3em] cursor-default">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-24">
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-brand-primary text-white py-8 font-bold uppercase text-[11px] tracking-[0.5em] flex items-center justify-center gap-6 hover:bg-brand-accent hover:shadow-[0_20px_40px_rgba(226,255,69,0.2)] transition-all transform hover:-translate-y-1"
              >
                Launch Production Site
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
