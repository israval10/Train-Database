const DATA_URL = "data/exercises.json";
const LANG_STORAGE_KEY = "exerciseCatalogLanguage";

const copy = {
  es: {
    documentTitle: "Mapa Muscular 2D",
    eyebrow: "Home muscular",
    title: "Mapa Muscular 2D",
    catalog: "Catalogo",
    language: "Idioma",
    atlasAria: "Mapa muscular interactivo frontal y posterior",
    groups: "Grupos",
    subgroups: "Subgrupos",
    selectionLabel: "Seleccion actual",
    allGroups: "Todos los grupos",
    openCatalog: "Ver catalogo",
    exercisesShort: "ej.",
    front: "Frente",
    backView: "Reverso",
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
    documentTitle: "2D Muscle Map",
    eyebrow: "Muscle home",
    title: "2D Muscle Map",
    catalog: "Catalog",
    language: "Language",
    atlasAria: "Interactive front and back muscle map",
    groups: "Groups",
    subgroups: "Subgroups",
    selectionLabel: "Current selection",
    allGroups: "All groups",
    openCatalog: "Open catalog",
    exercisesShort: "ex.",
    front: "Front",
    backView: "Back",
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
  "lower legs": "#48add7",
  neck: "#6fb0b0",
  shoulders: "#d9bb55",
  "upper arms": "#b978c2",
  "upper legs": "#3f8dca",
  waist: "#1fb3a7",
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

const bodyZones = [
  ["front", "levator scapulae", "neck", "M171 85 C164 104 159 119 155 139 L174 151 C181 133 185 112 184 90 Z M216 90 C215 112 219 133 226 151 L245 139 C241 119 236 104 229 85 Z"],
  ["front", "delts", "shoulders", "M116 151 C88 154 70 168 62 194 C82 201 100 206 122 202 C132 184 136 166 116 151 Z M284 151 C312 154 330 168 338 194 C318 201 300 206 278 202 C268 184 264 166 284 151 Z"],
  ["front", "pectorals", "chest", "M131 151 C154 144 178 145 194 156 L193 215 C168 219 141 213 125 194 C122 176 123 161 131 151 Z M206 156 C222 145 246 144 269 151 C277 161 278 176 275 194 C259 213 232 219 207 215 Z"],
  ["front", "serratus anterior", "chest", "M114 206 C122 217 128 231 130 250 L149 251 C144 230 139 215 130 200 Z M286 206 C278 217 272 231 270 250 L251 251 C256 230 261 215 270 200 Z"],
  ["front", "biceps", "upper arms", "M83 205 C98 210 111 218 119 230 C113 260 106 288 96 314 C78 309 67 298 61 281 C65 254 72 227 83 205 Z M317 205 C302 210 289 218 281 230 C287 260 294 288 304 314 C322 309 333 298 339 281 C335 254 328 227 317 205 Z"],
  ["front", "forearms", "lower arms", "M58 292 C72 311 85 326 97 344 C90 374 82 403 71 433 C55 424 44 407 37 384 C42 350 49 318 58 292 Z M342 292 C328 311 315 326 303 344 C310 374 318 403 329 433 C345 424 356 407 363 384 C358 350 351 318 342 292 Z"],
  ["front", "abs", "waist", "M166 225 C187 221 213 221 234 225 C237 257 236 293 229 326 C213 332 187 332 171 326 C164 293 163 257 166 225 Z"],
  ["front", "obliques", "waist", "M130 226 C141 224 152 224 163 226 C160 260 161 294 169 330 C154 326 141 314 131 295 C125 271 125 247 130 226 Z M270 226 C259 224 248 224 237 226 C240 260 239 294 231 330 C246 326 259 314 269 295 C275 271 275 247 270 226 Z"],
  ["front", "hip flexors", "waist", "M168 332 C184 337 194 345 199 358 C188 381 178 405 169 432 C150 410 144 380 151 345 Z M232 332 C216 337 206 345 201 358 C212 381 222 405 231 432 C250 410 256 380 249 345 Z"],
  ["front", "adductors", "upper legs", "M181 365 C192 372 198 386 199 408 C194 455 189 506 184 558 C169 513 158 464 151 411 C157 388 166 372 181 365 Z M219 365 C208 372 202 386 201 408 C206 455 211 506 216 558 C231 513 242 464 249 411 C243 388 234 372 219 365 Z"],
  ["front", "abductors", "upper legs", "M128 362 C148 365 164 376 173 394 C164 438 156 485 149 537 C125 502 110 460 104 410 C108 389 116 373 128 362 Z M272 362 C252 365 236 376 227 394 C236 438 244 485 251 537 C275 502 290 460 296 410 C292 389 284 373 272 362 Z"],
  ["front", "quads", "upper legs", "M132 390 C158 396 174 416 180 449 C174 497 166 542 155 583 C131 565 117 532 111 486 C113 448 120 416 132 390 Z M268 390 C242 396 226 416 220 449 C226 497 234 542 245 583 C269 565 283 532 289 486 C287 448 280 416 268 390 Z"],
  ["front", "calves", "lower legs", "M129 555 C146 565 157 586 159 620 C154 666 148 704 140 735 C121 713 110 680 108 636 C111 600 118 573 129 555 Z M271 555 C254 565 243 586 241 620 C246 666 252 704 260 735 C279 713 290 680 292 636 C289 600 282 573 271 555 Z"],
  ["front", "cardiovascular system", "cardio", "M215 217 C230 226 231 249 215 260 C199 249 200 226 215 217 Z"],
  ["back", "levator scapulae", "neck", "M578 83 C570 113 568 140 576 162 L596 164 C592 136 591 108 591 87 Z M622 87 C622 108 621 136 617 164 L638 162 C646 140 644 113 636 83 Z"],
  ["back", "traps", "back", "M548 145 C571 151 588 170 600 204 C612 170 629 151 652 145 C643 203 632 258 617 310 C606 316 594 316 583 310 C568 258 557 203 548 145 Z"],
  ["back", "upper back", "back", "M529 206 C556 211 579 231 595 263 C588 285 581 305 572 325 C546 306 528 276 518 235 Z M671 206 C644 211 621 231 605 263 C612 285 619 305 628 325 C654 306 672 276 682 235 Z"],
  ["back", "lats", "back", "M515 241 C539 263 559 298 574 343 C558 353 540 354 520 345 C508 311 503 276 515 241 Z M685 241 C661 263 641 298 626 343 C642 353 660 354 680 345 C692 311 697 276 685 241 Z"],
  ["back", "delts", "shoulders", "M516 150 C488 154 470 169 463 194 C483 202 501 206 522 202 C532 181 534 163 516 150 Z M684 150 C712 154 730 169 737 194 C717 202 699 206 678 202 C668 181 666 163 684 150 Z"],
  ["back", "triceps", "upper arms", "M482 203 C500 210 514 223 522 242 C517 270 510 295 499 320 C481 316 469 301 462 279 C466 248 472 224 482 203 Z M718 203 C700 210 686 223 678 242 C683 270 690 295 701 320 C719 316 731 301 738 279 C734 248 728 224 718 203 Z"],
  ["back", "forearms", "lower arms", "M459 289 C474 310 487 329 500 350 C493 379 485 407 473 433 C456 423 445 404 439 382 C444 348 450 318 459 289 Z M741 289 C726 310 713 329 700 350 C707 379 715 407 727 433 C744 423 755 404 761 382 C756 348 750 318 741 289 Z"],
  ["back", "lower back", "waist", "M574 324 C592 331 608 331 626 324 C633 352 630 381 617 410 C606 414 594 414 583 410 C570 381 567 352 574 324 Z"],
  ["back", "spine", "waist", "M596 159 C604 159 607 159 604 159 L608 414 L592 414 Z"],
  ["back", "glutes", "upper legs", "M544 360 C572 350 592 361 600 394 C590 424 570 441 540 445 C522 421 520 386 544 360 Z M656 360 C628 350 608 361 600 394 C610 424 630 441 660 445 C678 421 680 386 656 360 Z"],
  ["back", "hamstrings", "upper legs", "M532 430 C560 436 579 460 586 502 C580 544 570 581 556 613 C530 594 515 558 510 510 C512 475 519 448 532 430 Z M668 430 C640 436 621 460 614 502 C620 544 630 581 644 613 C670 594 685 558 690 510 C688 475 681 448 668 430 Z"],
  ["back", "calves", "lower legs", "M532 578 C553 589 566 616 568 655 C563 696 556 725 546 742 C525 715 514 679 513 636 C516 610 522 591 532 578 Z M668 578 C647 589 634 616 632 655 C637 696 644 725 654 742 C675 715 686 679 687 636 C684 610 678 591 668 578 Z"],
].map(([view, subgroup, group, path]) => ({ view, subgroup, group, path }));

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
  map: document.querySelector("#muscle-map"),
  tooltip: document.querySelector("#muscle-tooltip"),
  groupsLabel: document.querySelector("#atlas-groups-label"),
  subgroupsLabel: document.querySelector("#atlas-subgroups-label"),
  selectionLabel: document.querySelector("#atlas-selection-label"),
  selection: document.querySelector("#atlas-selection"),
  openCatalog: document.querySelector("#atlas-open-catalog"),
  groups: document.querySelector("#atlas-groups"),
  subgroups: document.querySelector("#atlas-subgroups"),
};

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
  renderMuscleMap();
  renderAtlas();
  bindEvents();
}

