import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const packageJsonPath = path.join(projectRoot, "package.json");
const tsconfigAppPath = path.join(projectRoot, "tsconfig.app.json");
const viteConfigPath = path.join(projectRoot, "vite.config.ts");
const tokenCssPath = path.join(srcRoot, "styles", "tokens.css");

const legacyClassNames = [
  "app-container",
  "main-content",
  "navbar",
  "navbar-brand",
  "navbar-right",
  "navbar-user",
  "role-badge",
  "btn",
  "btn-sm",
  "btn-primary",
  "btn-danger",
  "btn-ghost",
  "auth-page",
  "auth-card",
  "auth-subtitle",
  "form-group",
  "form-row",
  "auth-footer",
  "home-page",
  "status-card",
  "status-panel",
  "status-grid",
  "eyebrow",
  "status-copy",
  "status-list",
  "error-banner",
  "field-error",
  "loading-screen",
];

function listFiles(dirPath) {
  return readdirSync(dirPath).flatMap((entry) => {
    const fullPath = path.join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listFiles(fullPath);
    }

    return fullPath;
  });
}

function assertEmpty(name, offenders) {
  if (offenders.length > 0) {
    throw new Error(`${name}\n${offenders.map((entry) => `- ${entry}`).join("\n")}`);
  }
}

