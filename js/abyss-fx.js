import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

/**
 * ABYSS-FX.JS
 * Túnel Submarino 3D + HUD Animado y Textos Cíclicos
 */

export function initAbyssBackground() {
    const canvas = document.querySelector("#abyss-canvas");
    if (!canvas) return;

    // ── HUD: Animaciones GSAP y Textos Cíclicos ──
    if (typeof gsap !== 'undefined') {
        const hudEl = document.getElementById("abyss-hud");
        const cEl   = document.getElementById("coords");
        
        // Animación de entrada HUD
        gsap.timeline({defaults:{ease:"power3.out"},delay:0.3})
            .from(".hud-header",   {opacity:0, y:-12, duration:0.6})
            .from(".side-r",       {opacity:0, x:12, duration:0.5}, "-=0.3")
            .from(".f-title",      {opacity:0, y:20, duration:0.6, stagger:0.1}, "-=0.3")
            .from(".f-meta",       {opacity:0, y:8, duration:0.4}, "-=0.2")
            .from(".f-right > *",  {opacity:0, x:10, duration:0.4, stagger:0.08}, "-=0.4");

        // Coordenadas
        if (cEl) {
            window.addEventListener("mousemove", e => {
                const x = ((e.clientX / innerWidth) * 2 - 1).toFixed(3);
                const y = ((e.clientY / innerHeight) * 2 - 1).toFixed(3);
                cEl.textContent = `${x>=0?"+":""}${x} / ${y>=0?"+":""}${y}`;
            });
        }

        // Parallax Sutil del HUD
        window.addEventListener("mousemove", e => {
            const px = (e.clientX / innerWidth - 0.5) * 2;
            const py = (e.clientY / innerHeight - 0.5) * 2;
            gsap.to(".hud-footer", {x: px * 6, y: py * 3, duration: 1.8, ease: "power2.out"});
            gsap.to(".hud-header", {x: px * 3, duration: 1.6, ease: "power2.out"});
        });

        // Ciclo de frases creativas (Somos...)
        const dynamicText = document.getElementById("somos-dynamic-text");
        if (dynamicText) {
            const phrases = [
                "HISTORIAS", 
                "LO QUE TÚ QUIERAS", 
                "DE MAGDALENA DEL MAR",
                "DE PERÚ PARA EL MUNDO",
                "LEGIÓN",
                "LOS 144 MIL",
                "UNA EMPRESA HONESTA",
                "UN RECUERDO BONITO",
                "O NO TAN BONITO JAJAJA"
            ];
            let phraseIndex = 0;
            
            setInterval(() => {
                gsap.to(dynamicText, {
                    opacity: 0, 
                    duration: 1, 
                    onComplete: () => {
                        phraseIndex = (phraseIndex + 1) % phrases.length;
                        dynamicText.textContent = phrases[phraseIndex];
                        gsap.to(dynamicText, {opacity: 1, duration: 1});
                    }
                });
            }, 4000);
        }
    }

    // ── WEBGL: THREE.JS ENGINE ──
    const scene = new THREE.Scene();
    // Niebla Exponencial para dar profundidad infinita
    scene.fog = new THREE.FogExp2(0x000000, 0.1452);
    scene.background = new THREE.Color(0x000000);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = -0.2;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Controles limitados (No bloquean el scroll normal, solo orbitan internamente)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false; // Desactivar zoom para permitir scroll de la página web
    controls.rotateSpeed = 0.2;
    controls.minPolarAngle = Math.PI * 0.38;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.minAzimuthAngle = -0.25;
    controls.maxAzimuthAngle = 0.25;

    // Texturas del túnel
    const textureLoader = new THREE.TextureLoader();
    const normalTexture = textureLoader.load("https://raw.githubusercontent.com/danielyl123/person/refs/heads/main/pool-normal.jpg");
    const colorTexture = textureLoader.load("https://raw.githubusercontent.com/danielyl123/person/refs/heads/main/pool-color.jpg");

    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(10, 20);
    colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    colorTexture.repeat.set(10, 20);

    // Geometría del Túnel
    const cilinderGeometry = new THREE.CylinderGeometry(1, 1, 20, 60, 60);

    // Shader Material del Túnel (Caústicas)
    const cilinderMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.fog,
            {
                uTime: { value: 0 },
                uColorMap: { value: colorTexture },
                uNormalMap: { value: normalTexture },
                uCausticStrength: { value: 0.5 },
                uCausticScale: { value: 8.0 },
                uCausticSpeed: { value: 0.8 },
                uBaseColor: { value: new THREE.Color(0x88ccff) },
                uLightPosition: { value: new THREE.Vector3(0, 5, 0) },
                uRipplePos:  { value: new THREE.Vector2(0, 0) },
                uRippleTime: { value: 99.0 },
            },
        ]),
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying float vFogDepth;

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vFogDepth = -mvPosition.z;

                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform sampler2D uColorMap;
            uniform sampler2D uNormalMap;
            uniform float uCausticStrength;
            uniform float uCausticScale;
            uniform float uCausticSpeed;
            uniform vec3 uBaseColor;
            uniform vec3 uLightPosition;
            uniform vec2 uRipplePos;
            uniform float uRippleTime;

            uniform vec3 fogColor;
            uniform float fogDensity;

            varying vec2 vUv;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying float vFogDepth;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            float causticPattern(vec2 uv, float time) {
                float c = 0.0;
                for(float i = 1.0; i <= 3.0; i++) {
                    vec2 p = uv * uCausticScale * i;
                    p.x += sin(p.y * 0.5 + time * uCausticSpeed * 0.7) * 0.5;
                    p.y += cos(p.x * 0.5 + time * uCausticSpeed * 0.9) * 0.5;
                    vec2 cell = fract(p) - 0.5;
                    float d = length(cell);
                    float caustic = 1.0 - smoothstep(0.0, 0.4, d);
                    caustic = pow(caustic, 2.0);
                    c += caustic / i;
                }
                float n = noise(uv * uCausticScale * 2.0 + time * uCausticSpeed * 0.5);
                c *= 0.7 + n * 0.6;
                return c;
            }

            void main() {
                vec2 tiledUV = vUv * vec2(10.0, 20.0);
                vec3 baseColor = texture2D(uColorMap, tiledUV).rgb;
                vec2 causticUV = vWorldPosition.xz * 0.3;
                float caustic1 = causticPattern(causticUV, uTime);
                float caustic2 = causticPattern(causticUV * 1.2 + 0.5, uTime * 1.1);
                float caustics = (caustic1 + caustic2) * 0.5;
                caustics = pow(caustics, 1.5) * uCausticStrength;

                vec3 lightDir = normalize(uLightPosition - vWorldPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 causticColor = uBaseColor * caustics * (0.5 + diff * 0.5);
                vec3 finalColor = baseColor * (0.6 + diff * 0.4) + causticColor;
                finalColor += caustics * 0.3;

                float rippleDist = length(vWorldPosition.xz - uRipplePos);
                float rippleRadius = uRippleTime * 2.5;
                float ripple = smoothstep(0.18, 0.0, abs(rippleDist - rippleRadius));
                ripple *= max(0.0, 1.0 - uRippleTime * 0.35);
                finalColor += ripple * uBaseColor * 1.2;

                float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
                fogFactor = clamp(fogFactor, 0.0, 1.0);
                finalColor = mix(finalColor, fogColor, fogFactor);

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.DoubleSide,
        fog: true,
    });

    const cilinder = new THREE.Mesh(cilinderGeometry, cilinderMaterial);
    cilinder.rotation.x = Math.PI * 0.5;
    scene.add(cilinder);

    // ── Esferas Espejo Flotantes ──
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040, roughness: 0, metalness: 1,
        envMap: cubeRenderTarget.texture, envMapIntensity: 1.5,
    });

    const spheres = [];
    const spherePositions = [
        { x: -0.5, y: -0.35, z: 4.5, size: 0.12, floatSpeed: 0.8, floatAmount: 0.02 },
        { x: 0.4, y: -0.38, z: 3.8, size: 0.08, floatSpeed: 1.0, floatAmount: 0.015 },
        { x: 0.6, y: -0.36, z: 2.5, size: 0.06, floatSpeed: 0.9, floatAmount: 0.02 },
        { x: 0.3, y: 0.1, z: 3.0, size: 0.15, floatSpeed: 0.5, floatAmount: 0.03 },
        { x: -0.4, y: 0.2, z: 2.0, size: 0.1, floatSpeed: 0.6, floatAmount: 0.025 },
        { x: 0.5, y: 0.3, z: 1.5, size: 0.07, floatSpeed: 0.7, floatAmount: 0.02 },
        { x: -0.3, y: 0.0, z: -1.0, size: 0.12, floatSpeed: 0.4, floatAmount: 0.03 },
        { x: 0.2, y: 0.15, z: -2.5, size: 0.09, floatSpeed: 0.5, floatAmount: 0.025 },
        { x: -0.2, y: -0.1, z: -4.0, size: 0.08, floatSpeed: 0.6, floatAmount: 0.02 },
        { x: 0.1, y: 0.05, z: -6.0, size: 0.06, floatSpeed: 0.3, floatAmount: 0.015 },
        { x: -0.15, y: 0.1, z: -8.0, size: 0.05, floatSpeed: 0.35, floatAmount: 0.01 },
    ];

    spherePositions.forEach((pos, index) => {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(pos.size, 32, 32), sphereMaterial);
        sphere.position.set(pos.x, pos.y, pos.z);
        sphere.userData = { baseY: pos.y, baseX: pos.x, floatSpeed: pos.floatSpeed, floatAmount: pos.floatAmount, phase: index * 0.5 };
        spheres.push(sphere);
        scene.add(sphere);
    });

    // ── Espejo de Agua ──
    const waterGeometry = new THREE.PlaneGeometry(50, 50, 128, 128);
    const reflectionRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat,
    });
    const reflectionCamera = camera.clone();

    const waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x3a7090) },
            uOpacity: { value: 0.65 },
            uWaveHeight: { value: 0.025 },
            uWaveSpeed: { value: 0.6 },
            uFresnelPower: { value: 1.8 },
            uReflectionTexture: { value: reflectionRenderTarget.texture },
            uReflectionStrength: { value: 0.8 },
            uCameraPosition: { value: new THREE.Vector3() },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uRipplePos:  { value: new THREE.Vector2(0.5, 0.5) },
            uRippleTime: { value: 99.0 },
        },
        vertexShader: `
            varying vec2 vUv; varying float vElevation; varying vec3 vWorldPosition;
            varying vec3 vNormal; varying vec4 vScreenPos;
            uniform float uTime; uniform float uWaveHeight; uniform float uWaveSpeed;

            void main() {
                vUv = uv; vec3 pos = position;
                float wave1 = sin(pos.x * 3.0 + uTime * uWaveSpeed) * uWaveHeight;
                float wave2 = sin(pos.y * 2.5 + uTime * uWaveSpeed * 0.8) * uWaveHeight * 0.6;
                float wave3 = sin((pos.x + pos.y) * 4.0 + uTime * uWaveSpeed * 1.2) * uWaveHeight * 0.3;
                pos.z += wave1 + wave2 + wave3; vElevation = pos.z;

                float dx = cos(pos.x * 3.0 + uTime * uWaveSpeed) * 3.0 * uWaveHeight;
                float dy = cos(pos.y * 2.5 + uTime * uWaveSpeed * 0.8) * 2.5 * uWaveHeight * 0.6;
                vNormal = normalize(vec3(-dx, -dy, 1.0));

                vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
                vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPos;
                vScreenPos = gl_Position;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor; uniform float uOpacity; uniform float uTime;
            uniform float uFresnelPower; uniform sampler2D uReflectionTexture;
            uniform float uReflectionStrength; uniform vec3 uCameraPosition;
            uniform vec2 uResolution; uniform vec2 uRipplePos; uniform float uRippleTime;

            varying vec2 vUv; varying float vElevation; varying vec3 vWorldPosition;
            varying vec3 vNormal; varying vec4 vScreenPos;

            void main() {
                vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
                vec3 worldNormal = normalize(vNormal);
                float fresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), uFresnelPower);
                fresnel = clamp(fresnel, 0.0, 1.0); fresnel = 0.25 + fresnel * 0.75;

                vec2 screenUV = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
                screenUV.y = 1.0 - screenUV.y;

                float distortion = 0.012;
                screenUV.x += sin(vUv.y * 12.0 + uTime * 1.0) * distortion;
                screenUV.y += cos(vUv.x * 12.0 + uTime * 0.8) * distortion;
                screenUV += worldNormal.xy * 0.008;

                vec3 reflectionColor = texture2D(uReflectionTexture, screenUV).rgb * 1.15;
                vec3 waterColor = uColor * 0.5;
                vec3 finalColor = mix(waterColor, reflectionColor, fresnel * uReflectionStrength);

                vec3 reflectDir = reflect(-viewDir, worldNormal);
                float specular = pow(max(dot(reflectDir, vec3(0.0, 1.0, 0.3)), 0.0), 48.0);
                finalColor += specular * 0.6;
                float specular2 = pow(max(dot(reflectDir, vec3(0.0, 1.0, 0.3)), 0.0), 12.0);
                finalColor += specular2 * 0.1;

                float shimmer = sin(vUv.x * 50.0 + uTime * 2.5) * sin(vUv.y * 50.0 + uTime * 2.0) * 0.015;
                finalColor += shimmer;

                float wRippleDist = length(vUv - uRipplePos);
                float wRippleRadius = uRippleTime * 0.4;
                float wRipple = smoothstep(0.04, 0.0, abs(wRippleDist - wRippleRadius));
                wRipple *= max(0.0, 1.0 - uRippleTime * 0.4);
                finalColor += wRipple * 0.6;

                float alpha = uOpacity + fresnel * 0.25;
                gl_FragColor = vec4(finalColor, alpha);
            }
        `,
        transparent: true, side: THREE.DoubleSide, depthWrite: false,
    });

    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.4;
    scene.add(water);

    // ── Luces y Físicas Interactivas ──
    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(0, 1, 0);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);

    const lightTarget = new THREE.Vector3(0, 3, -1);
    const raycaster = new THREE.Raycaster();
    const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.4);
    let mouseVelocity = 0;
    let prevMouse = { x: 0, y: 0 };
    let rippleTime = 99;

    window.addEventListener("mousemove", (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        const dx = nx - prevMouse.x;
        const dy = ny - prevMouse.y;
        mouseVelocity = Math.sqrt(dx * dx + dy * dy) * 25;
        prevMouse = { x: nx, y: ny };
        lightTarget.set(nx * 2.5, 2.5 + ny * 1.5, -1);
    });

    window.addEventListener("click", (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
        const hit = new THREE.Vector3();
        raycaster.ray.intersectPlane(waterPlane, hit);
        if (hit) {
            rippleTime = 0;
            cilinderMaterial.uniforms.uRipplePos.value.set(hit.x, hit.z);
            cilinderMaterial.uniforms.uRippleTime.value = 0;
            waterMaterial.uniforms.uRipplePos.value.set((hit.x + 25) / 50, (hit.z + 25) / 50);
            waterMaterial.uniforms.uRippleTime.value = 0;
        }
    });

    const clock = new THREE.Clock();

    function tick() {
        const elapsedTime = clock.getElapsedTime();

        waterMaterial.uniforms.uTime.value = elapsedTime;
        waterMaterial.uniforms.uCameraPosition.value.copy(camera.position);
        cilinderMaterial.uniforms.uTime.value = elapsedTime;

        cilinderMaterial.uniforms.uLightPosition.value.lerp(lightTarget, 0.04);
        mouseVelocity *= 0.88;
        const targetStrength = 0.5 + mouseVelocity * 0.6;
        cilinderMaterial.uniforms.uCausticStrength.value = THREE.MathUtils.lerp(
            cilinderMaterial.uniforms.uCausticStrength.value, targetStrength, 0.08
        );

        if (rippleTime < 4) {
            rippleTime += 0.016;
            cilinderMaterial.uniforms.uRippleTime.value = rippleTime;
            waterMaterial.uniforms.uRippleTime.value = rippleTime;
        }

        spheres.forEach((sphere) => {
            const data = sphere.userData;
            sphere.position.y = data.baseY + Math.sin(elapsedTime * data.floatSpeed + data.phase) * data.floatAmount;
            sphere.position.x = data.baseX + Math.sin(elapsedTime * data.floatSpeed * 0.5 + data.phase) * data.floatAmount * 0.3;
            sphere.rotation.x = elapsedTime * 0.2;
            sphere.rotation.y = elapsedTime * 0.15;
        });

        const mainSphere = spheres[spheres.length - 1];
        spheres.forEach((s) => (s.visible = false));
        cubeCamera.position.copy(mainSphere.position);
        cubeCamera.update(renderer, scene);
        spheres.forEach((s) => (s.visible = true));

        water.visible = false;
        reflectionCamera.position.set(camera.position.x, -camera.position.y, camera.position.z);
        reflectionCamera.rotation.set(-camera.rotation.x, camera.rotation.y, camera.rotation.z);
        renderer.setRenderTarget(reflectionRenderTarget);
        renderer.render(scene, reflectionCamera);
        renderer.setRenderTarget(null);
        water.visible = true;

        controls.update();

        const maxR = 0.75;
        const radial = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2);
        if (radial > maxR) {
            const scale = maxR / radial;
            camera.position.x *= scale;
            camera.position.y *= scale;
        }
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -9, 9);

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
    }

    let rafId = requestAnimationFrame(tick);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        reflectionRenderTarget.setSize(window.innerWidth, window.innerHeight);
        waterMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        reflectionCamera.aspect = camera.aspect;
        reflectionCamera.updateProjectionMatrix();
    });

    window.addEventListener("abyss-destroy", () => {
        cancelAnimationFrame(rafId);
        scene.clear();
        renderer.dispose();
        console.log("Abyss WebGL Engine: Destroyed & Memory Freed");
    });
}

// Global initialization
window.initAbyssBackground = initAbyssBackground;
