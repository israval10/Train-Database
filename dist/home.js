import * as THREE from "./vendor/three.module.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const DATA_URL = "data/exercises.json";
const LANG_STORAGE_KEY = "exerciseCatalogLanguage";

const copy = {
  es: {
    documentTitle: "Mapa Muscular 3D",
    eyebrow: "Home muscular",
    title: "Mapa Muscular 3D",
    catalog: "Catalogo",
    language: "Idioma",
    kicker: "Mapa muscular 3D",
    atlasTitle: "Explora el cuerpo por subgrupos",
    atlasDescription: "Gira, acerca y toca el cuerpo para identificar subgrupos musculares.",
    atlasAria: "Cuerpo humano interactivo",
    groups: "Grupos",
    subgroups: "Subgrupos",
    selectionLabel: "Seleccion actual",
    allGroups: "Todos los grupos",
    openCatalog: "Ver catalogo",
    exercisesShort: "ej.",
    labels: {
      back: "Espalda",
      cardio: "Cardio",
      chest: "Pecho",
      "lower arms": "Antebrazos",
      "lower legs": "Pantorrillas",
      neck: "Cuello",
      shoulders: "Hombros",
      "upper arms": "Brazos",
      "upper legs": "Piernas",
      waist: "Core",
    },
  },
  en: {
    documentTitle: "3D Muscle Map",
    eyebrow: "Muscle home",
    title: "3D Muscle Map",
    catalog: "Catalog",
    language: "Language",
    kicker: "3D muscle map",
    atlasTitle: "Explore the body by subgroups",
    atlasDescription: "Rotate, zoom and touch the body to identify muscle subgroups.",
    atlasAria: "Interactive human body",
    groups: "Groups",
    subgroups: "Subgroups",
    selectionLabel: "Current selection",
    allGroups: "All groups",
    openCatalog: "Open catalog",
    exercisesShort: "ex.",
    labels: {
      back: "Back",
      cardio: "Cardio",
      chest: "Chest",
      "lower arms": "Forearms",
      "lower legs": "Calves",
      neck: "Neck",
      shoulders: "Shoulders",
      "upper arms": "Arms",
      "upper legs": "Legs",
      waist: "Core",
    },
  },
};

const atlasGroupOrder = [
  "neck",
  "shoulders",
  "chest",
  "back",
  "upper arms",
  "lower arms",
  "waist",
  "upper legs",
  "lower legs",
  "cardio",
];

const atlasGroupColors = {
  back: "#caa15b",
  cardio: "#c03942",
  chest: "#d36c62",
  "lower arms": "#b86f9e",
  "lower legs": "#83b783",
  neck: "#6fb0b0",
  shoulders: "#d9bb55",
  "upper arms": "#b978c2",
  "upper legs": "#d18c5b",
  waist: "#82a8d6",
};

const atlasTargetGroups = {
  abductors: "upper legs",
  abs: "waist",
  adductors: "upper legs",
  biceps: "upper arms",
  calves: "lower legs",
  "cardiovascular system": "cardio",
  delts: "shoulders",
  forearms: "lower arms",
  glutes: "upper legs",
  hamstrings: "upper legs",
  lats: "back",
  "levator scapulae": "neck",
  pectorals: "chest",
  quads: "upper legs",
  "serratus anterior": "chest",
  spine: "waist",
  traps: "back",
  triceps: "upper arms",
  "upper back": "back",
};

const subgroupToneOffsets = {
  "levator scapulae": [0, 0.08, 0.08],
  delts: [0.01, 0.08, 0.02],
  pectorals: [0, 0.1, 0.03],
  "serratus anterior": [0.025, 0.1, -0.03],
  traps: [-0.015, 0.08, 0.04],
  lats: [0.02, 0.12, -0.04],
  "upper back": [-0.035, 0.08, -0.01],
  biceps: [-0.02, 0.1, 0.05],
  triceps: [0.025, 0.12, -0.04],
  forearms: [0.015, 0.08, 0.02],
  abs: [0, 0.12, 0.04],
  obliques: [0.025, 0.1, -0.02],
  "hip flexors": [-0.025, 0.08, 0.01],
  "lower back": [0.04, 0.1, -0.06],
  spine: [-0.05, -0.05, 0.08],
  glutes: [-0.015, 0.08, 0.02],
  hamstrings: [0.035, 0.1, -0.04],
  quads: [0, 0.12, 0.05],
  adductors: [-0.04, 0.08, -0.02],
  abductors: [0.055, 0.08, 0.02],
  calves: [0.015, 0.12, -0.02],
  "cardiovascular system": [0, 0.12, 0],
};

const coreSubgroups = new Set(["abs", "obliques", "hip flexors", "lower back"]);

const state = {
  exercises: [],
  lang: localStorage.getItem(LANG_STORAGE_KEY) === "en" ? "en" : "es",
  group: "all",
  subgroup: "all",
  hovered: null,
  counts: { groups: {}, subgroups: {} },
};

const els = {
  homeEyebrow: document.querySelector("#home-eyebrow"),
  homeTitle: document.querySelector("#home-title"),
  catalogLink: document.querySelector("#catalog-link"),
  languageToggle: document.querySelector(".language-toggle"),
  languageButtons: document.querySelectorAll(".language-toggle button"),
  bodyStage: document.querySelector(".body-stage"),
  canvas: document.querySelector("#muscle-canvas"),
  tooltip: document.querySelector("#muscle-tooltip"),
  groupsLabel: document.querySelector("#atlas-groups-label"),
  subgroupsLabel: document.querySelector("#atlas-subgroups-label"),
  selectionLabel: document.querySelector("#atlas-selection-label"),
  selection: document.querySelector("#atlas-selection"),
  openCatalog: document.querySelector("#atlas-open-catalog"),
  groups: document.querySelector("#atlas-groups"),
  subgroups: document.querySelector("#atlas-subgroups"),
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas: els.canvas,
});
const controls = new OrbitControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const interactiveMeshes = [];
const materials = new Map();
let selectedMesh = null;
let hoveredMesh = null;
let rafId = 0;
let realModelLoaded = false;