function renderMuscleMap() {
  els.map.innerHTML = `
    <svg class="muscle-diagram" viewBox="0 0 800 820" role="img" aria-labelledby="muscle-map-title">
      <title id="muscle-map-title">${copy[state.lang].atlasAria}</title>
      <g class="body-view" aria-label="${copy[state.lang].front}">
        ${renderBodyBase(0)}
        ${renderZones("front")}
        ${renderBodyDetails(0, "front")}
        <text class="view-label" x="200" y="790">${copy[state.lang].front}</text>
      </g>
      <g class="body-view" aria-label="${copy[state.lang].backView}">
        ${renderBodyBase(400)}
        ${renderZones("back")}
        ${renderBodyDetails(400, "back")}
        <text class="view-label" x="600" y="790">${copy[state.lang].backView}</text>
      </g>
    </svg>
  `;
}

function renderBodyBase(x) {
  return `
    <g class="body-base" transform="translate(${x} 0)">
      <path d="M200 33 C231 33 251 55 249 89 C248 115 236 137 216 147 C208 151 192 151 184 147 C164 137 152 115 151 89 C149 55 169 33 200 33 Z" />
      <path d="M151 89 C137 92 134 126 152 137 M249 89 C263 92 266 126 248 137" />
      <path d="M176 137 C184 148 216 148 224 137 L239 154 C247 164 264 169 286 173 C321 179 339 206 344 250 C349 294 358 339 372 383 C379 407 367 432 337 448 C321 418 307 384 298 347 C289 311 281 249 278 194 C270 269 259 335 239 374 C228 395 213 404 200 404 C187 404 172 395 161 374 C141 335 130 269 122 194 C119 249 111 311 102 347 C93 384 79 418 63 448 C33 432 21 407 28 383 C42 339 51 294 56 250 C61 206 79 179 114 173 C136 169 153 164 161 154 Z" />
      <path d="M162 376 C142 397 125 438 116 505 C108 562 104 617 108 654 C111 703 121 743 143 743 C158 743 166 695 166 639 C171 561 184 484 200 415 C216 484 229 561 234 639 C234 695 242 743 257 743 C279 743 289 703 292 654 C296 617 292 562 284 505 C275 438 258 397 238 376 C224 395 211 405 200 405 C189 405 176 395 162 376 Z" />
      <path d="M112 737 C101 744 91 751 88 761 C99 766 121 765 143 759 C154 756 168 760 178 756 C173 744 159 737 144 739 C132 740 122 742 112 737 Z M288 737 C299 744 309 751 312 761 C301 766 279 765 257 759 C246 756 232 760 222 756 C227 744 241 737 256 739 C268 740 278 742 288 737 Z" />
    </g>
  `;
}

