const DATA_URL = "data/exercises.json";
const PAGE_SIZE = 48;

const LANG_STORAGE_KEY = "exerciseCatalogLanguage";

const copy = {
  es: {
    documentTitle: "Atlas de Ejercicios",
    eyebrow: "Catalogo movil",
    title: "Atlas de Ejercicios",
    filterAria: "Filtros del catalogo",
    options: "Opciones de busqueda",
    search: "Buscar",
    searchPlaceholder: "Nombre, equipo o musculo",
    category: "Categoria corporal",
    group: "Grupo muscular",
    subgroup: "Subgrupo muscular",
    equipment: "Equipo",
    clear: "Limpiar",
    hideFilters: "Ocultar filtros",
    showFilters: "Mostrar filtros",
    allGroups: "Todos los grupos",
    all: "Todos",
    allCategories: "Todas",
    allEquipment: "Todo el equipo",
    results: "resultados",
    result: "resultado",
    loadMore: "Cargar mas",
    empty: "No hay ejercicios con esos filtros. Prueba con otro grupo o borra la busqueda.",
    loadError: "No se pudo cargar el dataset local.",
    steps: "Pasos",
    secondaryMuscles: "Musculos secundarios",
    noneSpecified: "No especificados",
    closeDetail: "Cerrar detalle",
    objective: "Objetivo",
    synergist: "Grupo sinergista",
    animated: "Animacion de",
    gif: "GIF de",
    language: "Idioma",
    previousCategories: "Ver categorias anteriores",
    nextCategories: "Ver mas categorias",
    previousGroups: "Ver grupos anteriores",
    nextGroups: "Ver mas grupos",
    previousSubgroups: "Ver subgrupos anteriores",
    nextSubgroups: "Ver mas subgrupos",
    uncategorized: "Otros",
    bodyCategories: {
      all: "Todas",
      torso: "Torso",
      arms: "Brazos",
      legs: "Piernas",
      core: "Core",
      cardio: "Cardio",
    },
    groups: {
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
    equipmentGroups: {
      assistance: "Peso corporal y asistencia",
      freeWeights: "Pesos libres",
      machines: "Maquinas",
      accessories: "Bandas y accesorios",
    },
  },
  en: {
    documentTitle: "Exercise Atlas",
    eyebrow: "Mobile catalog",
    title: "Exercise Atlas",
    filterAria: "Catalog filters",
    options: "Search options",
    search: "Search",
    searchPlaceholder: "Name, equipment or muscle",
    category: "Body category",
    group: "Muscle group",
    subgroup: "Muscle subgroup",
    equipment: "Equipment",
    clear: "Clear",
    hideFilters: "Hide filters",
    showFilters: "Show filters",
    allGroups: "All groups",
    all: "All",
    allCategories: "All",
    allEquipment: "All equipment",
    results: "results",
    result: "result",
    loadMore: "Load more",
    empty: "No exercises match those filters. Try another group or clear the search.",
    loadError: "The local dataset could not be loaded.",
    steps: "Steps",
    secondaryMuscles: "Secondary muscles",
    noneSpecified: "Not specified",
    closeDetail: "Close detail",
    objective: "Target",
    synergist: "Synergist group",
    animated: "Animation of",
    gif: "GIF of",
    language: "Language",
    previousCategories: "See previous categories",
    nextCategories: "See more categories",
    previousGroups: "See previous groups",
    nextGroups: "See more groups",
    previousSubgroups: "See previous subgroups",
    nextSubgroups: "See more subgroups",
    uncategorized: "Other",
    bodyCategories: {
      all: "All",
      torso: "Torso",
      arms: "Arms",
      legs: "Legs",
      core: "Core",
      cardio: "Cardio",
    },
    groups: {
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
    equipmentGroups: {
      assistance: "Body weight and assistance",
      freeWeights: "Free weights",
      machines: "Machines",
      accessories: "Bands and accessories",
    },
  },
};

const bodyCategoryOrder = ["all", "torso", "arms", "legs", "core", "cardio"];

const bodyCategoryGroups = {
  all: [],
  torso: ["back", "chest", "shoulders", "neck"],
  arms: ["upper arms", "lower arms"],
  legs: ["upper legs", "lower legs"],
  core: ["waist"],
  cardio: ["cardio"],
};

const equipmentGroups = [
  {
    key: "assistance",
    items: ["body weight", "assisted", "weighted"],
  },
  {
    key: "freeWeights",
    items: ["dumbbell", "barbell", "ez barbell", "olympic barbell", "kettlebell", "trap bar"],
  },
  {
    key: "machines",
    items: [
      "cable",
      "leverage machine",
      "smith machine",
      "sled machine",
      "elliptical machine",
      "skierg machine",
      "stationary bike",
      "stepmill machine",
      "upper body ergometer",
    ],
  },
  {
    key: "accessories",
    items: [
      "band",
      "resistance band",
      "bosu ball",
      "medicine ball",
      "stability ball",
      "roller",
      "rope",
      "wheel roller",
      "tire",
      "hammer",
    ],
  },
];

const coreSubgroups = new Set(["abs", "obliques", "hip flexors", "lower back"]);

const state = {
  exercises: [],
  filtered: [],
  visibleCount: PAGE_SIZE,
  lang: getInitialLanguage(),
  groupCategory: "all",
  group: "all",
  subgroup: "all",
  equipment: "all",
  query: "",
  activeExercise: null,
};

const els = {
  appHeader: document.querySelector(".app-header"),
  eyebrow: document.querySelector(".eyebrow"),
  title: document.querySelector("h1"),
  languageToggle: document.querySelector(".language-toggle"),
  languageButtons: document.querySelectorAll(".language-toggle button"),
  filters: document.querySelector(".filters"),
  filterBody: document.querySelector("#filter-body"),
  filterToggle: document.querySelector("#filter-toggle"),
  filterSummary: document.querySelector("#filter-summary"),
  filterOptionsLabel: document.querySelector("#filter-options-label"),
  searchLabel: document.querySelector("#search-label"),
  categoryLabel: document.querySelector("#category-label"),
  groupLabel: document.querySelector("#group-label"),
  subgroupLabel: document.querySelector("#subgroup-label"),
  equipmentLabel: document.querySelector("#equipment-label"),
  resultCount: document.querySelector("#result-count"),
  resultLabel: document.querySelector("#result-label"),
  activeFilterCopy: document.querySelector("#active-filter-copy"),
  searchInput: document.querySelector("#search-input"),
  categoryChips: document.querySelector("#category-chips"),
  categoryPrev: document.querySelector("#category-prev"),
  categoryNext: document.querySelector("#category-next"),
  groupChips: document.querySelector("#group-chips"),
  groupPrev: document.querySelector("#group-prev"),
  groupNext: document.querySelector("#group-next"),
  subgroupChips: document.querySelector("#subgroup-chips"),
  subgroupPrev: document.querySelector("#subgroup-prev"),
  subgroupNext: document.querySelector("#subgroup-next"),
  equipmentSelect: document.querySelector("#equipment-select"),
  clearFilters: document.querySelector("#clear-filters"),
  grid: document.querySelector("#exercise-grid"),
  loadMore: document.querySelector("#load-more"),
  emptyState: document.querySelector("#empty-state"),
  dialog: document.querySelector("#exercise-dialog"),
  closeDialog: document.querySelector("#close-dialog"),
  detailGif: document.querySelector("#detail-gif"),
  detailCategory: document.querySelector("#detail-category"),
  detailTitle: document.querySelector("#detail-title"),
  detailTags: document.querySelector("#detail-tags"),
  stepsHeading: document.querySelector("#steps-heading"),
  detailSteps: document.querySelector("#detail-steps"),
  secondaryHeading: document.querySelector("#secondary-heading"),
  detailSecondary: document.querySelector("#detail-secondary"),
  detailAttribution: document.querySelector("#detail-attribution"),
};

const formatLabel = (value) => {
  if (!value) return "";
  return copy[state.lang].groups[value] || value.replace(/\b\w/g, (char) => char.toUpperCase());
};

function getInitialLanguage() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  return stored === "en" ? "en" : "es";
}

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const getFilterSubgroups = (exercise) => {
  if (exercise.body_part !== "waist") return [exercise.target].filter(Boolean);

  return uniqueSorted([exercise.target, exercise.muscle_group, ...(exercise.secondary_muscles || [])])
    .filter((muscle) => coreSubgroups.has(muscle));
};

const matchesSubgroup = (exercise, subgroup) =>
  subgroup === "all" || getFilterSubgroups(exercise).includes(subgroup);

const normalizeExercise = (exercise) => ({
  ...exercise,
  searchText: [
    exercise.name,
    exercise.body_part,
    copy.es.groups[exercise.body_part],
    copy.en.groups[exercise.body_part],
    exercise.equipment,
    exercise.target,
    exercise.muscle_group,
    ...(exercise.secondary_muscles || []),
  ]
    .join(" ")
    .toLowerCase(),
});

async function init() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  state.exercises = data.map(normalizeExercise);
  state.filtered = state.exercises;

  translateStaticText();
  renderCategoryChips();
  renderGroupChips();
  renderEquipmentOptions();
  renderSubgroupOptions();
  applyFilters();
  bindEvents();
  syncStickyOffset();
}