const formatLabel = (value) =>
  copy[state.lang].labels[value] || value.replace(/\b\w/g, (char) => char.toUpperCase());

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const getFilterSubgroups = (exercise) => {
  if (exercise.body_part !== "waist") return [exercise.target].filter(Boolean);
  return uniqueSorted([exercise.target, exercise.muscle_group, ...(exercise.secondary_muscles || [])])
    .filter((muscle) => coreSubgroups.has(muscle));
};

async function init() {
  const response = await fetch(DATA_URL);
  state.exercises = await response.json();
  state.counts.groups = countBy(state.exercises, (exercise) => exercise.body_part);
  state.counts.subgroups = countBy(state.exercises, (exercise) => getFilterSubgroups(exercise));

  translate();
  setupScene();
  renderAtlas();
  bindEvents();
  resizeViewer();
  animate();
}

function setupScene() {
  camera.position.set(0, 0.28, 10.4);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 3.5;
  controls.maxDistance = 11;
  controls.target.set(0, 0.05, 0);
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_ROTATE,
  };

  scene.add(new THREE.HemisphereLight(0xffffff, 0x5d544d, 1.75));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.15);
  keyLight.position.set(4, 5, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xd8e8ff, 1.65);
  rimLight.position.set(-3, 3, -5);
  scene.add(rimLight);

  const body = new THREE.Group();
  body.rotation.y = -0.28;
  scene.add(body);

  loadRealAnatomyModel(body);
  addSkeleton(body);
  addDeepMuscleLayer(body);
  addFasciaSeparators(body);
  addTendons(body);
  addMuscles(body);
}

function loadRealAnatomyModel(body) {
  const loader = new GLTFLoader();
  loader.load(
    "models/anatomy.glb",
    (gltf) => {
      const source = gltf.scene;
      const sourceBox = new THREE.Box3().setFromObject(source);
      const sourceCenter = sourceBox.getCenter(new THREE.Vector3());
      const sourceSize = sourceBox.getSize(new THREE.Vector3());
      const scaleFactor = 4.75 / Math.max(sourceSize.z, 0.001);
      const model = new THREE.Group();
      model.name = "real-anatomy-model";
      source.traverse((child) => {
        if (!child.isMesh) return;
        const geometry = child.geometry.clone();
        transformAnatomyGeometry(geometry, sourceCenter, scaleFactor);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
          color: pickAnatomyColor(child.name),
          roughness: 0.82,
          metalness: 0.04,
          side: THREE.DoubleSide,
        }));
        mesh.userData.passive = true;
        model.add(mesh);
      });

      body.add(model);
      body.children.forEach((child) => {
        if (child === model) return;
        child.traverse((object) => {
          if (!interactiveMeshes.includes(object)) object.visible = false;
        });
      });
      realModelLoaded = true;
      updateMeshState();
    },
    undefined,
    () => {
      realModelLoaded = false;
      updateMeshState();
    },
  );
}

