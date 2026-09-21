import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Sparkles, Play, Pause } from 'lucide-react';

export default function BlochSphere3D() {
  const [theta, setTheta] = useState(1.047); // ~60 degrees (pi/3)
  const [phi, setPhi] = useState(0.785);   // ~45 degrees (pi/4)
  const [animating, setAnimating] = useState(true);
  const canvasRef = useRef(null);

  // Auto-animate phi rotation
  useEffect(() => {
    let animId;
    if (animating) {
      const loop = () => {
        setPhi((prev) => (prev + 0.02) % (2 * Math.PI));
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [animating]);

  // Canvas 3D projection renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.38;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw outer sphere glowing circle
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    grad.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.15)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Equator & Meridians (dashed ellipses)
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 0.3, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Coordinate Axes (X, Y, Z)
    // Z-axis (Vertical)
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius - 15);
    ctx.lineTo(cx, cy + radius + 15);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // X-axis (Diagonal forward)
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.7, cy + radius * 0.4);
    ctx.lineTo(cx + radius * 0.7, cy - radius * 0.4);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.stroke();

    // Y-axis (Horizontal)
    ctx.beginPath();
    ctx.moveTo(cx - radius - 15, cy);
    ctx.lineTo(cx + radius + 15, cy);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.stroke();

    // Axis Labels
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('|0⟩ (Z)', cx - 18, cy - radius - 20);
    ctx.fillText('|1⟩ (-Z)', cx - 20, cy + radius + 28);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('X', cx + radius * 0.7 + 5, cy - radius * 0.4);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Y', cx + radius + 18, cy + 4);

    // 4. Calculate 3D State Vector Tip (x, y, z)
    // x = r * sin(theta) * cos(phi)
    // y = r * sin(theta) * sin(phi)
    // z = r * cos(theta)
    const x3d = radius * Math.sin(theta) * Math.cos(phi);
    const y3d = radius * Math.sin(theta) * Math.sin(phi);
    const z3d = radius * Math.cos(theta);

    // Isometric 3D to 2D projection
    const px = cx + x3d * 0.866 - y3d * 0.5;
    const py = cy - z3d + y3d * 0.25;

    // Projection dashed drop line to equator
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, cy + y3d * 0.25);
    ctx.lineTo(cx, cy);
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.5)';
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw State Vector Arrow |Ψ⟩
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Glowing Arrow Tip Point
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#e879f9';
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // State Label next to tip
    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('|Ψ⟩', px + 10, py - 5);

  }, [theta, phi]);

  // Quantum Amplitudes
  const alpha = Math.cos(theta / 2);
  const betaMag = Math.sin(theta / 2);
  const prob0 = (alpha * alpha * 100).toFixed(1);
  const prob1 = (betaMag * betaMag * 100).toFixed(1);

  return (
    <div className="glass-panel-glow rounded-xl p-5 border border-purple-500/30 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-slate-100">Quantum Bloch Sphere</h3>
        </div>
        <button
          onClick={() => setAnimating(!animating)}
          className="flex items-center gap-1.5 text-xs bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg transition"
        >
          {animating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {animating ? 'Pause Rotation' : 'Animate State'}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center my-2">
        <canvas ref={canvasRef} width={320} height={300} className="max-w-full drop-shadow-xl" />
      </div>

      {/* State Vector Math & Angles */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs font-mono text-purple-300">
          <div>|Ψ⟩ = {alpha.toFixed(3)}|0⟩ + {betaMag.toFixed(3)}e<sup>i({phi.toFixed(2)})</sup>|1⟩</div>
          <div className="flex justify-between mt-1 text-[11px] text-slate-400">
            <span>P(|0⟩): <strong className="text-cyan-400">{prob0}%</strong></span>
            <span>P(|1⟩): <strong className="text-purple-400">{prob1}%</strong></span>
          </div>
        </div>

        {/* Sliders for Theta & Phi */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Polar Angle (θ):</span>
              <span className="text-cyan-400 font-mono">{(theta * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.05"
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Azimuth Angle (φ):</span>
              <span className="text-purple-400 font-mono">{(phi * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.05"
              value={phi}
              onChange={(e) => setPhi(parseFloat(e.target.value))}
              className="w-full accent-purple-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
