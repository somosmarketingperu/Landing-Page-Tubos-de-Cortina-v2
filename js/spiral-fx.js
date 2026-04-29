/**
 * SPIRAL-FX.JS — Motor de Partículas en Espiral (Glimmer Style)
 * Genera un vórtice gravitacional continuo de partículas usando coordenadas polares
 * y motion blur mediante el repintado semitransparente del canvas.
 */

function initSpiralBackground() {
    const canvas = document.getElementById('va-spiral-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // alpha false para optimizar renderizado
    let width, height, cx, cy;
    let particles = [];
    let animationFrameId;

    // Configuración del motor
    const config = {
        particleCount: 500,
        speed: 0.002,
        baseRadius: 0,
        trailFade: 0.08, // Define el tamaño de la estela (menor = más estela)
        colors: [
            '#c88264', // Cobre de la marca
            '#fcd34d', // Dorado suave
            '#d97706', // Ámbar
        ]
    };

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        // Escalado para pantallas retina para que no se vea pixelado
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        cx = width / 2;
        cy = height / 2;
        config.baseRadius = Math.max(width, height) / 1.5;
        initParticles();
    }

    class Particle {
        constructor() {
            this.reset();
            // Espaciar el ángulo de inicio para que llenen la pantalla al arrancar
            this.angle = Math.random() * Math.PI * 2; 
        }

        reset() {
            this.radius = Math.random() * config.baseRadius;
            this.angle = Math.random() * Math.PI * 2;
            this.size = Math.random() * 2 + 0.5;
            this.speed = (Math.random() * 1 + 0.5) * config.speed;
            this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            // Variación gravitacional (espiral)
            this.inwardSpeed = Math.random() * 0.5 + 0.1;
        }

        update() {
            // Girar
            this.angle += this.speed;
            // Ser atraído al centro
            this.radius -= this.inwardSpeed;

            // Si llega al centro, renace en el borde
            if (this.radius < 0) {
                this.reset();
                this.radius = config.baseRadius;
            }

            // Convertir polares a cartesianas
            this.x = cx + Math.cos(this.angle) * this.radius;
            this.y = cy + Math.sin(this.angle) * this.radius;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
            // Pre-calcular posiciones para que no empiecen todas en el borde
            particles[i].radius = Math.random() * config.baseRadius;
        }
    }

    function animate() {
        // En lugar de ctx.clearRect, pintamos con un fondo semitransparente
        // Esto genera el efecto de estela / Motion Blur del espiral
        
        // Detectar el tema actual para pintar el fondo correcto (blanco o negro)
        const isDark = document.documentElement.classList.contains('dark-theme');
        ctx.fillStyle = isDark ? `rgba(10, 10, 10, ${config.trailFade})` : `rgba(252, 251, 249, ${config.trailFade})`;
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    // Inicializar
    window.addEventListener('resize', resize);
    resize();
    animate();

    // Optimización: Pausar si no está visible la pestaña
    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animate();
        }
    });
}

// Exponer la función para que app-bundle.js o main.js la ejecuten
window.initSpiralBackground = initSpiralBackground;