function transformAnatomyGeometry(geometry, center, scaleFactor) {
  const position = geometry.getAttribute("position");
  if (!position) return;
  const array = position.array;
  for (let i = 0; i < array.length; i += 3) {
    const sourceX = array[i];
    const sourceY = array[i + 1];
    const sourceZ = array[i + 2];
    array[i] = (sourceX - center.x) * scaleFactor;
    array[i + 1] = (sourceZ - center.z) * scaleFactor;
    array[i + 2] = -(sourceY - center.y) * scaleFactor;
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}

function pickAnatomyColor(name = "") {
  if (isTendonLike(name)) return new THREE.Color("#dfd0b8");
  const subgroup = classifyAnatomySubgroup(name);
  return getSubgroupColor(subgroup);
}

function getSubgroupColor(subgroup) {
  const group = atlasTargetGroups[subgroup] || "waist";
  const color = new THREE.Color(atlasGroupColors[group] || "#a66a5f");
  const [hue, saturation, lightness] = subgroupToneOffsets[subgroup] || [0, 0, 0];
  color.offsetHSL(hue, saturation, lightness);
  return color;
}

function isTendonLike(name = "") {
  const value = name.toLowerCase();
  return (
    value.includes("tendon") ||
    value.includes("ligament") ||
    value.includes("retinaculum") ||
    value.includes("membrane") ||
    value.includes("fascia")
  );
}

function classifyAnatomySubgroup(name = "") {
  const value = name.toLowerCase();

  if (value.includes("levator scapulae")) return "levator scapulae";
  if (
    value.includes("sternocleidomastoid") ||
    value.includes("scalen") ||
    value.includes("longus capitis") ||
    value.includes("longus colli") ||
    value.includes("digastric") ||
    value.includes("mylohyoid") ||
    value.includes("omohyoid") ||
    value.includes("sternohyoid") ||
    value.includes("thyrohyoid") ||
    value.includes("platysma")
  ) {
    return "levator scapulae";
  }

  if (
    value.includes("deltoid") ||
    value.includes("supraspinatus") ||
    value.includes("infraspinatus") ||
    value.includes("teres major") ||
    value.includes("teres minor") ||
    value.includes("subscapularis")
  ) {
    return "delts";
  }

  if (value.includes("serratus anterior")) return "serratus anterior";
  if (value.includes("pectoralis")) return "pectorals";

  if (value.includes("trapezius")) return "traps";
  if (value.includes("latissimus")) return "lats";
  if (
    value.includes("rhomboid") ||
    value.includes("serratus posterior") ||
    value.includes("splenius") ||
    value.includes("semispinalis")
  ) {
    return "upper back";
  }
  if (
    value.includes("iliocostalis") ||
    value.includes("longissimus") ||
    value.includes("spinalis")
  ) {
    return "lower back";
  }

  if (value.includes("biceps brachii") || value.includes("brachialis") || value.includes("coracobrachialis")) {
    return "biceps";
  }
  if (value.includes("triceps brachii") || value.includes("anconeus")) return "triceps";
  if (
    value.includes("carpi") ||
    value.includes("pronator") ||
    value.includes("supinator") ||
    value.includes("brachioradialis") ||
    value.includes("pollicis") ||
    value.includes("digitorum") ||
    value.includes("digiti") ||
    value.includes("palmaris") ||
    value.includes("lumbrical") ||
    value.includes("interosseous") ||
    value.includes("opponens")
  ) {
    return "forearms";
  }

  if (value.includes("external oblique") || value.includes("internal oblique")) return "obliques";
  if (value.includes("rectus abdominis") || value.includes("transversus abdominis")) return "abs";
  if (value.includes("psoas") || value.includes("iliacus")) return "hip flexors";
  if (value.includes("quadratus lumborum") || value.includes("diaphragm")) return "lower back";

  if (value.includes("gastrocnemius") || value.includes("soleus") || value.includes("plantaris")) return "calves";
  if (value.includes("tibialis") || value.includes("fibularis") || value.includes("popliteus")) return "calves";

  if (value.includes("glute")) return "glutes";
  if (value.includes("semitendinosus") || value.includes("semimembranosus") || value.includes("biceps femoris")) {
    return "hamstrings";
  }
  if (value.includes("adductor") || value.includes("gracilis") || value.includes("pectineus")) return "adductors";
  if (value.includes("abductor") || value.includes("tensor fasciae latae")) return "abductors";
  if (
    value.includes("rectus femoris") ||
    value.includes("vastus") ||
    value.includes("sartorius")
  ) {
    return "quads";
  }
  if (
    value.includes("obturator") ||
    value.includes("piriformis") ||
    value.includes("gemellus") ||
    value.includes("quadratus femoris")
  ) {
    return "glutes";
  }

  return "abs";
}

function classifyAnatomyGroup(name = "") {
  return atlasTargetGroups[classifyAnatomySubgroup(name)] || "waist";
}

function addDeepMuscleLayer(body) {
  const deep = makeMaterial("deep-muscle", "#7e756d", 0.88, 0.08);
  deep.transparent = true;
  deep.opacity = 0.72;

  const specs = [
    ["flat", [0, 0.88, 0.02], [0.6, 1.22, 0.22], [0, 0, 0]],
    ["flat", [0, 0.35, -0.1], [0.52, 0.95, 0.18], [0, 0, 0]],
    ["strap", [-0.8, 0.5, 0.01], [0.14, 1.42, 0.12], [0, 0, 0.16]],
    ["strap", [0.8, 0.5, 0.01], [0.14, 1.42, 0.12], [0, 0, -0.16]],
    ["strap", [-0.32, -1.22, 0.0], [0.2, 1.38, 0.15], [0.02, 0, -0.03]],
    ["strap", [0.32, -1.22, 0.0], [0.2, 1.38, 0.15], [0.02, 0, 0.03]],
    ["strap", [-0.25, -2.2, -0.02], [0.13, 0.96, 0.1], [0, 0, -0.01]],
    ["strap", [0.25, -2.2, -0.02], [0.13, 0.96, 0.1], [0, 0, 0.01]],
  ];

  specs.forEach(([type, position, scale, rotation]) => {
    const mesh = createMuscleMesh(type, deep, { grooves: 0 });
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rotation);
    mesh.renderOrder = -1;
    body.add(mesh);
  });
}

function addFasciaSeparators(body) {
  const fascia = new THREE.LineBasicMaterial({
    color: 0xd7c7ad,
    transparent: true,
    opacity: 0.58,
  });
  const curves = [
    [[0, 1.46, 0.36], [0, 0.08, 0.42]],
    [[-0.46, 1.27, 0.32], [-0.08, 1.07, 0.4], [-0.04, 0.92, 0.42]],
    [[0.46, 1.27, 0.32], [0.08, 1.07, 0.4], [0.04, 0.92, 0.42]],
    [[-0.28, 0.82, 0.42], [0.28, 0.82, 0.42]],
    [[-0.28, 0.54, 0.43], [0.28, 0.54, 0.43]],
    [[-0.26, 0.26, 0.42], [0.26, 0.26, 0.42]],
    [[-0.22, -0.02, 0.38], [0.22, -0.02, 0.38]],
    [[-0.58, 0.98, 0.28], [-0.48, 0.62, 0.3], [-0.36, 0.24, 0.28]],
    [[0.58, 0.98, 0.28], [0.48, 0.62, 0.3], [0.36, 0.24, 0.28]],
  ];

  curves.forEach((points) => {
    body.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point))), fascia));
  });
}

