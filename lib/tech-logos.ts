/**
 * Built-in logos for common technologies, self-hosted in /public/tech-logos
 * (sourced from Devicon, MIT, and Simple Icons, CC0). Lets the Technology Stack
 * show a real logo for every item without the admin uploading each one; an
 * admin-uploaded logo always takes precedence (see resolveTechLogo).
 *
 * To support a new technology: drop `<file>.svg` into public/tech-logos and add
 * its normalised name(s) below.
 */
const LOGO_FILES: Record<string, string> = {
  // Frontend
  react: "react",
  reactjs: "react",
  reactnative: "react",
  nextjs: "nextjs",
  next: "nextjs",
  vue: "vuejs",
  vuejs: "vuejs",
  angular: "angular",
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  tailwind: "tailwindcss",
  tailwindcss: "tailwindcss",
  // Backend
  node: "nodejs",
  nodejs: "nodejs",
  express: "express",
  expressjs: "express",
  python: "python",
  django: "django",
  fastapi: "fastapi",
  java: "java",
  go: "go",
  golang: "go",
  php: "php",
  laravel: "laravel",
  csharp: "csharp",
  dotnet: "dotnet",
  aspnet: "dotnet",
  cplusplus: "cplusplus",
  cpp: "cplusplus",
  graphql: "graphql",
  prisma: "prisma",
  // Mobile
  swift: "swift",
  kotlin: "kotlin",
  flutter: "flutter",
  // Cloud & DevOps
  aws: "aws",
  amazonwebservices: "aws",
  awsiotcore: "aws",
  awsiot: "aws",
  azure: "azure",
  microsoftazure: "azure",
  gcp: "gcp",
  googlecloud: "gcp",
  googlecloudplatform: "gcp",
  docker: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  terraform: "terraform",
  githubactions: "githubactions",
  github: "github",
  git: "git",
  linux: "linux",
  nginx: "nginx",
  vercel: "vercel",
  firebase: "firebase",
  supabase: "supabase",
  // AI / ML
  pytorch: "pytorch",
  tensorflow: "tensorflow",
  scikitlearn: "scikitlearn",
  sklearn: "scikitlearn",
  openai: "openai",
  openaiapi: "openai",
  chatgpt: "openai",
  huggingface: "huggingface",
  langchain: "langchain",
  opencv: "opencv",
  pandas: "pandas",
  numpy: "numpy",
  jupyter: "jupyter",
  // IoT & Robotics
  mqtt: "mqtt",
  ros: "ros",
  ros2: "ros",
  arduino: "arduino",
  raspberrypi: "raspberrypi",
  esp32: "esp32",
  esp8266: "esp32",
  espressif: "esp32",
  // Databases
  postgresql: "postgresql",
  postgres: "postgresql",
  mysql: "mysql",
  mongodb: "mongodb",
  mongo: "mongodb",
  redis: "redis",
  neon: "neon",
  neondb: "neon",
  // Design
  figma: "figma",
  framer: "framer",
  adobexd: "adobexd",
  xd: "adobexd",
  photoshop: "photoshop",
  adobephotoshop: "photoshop",
  illustrator: "illustrator",
  adobeillustrator: "illustrator",
};

/** "C#" → "csharp", "C++" → "cplusplus", "Node.js" → "nodejs", "scikit-learn" → "scikitlearn". */
function normaliseTechName(name: string): string {
  return name
    .toLowerCase()
    .replace(/c#/g, "csharp")
    .replace(/c\+\+/g, "cplusplus")
    .replace(/\.net/g, "dotnet")
    .replace(/[^a-z0-9]/g, "");
}

/** Built-in logo path for a technology name, or null if there isn't one. */
export function builtInTechLogo(name: string): string | null {
  const file = LOGO_FILES[normaliseTechName(name)];
  return file ? `/tech-logos/${file}.svg` : null;
}

/** Only real image URLs/paths count — older rows may hold a plain icon key. */
function isImageUrl(icon: string | null | undefined): icon is string {
  return !!icon && (/^https?:\/\//i.test(icon) || icon.startsWith("/"));
}

/** Admin-uploaded logo first, then the built-in logo for the name, else null. */
export function resolveTechLogo(name: string, icon: string | null | undefined): string | null {
  return isImageUrl(icon) ? icon : builtInTechLogo(name);
}