function renderBodyDetails(x, view) {
  const headLine =
    view === "front"
      ? '<path d="M171 76 C184 85 216 85 229 76 M171 101 C178 130 222 130 229 101" />'
      : '<path d="M171 88 C181 102 219 102 229 88" />';

  return `
    <g class="body-detail" transform="translate(${x} 0)">
      ${headLine}
      <path d="M63 448 C54 455 47 467 47 480 M73 448 C67 459 63 474 64 487 M83 441 C79 456 78 474 81 491 M96 424 C96 442 97 459 103 474" />
      <path d="M337 448 C346 455 353 467 353 480 M327 448 C333 459 337 474 336 487 M317 441 C321 456 322 474 319 491 M304 424 C304 442 303 459 297 474" />
      <path d="M112 737 C119 750 151 750 166 743 M288 737 C281 750 249 750 234 743" />
      <path d="M198 150 L198 405 M151 363 C168 383 184 397 200 405 C216 397 232 383 249 363" />
    </g>
  `;
}

function renderZones(view) {
  return bodyZones
    .filter((zone) => zone.view === view)
    .map((zone) => {
      const color = getSubgroupColor(zone.subgroup);
      return `<path class="muscle-zone" data-group="${zone.group}" data-subgroup="${zone.subgroup}" d="${zone.path}" style="--zone-color: ${color}; fill: ${color};" tabindex="0" role="button" aria-label="${formatLabel(zone.subgroup)}" />`;
    })
    .join("");
}