function addSkeleton(body) {
  const bone = makeMaterial("bone", "#d8d0c1", 0.72, 0.18);
  const spine = createCapsule("spine-core", "spine", "waist", [0, 0.72, -0.09], [0.11, 1.42, 0.11], bone);
  spine.rotation.z = 0.03;
  body.add(spine);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 24), bone);
  head.position.set(0, 2.43, 0.02);
  head.scale.set(0.68, 0.98, 0.66);
  body.add(head);

  const jaw = createMuscleMesh("flat", bone, { grooves: 0 });
  jaw.position.set(0, 2.19, 0.2);
  jaw.scale.set(0.28, 0.12, 0.08);
  jaw.rotation.x = -0.12;
  body.add(jaw);

  const faceMuscle = makeMaterial("face-muscle", "#9b7568", 0.84, 0.06);
  [
    [-0.22, 2.25, 0.24, -0.72],
    [0.22, 2.25, 0.24, 0.72],
  ].forEach(([x, y, z, rot]) => {
    const cheek = createMuscleMesh("strap", faceMuscle);
    cheek.position.set(x, y, z);
    cheek.scale.set(0.045, 0.32, 0.032);
    cheek.rotation.set(1.04, 0, rot);
    body.add(cheek);
  });

  const ribcage = createMuscleMesh("flat", bone, { grooves: 0 });
  ribcage.position.set(0, 0.84, -0.18);
  ribcage.scale.set(0.54, 0.96, 0.13);
  ribcage.material.opacity = 0.34;
  ribcage.material.transparent = true;
  body.add(ribcage);

  const ribLineMaterial = new THREE.LineBasicMaterial({ color: 0xcfc5b5, transparent: true, opacity: 0.42 });
  for (let i = 0; i < 5; i += 1) {
    const y = 1.22 - i * 0.15;
    [-1, 1].forEach((side) => {
      const points = [];
      for (let step = 0; step <= 10; step += 1) {
        const t = step / 10;
        points.push(new THREE.Vector3(side * (0.14 + t * 0.34), y - t * 0.1, -0.02 + Math.sin(t * Math.PI) * 0.09));
      }
      body.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), ribLineMaterial));
    });
  }

  const pelvis = createMuscleMesh("flat", bone, { grooves: 0 });
  pelvis.position.set(0, -0.48, 0.03);
  pelvis.scale.set(0.55, 0.36, 0.16);
  body.add(pelvis);

  [
    [-0.47, 1.46, 0.23, 0.54],
    [0.47, 1.46, 0.23, -0.54],
  ].forEach(([x, y, z, rot]) => {
    const clavicle = createCapsule("clavicle", "spine", "waist", [x, y, z], [0.032, 0.48, 0.032], bone);
    clavicle.rotation.z = rot;
    clavicle.rotation.y = x < 0 ? -0.25 : 0.25;
    body.add(clavicle);
  });

  addHandsAndFeet(body, bone);
}

function addTendons(body) {
  const tendon = makeMaterial("tendon", "#efe3ce", 0.72, 0.16);
  const specs = [
    [[0, 1.54, 0.27], [0.04, 0.62, 0.03], [0, 0, Math.PI / 2]],
    [[0, 0.25, 0.34], [0.04, 1.05, 0.035], [0, 0, 0]],
    [[-0.28, -0.07, 0.25], [0.035, 0.62, 0.03], [0.16, 0, -0.12]],
    [[0.28, -0.07, 0.25], [0.035, 0.62, 0.03], [0.16, 0, 0.12]],
    [[-1.26, -0.52, 0.05], [0.035, 0.48, 0.03], [0, 0, 0.1]],
    [[1.26, -0.52, 0.05], [0.035, 0.48, 0.03], [0, 0, -0.1]],
    [[-0.28, -1.72, 0.11], [0.035, 0.62, 0.03], [0.02, 0, -0.02]],
    [[0.28, -1.72, 0.11], [0.035, 0.62, 0.03], [0.02, 0, 0.02]],
  ];

  specs.forEach(([position, scale, rotation]) => {
    const mesh = createMuscleMesh("tendon", tendon, { grooves: 0 });
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rotation);
    body.add(mesh);
  });
}

function addHandsAndFeet(body, bone) {
  [
    [-1.3, -0.72, 0.06, 0.18],
    [1.3, -0.72, 0.06, -0.18],
  ].forEach(([x, y, z, rot]) => {
    const palm = createMuscleMesh("flat", bone, { grooves: 1 });
    palm.position.set(x, y, z);
    palm.scale.set(0.15, 0.24, 0.06);
    palm.rotation.z = rot;
    body.add(palm);

    for (let i = 0; i < 5; i += 1) {
      const finger = createMuscleMesh("tendon", bone, { grooves: 0 });
      finger.position.set(x + (i - 2) * 0.04 * Math.sign(x), y - 0.2, z + 0.02);
      finger.scale.set(0.018, 0.22 - Math.abs(i - 2) * 0.02, 0.018);
      finger.rotation.z = rot + (i - 2) * 0.04 * Math.sign(x);
      body.add(finger);
    }
  });

  [
    [-0.31, -2.86, 0.16, -0.12],
    [0.31, -2.86, 0.16, 0.12],
  ].forEach(([x, y, z, rot]) => {
    const foot = createMuscleMesh("flat", bone, { grooves: 1 });
    foot.position.set(x, y, z);
    foot.scale.set(0.2, 0.36, 0.09);
    foot.rotation.x = Math.PI / 2.8;
    foot.rotation.z = rot;
    body.add(foot);
  });
}

