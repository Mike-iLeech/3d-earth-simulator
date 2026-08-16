import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('app');

// --- Renderer / Scene / Camera ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050a14);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(0, 300, 900);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5;
controls.maxDistance = 8000;

// --- Starfield ---
function makeStars(count = 6000) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 4000 + Math.random() * 5000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.5, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}
scene.add(makeStars());

// --- Procedural fallbacks ---
function makeCanvasTexture(draw, w = 2048, h = 1024) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function proceduralEarthDay() {
  return makeCanvasTexture((ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1e6fd9');
    g.addColorStop(0.5, '#2f8fe8');
    g.addColorStop(1, '#1e6fd9');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const landColors = ['#3f7d3a', '#4f8f42', '#5a7a3a', '#6b8e4e', '#7a9c5a'];
    for (let i = 0; i < 34; i++) {
      const cx = Math.random() * w;
      const cy = h * 0.12 + Math.random() * h * 0.76;
      const baseR = 50 + Math.random() * 140;
      ctx.fillStyle = landColors[i % landColors.length];
      ctx.beginPath();
      let first = true;
      for (let a = 0; a <= Math.PI * 2 + 0.3; a += 0.35) {
        const rr = baseR * (0.55 + Math.random() * 0.8);
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr * 0.62;
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    for (let i = 0; i < 12; i++) {
      const cx = Math.random() * w;
      const cy = h * 0.3 + Math.random() * h * 0.4;
      const r = 25 + Math.random() * 60;
      ctx.fillStyle = 'rgba(194, 168, 96, 0.7)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const capH = h * 0.1;
    const capG = ctx.createLinearGradient(0, 0, 0, capH);
    capG.addColorStop(0, 'rgba(245,250,255,0.98)');
    capG.addColorStop(1, 'rgba(245,250,255,0)');
    ctx.fillStyle = capG;
    ctx.fillRect(0, 0, w, capH);
    const capG2 = ctx.createLinearGradient(0, h - capH, 0, h);
    capG2.addColorStop(0, 'rgba(245,250,255,0)');
    capG2.addColorStop(1, 'rgba(245,250,255,0.98)');
    ctx.fillStyle = capG2;
    ctx.fillRect(0, h - capH, w, capH);
  });
}

function proceduralEarthNight() {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, w, h);
    for (let cluster = 0; cluster < 28; cluster++) {
      const cx = Math.random() * w;
      const cy = h * 0.15 + Math.random() * h * 0.7;
      const spread = 40 + Math.random() * 90;
      const n = 30 + (Math.random() * 60 | 0);
      for (let i = 0; i < n; i++) {
        const x = cx + (Math.random() - 0.5) * spread * 2;
        const y = cy + (Math.random() - 0.5) * spread;
        if (x < 0 || x > w || y < h * 0.1 || y > h * 0.9) continue;
        const r = 0.8 + Math.random() * 2.4;
        const warm = 180 + (Math.random() * 75 | 0);
        ctx.fillStyle = `rgba(255, ${warm}, ${60 + (Math.random()*80|0)}, ${0.5 + Math.random()*0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

function proceduralClouds() {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 180; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const r = 25 + Math.random() * 90;
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      rg.addColorStop(0, 'rgba(255,255,255,0.6)');
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// --- Состояние ---
const state = {
  speed: 1,
  paused: false,
  clouds: true,
  cloudIntensity: 0.7,
  cloudSpeed: 1.0,
  cloudDrift: 0,
  atmosphere: true,
  cities: true,
  temperature: 15,
  dayTime: 0.35,
  season: 0.25,
  moonPhase: 0,
  showEarthOrbits: false,
  earthSpinCount: 0,
  earthOrbitCount: 0,
  moonOrbitCount: 0
};

const AXIAL_TILT = THREE.MathUtils.degToRad(23.44);

// --- Реалистичные пропорции ---
// Солнце R=109×Земля (реальное соотношение)
// Луна R=0.273×Земля (реальное соотношение)
// Орбита сжата до 500 ед. (реальная ~23480× — не рендерится)
const SUN_R    = 109;
const EARTH_R  = 1;
const MOON_R   = 0.273;
const ORBIT_R  = 500;
const MOON_DIST = 60;

// --- Солнце (статично в центре) ---
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_R, 96, 96),
  new THREE.MeshBasicMaterial({ color: 0xffdd44 })
);
scene.add(sunMesh);

// Свечение солнца (атмосфера)
const sunGlowMat = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.65 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
      gl_FragColor = vec4(vec3(1.0, 0.85, 0.3) * intensity, intensity);
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false
});
const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(SUN_R * 1.4, 64, 64), sunGlowMat);
scene.add(sunGlow);

// Точечный свет от солнца (в центре) — без затухания для корректного освещения на расстоянии
const sunPointLight = new THREE.PointLight(0xffffff, 2.5, 0, 0);
sunPointLight.position.set(0, 0, 0);
scene.add(sunPointLight);

const ambientLight = new THREE.AmbientLight(0x8899bb, 0.3);
scene.add(ambientLight);

// --- Орбита Земли (кольцо) ---
const orbitCurve = new THREE.EllipseCurve(0, 0, ORBIT_R, ORBIT_R, 0, Math.PI * 2, false, 0);
const orbitPoints = orbitCurve.getPoints(256).map(p => new THREE.Vector3(p.x, 0, p.y));
const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
const orbitLine = new THREE.Line(orbitGeom, new THREE.LineBasicMaterial({ color: 0x445566, transparent: true, opacity: 0.3 }));
scene.add(orbitLine);

// --- Земля (орбитальная группа с наклоном оси) ---
const earthOrbitGroup = new THREE.Group();
earthOrbitGroup.position.set(ORBIT_R, 0, 0);
scene.add(earthOrbitGroup);

const earthTiltGroup = new THREE.Group();
earthTiltGroup.rotation.z = AXIAL_TILT;
earthOrbitGroup.add(earthTiltGroup);

// Реальные текстуры Земли (NASA Blue Marble + Black Marble) — скачаны локально
const texLoader = new THREE.TextureLoader();
texLoader.setCrossOrigin('anonymous');

let dayTex, nightTex;
try {
  try {
    dayTex   = await texLoader.loadAsync('assets/earth_day_8k.jpg');
    nightTex = await texLoader.loadAsync('assets/earth_night_8k.jpg');
    console.log('[Планета Земля] Загружены текстуры 8K (8192x4096).');
  } catch {
    dayTex   = await texLoader.loadAsync('assets/earth_day.jpg');
    nightTex = await texLoader.loadAsync('assets/earth_night.jpg');
    console.log('[Планета Земля] Загружены текстуры 4K (4096x2048).');
  }
} catch (e) {
  console.warn('[Планета Земля] Не удалось загрузить локальные текстуры, использую процедурные.', e);
  dayTex   = proceduralEarthDay();
  nightTex = proceduralEarthNight();
}

let cloudTex;
try {
  try {
    cloudTex = await texLoader.loadAsync('assets/clouds_8k.jpg');
    console.log('[Планета Земля] Облака: текстура 8K.');
  } catch {
    cloudTex = proceduralClouds();
    console.log('[Планета Земля] Облака: процедурная текстура (фолбэк).');
  }
} catch {
  cloudTex = proceduralClouds();
}
const moonMat = new THREE.MeshStandardMaterial({ color: 0xb8bec9, roughness: 0.95, metalness: 0 });

// --- Earth surface: кастомный шейдер день/ночь с управлением ---
const earthUniforms = {
  dayMap:       { value: dayTex },
  nightMap:     { value: nightTex },
  sunDirection: { value: new THREE.Vector3(1, 0, 0).normalize() },
  cityIntensity:{ value: 1.0 },
  snowAmount:   { value: 0.0 }
};

const earthMat = new THREE.ShaderMaterial({
  uniforms: earthUniforms,
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormalW;
    void main() {
      vUv = uv;
      vNormalW = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayMap;
    uniform sampler2D nightMap;
    uniform vec3 sunDirection;
    uniform float cityIntensity;
    uniform float snowAmount;
    varying vec2 vUv;
    varying vec3 vNormalW;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0;
      v += 0.5 * vnoise(p);
      v += 0.25 * vnoise(p * 2.1 + 31.7);
      v += 0.125 * vnoise(p * 4.3 + 71.3);
      v += 0.0625 * vnoise(p * 8.7 + 113.9);
      return v;
    }

    void main() {
      float dotNL = dot(normalize(vNormalW), normalize(sunDirection));
      float dayMix = smoothstep(-0.12, 0.28, dotNL);
      vec3 dayColor   = texture2D(dayMap, vUv).rgb;
      vec3 nightBase   = texture2D(nightMap, vUv).rgb * cityIntensity;

      if (snowAmount > 0.001) {
        float lat = abs(vUv.y - 0.5) * 2.0;
        float snowLine = 1.0 - snowAmount;
        float noise = fbm(vUv * vec2(80.0, 40.0)) - 0.5;
        float edge = smoothstep(snowLine - 0.12, snowLine + 0.12, lat + noise);
        vec3 snowColor = mix(vec3(0.88, 0.92, 1.0), vec3(0.95, 0.97, 1.0), fbm(vUv * vec2(40.0, 20.0)));
        dayColor   = mix(dayColor, snowColor, edge * 0.92);
        nightBase  = mix(nightBase, snowColor * 0.15, edge * 0.6);
      }

      float terminator = 1.0 - abs(dotNL);
      vec3 sunsetGlow = vec3(1.0, 0.55, 0.25) * pow(terminator, 6.0) * 0.45;

      vec3 color = mix(nightBase, dayColor, dayMix) + sunsetGlow;
      gl_FragColor = vec4(color, 1.0);
    }
  `
});

const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R, 96, 96), earthMat);
earthTiltGroup.add(earthMesh);

// Clouds layer
const cloudMat = new THREE.MeshStandardMaterial({
  map: cloudTex,
  transparent: true,
  opacity: 0.7,
  depthWrite: false,
  roughness: 1,
  metalness: 0
});
const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R * 1.02, 96, 96), cloudMat);
earthTiltGroup.add(cloudsMesh);

