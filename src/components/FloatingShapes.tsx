export const FloatingShapes = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Geometric shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 border-2 border-primary/20 rounded-lg rotate-12 animate-float" />
      <div className="absolute top-40 right-20 w-12 h-12 border-2 border-purple-500/20 rounded-full animate-float animation-delay-2000" />
      <div className="absolute bottom-32 left-32 w-20 h-20 border-2 border-pink-500/20 rotate-45 animate-float animation-delay-4000" />
      <div className="absolute bottom-40 right-40 w-14 h-14 border-2 border-blue-500/20 rounded-full animate-float animation-delay-6000" />
      
      {/* Additional decorative elements */}
      <svg className="absolute top-1/4 right-1/4 w-24 h-24 text-primary/10 animate-float" viewBox="0 0 100 100">
        <polygon points="50,10 90,90 10,90" fill="currentColor" />
      </svg>
      
      <svg className="absolute bottom-1/4 left-1/4 w-32 h-32 text-purple-500/10 animate-float animation-delay-2000" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="currentColor" />
      </svg>
    </div>
  );
};