function addMuscles(body) {
  const specs = [
    ["levator scapulae", "neck", "strap", [-0.12, 1.95, 0.08], [0.055, 0.66, 0.04], [0.04, 0, -0.18]],
    ["levator scapulae", "neck", "strap", [0.12, 1.95, 0.08], [0.055, 0.66, 0.04], [0.04, 0, 0.18]],
    ["traps", "back", "flat", [0, 1.5, -0.28], [0.58, 0.42, 0.07], [-0.08, 0, 0]],
    ["upper back", "back", "flat", [-0.3, 1.08, -0.35], [0.34, 0.42, 0.08], [-0.08, 0.1, -0.42]],
    ["upper back", "back", "flat", [0.3, 1.08, -0.35], [0.34, 0.42, 0.08], [-0.08, -0.1, 0.42]],
    ["lats", "back", "flat", [-0.42, 0.64, -0.24], [0.25, 0.66, 0.08], [0.1, 0, -0.28]],
    ["lats", "back", "flat", [0.42, 0.64, -0.24], [0.25, 0.66, 0.08], [0.1, 0, 0.28]],
    ["pectorals", "chest", "fan", [-0.3, 1.2, 0.31], [0.43, 0.22, 0.085], [0.04, -0.1, 0.1]],
    ["pectorals", "chest", "fan", [0.3, 1.2, 0.31], [0.43, 0.22, 0.085], [0.04, 0.1, -0.1]],
    ["pectorals", "chest", "strap", [-0.28, 1.04, 0.34], [0.055, 0.5, 0.038], [1.2, -0.04, 1.38]],
    ["pectorals", "chest", "strap", [0.28, 1.04, 0.34], [0.055, 0.5, 0.038], [1.2, 0.04, -1.38]],
    ["serratus anterior", "chest", "strap", [-0.66, 0.82, 0.13], [0.09, 0.42, 0.08], [0.2, 0.02, -0.42]],
    ["serratus anterior", "chest", "strap", [0.66, 0.82, 0.13], [0.09, 0.42, 0.08], [0.2, -0.02, 0.42]],
    ["delts", "shoulders", "striated", [-0.72, 1.32, 0.05], [0.18, 0.28, 0.16], [0.04, 0, 0.56]],
    ["delts", "shoulders", "striated", [0.72, 1.32, 0.05], [0.18, 0.28, 0.16], [0.04, 0, -0.56]],
    ["biceps", "upper arms", "belly", [-0.9, 0.78, 0.17], [0.086, 0.66, 0.075], [0, 0, 0.22]],
    ["biceps", "upper arms", "belly", [0.9, 0.78, 0.17], [0.086, 0.66, 0.075], [0, 0, -0.22]],
    ["triceps", "upper arms", "belly", [-0.97, 0.74, -0.1], [0.088, 0.68, 0.075], [0, 0, 0.24]],
    ["triceps", "upper arms", "belly", [0.97, 0.74, -0.1], [0.088, 0.68, 0.075], [0, 0, -0.24]],
    ["forearms", "lower arms", "strap", [-1.05, -0.03, 0.09], [0.055, 0.74, 0.046], [0, 0, 0.12]],
    ["forearms", "lower arms", "strap", [-1.14, -0.04, -0.02], [0.042, 0.7, 0.04], [0, 0, 0.22]],
    ["forearms", "lower arms", "strap", [-0.98, -0.06, -0.04], [0.035, 0.66, 0.034], [0, 0, -0.02]],
    ["forearms", "lower arms", "strap", [1.05, -0.03, 0.09], [0.055, 0.74, 0.046], [0, 0, -0.12]],
    ["forearms", "lower arms", "strap", [1.14, -0.04, -0.02], [0.042, 0.7, 0.04], [0, 0, -0.22]],
    ["forearms", "lower arms", "strap", [0.98, -0.06, -0.04], [0.035, 0.66, 0.034], [0, 0, 0.02]],
    ["abs", "waist", "block", [-0.14, 0.75, 0.36], [0.13, 0.13, 0.045], [0, 0, 0]],
    ["abs", "waist", "block", [0.14, 0.75, 0.36], [0.13, 0.13, 0.045], [0, 0, 0]],
    ["abs", "waist", "block", [-0.14, 0.48, 0.37], [0.13, 0.13, 0.045], [0, 0, 0]],
    ["abs", "waist", "block", [0.14, 0.48, 0.37], [0.13, 0.13, 0.045], [0, 0, 0]],
    ["abs", "waist", "block", [-0.14, 0.21, 0.35], [0.125, 0.14, 0.045], [0, 0, 0]],
    ["abs", "waist", "block", [0.14, 0.21, 0.35], [0.125, 0.14, 0.045], [0, 0, 0]],
    ["abs", "waist", "block", [-0.12, -0.05, 0.31], [0.105, 0.12, 0.04], [0, 0, 0]],
    ["abs", "waist", "block", [0.12, -0.05, 0.31], [0.105, 0.12, 0.04], [0, 0, 0]],
    ["obliques", "waist", "flat", [-0.36, 0.34, 0.16], [0.14, 0.52, 0.07], [0.16, 0, -0.2]],
    ["obliques", "waist", "flat", [0.36, 0.34, 0.16], [0.14, 0.52, 0.07], [0.16, 0, 0.2]],
    ["hip flexors", "waist", "strap", [-0.22, -0.3, 0.24], [0.08, 0.48, 0.07], [0.22, 0, -0.06]],
    ["hip flexors", "waist", "strap", [0.22, -0.3, 0.24], [0.08, 0.48, 0.07], [0.22, 0, 0.06]],
    ["glutes", "upper legs", "striated", [-0.23, -0.5, -0.24], [0.28, 0.29, 0.16], [-0.08, 0.04, 0]],
    ["glutes", "upper legs", "striated", [0.23, -0.5, -0.24], [0.28, 0.29, 0.16], [-0.08, -0.04, 0]],
    ["quads", "upper legs", "belly", [-0.22, -1.08, 0.18], [0.115, 0.9, 0.09], [0.04, 0, -0.03]],
    ["quads", "upper legs", "belly", [0.22, -1.08, 0.18], [0.115, 0.9, 0.09], [0.04, 0, 0.03]],
    ["quads", "upper legs", "strap", [-0.39, -1.08, 0.06], [0.052, 0.78, 0.045], [0.04, 0, -0.08]],
    ["quads", "upper legs", "strap", [0.39, -1.08, 0.06], [0.052, 0.78, 0.045], [0.04, 0, 0.08]],
    ["quads", "upper legs", "strap", [-0.12, -1.15, 0.12], [0.05, 0.74, 0.043], [0.04, 0, 0.03]],
    ["quads", "upper legs", "strap", [0.12, -1.15, 0.12], [0.05, 0.74, 0.043], [0.04, 0, -0.03]],
    ["hamstrings", "upper legs", "belly", [-0.27, -1.12, -0.2], [0.1, 0.86, 0.1], [-0.04, 0, -0.04]],
    ["hamstrings", "upper legs", "belly", [0.27, -1.12, -0.2], [0.1, 0.86, 0.1], [-0.04, 0, 0.04]],
    ["adductors", "upper legs", "strap", [-0.1, -1.04, 0.03], [0.08, 0.76, 0.07], [0.08, 0, 0.02]],
    ["adductors", "upper legs", "strap", [0.1, -1.04, 0.03], [0.08, 0.76, 0.07], [0.08, 0, -0.02]],
    ["abductors", "upper legs", "strap", [-0.51, -0.95, 0.01], [0.08, 0.72, 0.08], [0, 0, 0.1]],
    ["abductors", "upper legs", "strap", [0.51, -0.95, 0.01], [0.08, 0.72, 0.08], [0, 0, -0.1]],
    ["calves", "lower legs", "belly", [-0.28, -2.02, -0.1], [0.108, 0.74, 0.095], [-0.02, 0, -0.02]],
    ["calves", "lower legs", "belly", [0.28, -2.02, -0.1], [0.108, 0.74, 0.095], [-0.02, 0, 0.02]],
    ["calves", "lower legs", "strap", [-0.2, -2.13, 0.08], [0.052, 0.7, 0.043], [0.02, 0, -0.04]],
    ["calves", "lower legs", "strap", [0.2, -2.13, 0.08], [0.052, 0.7, 0.043], [0.02, 0, 0.04]],
    ["cardiovascular system", "cardio", "sphere", [0.17, 0.92, 0.43], [0.14, 0.14, 0.14], [0, 0, 0]],
  ];

  specs.forEach(([subgroup, group, type, position, scale, rotation]) => {
    const material = getMuscleMaterial(group);
    const mesh = createMuscleMesh(type, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rotation);
    mesh.userData = { subgroup, group };
    body.add(mesh);
    interactiveMeshes.push(mesh);
    addSurfaceLines(body, mesh, type);
  });
}

