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
  Cpu
} from 'lucide-react';
import { CmsProject, fetchProjects } from '../services/cms';

// This matches the fallback PROJECTS in App.tsx
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
  const [tab, setTab] = useState<'overview' | 'code'>('overview');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function loadProject() {
      // First try CMS
      const result = await fetchProjects();
      let found = result.items.find(p => p.id === id);
      
      // If not in CMS, check fallback list
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
        <Cpu className="w-12 h-12 text-brand-primary animate-spin" />
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
      className="min-h-screen bg-brand-bg"
    >
      {/* Navigation Override */}
      <nav className="fixed top-0 w-full z-50 py-8 bg-brand-bg/80 backdrop-blur-xl border-b-2 border-brand-primary">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </Link>
          <span className="font-serif font-bold text-xl tracking-tighter uppercase">Nexus Studio.</span>
          <div className="w-24 px-4" /> {/* Spacer */}
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="bg-brand-bg border-2 border-brand-primary shadow-2xl flex flex-col lg:flex-row overflow-hidden min-h-[80vh]">
          {/* Visuals / Code Side */}
          <div className="lg:w-[55%] border-b lg:border-b-0 lg:border-r border-brand-primary flex flex-col relative h-[50vh] lg:h-auto">
             <div className="p-8 border-b border-brand-primary bg-neutral-50 flex items-center justify-between">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setTab('overview')}
                    className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'overview' ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-brand-primary'}`}
                  >
                    Visuals
                  </button>
                  <button 
                    onClick={() => setTab('code')}
                    className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'code' ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-brand-primary'}`}
                  >
                    <Code2 className="w-3 h-3" />
                    Source Code
                  </button>
                </div>
              </div>

              <div className="flex-1 relative bg-neutral-900 overflow-hidden">
                <AnimatePresence mode="wait">
                  {tab === 'overview' ? (
                    <motion.div
                      key="visuals"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <img 
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full relative group/code"
                    >
                      <div className="absolute top-6 right-6 z-20 opacity-0 group-hover/code:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCopyCode(project.code)}
                          className="p-3 bg-brand-bg border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-xl"
                        >
                          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="h-full overflow-auto bg-[#1e1e1e]">
                        <SyntaxHighlighter
                          language="typescript"
                          style={vscDarkPlus}
                          showLineNumbers={true}
                          lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#858585', textAlign: 'right' }}
                          customStyle={{
                            margin: 0,
                            padding: '2rem',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            backgroundColor: 'transparent',
                            minHeight: '100%',
                          }}
                        >
                          {project.code}
                        </SyntaxHighlighter>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
          </div>

          {/* Info Side */}
          <div className="lg:w-[45%] p-10 md:p-20 bg-white relative flex flex-col justify-between">
            <div className="space-y-16">
              <div className="space-y-6">
                <div className="font-serif italic text-4xl md:text-6xl text-brand-accent">
                   {project.id.padStart(2, '0')}
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tighter leading-[0.85]">
                    {project.title}
                  </h1>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-px bg-brand-accent" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                      {project.category}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-brand-primary/10 pb-4">Architecture</h5>
                  <p className="text-xl font-medium leading-relaxed font-sans uppercase tracking-tight">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-6">
                  <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 border-b border-brand-primary/10 pb-4">Systems Utilized</h5>
                  <div className="flex flex-wrap gap-3">
                    {project.technologies.map(tech => (
                      <span key={tech} className="px-6 py-3 border border-brand-primary/10 text-[9px] font-bold uppercase tracking-[0.3em] bg-neutral-50/50">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-20">
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-brand-primary text-white py-6 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-brand-accent transition-all"
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
