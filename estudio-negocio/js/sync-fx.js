import * as THREE from 'three';

/**
 * SYNC-FX.JS
 * Multi-Window Simulation Engine (SID Sync)
 */

export function initSyncHero() {
    const canvas = document.querySelector("#sync-canvas");
    if (!canvas) return;

    // ── CONFIGURATION ──
    const state = {
        windows: [],
        core: null,
        particles: null,
        isLoaded: false
    };

    // ── WEBGL SETUP ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── OBJECTS ──

    // 1. The Core (Glow Sphere)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.SphereGeometry(1, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x00ff9d,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x00ff9d,
        transparent: true,
        opacity: 0.1
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    state.core = coreGroup;

    // 2. Data Particles
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    const velArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
        velArray[i] = (Math.random() - 0.5) * 0.02;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMat = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x00ff9d,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);
    state.particles = { mesh: particlesMesh, pos: posArray, vel: velArray };

    // ── VIRTUAL WINDOWS LOGIC ──
    const winElements = document.querySelectorAll('.v-window');
    
    function setupWindows() {
        winElements.forEach((el, i) => {
            const angle = (i / winElements.length) * Math.PI * 2;
            const radius = window.innerWidth > 768 ? 300 : 150;
            const x = Math.cos(angle) * radius + window.innerWidth / 2 - 160;
            const y = Math.sin(angle) * radius + window.innerHeight / 2 - 110;

            gsap.set(el, { x: x, y: y, opacity: 0 });
            
            state.windows.push({
                el: el,
                baseX: x,
                baseY: y,
                angle: angle,
                floatOffset: Math.random() * 10
            });
        });

        // Entrance Animation
        const tl = gsap.timeline({ delay: 0.5 });
        tl.to(".v-window", { 
            opacity: 1, 
            scale: 1, 
            y: (i, target) => gsap.getProperty(target, "y"), 
            duration: 1.2, 
            stagger: 0.2, 
            ease: "power4.out" 
        });
        tl.from(".status-main", { opacity: 0, y: 30, duration: 1, ease: "power3.out" }, "-=0.8");
        tl.from(".sync-top-left", { opacity: 0, x: -20, duration: 0.8 }, "-=1");
    }

    // ── ANIMATION LOOP ──
    const clock = new THREE.Clock();

    function animate() {
        const elapsedTime = clock.getElapsedTime();
        const requestID = requestAnimationFrame(animate);

        // Core rotation
        if (state.core) {
            state.core.rotation.y = elapsedTime * 0.2;
            state.core.rotation.z = elapsedTime * 0.1;
            
            // Pulse effect
            const s = 1 + Math.sin(elapsedTime * 2) * 0.05;
            state.core.scale.set(s, s, s);
        }

        // Particles animation
        if (state.particles) {
            const positions = state.particles.mesh.geometry.attributes.position.array;
            for (let i = 0; i < particlesCount; i++) {
                const i3 = i * 3;
                positions[i3] += state.particles.vel[i3];
                positions[i3+1] += state.particles.vel[i3+1];
                positions[i3+2] += state.particles.vel[i3+2];

                // Attract to core
                positions[i3] *= 0.995;
                positions[i3+1] *= 0.995;
                positions[i3+2] *= 0.995;

                // Reset if too close
                if (Math.abs(positions[i3]) < 0.1) positions[i3] = (Math.random() - 0.5) * 10;
            }
            state.particles.mesh.geometry.attributes.position.needsUpdate = true;
        }

        // Window floating effect
        state.windows.forEach(win => {
            const floatY = Math.sin(elapsedTime + win.floatOffset) * 15;
            const floatX = Math.cos(elapsedTime * 0.8 + win.floatOffset) * 10;
            gsap.set(win.el, { 
                x: win.baseX + floatX, 
                y: win.baseY + floatY 
            });

            // Active state pulsing randomly
            if (Math.random() > 0.995) {
                win.el.classList.toggle('active');
            }
        });

        renderer.render(scene, camera);
    }

    // ── INITIALIZE ──
    setupWindows();
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Destroy Handler (to free memory when transition ends)
    window.addEventListener('sync-destroy', () => {
        state.windows = [];
        scene.clear();
        renderer.dispose();
        console.log("%c[SYSTEM] SID Sync Engine: Memory Freed", "color: #00ff9d; font-style: italic;");
    });
}

// Global exposure
window.initSyncHero = initSyncHero;
