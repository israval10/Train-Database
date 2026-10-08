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
      abductors: "Abductores",
      abs: "Abdominales",
      adductors: "Aductores",
      biceps: "Biceps",
      calves: "Pantorrillas",
      "cardiovascular system": "Sistema cardiovascular",
      delts: "Deltoides",
      forearms: "Antebrazos",
      glutes: "Gluteos",
      hamstrings: "Isquiotibiales",
      "hip flexors": "Flexores de cadera",
      lats: "Dorsales",
      "levator scapulae": "Elevador de escapula",
      "lower back": "Zona lumbar",
      obliques: "Oblicuos",
      pectorals: "Pectorales",
      quads: "Cuadriceps",
      "serratus anterior": "Serrato anterior",
      spine: "Estabilizadores de columna",
      traps: "Trapecios",
      triceps: "Triceps",
      "upper back": "Espalda alta",
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
      "cardiovascular system": "Cardiovascular System",
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

const subgroupAtlas = {
  "hip flexors": { group: "waist", color: "#25b9aa" },
  "lower back": { group: "waist", color: "#168f86" },
  obliques: { group: "waist", color: "#18aeb9" },
  lats: { group: "back", color: "#b58d47" },
  traps: { group: "back", color: "#e76f9b" },
  "upper back": { group: "back", color: "#c57db5" },
  "cardiovascular system": { group: "cardio", color: "#d92e43", special: true },
  pectorals: { group: "chest", color: "#a7cc10" },
  "serratus anterior": { group: "chest", color: "#18b8b2" },
  forearms: { group: "lower arms", color: "#f39a17" },
  calves: { group: "lower legs", color: "#1db5dc" },
  "levator scapulae": { group: "neck", color: "#ec6095" },
  delts: { group: "shoulders", color: "#e42d3f" },
  biceps: { group: "upper arms", color: "#d93248" },
  triceps: { group: "upper arms", color: "#d12b45" },
  abductors: { group: "upper legs", color: "#2d8bc8" },
  adductors: { group: "upper legs", color: "#1aa0c4" },
  glutes: { group: "upper legs", color: "#8f82c5" },
  hamstrings: { group: "upper legs", color: "#2f79bf" },
  quads: { group: "upper legs", color: "#328dca" },
  abs: { group: "waist", color: "#2aad50" },
  spine: { group: "waist", color: "#16a698" },
};

const atlasTargetGroups = Object.fromEntries(
  Object.entries(subgroupAtlas).map(([subgroup, config]) => [subgroup, config.group]),
);

const coreSubgroups = new Set(["abs", "obliques", "hip flexors", "lower back"]);