function bindEvents() {
  els.languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  els.searchInput.addEventListener("input", () => {
    state.query = els.searchInput.value.trim().toLowerCase();
    state.visibleCount = PAGE_SIZE;
    applyFilters();
  });

  els.equipmentSelect.addEventListener("change", () => {
    state.equipment = els.equipmentSelect.value;
    state.visibleCount = PAGE_SIZE;
    applyFilters();
  });

  bindChipScroller(els.groupChips, els.groupPrev, els.groupNext);
  bindChipScroller(els.subgroupChips, els.subgroupPrev, els.subgroupNext);
  bindChipScroller(els.categoryChips, els.categoryPrev, els.categoryNext);

  els.filterToggle.addEventListener("click", () => {
    const isCollapsed = els.filters.classList.toggle("is-collapsed");
    els.filterToggle.setAttribute("aria-expanded", String(!isCollapsed));
    els.filterBody.hidden = isCollapsed;
    els.filterToggle.textContent = isCollapsed ? copy[state.lang].showFilters : copy[state.lang].hideFilters;
  });

  window.addEventListener("resize", syncStickyOffset);

  els.clearFilters.addEventListener("click", () => {
    state.groupCategory = "all";
    state.group = "all";
    state.subgroup = "all";
    state.equipment = "all";
    state.query = "";
    state.visibleCount = PAGE_SIZE;
    els.searchInput.value = "";
    els.equipmentSelect.value = "all";
    renderCategoryChips();
    renderGroupChips();
    renderSubgroupOptions();
    applyFilters();
  });

  els.loadMore.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderCards();
  });

  els.closeDialog.addEventListener("click", () => closeDetail());
  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) closeDetail();
  });
}

