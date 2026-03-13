import { NavigatorConceptSwitcher } from "./NavigatorConceptSwitcher.js";
import { NavigatorMetroMap } from "./NavigatorMetroMap.js";
import { NavigatorRoutePathMap } from "./NavigatorRoutePathMap.js";
import { NavigatorCardFlowMap } from "./NavigatorCardFlowMap.js";
import { NavigatorConceptInfoPanel } from "./NavigatorConceptInfoPanel.js";
import { getStageContext } from "./conceptShared.js";

function renderActiveMap({ conceptId, stageStates }) {
  if (conceptId === "route") return NavigatorRoutePathMap({ stageStates });
  if (conceptId === "cards") return NavigatorCardFlowMap({ stageStates });
  return NavigatorMetroMap({ stageStates });
}

function renderCriteriaBlock() {
  const criteria = [
    "Понятно ли, куда нажимать",
    "Понятно ли, где текущий этап",
    "Есть ли ощущение маршрута",
    "Не перегружает ли интерфейс",
    "Выглядит ли как основной продукт RemCard"
  ];

  return `
    <section class="card navigator-concepts-card navigator-concepts-criteria">
      <div class="navigator-concepts-headline">
        <h2>Критерии сравнения</h2>
      </div>
      <ul class="navigator-concepts-list">
        ${criteria.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>
  `;
}

export function NavigatorConceptPreviewPage({ stages, selectedStageId, selectedConceptId }) {
  const { selectedStage, nextStage, states } = getStageContext(stages, selectedStageId);

  return `
    <div class="navigator-concepts-layout">
      <header class="card navigator-concepts-card navigator-concepts-hero">
        <p class="navigator-concepts-kicker">Navigator Preview</p>
        <h1>Сравнение 3 концепций карты “Навигатора ремонта”</h1>
        <p class="muted">
          Выберите концепцию и кликните по этапу. Этап сохраняется при переключении между Metro Map, Route Path и Card Flow.
        </p>
      </header>

      ${NavigatorConceptSwitcher({ activeConceptId: selectedConceptId })}
      ${renderCriteriaBlock()}
      ${renderActiveMap({ conceptId: selectedConceptId, stageStates: states })}
      ${NavigatorConceptInfoPanel({ stage: selectedStage, nextStage })}
    </div>
  `;
}