function createMuscleMesh(type, material, options = {}) {
  if (type === "sphere") {
    return new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material.clone());
  }
  if (type === "flat" || type === "fan" || type === "block") {
    const mesh = new THREE.Mesh(createOrganicEllipsoidGeometry(type), material.clone());
    mesh.material.roughness = 0.68;
    return mesh;
  }
  return new THREE.Mesh(createTaperedMuscleGeometry(type, options), material.clone());
}

function createCapsule(name, subgroup, group, position, scale, material) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1, 12, 24), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.userData = { subgroup, group, passive: true };
  return mesh;
}

function createTaperedMuscleGeometry(type) {
  const radialSegments = 48;
  const heightSegments = 32;
  const groovesByType = {
    strap: 2,
    belly: 4,
    striated: 8,
    tendon: 1,
  };
  const grooveCount = groovesByType[type] || 3;
  const grooveDepth = type === "tendon" ? 0.01 : type === "striated" ? 0.105 : 0.075;
  const vertices = [];
  const indices = [];

  for (let yIndex = 0; yIndex <= heightSegments; yIndex += 1) {
    const v = yIndex / heightSegments;
    const y = v - 0.5;
    const taper = Math.sin(Math.PI * v);
      const belly = Math.pow(Math.max(taper, 0.001), type === "strap" ? 0.55 : 0.72);
      const endPinch = 1 - Math.abs(v - 0.5) * 0.38;

    for (let i = 0; i <= radialSegments; i += 1) {
      const u = i / radialSegments;
      const theta = u * Math.PI * 2;
      const groove = 1 - Math.pow(Math.max(Math.cos(theta * grooveCount), 0), 8) * grooveDepth;
      const tendonPull = 1 - Math.pow(Math.abs(v - 0.5) * 2, 4) * (type === "tendon" ? 0 : 0.18);
      const asymmetry = 1 + Math.sin(theta + v * Math.PI) * 0.035 + Math.sin(v * 21 + theta * 2) * 0.012;
      const seam = 1 - Math.pow(Math.max(Math.cos(theta * 2), 0), 16) * 0.035;
      const radius = belly * endPinch * groove * tendonPull * asymmetry * seam;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius * (type === "strap" ? 0.5 : 0.68);
      vertices.push(x, y, z);
    }
  }

  for (let yIndex = 0; yIndex < heightSegments; yIndex += 1) {
    for (let i = 0; i < radialSegments; i += 1) {
      const a = yIndex * (radialSegments + 1) + i;
      const b = a + radialSegments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createOrganicEllipsoidGeometry(type) {
  const geometry = new THREE.SphereGeometry(1, 40, 24);
  const position = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const yBand = Math.abs(vertex.y);
    const theta = Math.atan2(vertex.z, vertex.x);
    let ridge = 1;

    if (type === "fan") {
      ridge -= Math.pow(Math.max(Math.cos(theta * 8), 0), 8) * 0.105;
      vertex.x *= 1.18 - yBand * 0.28;
      vertex.y *= 0.72;
      vertex.z *= 0.38 + yBand * 0.16;
    } else if (type === "block") {
      ridge -= Math.pow(Math.max(Math.cos(theta * 4), 0), 8) * 0.06;
      vertex.x *= 0.82;
      vertex.y *= 0.62;
      vertex.z *= 0.3;
    } else {
      ridge -= Math.pow(Math.max(Math.cos(theta * 6), 0), 8) * 0.07;
      vertex.x *= 1.03;
      vertex.y *= 0.78;
      vertex.z *= 0.34;
    }

    vertex.multiplyScalar(ridge);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function addSurfaceLines(body, mesh, type) {
  if (type === "sphere" || type === "tendon") return;

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x251c18,
    transparent: true,
    opacity: 0.46,
  });
  const count = type === "fan" ? 11 : type === "block" ? 3 : type === "flat" ? 7 : 6;

  for (let i = 0; i < count; i += 1) {
    const offset = count === 1 ? 0 : (i / (count - 1) - 0.5) * 0.7;
    const points = [];
    for (let step = 0; step <= 24; step += 1) {
      const t = step / 24;
      const y = (t - 0.5) * 1.5;
      const x = type === "fan" ? offset * (1 - t * 0.5) : offset * 0.12;
      const z = 0.9 + Math.sin(t * Math.PI) * 0.08;
      const local = new THREE.Vector3(x, y, z);
      local.multiply(mesh.scale);
      local.applyEuler(mesh.rotation);
      local.add(mesh.position);
      points.push(local);
    }
    const curve = new THREE.BufferGeometry().setFromPoints(points);
    body.add(new THREE.Line(curve, lineMaterial));
  }

  if (type === "belly" || type === "striated") {
    const crossMaterial = new THREE.LineBasicMaterial({
      color: 0xead7bc,
      transparent: true,
      opacity: 0.2,
    });
    for (let band = 0; band < 5; band += 1) {
      const t = (band + 1) / 6;
      const points = [];
      for (let step = 0; step <= 16; step += 1) {
        const angle = (step / 16) * Math.PI * 2;
        const local = new THREE.Vector3(Math.cos(angle) * 0.5, t - 0.5, Math.sin(angle) * 0.44);
        local.multiply(mesh.scale);
        local.applyEuler(mesh.rotation);
        local.add(mesh.position);
        points.push(local);
      }
      body.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), crossMaterial));
    }
  }
}

