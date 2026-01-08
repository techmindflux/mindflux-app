import { useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/check-in/manual", icon: Heart, label: "Check-in" },
  { path: "/reflect", icon: BarChart3, label: "Reflect" },
  { path: "/lumina", icon: Sparkles, label: "Lumina AI" },
];

export function LiquidGlassNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* SVG Filter for liquid glass distortion effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="liquid-glass-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015 0.015" 
              numOctaves="3" 
              seed="42" 
              result="noise" 
            />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="blurred" 
              scale="8" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="liquid-glass-container">
          {/* Distortion filter layer */}
          <div className="liquid-glass-filter" />
          
          {/* Background overlay */}
          <div className="liquid-glass-overlay" />
          
          {/* Specular highlight layer */}
          <div className="liquid-glass-specular" />
          
          {/* Content layer */}
          <div className="liquid-glass-content">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    "liquid-glass-item",
                    isActive && "liquid-glass-item--active"
                  )}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[11px] font-semibold tracking-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