function setLanguage(lang) {
  if (!copy[lang] || lang === state.lang) return;
  state.lang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  translateStaticText();
  renderCategoryChips();
  renderGroupChips();
  renderEquipmentOptions();
  renderSubgroupOptions();
  renderResultMeta();
  renderCards();
  if (state.activeExercise) renderDetail(state.activeExercise);
  syncStickyOffset();
}

function translateStaticText() {
  const text = copy[state.lang];
  document.documentElement.lang = state.lang;
  document.title = text.documentTitle;
  els.eyebrow.textContent = text.eyebrow;
  els.title.textContent = text.title;
  els.languageToggle.setAttribute("aria-label", text.language);
  els.filters.setAttribute("aria-label", text.filterAria);
  els.filterOptionsLabel.textContent = text.options;
  els.searchLabel.textContent = text.search;
  els.searchInput.placeholder = text.searchPlaceholder;
  els.categoryLabel.textContent = text.category;
  els.groupLabel.textContent = text.group;
  els.subgroupLabel.textContent = text.subgroup;
  els.equipmentLabel.textContent = text.equipment;
  els.clearFilters.textContent = text.clear;
  els.filterToggle.textContent = els.filterBody.hidden ? text.showFilters : text.hideFilters;
  els.loadMore.textContent = text.loadMore;
  els.emptyState.textContent = text.empty;
  els.closeDialog.setAttribute("aria-label", text.closeDetail);
  els.stepsHeading.textContent = text.steps;
  els.secondaryHeading.textContent = text.secondaryMuscles;
  els.categoryPrev.setAttribute("aria-label", text.previousCategories);
  els.categoryNext.setAttribute("aria-label", text.nextCategories);
  els.groupPrev.setAttribute("aria-label", text.previousGroups);
  els.groupNext.setAttribute("aria-label", text.nextGroups);
  els.subgroupPrev.setAttribute("aria-label", text.previousSubgroups);
  els.subgroupNext.setAttribute("aria-label", text.nextSubgroups);
  els.languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === state.lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCategoryChips() {
  const buttons = bodyCategoryOrder.map((value) =>
    createCategoryChip(copy[state.lang].bodyCategories[value], value, state.groupCategory === value),
  );
  els.categoryChips.replaceChildren(...buttons);
  requestAnimationFrame(() =>
    updateScrollButtons(els.categoryChips, els.categoryPrev, els.categoryNext),
  );
}

function renderGroupChips() {
  const allGroups = uniqueSorted(state.exercises.map((exercise) => exercise.body_part));
  const categoryGroups = bodyCategoryGroups[state.groupCategory] || [];
  const groups =
    state.groupCategory === "all"
      ? allGroups
      : categoryGroups.filter((group) => allGroups.includes(group));
  const allButton = createGroupChip(copy[state.lang].all, "all", state.group === "all");
  const groupButtons = groups.map((group) =>
    createGroupChip(formatLabel(group), group, state.group === group),
  );
  els.groupChips.replaceChildren(allButton, ...groupButtons);
  requestAnimationFrame(() => updateScrollButtons(els.groupChips, els.groupPrev, els.groupNext));
}

function createBaseChip(label, value, isActive) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chip${isActive ? " is-active" : ""}`;
  button.textContent = label;
  button.setAttribute("role", "option");
  button.setAttribute("aria-selected", String(isActive));
  button.dataset.value = value;
  return button;
}

function createCategoryChip(label, value, isActive) {
  const button = createBaseChip(label, value, isActive);
  button.addEventListener("click", () => {
    state.groupCategory = value;
    state.group = "all";
    state.subgroup = "all";
    state.visibleCount = PAGE_SIZE;
    renderCategoryChips();
    renderGroupChips();
    renderSubgroupOptions();
    applyFilters();
  });
  return button;
}

function createGroupChip(label, value, isActive) {
  const button = createBaseChip(label, value, isActive);
  button.addEventListener("click", () => {
    state.group = value;
    state.subgroup = "all";
    state.visibleCount = PAGE_SIZE;
    renderGroupChips();
    renderSubgroupOptions();
    applyFilters();
  });
  return button;
}

function createSubgroupChip(label, value, isActive) {
  const button = createBaseChip(label, value, isActive);
  button.addEventListener("click", () => {
    state.subgroup = value;
    state.visibleCount = PAGE_SIZE;
    renderSubgroupOptions();
    applyFilters();
  });
  return button;
}

function renderSubgroupOptions() {
  const scopedExercises = state.exercises.filter((exercise) => {
    const byCategory =
      state.groupCategory === "all" ||
      (bodyCategoryGroups[state.groupCategory] || []).includes(exercise.body_part);
    const byGroup = state.group === "all" || exercise.body_part === state.group;
    return byCategory && byGroup;
  });
  const subgroups = uniqueSorted(scopedExercises.flatMap(getFilterSubgroups));

  if (!subgroups.includes(state.subgroup)) {
    state.subgroup = "all";
  }

  const allButton = createSubgroupChip(copy[state.lang].all, "all", state.subgroup === "all");
  const subgroupButtons =
    state.groupCategory === "all" && state.group === "all"
      ? []
      : subgroups.map((subgroup) =>
          createSubgroupChip(formatLabel(subgroup), subgroup, state.subgroup === subgroup),
        );

  els.subgroupChips.replaceChildren(allButton, ...subgroupButtons);
  requestAnimationFrame(() =>
    updateScrollButtons(els.subgroupChips, els.subgroupPrev, els.subgroupNext),
  );
}

function bindChipScroller(row, previousButton, nextButton) {
  previousButton.addEventListener("click", () => scrollChipRow(row, -1));
  nextButton.addEventListener("click", () => scrollChipRow(row, 1));
  row.addEventListener("scroll", () => updateScrollButtons(row, previousButton, nextButton), {
    passive: true,
  });
  window.addEventListener("resize", () => updateScrollButtons(row, previousButton, nextButton));
}

function scrollChipRow(row, direction) {
  row.scrollBy({
    left: direction * Math.max(row.clientWidth * 0.75, 180),
    behavior: "smooth",
  });
}

function updateScrollButtons(row, previousButton, nextButton) {
  const maxScroll = Math.max(row.scrollWidth - row.clientWidth, 0);
  const hasOverflow = maxScroll > 2;
  previousButton.disabled = !hasOverflow || row.scrollLeft <= 2;
  nextButton.disabled = !hasOverflow || row.scrollLeft >= maxScroll - 2;
}

function renderEquipmentOptions() {
  const equipment = uniqueSorted(state.exercises.map((exercise) => exercise.equipment));
  const available = new Set(equipment);
  const used = new Set();
  const allOption = new Option(copy[state.lang].allEquipment, "all");
  const groups = equipmentGroups
    .map((group) => {
      const groupElement = document.createElement("optgroup");
      groupElement.label = copy[state.lang].equipmentGroups[group.key];
      group.items
        .filter((item) => available.has(item))
        .forEach((item) => {
          used.add(item);
          groupElement.append(new Option(formatLabel(item), item));
        });
      return groupElement;
    })
    .filter((groupElement) => groupElement.children.length > 0);

  const uncategorized = equipment.filter((item) => !used.has(item));
  if (uncategorized.length > 0) {
    const otherGroup = document.createElement("optgroup");
    otherGroup.label = copy[state.lang].uncategorized;
    uncategorized.forEach((item) => otherGroup.append(new Option(formatLabel(item), item)));
    groups.push(otherGroup);
  }

  els.equipmentSelect.replaceChildren(allOption, ...groups);
  els.equipmentSelect.value = state.equipment;
}

function applyFilters() {
  state.filtered = state.exercises.filter((exercise) => {
    const byCategory =
      state.groupCategory === "all" ||
      (bodyCategoryGroups[state.groupCategory] || []).includes(exercise.body_part);
    const byGroup = state.group === "all" || exercise.body_part === state.group;
    const bySubgroup = matchesSubgroup(exercise, state.subgroup);
    const byEquipment = state.equipment === "all" || exercise.equipment === state.equipment;
    const byQuery = !state.query || exercise.searchText.includes(state.query);
    return byCategory && byGroup && bySubgroup && byEquipment && byQuery;
  });

  renderResultMeta();
  renderCards();
}

function renderResultMeta() {
  const count = state.filtered.length;
  els.resultCount.textContent = count.toLocaleString(state.lang);
  els.resultLabel.textContent = count === 1 ? copy[state.lang].result : copy[state.lang].results;

  const parts = [];
  if (state.groupCategory !== "all") parts.push(copy[state.lang].bodyCategories[state.groupCategory]);
  if (state.group !== "all") parts.push(formatLabel(state.group));
  if (state.subgroup !== "all") parts.push(formatLabel(state.subgroup));
  if (state.equipment !== "all") parts.push(formatLabel(state.equipment));
  const summary = parts.length ? parts.join(" / ") : copy[state.lang].allGroups;
  els.activeFilterCopy.textContent = summary;
  els.filterSummary.textContent = summary;
}

function syncStickyOffset() {
  const headerHeight = els.appHeader?.offsetHeight || 76;
  document.documentElement.style.setProperty("--sticky-top", `${headerHeight}px`);
}

function renderCards() {
  const visible = state.filtered.slice(0, state.visibleCount);
  els.grid.replaceChildren(...visible.map(createCard));

  const hasMore = state.visibleCount < state.filtered.length;
  els.loadMore.hidden = !hasMore;
  els.emptyState.hidden = state.filtered.length !== 0;
}

function createCard(exercise) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "exercise-card";
  button.addEventListener("click", () => openDetail(exercise));

  const image = document.createElement("img");
  image.src = exercise.gif_url;
  image.alt = `${copy[state.lang].animated} ${exercise.name}`;
  image.loading = "lazy";
  image.decoding = "async";

  const cardCopy = document.createElement("div");
  cardCopy.className = "card-copy";

  const title = document.createElement("h2");
  title.textContent = exercise.name;

  const meta = document.createElement("p");
  meta.className = "meta-line";
  meta.textContent = `${formatLabel(exercise.body_part)} · ${formatLabel(exercise.equipment)}`;

  const tags = document.createElement("div");
  tags.className = "tag-line";
  [exercise.target, exercise.muscle_group].forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = formatLabel(item);
    tags.append(tag);
  });

  cardCopy.append(title, meta, tags);
  button.append(image, cardCopy);
  return button;
}

function openDetail(exercise) {
  state.activeExercise = exercise;
  renderDetail(exercise);

  if (typeof els.dialog.showModal === "function") {
    els.dialog.showModal();
  } else {
    els.dialog.setAttribute("open", "");
  }
}

function renderDetail(exercise) {
  els.detailGif.src = exercise.gif_url;
  els.detailGif.alt = `${copy[state.lang].gif} ${exercise.name}`;
  els.detailCategory.textContent = `${formatLabel(exercise.body_part)} · ${formatLabel(exercise.equipment)}`;
  els.detailTitle.textContent = exercise.name;

  const tagValues = [
    [copy[state.lang].objective, exercise.target],
    [copy[state.lang].synergist, exercise.muscle_group],
    [copy[state.lang].equipment, exercise.equipment],
  ];
  els.detailTags.replaceChildren(
    ...tagValues.map(([label, value]) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = `${label}: ${formatLabel(value)}`;
      return tag;
    }),
  );

  const steps = exercise.instruction_steps?.[state.lang]?.length
    ? exercise.instruction_steps[state.lang]
    : exercise.instruction_steps?.en || [];
  els.detailSteps.replaceChildren(
    ...steps.map((step) => {
      const item = document.createElement("li");
      item.textContent = step;
      return item;
    }),
  );

  els.detailSecondary.textContent = exercise.secondary_muscles?.length
    ? exercise.secondary_muscles.map(formatLabel).join(", ")
    : copy[state.lang].noneSpecified;
  els.detailAttribution.textContent = exercise.attribution || "";
}

function closeDetail() {
  state.activeExercise = null;
  els.detailGif.removeAttribute("src");
  if (els.dialog.open) els.dialog.close();
}

init().catch((error) => {
  els.emptyState.hidden = false;
  els.emptyState.textContent = copy[state.lang].loadError;
  console.error(error);
});