function getMuscleMaterial(group) {
  if (!materials.has(group)) {
    materials.set(group, makeMaterial(group, atlasGroupColors[group] || "#9b8f85", 0.76, 0.22));
  }
  return materials.get(group);
}

function makeMaterial(name, color, roughness, metalness) {
  const material = new THREE.MeshStandardMaterial({
    name,
    color,
    roughness,
    metalness,
    emissive: color,
    emissiveIntensity: 0.01,
  });
  if (name !== "bone" && name !== "tendon") {
    material.bumpMap = getFiberTexture();
    material.bumpScale = 0.045;
  }
  return material;
}

let fiberTexture = null;

function getFiberTexture() {
  if (fiberTexture) return fiberTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#777";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y += 2) {
    const shade = 105 + Math.sin(y * 0.45) * 28 + Math.sin(y * 1.7) * 9;
    ctx.strokeStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(y * 0.18) * 2);
    ctx.bezierCurveTo(32, y - 4, 72, y + 5, 128, y + Math.sin(y * 0.11) * 2);
    ctx.stroke();
  }
  fiberTexture = new THREE.CanvasTexture(canvas);
  fiberTexture.wrapS = THREE.RepeatWrapping;
  fiberTexture.wrapT = THREE.RepeatWrapping;
  fiberTexture.repeat.set(1, 3);
  return fiberTexture;
}

function bindEvents() {
  els.languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  els.canvas.addEventListener("pointermove", handlePointerMove);
  els.canvas.addEventListener("pointerleave", clearHover);
  els.canvas.addEventListener("click", () => {
    if (state.hovered) selectSubgroup(state.hovered.subgroup, state.hovered.group);
  });
  window.addEventListener("resize", resizeViewer);
}

function handlePointerMove(event) {
  const rect = els.canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
  if (!hit) {
    clearHover();
    return;
  }

  setHoveredMesh(hit.object);
  els.tooltip.hidden = false;
  els.tooltip.style.left = `${event.clientX - rect.left}px`;
  els.tooltip.style.top = `${event.clientY - rect.top}px`;
  els.tooltip.textContent = `${formatLabel(hit.object.userData.subgroup)} · ${
    state.counts.subgroups[hit.object.userData.subgroup] || 0
  } ${copy[state.lang].exercisesShort}`;
}

function setHoveredMesh(mesh) {
  if (hoveredMesh === mesh) return;
  if (hoveredMesh && hoveredMesh !== selectedMesh) updateMeshState();
  hoveredMesh = mesh;
  state.hovered = mesh.userData;
  if (realModelLoaded) mesh.material.colorWrite = false;
  mesh.material.emissiveIntensity = 0.28;
  els.canvas.style.cursor = "pointer";
}

