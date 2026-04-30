/**
 * PARALLAX-ENGINE.JS (v3.2 — "Full Site Luxury" Edition)
 * Replicando efectos de alta gama con reflexión dinámica y suavizado de seda.
 */
function initKitParallax() {
    const parallaxZones = [
        {
            triggerId: 'hero-trigger-top',
            layers: [
                { id: 'hero-img-top', factor: 35 },
                { id: 'hero-glare-top', isGlare: true }
            ]
        },
        {
            triggerId: 'kit-parallax-trigger',
            layers: [
                { id: 'kit-prod-img', factor: 20, isProduct: true },
                { id: 'kit-badge', factor: 12 },
                { id: 'kit-glare', isGlare: true }
            ]
        },
        {
            triggerId: 'ba-trigger-bad',
            layers: [
                { id: 'ba-img-bad', factor: 40 },
                { id: 'ba-glare-bad', isGlare: true }
            ]
        },
        {
            triggerId: 'ba-trigger-good',
            layers: [
                { id: 'ba-img-good', factor: 25, isProduct: true },
                { id: 'ba-glare-good', isGlare: true }
            ]
        },
        {
            triggerId: 'sol-trigger-evo',
            layers: [
                { id: 'sol-img-evo', factor: 30 },
                { id: 'sol-glare-evo', isGlare: true }
            ]
        },
        {
            triggerId: 'hero-trigger-main',
            layers: [
                { id: 'hero-img-main', factor: 35 },
                { id: 'hero-glare-main', isGlare: true }
            ]
        }
    ];

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const lerp = 0.08;

    if (window.innerWidth > 1024) {
        document.addEventListener('mousemove', (e) => {
            targetX = (e.clientX - window.innerWidth / 2);
            targetY = (e.clientY - window.innerHeight / 2);
        });

        function update() {
            currentX += (targetX - currentX) * lerp;
            currentY += (targetY - currentY) * lerp;

            const normX = currentX / (window.innerWidth / 2);
            const normY = currentY / (window.innerHeight / 2);

            parallaxZones.forEach(zone => {
                const trigger = document.getElementById(zone.triggerId);
                if (!trigger) return;

                zone.layers.forEach(layerData => {
                    const el = document.getElementById(layerData.id);
                    if (!el) return;

                    if (layerData.isGlare) {
                        const glareX = -normX * 100;
                        const glareY = -normY * 100;
                        el.style.transform = `translate(${glareX}%, ${glareY}%)`;
                        el.style.opacity = Math.max(0.2, 1 - Math.abs(normX));
                    } else {
                        const x = (currentX / layerData.factor);
                        const y = (currentY / layerData.factor);
                        
                        if (layerData.isProduct) {
                            const rotX = -y / 10;
                            const rotY = x / 10;
                            el.style.transform = `translate(${x}px, ${y}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
                        } else {
                            el.style.transform = `translate(${x}px, ${y}px)`;
                        }
                    }
                });
            });

            requestAnimationFrame(update);
        }

        update();
    }
    
    console.log('Luxury Parallax Engine v3.2: Active');
}

window.initKitParallax = initKitParallax;
