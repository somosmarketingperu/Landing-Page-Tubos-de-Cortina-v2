import * as THREE from 'three';

/**
 * SUBMERGE-FX.JS — WebGL Fluid Sphere (CodePen Inspired)
 * Uses Custom GLSL Shaders to render a liquid metal/copper sphere.
 */

// GLSL Noise Function (Ashima Arts)
const noiseShader = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
${noiseShader}

void main() {
    vUv = uv;
    vNormal = normal;
    vec3 pos = position;
    
    // Deform the sphere continuously with noise to create liquid waves
    float noise = snoise(pos * 1.5 + uTime * 0.3);
    pos += normal * noise * 0.35; // Intensidad de las olas
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform int uIsDark; // 0 for light, 1 for dark theme
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
${noiseShader}

void main() {
    // Generar textura cáustica líquida
    float noise = snoise(vPosition * 2.5 + uTime * 0.4);
    
    // Paleta de colores Corporativa (Tubos de Cortina Perú)
    vec3 baseColor;
    vec3 highlightColor;
    vec3 edgeGlow;

    if (uIsDark == 1) {
        // En modo oscuro: Cobre vibrante sobre fondo casi negro
        baseColor = vec3(0.1, 0.05, 0.02); // Dark magma
        highlightColor = vec3(0.78, 0.42, 0.25); // Copper
        edgeGlow = vec3(0.98, 0.83, 0.3); // Gold
    } else {
        // En modo claro: Tonos dorados cálidos sobre fondo hueso
        baseColor = vec3(0.8, 0.6, 0.4);
        highlightColor = vec3(0.9, 0.8, 0.6);
        edgeGlow = vec3(0.78, 0.42, 0.25);
    }
    
    // Mezcla base por el ruido
    vec3 color = mix(baseColor, highlightColor, noise * 0.5 + 0.5);
    
    // Specular (reflejos brillantes del líquido)
    float specular = smoothstep(0.5, 0.9, noise);
    color += edgeGlow * specular * 0.6;
    
    // Fresnel Effect (Brillo en los bordes para dar volumen 3D)
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, vNormal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    color += edgeGlow * pow(fresnel, 3.0) * 0.7;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

function initSubmergeBackground() {
    const canvas = document.querySelector('#submerge-canvas');
    if (!canvas) return;

    // Inicializar Motor WebGL
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    
    // Cámara
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 4; // Zoom al objeto

    // Geometría: Icosaedro subdividido para suavidad
    const geometry = new THREE.IcosahedronGeometry(1.4, 128);
    
    // Detector de Tema (Claro u Oscuro)
    const isDark = document.documentElement.classList.contains('dark-theme');

    // Material de Shaders Personalizados
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uIsDark: { value: isDark ? 1 : 0 }
        },
        wireframe: false,
        transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    // Mouse Parallax interactivo sutil (Sin bloquear eventos)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    function tick() {
        const elapsedTime = clock.getElapsedTime();
        
        // Actualizar tiempo en el shader
        material.uniforms.uTime.value = elapsedTime;
        
        // Rotación continua
        mesh.rotation.y = elapsedTime * 0.05;
        mesh.rotation.z = elapsedTime * 0.02;

        // Inercia del mouse (Parallax)
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        mesh.rotation.y += 0.05 * (targetX - mesh.rotation.y);
        mesh.rotation.x += 0.05 * (targetY - mesh.rotation.x);

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }

    tick();

    // Adaptación a la pantalla
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Observar cambios de tema para inyectar al shader
    const observer = new MutationObserver(() => {
        const dark = document.documentElement.classList.contains('dark-theme');
        material.uniforms.uIsDark.value = dark ? 1 : 0;
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

// Hacerlo accesible globalmente para el app-bundle
window.initSubmergeBackground = initSubmergeBackground;
