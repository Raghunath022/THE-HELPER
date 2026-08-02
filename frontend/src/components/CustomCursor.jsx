import React, { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [angle, setAngle] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide on mobile / touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const onMouseMove = (e) => {
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      
      // Calculate tilt angle based on movement direction
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const moveAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 45;
        setAngle(moveAngle);
      }

      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      const isInteractive = target && target.closest && target.closest('button, a, input, select, textarea, .card-glass, .glass-card, [role="button"], .sensor-value-card');
      setIsHovered(!!isInteractive);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [pos, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        transform: `translate3d(${pos.x - 9}px, ${pos.y - 9}px, 0) rotate(${angle}deg) scale(${isHovered ? 1.4 : isClicked ? 0.75 : 1})`,
        transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        filter: isHovered 
          ? 'drop-shadow(0 0 12px rgba(82, 183, 136, 0.9))' 
          : 'drop-shadow(0 0 6px rgba(82, 183, 136, 0.6))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Leaf 
        size={20} 
        style={{ 
          color: '#52b788', 
          fill: isHovered ? 'rgba(82, 183, 136, 0.5)' : 'rgba(82, 183, 136, 0.25)',
          transition: 'all 0.2s ease'
        }} 
      />
    </div>
  );
}
