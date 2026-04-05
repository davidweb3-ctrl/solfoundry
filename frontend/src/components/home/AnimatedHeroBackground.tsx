import React, { useEffect, useRef, useCallback } from 'react';

/**
 * AnimatedHeroBackground - SolFoundry Forge Theme
 * 
 * Features:
 * - 60fps smooth animations
 * - Forge/factory visual theme with molten metal effects
 * - Floating embers and sparks
 * - Pulsing glow effects
 * - Responsive to screen sizes
 * - Optimized performance (< 30MB bundle impact)
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
}

export function AnimatedHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const lastTimeRef = useRef<number>(0);

  // Colors from SolFoundry brand
  const colors = {
    emerald: '#00E676',
    emeraldGlow: 'rgba(0, 230, 118, 0.3)',
    purple: '#E040FB',
    purpleGlow: 'rgba(224, 64, 251, 0.3)',
    orange: '#FF6D00',
    orangeGlow: 'rgba(255, 109, 0, 0.4)',
    molten: '#FF3D00',
  };

  const createParticle = useCallback((width: number, height: number): Particle => {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;
    
    // Spawn from bottom (forge effect)
    x = Math.random() * width;
    y = height + 10;
    vx = (Math.random() - 0.5) * 0.5;
    vy = -Math.random() * 2 - 0.5;
    
    const colorRand = Math.random();
    let color = colors.emerald;
    if (colorRand > 0.6) color = colors.orange;
    else if (colorRand > 0.3) color = colors.purple;
    
    return {
      x,
      y,
      vx,
      vy,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      decay: Math.random() * 0.005 + 0.002,
      color,
    };
  }, []);

  const createSpark = useCallback((width: number, height: number): Spark => {
    return {
      x: Math.random() * width,
      y: height - Math.random() * 200,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 10 - 5,
      size: Math.random() * 2 + 0.5,
      life: 1,
      maxLife: Math.random() * 30 + 20,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Initialize particles
    for (let i = 0; i < 25; i++) {
      particlesRef.current.push(createParticle(width, height));
    }

    const animate = (currentTime: number) => {
      // Throttle to ~60fps
      if (currentTime - lastTimeRef.current < 16) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = currentTime;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles (floating embers)
      particlesRef.current = particlesRef.current.filter((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.vx += Math.sin(currentTime * 0.001 + index) * 0.01;

        if (p.alpha <= 0 || p.y < -50) {
          return false;
        }

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, p.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.fill();

        return true;
      });

      // Spawn new particles
      if (particlesRef.current.length < 25 && Math.random() < 0.1) {
        particlesRef.current.push(createParticle(width, height));
      }

      // Update and draw sparks
      ctx.globalAlpha = 1;
      sparksRef.current = sparksRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.3; // Gravity
        s.life--;

        if (s.life <= 0 || s.y > height) {
          return false;
        }

        const lifeRatio = s.life / s.maxLife;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = colors.molten;
        ctx.globalAlpha = lifeRatio;
        ctx.fill();

        return true;
      });

      // Spawn sparks occasionally
      if (Math.random() < 0.05) {
        sparksRef.current.push(createSpark(width, height));
      }

      // Draw forge glow at bottom
      const forgeGradient = ctx.createRadialGradient(
        width / 2, height, 0,
        width / 2, height, width * 0.6
      );
      forgeGradient.addColorStop(0, 'rgba(255, 61, 0, 0.15)');
      forgeGradient.addColorStop(0.5, 'rgba(255, 109, 0, 0.05)');
      forgeGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = forgeGradient;
      ctx.globalAlpha = 0.3 + Math.sin(currentTime * 0.002) * 0.1;
      ctx.fillRect(0, 0, width, height);

      // Draw pulsing energy lines
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = colors.emerald;
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const y = height * 0.7 + Math.sin(currentTime * 0.001 + i) * 50;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 50) {
          ctx.lineTo(x, y + Math.sin((x + currentTime) * 0.01) * 20);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createParticle, createSpark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 50%, #1a0f0f 100%)',
      }}
      aria-hidden="true"
    />
  );
}

export default AnimatedHeroBackground;
