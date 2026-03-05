import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const STAGES = ["planning", "rough", "engineering", "finishing", "furniture"];
const HTTP_URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(__dirname, "knowledge/knowledge-base.json");

const errors = [];
const warnings = [];

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const unique = (arr) => Array.from(new Set(arr));

const addError = (fieldPath, message) => {
  errors.push(`${fieldPath}: ${message}`);
};

const addWarning = (fieldPath, message) => {
  warnings.push(`${fieldPath}: ${message}`);
};

const ensureObject = (value, fieldPath) => {
  if (!isObject(value)) {
    addError(fieldPath, "must be an object");
    return null;
  }
  return value;
};

const ensureString = (value, fieldPath) => {
  if (!isNonEmptyString(value)) {
    addError(fieldPath, "must be a non-empty string");
    return false;
  }
  return true;
};

const ensureStringArray = (value, fieldPath, { min = 1, max = 8 } = {}) => {
  if (!Array.isArray(value)) {
    addError(fieldPath, "must be an array");
    return false;
  }
  if (value.length < min) addError(fieldPath, `must contain at least ${min} items`);
  if (value.length > max) addError(fieldPath, `must contain at most ${max} items`);

  const normalized = [];
  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      addError(`${fieldPath}[${index}]`, "must be a non-empty string");
      return;
    }
    normalized.push(item.trim());
  });

  if (unique(normalized).length !== normalized.length) {
    addWarning(fieldPath, "contains duplicate values");
  }

  return true;
};

const validateMeta = (json) => {
  const meta = ensureObject(json.meta, "meta");
  if (!meta) return;

  ensureString(meta.version, "meta.version");
  ensureString(meta.source, "meta.source");
  ensureString(meta.focus_city, "meta.focus_city");
};

const validateStageTemplates = (json) => {
  const templates = ensureObject(json.stage_templates, "stage_templates");
  if (!templates) return;

  const templateKeys = Object.keys(templates);
  for (const stage of STAGES) {
    if (!Object.prototype.hasOwnProperty.call(templates, stage)) {
      addError(`stage_templates.${stage}`, "is required");
    }
  }
  for (const key of templateKeys) {
    if (!STAGES.includes(key)) addWarning(`stage_templates.${key}`, "is an unknown stage key");
  }

  STAGES.forEach((stage) => {
    const tpl = ensureObject(templates[stage], `stage_templates.${stage}`);
    if (!tpl) return;

    ensureString(tpl.title, `stage_templates.${stage}.title`);
    ensureString(tpl.description, `stage_templates.${stage}.description`);
    ensureString(tpl.stage_type, `stage_templates.${stage}.stage_type`);
    if (isNonEmptyString(tpl.stage_type) && tpl.stage_type !== stage) {
      addError(`stage_templates.${stage}.stage_type`, `must be "${stage}"`);
    }
    ensureStringArray(tpl.recommended_professionals, `stage_templates.${stage}.recommended_professionals`, { min: 1, max: 8 });
    ensureStringArray(tpl.recommended_categories, `stage_templates.${stage}.recommended_categories`, { min: 1, max: 8 });
    ensureStringArray(tpl.tips, `stage_templates.${stage}.tips`, { min: 1, max: 8 });

    if (!Array.isArray(tpl.resources)) {
      addError(`stage_templates.${stage}.resources`, "must be an array");
      return;
    }
    if (tpl.resources.length < 1) addError(`stage_templates.${stage}.resources`, "must contain at least 1 item");
    if (tpl.resources.length > 4) addError(`stage_templates.${stage}.resources`, "must contain at most 4 items");

    tpl.resources.forEach((resource, index) => {
      const rp = `stage_templates.${stage}.resources[${index}]`;
      const obj = ensureObject(resource, rp);
      if (!obj) return;

      ensureString(obj.type, `${rp}.type`);
      ensureString(obj.title, `${rp}.title`);
      if (ensureString(obj.url, `${rp}.url`) && !HTTP_URL_RE.test(obj.url.trim())) {
        addError(`${rp}.url`, "must be a valid http(s) URL");
      }
    });
  });
};

const validateKbCore = (json) => {
  const kbCore = ensureObject(json.kb_core, "kb_core");
  if (!kbCore) return;

  for (const stage of STAGES) {
    if (!Object.prototype.hasOwnProperty.call(kbCore, stage)) {
      addError(`kb_core.${stage}`, "is required");
      continue;
    }
    ensureStringArray(kbCore[stage], `kb_core.${stage}`, { min: 1, max: 8 });
  }

  Object.keys(kbCore).forEach((key) => {
    if (!STAGES.includes(key)) addWarning(`kb_core.${key}`, "is an unknown stage key");
  });
};

const validateCardArray = (value, fieldPath) => {
  if (!Array.isArray(value)) {
    addError(fieldPath, "must be an array");
    return;
  }
  if (value.length < 1) addError(fieldPath, "must contain at least 1 card");

  value.forEach((card, index) => {
    const cp = `${fieldPath}[${index}]`;
    const obj = ensureObject(card, cp);
    if (!obj) return;

    ensureString(obj.title, `${cp}.title`);
    ensureStringArray(obj.items, `${cp}.items`, { min: 1, max: 10 });
  });
};

const validateKnowledgePage = (json) => {
  const knowledgePage = ensureObject(json.knowledge_page, "knowledge_page");
  if (!knowledgePage) return;

  ensureString(knowledgePage.hero_title, "knowledge_page.hero_title");
  ensureString(knowledgePage.hero_subtitle, "knowledge_page.hero_subtitle");
  validateCardArray(knowledgePage.top_cards, "knowledge_page.top_cards");
  validateCardArray(knowledgePage.checklists, "knowledge_page.checklists");

  const cta = ensureObject(knowledgePage.cta, "knowledge_page.cta");
  if (!cta) return;

  ensureString(cta.title, "knowledge_page.cta.title");
  ensureString(cta.text, "knowledge_page.cta.text");
  ensureString(cta.button_text, "knowledge_page.cta.button_text");
  if (ensureString(cta.button_href, "knowledge_page.cta.button_href")) {
    const href = cta.button_href.trim();
    const isRelative = href.startsWith("/");
    const isAbsolute = HTTP_URL_RE.test(href);
    if (!isRelative && !isAbsolute) {
      addError("knowledge_page.cta.button_href", 'must start with "/" or be a valid http(s) URL');
    }
  }
};

const validate = (json) => {
  const root = ensureObject(json, "root");
  if (!root) return;

  validateMeta(root);
  validateStageTemplates(root);
  validateKbCore(root);
  validateKnowledgePage(root);
};

const readJson = () => {
  try {
    const raw = fs.readFileSync(inputPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    addError("file", `cannot read or parse JSON at "${inputPath}": ${err.message}`);
    return null;
  }
};

const data = readJson();
if (data) validate(data);

if (warnings.length) {
  console.log("Validation warnings:");
  warnings.forEach((item) => console.log(`- ${item}`));
  console.log("");
}

if (errors.length) {
  console.error("Knowledge base validation failed:");
  errors.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`Knowledge base is valid: ${inputPath}`);
process.exit(0);
