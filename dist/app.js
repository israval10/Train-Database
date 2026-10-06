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

const state = {
  exercises: [],
  filtered: [],
  visibleCount: PAGE_SIZE,
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
  groupChips: document.querySelector("#group-chips"),
  subgroupChips: document.querySelector("#subgroup-chips"),
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

const getFilterSubgroups = (exercise) => [exercise.target].filter(Boolean);

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

  els.clearFilters.addEventListener("click", () => {
    state.group = "all";
    state.subgroup = "all";
    state.equipment = "all";
    state.query = "";
    state.visibleCount = PAGE_SIZE;
    els.searchInput.value = "";
    els.equipmentSelect.value = "all";
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

function renderGroupChips() {
  const groups = uniqueSorted(state.exercises.map((exercise) => exercise.body_part));
  const allButton = createGroupChip("Todos", "all", state.group === "all");
  const groupButtons = groups.map((group) =>
    createGroupChip(formatLabel(group), group, state.group === group),
  );
  els.groupChips.replaceChildren(allButton, ...groupButtons);
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
  const scopedExercises = state.exercises.filter((exercise) => exercise.body_part === state.group);
  const subgroups = uniqueSorted(scopedExercises.flatMap(getFilterSubgroups));

  if (state.group === "all" || !subgroups.includes(state.subgroup)) {
    state.subgroup = "all";
  }

  const allButton = createSubgroupChip("Todos", "all", state.subgroup === "all");
  const subgroupButtons =
    state.group === "all"
      ? []
      : subgroups.map((subgroup) =>
          createSubgroupChip(formatLabel(subgroup), subgroup, state.subgroup === subgroup),
        );

  els.subgroupChips.replaceChildren(allButton, ...subgroupButtons);
}

function renderEquipmentOptions() {
  const equipment = uniqueSorted(state.exercises.map((exercise) => exercise.equipment));
  const options = [new Option("Todo el equipo", "all")];
  equipment.forEach((item) => options.push(new Option(formatLabel(item), item)));
  els.equipmentSelect.replaceChildren(...options);
}

function applyFilters() {
  state.filtered = state.exercises.filter((exercise) => {
    const byGroup = state.group === "all" || exercise.body_part === state.group;
    const bySubgroup = matchesSubgroup(exercise, state.subgroup);
    const byEquipment = state.equipment === "all" || exercise.equipment === state.equipment;
    const byQuery = !state.query || exercise.searchText.includes(state.query);
    return byGroup && bySubgroup && byEquipment && byQuery;
  });

  renderResultMeta();
  renderCards();
}

function renderResultMeta() {
  const count = state.filtered.length;
  els.resultCount.textContent = count.toLocaleString("es");
  els.resultLabel.textContent = count === 1 ? "resultado" : "resultados";

  const parts = [];
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