// Atmosphere glow (BackSide + Additive)
const atmosphereMat = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.7 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
      gl_FragColor = vec4(vec3(0.35, 0.65, 1.0) * intensity, intensity);
    }
  `,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false
});
const atmosphereMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_R * 1.14, 64, 64), atmosphereMat);
earthTiltGroup.add(atmosphereMesh);

// --- Moon (орбита вокруг Земли) ---
const moonPivot = new THREE.Group();
earthOrbitGroup.add(moonPivot);
const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(MOON_R, 48, 48),
  moonMat
);
moonMesh.position.x = MOON_DIST;
moonPivot.add(moonMesh);

// Кольцо орбиты Луны (визуальная подсказка)
const moonOrbitPts = new THREE.EllipseCurve(0, 0, MOON_DIST, MOON_DIST, 0, Math.PI * 2, false, 0).getPoints(128);
const moonOrbitGeom = new THREE.BufferGeometry().setFromPoints(moonOrbitPts.map(p => new THREE.Vector3(p.x, 0, p.y)));
const moonOrbitLine = new THREE.Line(moonOrbitGeom, new THREE.LineBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.25 }));
earthOrbitGroup.add(moonOrbitLine);

// --- Земная ось (красная линия через центр) ---
const axisGeom = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, -1.5, 0),
  new THREE.Vector3(0, 1.5, 0)
]);
const axisLine = new THREE.Line(axisGeom, new THREE.LineBasicMaterial({ color: 0xff3333 }));
axisLine.visible = false;
earthTiltGroup.add(axisLine);

// --- Около-Земные орбиты (НОО, СОО, ГОО, ВЭО) ---
const EARTH_ORBIT_RADII = [1.042, 1.0657, 1.398, 1.012]; // в единицах EARTH_R
const earthOrbitLines = [];
EARTH_ORBIT_RADII.forEach((r, i) => {
  const pts = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0).getPoints(128);
  const geom = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
  const colors = [0x44ffaa, 0xffcc44, 0x66aaff, 0xff6688];
  const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: colors[i], transparent: true, opacity: 0.5 }));
  earthTiltGroup.add(line);
  earthOrbitLines.push(line);
});

function updateEarthOrbitsVisibility() {
  earthOrbitLines.forEach(l => l.visible = state.showEarthOrbits);
}

// --- Температура → снег на поверхности Земли (от полюсов к экватору) ---
function applyTemperature(t) {
  const snowAmount = THREE.MathUtils.clamp((-t + 5) / 50, 0, 1);
  earthUniforms.snowAmount.value = snowAmount;
}

// --- Сезонная температура (средняя глобальная, °C) ---
// season: 0=Янв, 0.25=Апр, 0.5=Июл, 0.75=Окт
const MONTHLY_TEMPS = [4.0, 5.5, 8.5, 13.0, 17.5, 21.0, 23.5, 23.0, 19.5, 14.5, 9.0, 5.0];

function getSeasonalTemperature(season) {
  const s = ((season % 1) + 1) % 1;
  const monthFloat = s * 12;
  const m0 = Math.floor(monthFloat) % 12;
  const m1 = (m0 + 1) % 12;
  const frac = monthFloat - Math.floor(monthFloat);
  // Плавная интерполяция (smoothstep) между месяцами
  const smooth = frac * frac * (3 - 2 * frac);
  return MONTHLY_TEMPS[m0] * (1 - smooth) + MONTHLY_TEMPS[m1] * smooth;
}

// --- Вращение Земли вокруг оси: привязано к времени суток ---
function updateEarthRotation(t) {
  earthMesh.rotation.y = t * Math.PI * 2;
  cloudsMesh.rotation.y = t * Math.PI * 2 + state.cloudDrift;
}

// --- Смена суток: направление солнца из чистой геометрии (Земля → Солнце в начале координат) ---
function applyDayTime(t) {
  // Направление от Земли к Солнцу (мировые координаты):
  // Солнце в (0,0,0), Земля на орбите → toSun = -earthPos.normalized()
  const earthPos = earthOrbitGroup.position;
  const toSun = new THREE.Vector3(-earthPos.x, -earthPos.y, -earthPos.z).normalize();

  // Наклон оси учтён в earthTiltGroup.rotation.z — нормали автоматически наклонены
  earthUniforms.sunDirection.value.copy(toSun);

  updateEarthRotation(t);

  // Фаза суток для UI
  const hour = Math.floor(t * 24);
  const min  = Math.floor((t * 24 - hour) * 60);
  document.getElementById('s-time').textContent =
    String(hour).padStart(2, '0') + ':' + String(min).padStart(2, '0');

  // Календарная дата: season=0 → 1 января текущего года
  const year = new Date().getFullYear();
  const dayOfYear = Math.floor(state.season * 365.25);
  const dateObj = new Date(year, 0, 1 + dayOfYear);
  document.getElementById('s-date').textContent =
    String(dateObj.getDate()).padStart(2, '0') + '.' +
    String(dateObj.getMonth() + 1).padStart(2, '0') + '.' +
    dateObj.getFullYear();

  let phase;
  if (hour < 5 || hour >= 21)      phase = 'Ночь';
  else if (hour < 8)               phase = 'Рассвет';
  else if (hour < 17)              phase = 'День';
  else                             phase = 'Закат';
  document.getElementById('s-phase').textContent = phase;

  // Температура: сезонная база + суточный ход (только для отображения)
  const baseTemp = getSeasonalTemperature(state.season);
  const diurnal  = Math.sin((t - 0.2) * Math.PI * 2) * 6;
  const current  = baseTemp + diurnal;
  document.getElementById('s-temp').textContent =
    (current >= 0 ? '+' : '') + current.toFixed(1) + '°C';

  // Снег зависит от сезонной температуры
  applyTemperature(baseTemp);
}

// --- Позиция Земли на орбите ---
function updateEarthOnOrbit() {
  const angle = state.season * Math.PI * 2;
  earthOrbitGroup.position.set(Math.cos(angle) * ORBIT_R, 0, -Math.sin(angle) * ORBIT_R);
}

// --- Фаза Луны: 0=новолуние, 0.5=полнолуние ---
function updateMoonPhase() {
  moonPivot.rotation.y = state.moonPhase * Math.PI * 2;
}

// --- Камера: следование за объектом ---
let cameraFollow = null; // 'earth' | 'moon' | 'sun' | null
let fly = null;
const _followOffset = new THREE.Vector3();
const _followTarget = new THREE.Vector3();

function getEarthWorldPos(out) { return earthOrbitGroup.getWorldPosition(out); }
function getMoonWorldPos(out) { return moonMesh.getWorldPosition(out); }

function updateCameraFollow() {
  if (!cameraFollow || fly) return;
  let targetPos;
  if (cameraFollow === 'earth')      targetPos = getEarthWorldPos(_followTarget);
  else if (cameraFollow === 'moon')  targetPos = getMoonWorldPos(_followTarget);
  else                                targetPos.set(0, 0, 0);

  _followOffset.copy(camera.position).sub(controls.target);
  controls.target.copy(targetPos);
  camera.position.copy(targetPos).add(_followOffset);
}

// Отрыв камеры при панораме (ПКМ)
renderer.domElement.addEventListener('pointerdown', (e) => {
  if (e.button === 2 && cameraFollow) cameraFollow = null;
});

// --- UI bindings ---
function bindUI() {
  const $ = (id) => document.getElementById(id);

  // Логарифмическая скорость: 0 = реальное время (1x), max = год за 60 секунд (525960x)
  const SPEED_MAX = 525960; // 31557600 сек / 60 сек

  function mapSpeedSlider(v) {
    if (v <= 0) return 1;
    const t = v / 100;
    return Math.pow(10, t * Math.log10(SPEED_MAX));
  }

  function formatSpeed(s) {
    if (s <= 1.5) return 'Реальная';
    const yearSeconds = 31557600;
    const secondsPerYear = yearSeconds / s;
    if (secondsPerYear >= 86400) return 'Год за ' + Math.round(secondsPerYear / 86400) + ' дн';
    if (secondsPerYear >= 3600) return 'Год за ' + Math.round(secondsPerYear / 3600) + ' ч';
    if (secondsPerYear >= 60)   return 'Год за ' + Math.round(secondsPerYear / 60) + ' мин';
    return 'Год за ' + Math.max(1, Math.round(secondsPerYear)) + ' сек';
  }

  $('speed').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    state.speed = mapSpeedSlider(v);
    $('speed-val').textContent = formatSpeed(state.speed);
  });

  // Температура — автоматическая (сезонная), слайдер только для отображения
  function updateTempDisplay() {
    const baseTemp = getSeasonalTemperature(state.season);
    $('temp-val').textContent = (baseTemp >= 0 ? '+' : '') + Math.round(baseTemp) + '°C';
  }

  // Время суток → вращение Земли вокруг оси
  const todSlider = $('timeOfDay');
  let userDraggingTod = false;
  todSlider.addEventListener('input', (e) => {
    state.dayTime = parseFloat(e.target.value);
    applyDayTime(state.dayTime);
  });
  todSlider.addEventListener('pointerdown', () => { userDraggingTod = true; });
  window.addEventListener('pointerup',   () => { userDraggingTod = false; });

  // Год (орбита Земли вокруг Солнца)
  const monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  function updateSeasonLabel() {
    const idx = Math.floor((((state.season % 1) + 1) % 1) * 12);
    $('season-val').textContent = monthNames[idx];
  }
  $('season').addEventListener('input', (e) => {
    state.season = parseFloat(e.target.value);
    updateSeasonLabel();
    updateTempDisplay();
    updateEarthOnOrbit();
    applyDayTime(state.dayTime);
  });
  updateSeasonLabel();
  updateEarthOnOrbit();

  // Месяц → фаза Луны (0=новолуние, 0.5=полнолуние)
  const moonPhaseNames = ['Новолуние','Первая четверть','Полнолуние','Последняя четверть'];
  function updateMoonPhaseLabel() {
    const p = ((state.moonPhase % 1) + 1) % 1;
    let idx;
    if (p < 0.125 || p >= 0.875)      idx = 0;
    else if (p < 0.375)               idx = 1;
    else if (p < 0.625)               idx = 2;
    else                              idx = 3;
    $('moon-phase-val').textContent = moonPhaseNames[idx];
  }
  $('moonPhase').addEventListener('input', (e) => {
    state.moonPhase = parseFloat(e.target.value);
    updateMoonPhaseLabel();
    updateMoonPhase();
  });
  updateMoonPhaseLabel();
  updateMoonPhase();

  // Около-Земные орбиты
  $('t-earth-orbits').addEventListener('change', (e) => {
    state.showEarthOrbits = e.target.checked;
    updateEarthOrbitsVisibility();
  });

  // Земная ось
  $('t-axis').addEventListener('change', (e) => {
    axisLine.visible = e.target.checked;
  });

  // Синхронизация ползунков с автоматическим ходом времени (только UI, без триггера input)
  const seasonSlider = $('season');
  const moonPhaseSlider = $('moonPhase');
  let userDraggingSeason = false;
  let userDraggingMoon = false;
  seasonSlider.addEventListener('pointerdown', () => { userDraggingSeason = true; });
  moonPhaseSlider.addEventListener('pointerdown', () => { userDraggingMoon = true; });
  window.addEventListener('pointerup',   () => { userDraggingSeason = false; userDraggingMoon = false; });

  setInterval(() => {
    if (!userDraggingTod && !state.paused) {
      todSlider.value = state.dayTime.toFixed(3);
    }
    const hour = Math.floor(state.dayTime * 24);
    const min  = Math.floor((state.dayTime * 24 - hour) * 60);
    $('tod-val').textContent = String(hour).padStart(2, '0') + ':' + String(min).padStart(2, '0');

    if (!userDraggingSeason && !state.paused) {
      seasonSlider.value = state.season.toFixed(3);
      updateSeasonLabel();
      updateTempDisplay();
    }

    if (!userDraggingMoon && !state.paused) {
      moonPhaseSlider.value = state.moonPhase.toFixed(3);
      updateMoonPhaseLabel();
    }
  }, 150);

  $('t-clouds').addEventListener('change', (e) => {
    state.clouds = e.target.checked;
    cloudsMesh.visible = state.clouds;
  });

  $('cloud-intensity').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    state.cloudIntensity = v / 100;
    $('ci-val').textContent = v + '%';
    cloudMat.opacity = 0.25 + state.cloudIntensity * 0.75;
  });

  $('cloud-speed').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    if (v <= 0) {
      state.cloudSpeed = 0;
    } else {
      const t = v / 100;
      state.cloudSpeed = Math.pow(10, t * Math.log10(5000));
    }
    $('cs-val').textContent = (state.cloudSpeed >= 1 ? Math.round(state.cloudSpeed) : state.cloudSpeed.toFixed(1)) + 'x';
  });

  $('t-atmosphere').addEventListener('change', (e) => {
    state.atmosphere = e.target.checked;
    atmosphereMesh.visible = state.atmosphere;
  });
  $('t-cities').addEventListener('change', (e) => {
    state.cities = e.target.checked;
    earthUniforms.cityIntensity.value = state.cities ? 1.0 : 0.0;
  });

  const pauseBtn = $('pause');
  pauseBtn.addEventListener('click', () => {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? 'Продолжить' : 'Пауза';
  });

  // --- Camera views with follow ---
  function startFly(toPosFn, targetFn, follow) {
    controls.enabled = false;

    const prevFollow = cameraFollow;  // кто был до смены — для определения sameObject
    const currentTarget = targetFn();
    const fromOffset = new THREE.Vector3().copy(camera.position).sub(currentTarget);

    fly = {
      fromPos: camera.position.clone(),   // где камера сейчас (абсолютно) — для absolute lerp
      fromTarget: controls.target.clone(),// куда смотрит сейчас (абсолютно) — для absolute lerp
      fromOffset: fromOffset,             // смещение камеры от объекта — для offset-based lerp
      toPosFn: toPosFn,                   // () => Vector3 — желаемая позиция камеры
      targetFn: targetFn,                 // () => Vector3 — текущая позиция целевого объекта
      t: 0, follow: follow || null, prevFollow: prevFollow,
      twoPhase: false                     // для переходов к Солнцу: сначала отдаление, потом поворот
    };
    cameraFollow = follow;
  }

  const views = {
    earthOrbits: () => {
      startFly(
        () => new THREE.Vector3().copy(getEarthWorldPos(new THREE.Vector3())).add(new THREE.Vector3(2.5, 1.5, 4)),
        () => getEarthWorldPos(new THREE.Vector3()),
        'earth'
      );
    },
    earth: () => {
      startFly(
        () => new THREE.Vector3().copy(getEarthWorldPos(new THREE.Vector3())).add(new THREE.Vector3(1.0, 0.6, 1.6)),
        () => getEarthWorldPos(new THREE.Vector3()),
        'earth'
      );
    },
    moon: () => {
      startFly(
        () => new THREE.Vector3().copy(getMoonWorldPos(new THREE.Vector3())).add(new THREE.Vector3(0.8, 0.4, 1.2)),
        () => getMoonWorldPos(new THREE.Vector3()),
        'moon'
      );
    },
    sun: () => {
      startFly(
        () => new THREE.Vector3(0, ORBIT_R * 1.8, ORBIT_R * 2.2),
        () => new THREE.Vector3(0, 0, 0),
        null
      );
      // Двухфазная анимация: сначала отдаление, потом поворот к Солнцу
      if (fly) fly.twoPhase = true;
    }
  };

  document.querySelectorAll('.buttons button').forEach((btn) => {
    btn.addEventListener('click', () => views[btn.dataset.view]());
  });
}

bindUI();

// Плавная интерполяция (smoothstep): 0→0, 1→1, плавный S-образный переход
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function updateFly(dt) {
  if (!fly) return;
  fly.t = Math.min(1, fly.t + dt * 0.8);

  // Гауссова колоколообразная кривая скорости:
  // скорость ~ exp(-((t-0.5)/σ)²), σ=0.25 → пик в середине, нули на краях
  // Более широкий σ = более плавное ускорение/замедление (ease-in/ease-out)
  const sigma = 0.25;
  const g = (x) => Math.exp(-((x - 0.5) * (x - 0.5)) / (sigma * sigma));

  // Интегрируем гауссову кривую для получения позиции:
  // k(t) = ∫₀ᵗ g(s)ds / ∫₀¹ g(s)ds
  // Аналитически: используем erf
  const sqrt2 = Math.SQRT2;
  const erf = (x) => {
    // Аппроксимация erf (Абрамовштейн-Стегн, точность ~1e-7)
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * ax);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
    return sign * y;
  };

  const a = (0 - 0.5) / (sigma * sqrt2);
  const b = (fly.t - 0.5) / (sigma * sqrt2);
  const integral = (erf(b) - erf(a)) / 2;
  const totalIntegral = (erf((1 - 0.5) / (sigma * sqrt2)) - erf(a)) / 2;
  const k = fly.t >= 1 ? 1 : Math.max(0, integral / totalIntegral);

  // Каждый кадр: получаем ТЕКУЩЕЕ положение целевого объекта
  const targetPos = fly.targetFn();
  const desiredCamPos = fly.toPosFn();

  // Offset-based только если камера УЖЕ следует за Землёй (тот же объект)
  // — тогда интерполяция смещения корректна.
  // При смене объекта (Луна→Земля, Солнце→Земля) используем absolute lerp.
  const sameObject = fly.prevFollow === 'earth' && fly.follow === 'earth';

  if (fly.twoPhase) {
    // Плавный переход к Солнцу: камера движется от текущей позиции к целевой у Солнца,
    // а взгляд плавно поворачивается от текущего объекта к Солнцу.
    // Используем общую гауссову кривую k для обеих интерполяций — это гарантирует непрерывность скорости.

    // Интерполяция позиции камеры: от стартовой (fly.fromPos) к целевой у Солнца (desiredCamPos)
    camera.position.lerpVectors(fly.fromPos, desiredCamPos, k);

    // Плавный поворот взгляда: интерполируем ПОЗИЦИЮ ЦЕЛИ (от текущего объекта к Солнцу)
    controls.target.lerpVectors(fly.fromTarget, targetPos, k);

  } else if (sameObject) {
    // Камера привязана к текущему положению движущегося объекта
    const toOffset = new THREE.Vector3().copy(desiredCamPos).sub(targetPos);
    const currentOffset = new THREE.Vector3().lerpVectors(fly.fromOffset, toOffset, k);
    camera.position.copy(targetPos).add(currentOffset);
    controls.target.copy(targetPos);
  } else {
    // Absolute: интерполяция позиции камеры от фиксированной стартовой к движущейся цели
    camera.position.lerpVectors(fly.fromPos, desiredCamPos, k);

    // Плавный поворот взгляда: интерполируем НАПРАВЛЕНИЕ (вектор camera→target),
    // а не абсолютную позицию цели. Это предотвращает резкий скачок controls.target
    // при смене объекта (Луна→Земля, Солнце→Земля).
    const fromLookDir = new THREE.Vector3().copy(fly.fromTarget).sub(fly.fromPos);
    const toLookDir = new THREE.Vector3().copy(targetPos).sub(camera.position);
    const currentLookDir = new THREE.Vector3().lerpVectors(fromLookDir, toLookDir, k);
    controls.target.copy(camera.position).add(currentLookDir);
  }

  camera.lookAt(controls.target);

  if (fly.t >= 1) {
    // Финальная позиция — жёстко фиксируем по текущему положению объекта
    const finalTarget = fly.targetFn();
    const finalCamPos = fly.toPosFn();
    camera.position.copy(finalCamPos);
    controls.target.copy(finalTarget);
    camera.lookAt(controls.target);

    // Сброс ограничений для свободного облёта цели
    controls.minDistance = 0.01;
    controls.maxDistance = Infinity;

    // Синхронизация внутреннего сферического состояния OrbitControls:
    // update() читает текущую camera.position, пересчитывает _spherical,
    // и т.к. нет pending-взаимодействий — не применяет никаких дельт
    controls.enabled = true;
    controls.update();

    cameraFollow = fly.follow;
    fly = null;
  }
}

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Инициализация ---
applyTemperature(state.temperature);
updateEarthOnOrbit();
applyDayTime(state.dayTime);
updateEarthOrbitsVisibility();

// --- Animation loop ---
const clock = new THREE.Clock();
let dt_global = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  dt_global = dt;

  if (!state.paused) {
    // Смена суток: полный цикл за ~60 секунд при speed=1
    const prevDayTime = state.dayTime;
    state.dayTime = (state.dayTime + dt * (state.speed / 60)) % 1;
    if (state.dayTime < prevDayTime) state.earthSpinCount++;

    // Сезон: полный год за ~120 секунд при speed=1
    const prevSeason = state.season;
    state.season = (state.season + dt * (state.speed / 120)) % 1;
    if (state.season < prevSeason) state.earthOrbitCount++;
    updateEarthOnOrbit();

    // Фаза Луны: полный цикл за ~90 секунд при speed=1
    const prevMoonPhase = state.moonPhase;
    state.moonPhase = (state.moonPhase + dt * (state.speed / 90)) % 1;
    if (state.moonPhase < prevMoonPhase) state.moonOrbitCount++;
    updateMoonPhase();

    // Вращение Луны вокруг своей оси (приливный захват)
    moonMesh.rotation.y += dt * 0.1 * state.speed;

    // Дрейф облаков: базовая скорость = 1 оборот за сутки реального времени, умноженная на cloudSpeed
    const baseDriftRate = (2 * Math.PI) / 86400;
    state.cloudDrift += dt * baseDriftRate * state.speed * state.cloudSpeed;

    // Счётчики оборотов в UI
    document.getElementById('s-earth-spin').textContent = state.earthSpinCount;
    document.getElementById('s-earth-orbit').textContent = state.earthOrbitCount;
    document.getElementById('s-moon-orbit').textContent = state.moonOrbitCount;

    applyDayTime(state.dayTime);
  }

  updateFly(dt);
  if (!fly) {
    updateCameraFollow();
    controls.update();
  }
  renderer.render(scene, camera);
}
animate();

console.log('[Планета Земля] Запущено: реалистичные пропорции (Солнце R=109, Земля R=1, Луна R=0.273), орбита вокруг Солнца, смена суток, температура, огни городов, атмосфера.');
