import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "./HeroBackground";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", delay: 0.5 }
    );
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <HeroBackground />
      
      <div className="max-w-4xl w-full text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div className="bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full flex items-center gap-2 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Connecting the world, beautifully.
          </div>
        </motion.div>

        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl font-serif tracking-tight text-slate-900 leading-[1.1]"
        >
          Welcome to <span className="text-primary italic">Beacon</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A professional social network designed for meaningful connections, 
          authentic interactions, and creative expression.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            className="h-14 px-8 text-lg rounded-full group"
            onClick={onEnter}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full">
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          {[
            { icon: Zap, title: "Real-time", desc: "Instant updates and global messaging" },
            { icon: Shield, title: "Privacy", desc: "You control your data and visibility" },
            { icon: Sparkles, title: "Creative", desc: "Rich media and storytelling tools" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.2 }}
              className="p-6 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-left"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