const bodyZones = [
  ["front", "levator scapulae", "neck", "M171 82 C164 106 158 126 154 151 L177 161 C184 138 187 111 184 86 Z M216 86 C213 111 216 138 223 161 L246 151 C242 126 236 106 229 82 Z"],
  ["front", "delts", "shoulders", "M112 151 C83 156 66 171 58 198 C78 207 102 211 124 202 C135 181 134 160 112 151 Z M288 151 C317 156 334 171 342 198 C322 207 298 211 276 202 C265 181 266 160 288 151 Z"],
  ["front", "pectorals", "chest", "M126 151 C148 141 179 142 195 158 C198 177 198 195 193 214 C164 222 134 215 120 194 C118 175 119 160 126 151 Z M205 158 C221 142 252 141 274 151 C281 160 282 175 280 194 C266 215 236 222 207 214 C202 195 202 177 205 158 Z"],
  ["front", "serratus anterior", "chest", "M116 203 C127 219 134 238 137 260 L156 260 C151 236 142 216 129 198 Z M284 203 C273 219 266 238 263 260 L244 260 C249 236 258 216 271 198 Z"],
  ["front", "biceps", "upper arms", "M82 205 C99 209 113 220 121 237 C116 270 106 304 95 334 C76 326 63 309 58 286 C62 253 70 225 82 205 Z M318 205 C301 209 287 220 279 237 C284 270 294 304 305 334 C324 326 337 309 342 286 C338 253 330 225 318 205 Z"],
  ["front", "forearms", "lower arms", "M56 297 C71 318 85 338 98 360 C90 392 80 420 65 445 C47 431 37 411 31 389 C38 352 46 321 56 297 Z M344 297 C329 318 315 338 302 360 C310 392 320 420 335 445 C353 431 363 411 369 389 C362 352 354 321 344 297 Z"],
  ["front", "abs", "waist", "M178 225 C190 222 210 222 222 225 C225 238 222 249 212 254 L188 254 C178 249 175 238 178 225 Z M176 261 C188 258 195 258 198 263 L197 285 C193 291 184 292 174 288 C170 279 171 268 176 261 Z M202 263 C205 258 212 258 224 261 C229 268 230 279 226 288 C216 292 207 291 203 285 Z M173 296 C184 292 194 294 198 301 L197 323 C191 330 179 329 170 322 C167 312 168 303 173 296 Z M202 301 C206 294 216 292 227 296 C232 303 233 312 230 322 C221 329 209 330 203 323 Z M174 333 C185 330 194 331 199 338 L199 365 C189 362 178 355 170 344 C170 340 171 336 174 333 Z M201 338 C206 331 215 330 226 333 C229 336 230 340 230 344 C222 355 211 362 201 365 Z"],
  ["front", "obliques", "waist", "M128 221 C140 219 154 221 164 228 C160 263 162 298 172 334 C155 331 140 317 129 296 C123 269 123 242 128 221 Z M272 221 C260 219 246 221 236 228 C240 263 238 298 228 334 C245 331 260 317 271 296 C277 269 277 242 272 221 Z"],
  ["front", "hip flexors", "waist", "M165 334 C183 338 195 347 200 361 C188 386 178 414 170 446 C151 422 144 389 151 350 Z M235 334 C217 338 205 347 200 361 C212 386 222 414 230 446 C249 422 256 389 249 350 Z"],
  ["front", "adductors", "upper legs", "M180 368 C191 377 198 393 199 416 C194 469 189 522 184 575 C166 527 154 474 148 414 C156 390 166 374 180 368 Z M220 368 C209 377 202 393 201 416 C206 469 211 522 216 575 C234 527 246 474 252 414 C244 390 234 374 220 368 Z"],
  ["front", "abductors", "upper legs", "M126 361 C148 365 165 378 174 399 C166 449 157 499 148 552 C123 516 107 470 103 414 C108 390 116 372 126 361 Z M274 361 C252 365 235 378 226 399 C234 449 243 499 252 552 C277 516 293 470 297 414 C292 390 284 372 274 361 Z"],
  ["front", "quads", "upper legs", "M130 392 C158 399 176 421 181 457 C176 506 168 553 156 592 C130 575 113 539 108 489 C111 448 119 415 130 392 Z M270 392 C242 399 224 421 219 457 C224 506 232 553 244 592 C270 575 287 539 292 489 C289 448 281 415 270 392 Z"],
  ["front", "calves", "lower legs", "M128 557 C146 568 157 592 158 629 C154 677 148 713 139 737 C121 716 110 682 108 640 C110 603 117 575 128 557 Z M272 557 C254 568 243 592 242 629 C246 677 252 713 261 737 C279 716 290 682 292 640 C290 603 283 575 272 557 Z"],
  ["back", "levator scapulae", "neck", "M577 82 C569 111 568 139 576 164 L596 165 C593 136 592 108 591 87 Z M623 87 C622 108 621 136 617 165 L638 164 C646 139 645 111 637 82 Z"],
  ["back", "traps", "back", "M546 143 C571 148 589 169 600 207 C611 169 629 148 654 143 C646 205 633 263 617 315 C607 322 593 322 583 315 C567 263 554 205 546 143 Z"],
  ["back", "upper back", "back", "M528 199 C558 208 581 231 596 266 C589 291 581 313 571 331 C544 311 526 280 516 236 Z M672 199 C642 208 619 231 604 266 C611 291 619 313 629 331 C656 311 674 280 684 236 Z"],
  ["back", "lats", "back", "M513 235 C539 260 560 297 575 347 C558 359 538 360 518 349 C506 313 502 274 513 235 Z M687 235 C661 260 640 297 625 347 C642 359 662 360 682 349 C694 313 698 274 687 235 Z"],
  ["back", "delts", "shoulders", "M512 150 C483 156 466 172 459 199 C480 208 503 211 524 202 C535 181 535 160 512 150 Z M688 150 C717 156 734 172 741 199 C720 208 697 211 676 202 C665 181 665 160 688 150 Z"],
  ["back", "triceps", "upper arms", "M481 203 C500 209 515 222 523 242 C518 275 509 306 498 335 C478 327 465 309 459 284 C463 251 470 224 481 203 Z M719 203 C700 209 685 222 677 242 C682 275 691 306 702 335 C722 327 735 309 741 284 C737 251 730 224 719 203 Z"],
  ["back", "forearms", "lower arms", "M456 296 C472 318 487 339 500 362 C492 394 482 422 467 446 C449 432 438 411 432 388 C439 351 447 321 456 296 Z M744 296 C728 318 713 339 700 362 C708 394 718 422 733 446 C751 432 762 411 768 388 C761 351 753 321 744 296 Z"],
  ["back", "lower back", "waist", "M573 321 C591 329 609 329 627 321 C635 350 631 383 617 412 C606 417 594 417 583 412 C569 383 565 350 573 321 Z"],
  ["back", "spine", "waist", "M595 158 L605 158 L609 414 L591 414 Z"],
  ["back", "glutes", "upper legs", "M543 356 C572 348 592 361 600 395 C590 428 569 447 539 450 C520 425 519 383 543 356 Z M657 356 C628 348 608 361 600 395 C610 428 631 447 661 450 C680 425 681 383 657 356 Z"],
  ["back", "hamstrings", "upper legs", "M531 429 C560 436 579 463 586 507 C580 550 570 588 556 617 C529 598 514 560 509 512 C511 475 519 448 531 429 Z M669 429 C640 436 621 463 614 507 C620 550 630 588 644 617 C671 598 686 560 691 512 C689 475 681 448 669 429 Z"],
  ["back", "calves", "lower legs", "M531 579 C552 591 565 618 568 657 C563 699 556 727 546 743 C526 718 515 682 513 640 C516 610 522 591 531 579 Z M669 579 C648 591 635 618 632 657 C637 699 644 727 654 743 C674 718 685 682 687 640 C684 610 678 591 669 579 Z"],
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
      ${renderSpecialControl()}
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

function renderSpecialControl() {
  const subgroup = "cardiovascular system";
  const color = getSubgroupColor(subgroup);
  return `
    <g class="special-zone" data-group="cardio" data-subgroup="${subgroup}" tabindex="0" role="button" aria-label="${formatLabel(subgroup)}" style="--zone-color: ${color};">
      <circle cx="400" cy="47" r="24" />
      <path d="M400 61 C386 52 381 43 384 35 C387 28 396 29 400 36 C404 29 413 28 416 35 C419 43 414 52 400 61 Z" />
      <text x="400" y="88">${formatLabel(subgroup)}</text>
    </g>
  `;
}

function renderBodyBase(x) {
  return `
    <g class="body-base" transform="translate(${x} 0)">
      <path d="M200 28 C228 28 247 49 247 82 C247 116 228 140 200 140 C172 140 153 116 153 82 C153 49 172 28 200 28 Z" />
      <path d="M153 86 C139 90 137 123 153 134 M247 86 C261 90 263 123 247 134" />
      <path d="M166 120 C177 135 223 135 234 120 M170 134 C181 153 219 153 230 134" />
      <path d="M171 139 L151 174 C136 176 118 180 99 189 C70 204 58 234 54 278 C50 321 41 358 28 391 C20 411 29 435 51 451 C66 431 78 399 87 355 C96 313 105 263 114 208 C119 287 133 340 156 373 C171 395 185 407 200 407 C215 407 229 395 244 373 C267 340 281 287 286 208 C295 263 304 313 313 355 C322 399 334 431 349 451 C371 435 380 411 372 391 C359 358 350 321 346 278 C342 234 330 204 301 189 C282 180 264 176 249 174 L229 139 C216 148 184 148 171 139 Z" />
      <path d="M51 451 C42 454 34 462 32 474 C42 477 51 472 59 464 C57 479 58 492 65 499 C72 488 73 474 70 461 C78 476 87 486 96 487 C98 473 91 459 80 449 C91 459 102 464 112 461 C108 448 96 439 82 435 C70 433 61 441 51 451 Z" />
      <path d="M349 451 C358 454 366 462 368 474 C358 477 349 472 341 464 C343 479 342 492 335 499 C328 488 327 474 330 461 C322 476 313 486 304 487 C302 473 309 459 320 449 C309 459 298 464 288 461 C292 448 304 439 318 435 C330 433 339 441 349 451 Z" />
      <path d="M157 371 C136 397 121 439 113 504 C105 574 103 624 108 660 C113 709 123 742 142 743 C158 744 166 699 166 640 C170 565 183 485 200 414 C217 485 230 565 234 640 C234 699 242 744 258 743 C277 742 287 709 292 660 C297 624 295 574 287 504 C279 439 264 397 243 371 C227 394 214 406 200 407 C186 406 173 394 157 371 Z" />
      <path d="M111 739 C101 746 91 754 88 764 C98 769 120 768 143 762 C155 759 169 764 179 758 C173 746 159 738 144 739 C132 740 121 744 111 739 Z M289 739 C299 746 309 754 312 764 C302 769 280 768 257 762 C245 759 231 764 221 758 C227 746 241 738 256 739 C268 740 279 744 289 739 Z" />
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
      <path d="M48 454 C43 465 43 475 48 482 M59 457 C55 470 56 484 64 494 M70 455 C68 470 72 482 82 489 M87 444 C95 451 102 456 111 459" />
      <path d="M352 454 C357 465 357 475 352 482 M341 457 C345 470 344 484 336 494 M330 455 C332 470 328 482 318 489 M313 444 C305 451 298 456 289 459" />
      <path d="M111 739 C119 752 153 751 171 744 M289 739 C281 752 247 751 229 744" />
      <path d="M199 151 L199 407 M152 363 C167 385 184 401 200 407 C216 401 233 385 248 363" />
    </g>
  `;
}

function renderZones(view) {
  return bodyZones
    .filter((zone) => zone.view === view)
    .map((zone) => {
      const color = getSubgroupColor(zone.subgroup);
      const group = subgroupAtlas[zone.subgroup]?.group || zone.group;
      return `<path class="muscle-zone" data-group="${group}" data-subgroup="${zone.subgroup}" d="${zone.path}" style="--zone-color: ${color}; fill: ${color};" tabindex="0" role="button" aria-label="${formatLabel(zone.subgroup)}" />`;
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
    const zone = event.target.closest(".muscle-zone, .special-zone");
    if (zone) selectSubgroup(zone.dataset.subgroup, zone.dataset.group);
  });
  els.map.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const zone = event.target.closest(".muscle-zone, .special-zone");
    if (!zone) return;
    event.preventDefault();
    selectSubgroup(zone.dataset.subgroup, zone.dataset.group);
  });
}

function handlePointerMove(event) {
  const zone = event.target.closest(".muscle-zone, .special-zone");
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
  els.map.querySelectorAll(".muscle-zone, .special-zone").forEach((zone) => {
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
  return subgroupAtlas[subgroup]?.color || atlasGroupColors[atlasTargetGroups[subgroup]] || "#9b8f85";
}

init().catch((error) => {
  console.error(error);
});