function clearHover() {
  if (hoveredMesh && hoveredMesh !== selectedMesh) updateMeshState();
  hoveredMesh = null;
  state.hovered = null;
  els.tooltip.hidden = true;
  els.canvas.style.cursor = "grab";
}

function setLanguage(lang) {
  if (!copy[lang] || lang === state.lang) return;
  state.lang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  translate();
  renderAtlas();
}

function translate() {
  const text = copy[state.lang];
  document.documentElement.lang = state.lang;
  document.title = text.documentTitle;
  els.homeEyebrow.textContent = text.eyebrow;
  els.homeTitle.textContent = text.title;
  els.catalogLink.textContent = text.catalog;
  els.languageToggle.setAttribute("aria-label", text.language);
  els.bodyStage.setAttribute("aria-label", text.atlasAria);
  els.groupsLabel.textContent = text.groups;
  els.subgroupsLabel.textContent = text.subgroups;
  els.selectionLabel.textContent = text.selectionLabel;
  els.openCatalog.textContent = text.openCatalog;
  els.languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === state.lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderAtlas() {
  const availableGroups = atlasGroupOrder.filter((group) => state.counts.groups[group]);
  els.groups.replaceChildren(
    ...availableGroups.map((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `atlas-chip${state.group === group ? " is-active" : ""}`;
      button.style.setProperty("--zone-color", atlasGroupColors[group]);
      button.addEventListener("click", () => selectGroup(group));

      const label = document.createElement("strong");
      label.textContent = formatLabel(group);

      const count = document.createElement("span");
      count.textContent = `${state.counts.groups[group].toLocaleString(state.lang)} ${copy[state.lang].exercisesShort}`;

      button.append(label, count);
      return button;
    }),
  );

  const scopedExercises =
    state.group === "all"
      ? state.exercises
      : state.exercises.filter((exercise) => exercise.body_part === state.group);
  const subgroupCounts = countBy(scopedExercises, (exercise) => getFilterSubgroups(exercise));
  const subgroups = Object.keys(subgroupCounts).sort((a, b) => {
    const groupA = atlasTargetGroups[a] || "";
    const groupB = atlasTargetGroups[b] || "";
    return groupA.localeCompare(groupB) || a.localeCompare(b);
  });

  els.subgroups.replaceChildren(
    ...subgroups.map((subgroup) => {
      const targetGroup = atlasTargetGroups[subgroup] || state.group || "waist";
      const button = document.createElement("button");
      button.type = "button";
      button.className = `subgroup-dot${state.subgroup === subgroup ? " is-active" : ""}`;
      button.style.setProperty("--zone-color", getSubgroupColor(subgroup).getStyle());
      button.addEventListener("click", () => selectSubgroup(subgroup, targetGroup));
      button.textContent = `${formatLabel(subgroup)} · ${subgroupCounts[subgroup].toLocaleString(state.lang)}`;
      return button;
    }),
  );

  updateMeshState();
  updateSelection();
}

function updateMeshState() {
  interactiveMeshes.forEach((mesh) => {
    const isGroup = state.group !== "all" && mesh.userData.group === state.group;
    const isSubgroup = state.subgroup !== "all" && mesh.userData.subgroup === state.subgroup;
    const isActive = isSubgroup || (state.subgroup === "all" && isGroup);
    const baseOpacity = realModelLoaded ? 0 : 1;
    const mutedOpacity = realModelLoaded ? 0 : 0.28;
    mesh.material.opacity = state.group === "all" || isGroup || isSubgroup ? baseOpacity : mutedOpacity;
    if (isActive) mesh.material.opacity = realModelLoaded ? 0 : 1;
    mesh.material.transparent = true;
    mesh.material.colorWrite = !realModelLoaded;
    mesh.material.depthWrite = !realModelLoaded;
    mesh.material.emissiveIntensity = isActive ? 0.42 : 0.03;
    mesh.scale.multiplyScalar(1);
    if (isSubgroup) selectedMesh = mesh;
  });
}

function countBy(items, getter) {
  return items.reduce((counts, item) => {
    const values = Array.isArray(getter(item)) ? getter(item) : [getter(item)];
    values.filter(Boolean).forEach((value) => {
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }, {});
}

function selectGroup(group) {
  state.group = group;
  state.subgroup = "all";
  selectedMesh = null;
  renderAtlas();
}

function selectSubgroup(subgroup, group) {
  state.group = group;
  state.subgroup = subgroup;
  renderAtlas();
}

function updateSelection() {
  const parts = [];
  if (state.group !== "all") parts.push(formatLabel(state.group));
  if (state.subgroup !== "all") parts.push(formatLabel(state.subgroup));
  els.selection.textContent = parts.length ? parts.join(" / ") : copy[state.lang].allGroups;
  els.openCatalog.href = getCatalogUrl();
  els.catalogLink.href = getCatalogUrl();
}

function getCatalogUrl() {
  const params = new URLSearchParams();
  if (state.group !== "all") params.set("group", state.group);
  if (state.subgroup !== "all") params.set("subgroup", state.subgroup);
  const query = params.toString();
  return query ? `catalog.html?${query}` : "catalog.html";
}

function resizeViewer() {
  const rect = els.bodyStage.getBoundingClientRect();
  const width = Math.max(Math.floor(rect.width), 320);
  const height = Math.max(Math.floor(rect.height), 520);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
}

function animate() {
  rafId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

init().catch((error) => {
  cancelAnimationFrame(rafId);
  console.error(error);
});
