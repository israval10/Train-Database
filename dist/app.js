const DATA_URL = "data/exercises.json";
const PAGE_SIZE = 48;

const groupLabels = {
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
};

const bodyCategoryLabels = {
  all: "Todas",
  torso: "Torso",
  arms: "Brazos",
  legs: "Piernas",
  core: "Core",
  cardio: "Cardio",
};

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
    label: "Peso corporal y asistencia",
    items: ["body weight", "assisted", "weighted"],
  },
  {
    label: "Pesos libres",
    items: ["dumbbell", "barbell", "ez barbell", "olympic barbell", "kettlebell", "trap bar"],
  },
  {
    label: "Maquinas",
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
    label: "Bandas y accesorios",
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
  groupCategory: "all",
  group: "all",
  subgroup: "all",
  equipment: "all",
  query: "",
};

const els = {
  totalCount: document.querySelector("#total-count"),
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
  detailSteps: document.querySelector("#detail-steps"),
  detailSecondary: document.querySelector("#detail-secondary"),
  detailAttribution: document.querySelector("#detail-attribution"),
};

const formatLabel = (value) => {
  if (!value) return "";
  return groupLabels[value] || value.replace(/\b\w/g, (char) => char.toUpperCase());
};

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

  els.totalCount.textContent = state.exercises.length.toLocaleString("es");
  renderCategoryChips();
  renderGroupChips();
  renderEquipmentOptions();
  renderSubgroupOptions();
  applyFilters();
  bindEvents();
}

function bindEvents() {
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

function renderCategoryChips() {
  const buttons = Object.entries(bodyCategoryLabels).map(([value, label]) =>
    createCategoryChip(label, value, state.groupCategory === value),
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
  const allButton = createGroupChip("Todos", "all", state.group === "all");
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

  const allButton = createSubgroupChip("Todos", "all", state.subgroup === "all");
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
  const allOption = new Option("Todo el equipo", "all");
  const groups = equipmentGroups
    .map((group) => {
      const groupElement = document.createElement("optgroup");
      groupElement.label = group.label;
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
    otherGroup.label = "Otros";
    uncategorized.forEach((item) => otherGroup.append(new Option(formatLabel(item), item)));
    groups.push(otherGroup);
  }

  els.equipmentSelect.replaceChildren(allOption, ...groups);
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
  els.resultCount.textContent = count.toLocaleString("es");
  els.resultLabel.textContent = count === 1 ? "resultado" : "resultados";

  const parts = [];
  if (state.groupCategory !== "all") parts.push(bodyCategoryLabels[state.groupCategory]);
  if (state.group !== "all") parts.push(formatLabel(state.group));
  if (state.subgroup !== "all") parts.push(formatLabel(state.subgroup));
  if (state.equipment !== "all") parts.push(formatLabel(state.equipment));
  els.activeFilterCopy.textContent = parts.length ? parts.join(" / ") : "Todos los grupos";
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
  image.alt = `Animacion de ${exercise.name}`;
  image.loading = "lazy";
  image.decoding = "async";

  const copy = document.createElement("div");
  copy.className = "card-copy";

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

  copy.append(title, meta, tags);
  button.append(image, copy);
  return button;
}

function openDetail(exercise) {
  els.detailGif.src = exercise.gif_url;
  els.detailGif.alt = `GIF de ${exercise.name}`;
  els.detailCategory.textContent = `${formatLabel(exercise.body_part)} · ${formatLabel(exercise.equipment)}`;
  els.detailTitle.textContent = exercise.name;

  const tagValues = [
    ["Objetivo", exercise.target],
    ["Grupo sinergista", exercise.muscle_group],
    ["Equipo", exercise.equipment],
  ];
  els.detailTags.replaceChildren(
    ...tagValues.map(([label, value]) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = `${label}: ${formatLabel(value)}`;
      return tag;
    }),
  );

  const steps = exercise.instruction_steps?.es?.length
    ? exercise.instruction_steps.es
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
    : "No especificados";
  els.detailAttribution.textContent = exercise.attribution || "";

  if (typeof els.dialog.showModal === "function") {
    els.dialog.showModal();
  } else {
    els.dialog.setAttribute("open", "");
  }
}

function closeDetail() {
  els.detailGif.removeAttribute("src");
  if (els.dialog.open) els.dialog.close();
}

init().catch((error) => {
  els.emptyState.hidden = false;
  els.emptyState.textContent = "No se pudo cargar el dataset local.";
  console.error(error);
});
