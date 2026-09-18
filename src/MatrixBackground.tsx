import React, { useEffect, useRef } from 'react';

const MatrixBackground: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const chars = '01';
    const fontSize = 16;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = [];

    // Initialize drops
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * (height / fontSize);
    }

    const draw = () => {
      // Determine background color based on theme
      const bgColor = theme === 'light' ? 'rgba(240, 245, 242, 0.08)' : 'rgba(1, 13, 3, 0.08)';

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        
        // Use the specified green palette: #408C1C and #59BF2A
        ctx.fillStyle = Math.random() > 0.5 ? '#408C1C' : '#59BF2A';
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to the top randomly to create staggered effect
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i]++;
      }
    };

    let animationFrameId: number;
    let lastDrawTime = 0;
    const fps = 30; // Control falling speed
    const interval = 1000 / fps;

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      const deltaTime = time - lastDrawTime;
      
      if (deltaTime > interval) {
         draw();
         lastDrawTime = time - (deltaTime % interval);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * (height / fontSize);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 opacity-15"
    />
  );
};

export default MatrixBackground;