function bindEvents() {
  els.languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  els.map.addEventListener("pointermove", handlePointerMove);
  els.map.addEventListener("pointerleave", clearHover);
  els.map.addEventListener("click", (event) => {
    const zone = event.target.closest(".muscle-zone");
    if (zone) selectSubgroup(zone.dataset.subgroup, zone.dataset.group);
  });
  els.map.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const zone = event.target.closest(".muscle-zone");
    if (!zone) return;
    event.preventDefault();
    selectSubgroup(zone.dataset.subgroup, zone.dataset.group);
  });
}

function handlePointerMove(event) {
  const zone = event.target.closest(".muscle-zone");
  if (!zone) {
    clearHover();
    return;
  }

  state.hovered = { subgroup: zone.dataset.subgroup, group: zone.dataset.group };
  const rect = els.bodyStage.getBoundingClientRect();
  els.tooltip.hidden = false;
  els.tooltip.style.left = `${event.clientX - rect.left}px`;
  els.tooltip.style.top = `${event.clientY - rect.top}px`;
  els.tooltip.textContent = `${formatLabel(zone.dataset.subgroup)} · ${
    state.counts.subgroups[zone.dataset.subgroup] || 0
  } ${copy[state.lang].exercisesShort}`;
}

function clearHover() {
  state.hovered = null;
  els.tooltip.hidden = true;
}

function setLanguage(lang) {
  if (!copy[lang] || lang === state.lang) return;
  state.lang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  translate();
  renderMuscleMap();
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
      button.style.setProperty("--zone-color", getSubgroupColor(subgroup));
      button.addEventListener("click", () => selectSubgroup(subgroup, targetGroup));
      button.textContent = `${formatLabel(subgroup)} · ${subgroupCounts[subgroup].toLocaleString(state.lang)}`;
      return button;
    }),
  );

  updateZoneState();
  updateSelection();
}

function updateZoneState() {
  els.map.querySelectorAll(".muscle-zone").forEach((zone) => {
    const isGroup = state.group !== "all" && zone.dataset.group === state.group;
    const isSubgroup = state.subgroup !== "all" && zone.dataset.subgroup === state.subgroup;
    const isActive = isSubgroup || (state.subgroup === "all" && isGroup);
    const isMuted = state.group !== "all" && !isGroup && !isSubgroup;
    zone.classList.toggle("is-active", isActive);
    zone.classList.toggle("is-muted", isMuted);
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

function getSubgroupColor(subgroup) {
  const group = atlasTargetGroups[subgroup] || "waist";
  const [hueOffset, saturationOffset, lightnessOffset] = subgroupToneOffsets[subgroup] || [0, 0, 0];
  const [hue, saturation, lightness] = hexToHsl(atlasGroupColors[group] || "#9b8f85");
  return hslToHex(
    (hue + hueOffset + 1) % 1,
    clamp(saturation + saturationOffset, 0.25, 0.95),
    clamp(lightness + lightnessOffset, 0.28, 0.72),
  );
}

function hexToHsl(hex) {
  const normalized = hex.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) return [0, 0, lightness];

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
  if (max === green) hue = (blue - red) / delta + 2;
  if (max === blue) hue = (red - green) / delta + 4;
  return [hue / 6, saturation, lightness];
}

function hslToHex(hue, saturation, lightness) {
  const toRgb = (p, q, t) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  const channels = [
    toRgb(p, q, hue + 1 / 3),
    toRgb(p, q, hue),
    toRgb(p, q, hue - 1 / 3),
  ];
  return `#${channels.map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

init().catch((error) => {
  console.error(error);
});
