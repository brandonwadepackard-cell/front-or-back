import { ReactNode, useEffect, useRef, useState } from "react";

interface ParallaxHeroProps {
  children: ReactNode;
}

export const ParallaxHero = ({ children }: ParallaxHeroProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", () => setIsHovering(true));
      container.addEventListener("mouseleave", () => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", () => setIsHovering(true));
        container.removeEventListener("mouseleave", () => setIsHovering(false));
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Floating decorative elements with parallax */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: isHovering ? "none" : "transform 0.5s ease-out",
        }}
      >
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl rotate-12 blur-xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl" />
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl rotate-45 blur-xl" />
      </div>

      {/* Geometric shapes layer - faster movement */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`,
          transition: isHovering ? "none" : "transform 0.5s ease-out",
        }}
      >
        <svg className="absolute top-1/4 right-1/4 w-16 h-16 text-primary/10" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-1/3 left-1/3 w-20 h-20 text-purple-500/10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
        </svg>
        <div className="absolute top-1/2 right-1/3 w-12 h-12 border-2 border-pink-500/20 rounded-lg rotate-12" />
      </div>

      {/* Content layer - subtle movement */}
      <div
        style={{
          transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
          transition: isHovering ? "none" : "transform 0.5s ease-out",
        }}
      >
        {children}
      </div>

      {/* Grid overlay with parallax */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`,
          transition: isHovering ? "none" : "transform 0.5s ease-out",
        }}
      />
    </div>
  );
};
