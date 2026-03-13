export const CONCEPTS = [
  { id: "metro", title: "Metro Map", description: "Маршрут как схема метро." },
  { id: "route", title: "Route Path", description: "Путь A → B с ощущением движения." },
  { id: "cards", title: "Card Flow", description: "Карточки этапов в едином потоке." }
];

export const STAGE_CODE_BY_ID = {
  planning: "PLANNING",
  rough: "ROUGH",
  engineering: "ENGINEERING",
  finishing: "FINISHING",
  furnishing: "FURNITURE"
};

export function normalizeConcept(rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();
  return CONCEPTS.some((concept) => concept.id === value) ? value : "metro";
}

export function normalizeStageId(stages, rawValue) {
  const value = String(rawValue || "").trim().toLowerCase();
  if (value === "furniture") return "furnishing";
  if (stages.some((stage) => stage.id === value)) return value;
  return "rough";
}

export function getStageContext(stages, selectedStageId) {
  const selectedIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === selectedStageId)
  );
  const selectedStage = stages[selectedIndex] || stages[0];
  const nextStage = selectedStage && selectedStage.nextStage ? stages.find((stage) => stage.id === selectedStage.nextStage) || null : null;

  return {
    selectedIndex,
    selectedStage,
    nextStage,
    states: stages.map((stage, index) => ({
      stage,
      index,
      isCompleted: index < selectedIndex,
      isCurrent: index === selectedIndex,
      isUpcoming: index > selectedIndex
    }))
  };
}

export function buildCatalogHref(stageId) {
  const params = new URLSearchParams({ stage: STAGE_CODE_BY_ID[stageId] || "ROUGH" });
  return `../catalog/?${params.toString()}`;
}