function fileExists(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

const sourceFiles = listFiles(srcRoot).filter((filePath) => /\.(ts|tsx|css)$/.test(filePath));

const explicitAnyOffenders = sourceFiles
  .filter((filePath) => /\.(ts|tsx)$/.test(filePath))
  .filter((filePath) => /\bany\b/.test(readFileSync(filePath, "utf8")))
  .map((filePath) => path.relative(projectRoot, filePath));

assertEmpty("Explicit any is not allowed in apps/web/src.", explicitAnyOffenders);

const appFilePath = path.join(srcRoot, "App.tsx");
const appSource = readFileSync(appFilePath, "utf8");
const indexCssPath = path.join(srcRoot, "index.css");
const indexCssSource = readFileSync(indexCssPath, "utf8");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const tsconfigAppSource = readFileSync(tsconfigAppPath, "utf8");
const viteConfigSource = readFileSync(viteConfigPath, "utf8");
const tokenCssSource = readFileSync(tokenCssPath, "utf8");

if (appSource.includes("./App.css")) {
  throw new Error("App.tsx must not import the legacy App.css stylesheet.");
}

const tokenImportMatch = indexCssSource.match(/@import\s+["']([^"']*tokens\.css)["'];/);

if (!tokenImportMatch) {
  throw new Error("src/index.css must import the generated design token stylesheet.");
}

const tokenImportPath = tokenImportMatch[1];
const resolvedTokenImportPath = tokenImportPath.startsWith("./")
  ? path.resolve(srcRoot, tokenImportPath)
  : tokenImportPath.startsWith("@/")
    ? path.resolve(srcRoot, tokenImportPath.slice(2))
    : null;

if (!resolvedTokenImportPath || !statSync(resolvedTokenImportPath).isFile()) {
  throw new Error(
    `src/index.css imports a token stylesheet that does not exist: ${tokenImportPath}`,
  );
}

if (packageJson.dependencies?.["@/styles"]) {
  throw new Error("package.json must not declare local src aliases as npm dependencies.");
}

if (!tsconfigAppSource.includes('"@/*": ["./src/*"]')) {
  throw new Error('tsconfig.app.json must define the "@/*" path alias.');
}

if (!viteConfigSource.includes('"@": path.resolve(__dirname, "./src")')) {
  throw new Error('vite.config.ts must resolve the "@" alias to ./src.');
}

const typographyTokenNames = [
  "--type-size-display",
  "--type-size-headline",
  "--type-size-title",
  "--type-size-subtitle",
  "--type-size-body",
  "--type-size-body-small",
  "--type-size-label",
  "--type-size-caption",
  "--type-size-overline",
  "--type-size-code",
  "--text-display: var(--type-size-display);",
  "--text-headline: var(--type-size-headline);",
  "--text-title: var(--type-size-title);",
  "--text-subtitle: var(--type-size-subtitle);",
  "--text-body: var(--type-size-body);",
  "--text-body-small: var(--type-size-body-small);",
  "--text-label: var(--type-size-label);",
  "--text-caption: var(--type-size-caption);",
  "--text-overline: var(--type-size-overline);",
  "--text-code: var(--type-size-code);",
];

const missingTypographyTokens = typographyTokenNames.filter(
  (tokenName) => !tokenCssSource.includes(tokenName),
);

assertEmpty(
  "Typography tokens must exist in src/styles/tokens.css and be exposed through @theme inline.",
  missingTypographyTokens,
);

const disallowedTypographyTokenNames = [
  "--type-leading-",
  "--type-tracking-",
  "--leading-display:",
  "--leading-headline:",
  "--leading-title:",
  "--leading-subtitle:",
  "--leading-body:",
  "--leading-body-small:",
  "--leading-label:",
  "--leading-caption:",
  "--leading-overline:",
  "--leading-code:",
  "--tracking-display:",
  "--tracking-headline:",
  "--tracking-title:",
  "--tracking-subtitle:",
  "--tracking-body:",
  "--tracking-body-small:",
  "--tracking-label:",
  "--tracking-caption:",
  "--tracking-overline:",
  "--tracking-code:",
];

const forbiddenTypographyTokens = disallowedTypographyTokenNames.filter((tokenName) =>
  tokenCssSource.includes(tokenName),
);

assertEmpty(
  "Typography CSS must only define size tokens. Leading and tracking belong in typography.tsx Tailwind classes.",
  forbiddenTypographyTokens,
);

const typographyFilePath = path.join(srcRoot, "components", "ui", "typography.tsx");
const typographySource = readFileSync(typographyFilePath, "utf8");

if (/text-\[(calc|clamp)\(/.test(typographySource)) {
  throw new Error(
    "typography.tsx must not use raw text-[calc(...)] or text-[clamp(...)] classes. Put text sizes in CSS tokens and reference them with text-* utilities.",
  );
}

const rawTypographyTagPattern = /<(h[1-6]|p|label|code)\b/;
const rawTypographyAllowedFiles = new Set([
  path.join(srcRoot, "components", "ui", "typography.tsx"),
]);

const rawTypographyOffenders = sourceFiles
  .filter((filePath) => /\.(tsx)$/.test(filePath))
  .filter((filePath) => !rawTypographyAllowedFiles.has(filePath))
  .filter((filePath) => rawTypographyTagPattern.test(readFileSync(filePath, "utf8")))
  .map((filePath) => path.relative(projectRoot, filePath));

assertEmpty(
  "App UI must use typography primitives instead of raw heading, paragraph, label, or code tags.",
  rawTypographyOffenders,
);

const legacyClassOffenders = sourceFiles
  .filter((filePath) => /\.(ts|tsx)$/.test(filePath))
  .flatMap((filePath) => {
    const source = readFileSync(filePath, "utf8");
    const relativePath = path.relative(projectRoot, filePath);

    return legacyClassNames
      .filter((className) => source.includes(className))
      .map((className) => `${relativePath}:${className}`);
  });

assertEmpty(
  "Legacy semantic CSS class names must be replaced with Tailwind utilities and components.",
  legacyClassOffenders,
);

const shadcnThemeUtilityFragments = [
  "bg-primary",
  "text-primary-foreground",
  "bg-card",
  "text-card-foreground",
  "bg-popover",
  "text-popover-foreground",
  "border-border",
  "bg-background",
  "text-foreground",
  "bg-secondary",
  "text-secondary-foreground",
  "bg-accent",
  "text-accent-foreground",
  "text-muted-foreground",
  "bg-destructive",
  "text-destructive",
  "border-input",
  "bg-input",
  "border-ring",
  "ring-ring",
  "bg-sidebar",
  "text-sidebar-foreground",
  "bg-sidebar-primary",
  "text-sidebar-primary-foreground",
  "bg-sidebar-accent",
  "text-sidebar-accent-foreground",
  "border-sidebar-border",
  "ring-sidebar-ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "--background:",
  "--foreground:",
  "--card:",
  "--card-foreground:",
  "--popover:",
  "--popover-foreground:",
  "--primary:",
  "--primary-foreground:",
  "--secondary:",
  "--secondary-foreground:",
  "--muted:",
  "--muted-foreground:",
  "--accent:",
  "--accent-foreground:",
  "--destructive:",
  "--border:",
  "--input:",
  "--ring:",
  "--chart-1:",
  "--chart-2:",
  "--chart-3:",
  "--chart-4:",
  "--chart-5:",
  "--sidebar:",
  "--sidebar-foreground:",
  "--sidebar-primary:",
  "--sidebar-primary-foreground:",
  "--sidebar-accent:",
  "--sidebar-accent-foreground:",
  "--sidebar-border:",
  "--sidebar-ring:",
];

const shadcnThemeUtilityOffenders = sourceFiles
  .filter((filePath) => filePath !== tokenCssPath)
  .flatMap((filePath) => {
    const source = readFileSync(filePath, "utf8");
    const relativePath = path.relative(projectRoot, filePath);

    return shadcnThemeUtilityFragments
      .filter((fragment) => source.includes(fragment))
      .map((fragment) => `${relativePath}:${fragment}`);
  });

assertEmpty(
  "Generated shadcn/ui components must be remapped to local semantic token classes before use.",
  shadcnThemeUtilityOffenders,
);

console.log("Frontend standards check passed.");
