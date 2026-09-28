import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  className?: string;
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = 'absolute inset-0 w-full h-[680px] pointer-events-none opacity-60' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 680;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 90;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Node mesh group
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const NODE_COUNT = 90;
    const positions = new Float32Array(NODE_COUNT * 3);
    const velocities: Array<{
      x: number;
      y: number;
      z: number;
      threatState: number; // 0 = Safe (Cyan), 1 = Neutralizing (Red), 2 = Resolving
      flashTimer: number;
    }> = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 160;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 50;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      velocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.08,
        z: (Math.random() - 0.5) * 0.04,
        threatState: 0,
        flashTimer: 0,
      });
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const colors = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      // Cyan #00E5C7 default (0.0, 0.9, 0.78)
      colors[i * 3] = 0.0;
      colors[i * 3 + 1] = 0.9;
      colors[i * 3 + 2] = 0.78;
    }
    pointGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glow canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(0,229,199,0.8)');
      grad.addColorStop(0.7, 'rgba(0,229,199,0.2)');
      grad.addColorStop(1, 'rgba(0,229,199,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const pointTexture = new THREE.CanvasTexture(canvas);

    const pointMaterial = new THREE.PointsMaterial({
      size: 3.5,
      map: pointTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pointCloud = new THREE.Points(pointGeometry, pointMaterial);
    nodeGroup.add(pointCloud);

    // Dynamic Connecting Lines
    const maxLines = 180;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    nodeGroup.add(linesMesh);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.04;
      mouseY = (e.clientY - windowHalfY) * 0.04;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Threat pulses interval
    const threatInterval = setInterval(() => {
      const targetIdx = Math.floor(Math.random() * NODE_COUNT);
      velocities[targetIdx].threatState = 1;
      velocities[targetIdx].flashTimer = 45;
    }, 2600);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      nodeGroup.rotation.y = targetX * 0.005;
      nodeGroup.rotation.x = -targetY * 0.005;

      const posAttr = pointGeometry.attributes.position as THREE.BufferAttribute;
      const colAttr = pointGeometry.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < NODE_COUNT; i++) {
        const v = velocities[i];
        posAttr.array[i * 3] += v.x;
        posAttr.array[i * 3 + 1] += v.y;
        posAttr.array[i * 3 + 2] += v.z;

        if (Math.abs(posAttr.array[i * 3]) > 85) v.x *= -1;
        if (Math.abs(posAttr.array[i * 3 + 1]) > 55) v.y *= -1;
        if (Math.abs(posAttr.array[i * 3 + 2]) > 30) v.z *= -1;

        if (v.threatState === 1) {
          v.flashTimer--;
          // Red flash (#FF4757)
          colAttr.array[i * 3] = 1.0;
          colAttr.array[i * 3 + 1] = 0.28;
          colAttr.array[i * 3 + 2] = 0.34;

          if (v.flashTimer <= 0) {
            v.threatState = 2;
            v.flashTimer = 30;
          }
        } else if (v.threatState === 2) {
          v.flashTimer--;
          const progress = 1.0 - v.flashTimer / 30;
          colAttr.array[i * 3] = THREE.MathUtils.lerp(1.0, 0.0, progress);
          colAttr.array[i * 3 + 1] = THREE.MathUtils.lerp(0.5, 0.9, progress);
          colAttr.array[i * 3 + 2] = THREE.MathUtils.lerp(0.2, 0.78, progress);

          if (v.flashTimer <= 0) {
            v.threatState = 0;
            colAttr.array[i * 3] = 0.0;
            colAttr.array[i * 3 + 1] = 0.9;
            colAttr.array[i * 3 + 2] = 0.78;
          }
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Connecting lines
      let lineIdx = 0;
      for (let i = 0; i < NODE_COUNT && lineIdx < maxLines; i++) {
        for (let j = i + 1; j < NODE_COUNT && lineIdx < maxLines; j++) {
          const dx = posAttr.array[i * 3] - posAttr.array[j * 3];
          const dy = posAttr.array[i * 3 + 1] - posAttr.array[j * 3 + 1];
          const dz = posAttr.array[i * 3 + 2] - posAttr.array[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 22) {
            const p1 = lineIdx * 6;
            linePositions[p1] = posAttr.array[i * 3];
            linePositions[p1 + 1] = posAttr.array[i * 3 + 1];
            linePositions[p1 + 2] = posAttr.array[i * 3 + 2];

            linePositions[p1 + 3] = posAttr.array[j * 3];
            linePositions[p1 + 4] = posAttr.array[j * 3 + 1];
            linePositions[p1 + 5] = posAttr.array[j * 3 + 2];

            const isThreat = velocities[i].threatState === 1 || velocities[j].threatState === 1;
            const alpha = 1.0 - dist / 22;

            if (isThreat) {
              lineColors[p1] = 1.0 * alpha;
              lineColors[p1 + 1] = 0.28 * alpha;
              lineColors[p1 + 2] = 0.34 * alpha;
              lineColors[p1 + 3] = 1.0 * alpha;
              lineColors[p1 + 4] = 0.28 * alpha;
              lineColors[p1 + 5] = 0.34 * alpha;
            } else {
              lineColors[p1] = 0.0;
              lineColors[p1 + 1] = 0.8 * alpha;
              lineColors[p1 + 2] = 0.7 * alpha;
              lineColors[p1 + 3] = 0.0;
              lineColors[p1 + 4] = 0.8 * alpha;
              lineColors[p1 + 5] = 0.7 * alpha;
            }
            lineIdx++;
          }
        }
      }

      for (let k = lineIdx * 6; k < maxLines * 6; k++) {
        linePositions[k] = 0;
        lineColors[k] = 0;
      }

      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 680;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(threatInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={className} style={{ display: 'block' }} />;
};
