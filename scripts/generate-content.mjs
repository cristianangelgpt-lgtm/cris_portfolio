import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(siteRoot, "..");
const contentRoot = path.join(workspaceRoot, "portfolio-content");
const publicRoot = path.join(siteRoot, "public");
const mediaRoot = path.join(publicRoot, "media", "projects");
const dataOutput = path.join(siteRoot, "src", "data", "generatedPortfolio.ts");
const cvSource = path.join(workspaceRoot, "CV CRIS.pdf");
const cvTarget = path.join(publicRoot, "CV-CRIS.pdf");

const AREA_ORDER = ["GIS Analysis", "Remote Sensing", "UAV Mapping"];
const EXPECTED_PUBLIC_PROJECTS = 26;
const EXPECTED_PUBLIC_IMAGES = 63;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const AREA_COPY = {
  "GIS Analysis":
    "Spatial analysis and cartographic production for municipal operations, service coverage, route planning, urban asset inventories and landfill decision support in La Paz.",
  "Remote Sensing":
    "Satellite and radar-based analysis for environmental monitoring, vegetation signal reconstruction, water dynamics and geospatial hazard assessment.",
  "UAV Mapping":
    "UAV photogrammetry, orthomosaics, DSM/DTM products, elevation models and 3D geospatial analysis for landfills, infrastructure corridors and urban sites.",
};

const GROUP_COPY = {
  "Network Analysis and Route Optimization":
    "GIS network analysis for operational routing, service sequencing and route database development across waste collection and municipal disinfection workflows.",
  "Urban Assets and Service Coverage Analysis":
    "Facility, asset and service coverage analysis for urban equipment, concession boundaries, supervision areas and location-based operational planning.",
  "Landfill Spatial Analysis and Risk Mapping":
    "Spatial analysis for Alpacoma landfill operations, infrastructure inventories, risk-zone interpretation, operational zoning and facility location support.",
  "InSAR Debris Flow Hazard Assessment":
    "Multi-sensor InSAR analysis and physics-guided modeling for surface displacement, debris-flow susceptibility and hazard interpretation.",
  "Satellite SIF Reconstruction and Downscaling":
    "Remote sensing and machine-learning workflows for reconstructing and downscaling satellite solar-induced fluorescence data.",
  "Amazon Deforestation Monitoring Platform":
    "Geospatial data preparation, standardization and QA/QC for forest and deforestation indicators published through an environmental monitoring platform.",
  "Lake Titicaca Water Extent and Temperature Analysis":
    "Landsat-based analysis of lake surface extent, temperature patterns and multi-temporal water dynamics.",
  "Alpacoma UAV Mapping and 3D Analysis":
    "UAV mapping at Alpacoma landfill and related operational areas, including photogrammetric capture, orthomosaics, DSM/DTM, displacement interpretation and 3D planning support.",
  "Mallasa Ex-Landfill UAV Survey":
    "UAV photogrammetric survey of the Mallasa ex-landfill area, producing orthomosaic, elevation and 3D model outputs for terrain interpretation.",
  "Urban and Infrastructure UAV Surveys":
    "UAV surveys for urban green areas, operations bases, road corridors and landslide documentation, with photogrammetric outputs for planning and technical reporting.",
};

const GROUP_TITLE_OVERRIDES = {
  "Alpacoma UAV Mapping and 3D Analysis": "Alpacoma Landfill UAV Mapping and 3D Analysis",
};

const PROJECT_TITLE_OVERRIDES = {
  "RSNJA Risk Zone Map": "Alpacoma Landfill Risk Zone Map",
  "RSNJA 3D Planning and PTMB Model": "Alpacoma Landfill 3D Planning and MBT Model",
  "RSNJA Access Road UAV Survey": "Alpacoma Landfill Access Road UAV Survey",
  "RSNJA Surface Displacement and Settlement Monitoring":
    "Alpacoma Landfill Surface Displacement and Settlement Monitoring",
};

const PROJECT_SUMMARY_OVERRIDES = {
  "Alpacoma Landfill 3D Planning and MBT Model":
    "3D dimensional integration of planned landfill interventions with the proposed mechanical biological treatment plant and operational restructuring at Alpacoma landfill.",
  "Alpacoma Landfill Surface Displacement and Settlement Monitoring":
    "Photogrammetric comparison of orthomosaic and elevation products to assess surface displacement, settlement patterns and operational risk at Alpacoma landfill.",
  "Alpacoma Landfill Access Road UAV Survey":
    "UAV survey and orthomosaic production for access-road planning and design support at Alpacoma landfill.",
  "Alpacoma Landfill Risk Zone Map":
    "Georeferenced risk-zone mapping for Alpacoma landfill, integrating spatial context, operational areas and risk-sensitive terrain interpretation.",
};

const SUPPORTING_PROJECT_TITLES = new Set(["Biogas Collector Georeferencing"]);

const AREA_HERO_CAPTION_OVERRIDES = {
  "GIS Analysis": "Macro-area route plan for the Centro district group.",
  "Remote Sensing": "Combined 2D and 3D surface-displacement velocity visualization for hazard interpretation.",
  "UAV Mapping": "Alpacoma Landfill 3D Planning and MBT Model",
};

const GROUP_HERO_CAPTION_OVERRIDES = {
  "GIS Analysis::Network Analysis and Route Optimization": "Macro-area route plan for the Centro district group.",
  "Remote Sensing::InSAR Debris Flow Hazard Assessment":
    "Combined 2D and 3D surface-displacement velocity visualization for hazard interpretation.",
  "UAV Mapping::Alpacoma Landfill UAV Mapping and 3D Analysis": "Alpacoma Landfill 3D Planning and MBT Model",
};

const PROJECT_HERO_CAPTION_OVERRIDES = {
  "Debris Flow Hazard Assessment with InSAR and Physics-Guided Learning":
    "Combined 2D and 3D surface-displacement velocity visualization for hazard interpretation.",
};

const PROJECT_ORDER_OVERRIDES = {
  "UAV Mapping::Alpacoma Landfill UAV Mapping and 3D Analysis": [
    "Alpacoma Landfill 3D Planning and MBT Model",
    "Alpacoma-Saka Churu Multitemporal UAV Mapping",
  ],
};

const FEATURED_PROJECT_IDS = [
  "uav-mapping-alpacoma-landfill-uav-mapping-and-3d-analysis-alpacoma-landfill-3d-planning-and-mbt-model",
  "remote-sensing-insar-debris-flow-hazard-assessment-debris-flow-hazard-assessment-with-insar-and-physics-guided-learning",
  "gis-analysis-network-analysis-and-route-optimization-urban-street-disinfection-routes-la-paz",
  "remote-sensing-amazon-deforestation-monitoring-platform-amazon-regional-observatory-deforestation-platform",
  "remote-sensing-satellite-sif-reconstruction-and-downscaling-satellite-sif-reconstruction-and-downscaling",
  "uav-mapping-alpacoma-landfill-uav-mapping-and-3d-analysis-alpacoma-landfill-surface-displacement-and-settlement-monitoring",
];

const isValidate = process.argv.includes("--validate");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function emptyDir(dirPath) {
  if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function listFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    return entry.isDirectory() ? listFilesRecursive(entryPath) : [entryPath];
  });
}

function validateBundledSnapshot() {
  const errors = [];
  const publicProjectImages = listFilesRecursive(mediaRoot).filter((filePath) =>
    IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
  );

  if (!fs.existsSync(dataOutput)) {
    errors.push(`Missing generated data file: ${path.relative(siteRoot, dataOutput)}.`);
  }
  if (!fs.existsSync(cvTarget)) {
    errors.push(`Missing bundled CV: ${path.relative(siteRoot, cvTarget)}.`);
  }
  if (!fs.existsSync(path.join(publicRoot, "media", "profile", "whatsapp-qr.jpg"))) {
    errors.push("Missing bundled WhatsApp QR image in public/media/profile.");
  }
  if (publicProjectImages.length !== EXPECTED_PUBLIC_IMAGES) {
    errors.push(`Expected ${EXPECTED_PUBLIC_IMAGES} bundled project images, found ${publicProjectImages.length}.`);
  }

  if (errors.length) {
    for (const error of errors) console.error(error);
    throw new Error("Bundled portfolio snapshot validation failed.");
  }

  console.log(
    `Using bundled portfolio snapshot (${publicProjectImages.length} project images) because ${path.relative(
      siteRoot,
      contentRoot,
    )} is not available.`,
  );
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripPriority(name) {
  return name.replace(/^\d+\s*-\s*/, "").trim();
}

function getPriority(name, fallback = 99) {
  const match = name.match(/^(\d+)\s*-/);
  return match ? Number(match[1]) : fallback;
}

function sortByPriorityThenName(left, right) {
  const priorityDiff = getPriority(left.name) - getPriority(right.name);
  return priorityDiff || left.name.localeCompare(right.name);
}

function listDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("0 -"))
    .sort(sortByPriorityThenName)
    .map((entry) => ({ name: entry.name, path: path.join(dirPath, entry.name) }));
}

function extractTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function extractIntro(markdown) {
  const lines = markdown.split(/\r?\n/);
  const paragraphs = [];
  let current = [];
  for (const line of lines) {
    if (line.startsWith("#")) continue;
    if (line.startsWith("- ") || /^\d+\./.test(line) || line.startsWith("|")) continue;
    if (!line.trim()) {
      if (current.length) {
        paragraphs.push(current.join(" ").trim());
        current = [];
      }
      continue;
    }
    current.push(line.trim());
  }
  if (current.length) paragraphs.push(current.join(" ").trim());
  return paragraphs.find((paragraph) => !/^Priority\s+\d+/i.test(paragraph)) || paragraphs[0] || "";
}

function publicText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\bRSNJA\b/gi, "Alpacoma landfill")
    .replace(/\bPTMB\b/gi, "MBT")
    .replace(/Alpacoma landfill access road, Alpacoma/gi, "Alpacoma landfill access road")
    .replace(/This group presents\s+/gi, "")
    .replace(/The public order prioritizes[^.]*\.\s*/gi, "")
    .replace(/Website Order/gi, "Project Groups")
    .replace(/\s+/g, " ")
    .trim();
}

function publicObject(value) {
  if (Array.isArray(value)) return value.map(publicObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, publicObject(entry)]));
  }
  return publicText(value);
}

function getSection(markdown, heading) {
  const pattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
  const match = markdown.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = markdown.slice(start);
  const nextHeading = rest.search(/^##\s+/m);
  return (nextHeading >= 0 ? rest.slice(0, nextHeading) : rest).trim();
}

function parseList(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").replace(/^`|`$/g, "").trim())
    .filter(Boolean);
}

function parseMetadata(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^- \\*\\*${escaped}:\\*\\*\\s*(.+)$`, "m"));
  if (!match) return "";
  return match[1].replace(/`/g, "").trim();
}

function parseVisualIndex(projectPath) {
  const visualPath = path.join(projectPath, "visual-index.md");
  const markdown = readText(visualPath);
  const captions = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s*\[images\/[^\]]+\]\(\.\/images\/([^)]+)\)\s*\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|$/);
    if (!match) continue;
    const filename = decodeURIComponent(match[1]).replace(/\//g, path.sep);
    captions.set(path.basename(filename), {
      caption: match[2].trim(),
      source: match[3].replace(/`/g, "").trim(),
    });
  }
  return captions;
}

function listImages(projectPath) {
  const imagesPath = path.join(projectPath, "images");
  if (!fs.existsSync(imagesPath)) return [];
  return fs
    .readdirSync(imagesPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => path.join(imagesPath, entry.name));
}

function copyProjectImage(sourcePath, projectId, usedNames) {
  const extension = path.extname(sourcePath).toLowerCase();
  const base = slugify(publicText(path.basename(sourcePath, path.extname(sourcePath)))) || "image";
  let filename = `${base}${extension}`;
  let index = 2;
  while (usedNames.has(filename)) {
    filename = `${base}-${index}${extension}`;
    index += 1;
  }
  usedNames.add(filename);
  const targetDir = path.join(mediaRoot, projectId);
  ensureDir(targetDir);
  const targetPath = path.join(targetDir, filename);
  fs.copyFileSync(sourcePath, targetPath);
  return `/media/projects/${projectId}/${filename}`;
}

function prioritizeImageByCaption(images, caption) {
  if (!caption) return images;
  const index = images.findIndex((image) => image.caption === caption);
  if (index < 0) return images;
  return [images[index], ...images.slice(0, index), ...images.slice(index + 1)];
}

function sortProjectsForDisplay(projects, area, group) {
  const order = PROJECT_ORDER_OVERRIDES[`${area}::${group}`] || [];
  return [...projects]
    .sort((left, right) => {
      const leftIndex = order.indexOf(left.title);
      const rightIndex = order.indexOf(right.title);
      const leftRank = leftIndex === -1 ? Number.POSITIVE_INFINITY : leftIndex;
      const rightRank = rightIndex === -1 ? Number.POSITIVE_INFINITY : rightIndex;
      return leftRank - rightRank || left.priority - right.priority || left.title.localeCompare(right.title);
    })
    .map((project, index) => ({ ...project, priority: index + 1 }));
}

function readImageDimensions(sourcePath) {
  const buffer = fs.readFileSync(sourcePath);
  if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }
  return { width: 1600, height: 1000 };
}

function parseProject(projectPath, area, group, priority, groupPriority) {
  const markdown = readText(path.join(projectPath, "project.md"));
  assert(markdown, `Missing project.md in ${projectPath}`);

  const sourceTitle = extractTitle(markdown, path.basename(projectPath));
  const title = PROJECT_TITLE_OVERRIDES[sourceTitle] || sourceTitle;
  const id = slugify(`${area}-${group || "direct"}-${title}`);
  const captions = parseVisualIndex(projectPath);
  const usedNames = new Set();
  const images = listImages(projectPath).map((imagePath) => {
    const originalName = path.basename(imagePath);
    const meta = captions.get(originalName) || {};
    return {
      src: copyProjectImage(imagePath, id, usedNames),
      alt: `${title} visual`,
      caption: publicText(meta.caption || title),
      source: meta.source || "Curated portfolio image",
      originalName,
      ...readImageDimensions(imagePath),
    };
  });
  const gallery = prioritizeImageByCaption(images, PROJECT_HERO_CAPTION_OVERRIDES[title]);

  const shortDescription = PROJECT_SUMMARY_OVERRIDES[title] || publicText(getSection(markdown, "Short Description"));
  const role = publicText(getSection(markdown, "Technical Role"));
  const deliverables = parseList(getSection(markdown, "Main Deliverables")).map(publicText);
  const sources = parseList(getSection(markdown, "Sources"));
  const campaigns = publicText(getSection(markdown, "Campaigns"));
  const allText = [title, shortDescription, role, deliverables.join(" "), area, group].join(" ");

  return {
    id,
    title,
    area,
    group,
    priority,
    groupPriority,
    status: parseMetadata(markdown, "Status") || "ready-for-review",
    period: publicText(parseMetadata(markdown, "Period")),
    client: publicText(parseMetadata(markdown, "Client / Context")),
    location: publicText(parseMetadata(markdown, "Location")),
    summary: shortDescription,
    details: {
      role,
      campaigns,
    },
    keywords: makeKeywords(allText, area, title),
    deliverables,
    sources,
    heroImage: gallery[0] || null,
    gallery,
    hasOwnImages: gallery.length > 0,
    visualPending: gallery.length === 0,
    isSupporting: SUPPORTING_PROJECT_TITLES.has(sourceTitle),
  };
}

function makeKeywords(text, area, title) {
  const lower = text.toLowerCase();
  const keywords = [];
  const add = (value, test = true) => {
    if (test && !keywords.includes(value)) keywords.push(value);
  };

  add(area);
  add("ArcGIS", /arcgis|gis|route|map|spatial|georeferenc|concession|facility/.test(lower));
  add("Network Analysis", /network|route|routing|sequence|collection|disinfection/.test(lower));
  add("Route Optimization", /route|routing|sequence|collection/.test(lower));
  add("Service Coverage", /coverage|concession|supervision|facility|asset/.test(lower));
  add("Asset Mapping", /asset|container|facility|bin|green island|equipment/.test(lower));
  add("Risk Mapping", /risk|hazard|landslide|debris|susceptibility/.test(lower));
  add("Landfill Operations", /landfill|alpacoma|saka churu|rsnja|biogas/.test(lower));
  add("UAV Photogrammetry", /uav|drone|photogrammetric|orthomosaic|flight/.test(lower));
  add("Orthomosaic", /orthomosaic/.test(lower));
  add("DEM", /dem|elevation|terrain|surface/.test(lower));
  add("3D Modeling", /3d|model/.test(lower));
  add("InSAR", /insar|sar|sentinel|terrasar/.test(lower));
  add("Remote Sensing", /landsat|satellite|sif|remote sensing|insar/.test(lower));
  add("Machine Learning", /machine|learning|downscal/.test(lower));
  add("Landsat", /landsat|titicaca|temperature/.test(lower));
  add("SIF", /sif|fluorescence/.test(lower));
  add("Web GIS", /amazon|platform|web|deforestation/.test(lower));

  if (title.toLowerCase().includes("gps")) add("GPS Tracking");
  if (title.toLowerCase().includes("biogas")) add("Infrastructure Inventory");

  return keywords.slice(0, 7);
}

function featuredScore(project) {
  const text = `${project.title} ${project.area} ${project.group} ${project.keywords.join(" ")}`.toLowerCase();
  let score = 0;
  if (/3d planning/.test(text)) score += 160;
  if (/3d|model/.test(text)) score += 80;
  if (/uav|photogrammetry|orthomosaic/.test(text)) score += 70;
  if (/dem|dtm|dsm|elevation/.test(text)) score += 45;
  if (/insar|hazard|risk/.test(text)) score += 32;
  if (/remote sensing|landsat|sif/.test(text)) score += 20;
  if (/route|network|coverage/.test(text)) score += 10;
  return score;
}

function discoverProjectFolders(groupPath) {
  if (fs.existsSync(path.join(groupPath, "project.md"))) return [groupPath];
  return listDirectories(groupPath)
    .map((entry) => entry.path)
    .filter((projectPath) => fs.existsSync(path.join(projectPath, "project.md")));
}

function assignFallbackImages(areas) {
  const pickImage = (images, caption) => images.find((image) => image.caption === caption) || null;

  for (const area of areas) {
    const areaImages = area.groups.flatMap((group) =>
      [...group.projects, ...(group.supportingProjects || [])].flatMap((project) => project.gallery),
    );
    area.heroImage = pickImage(areaImages, AREA_HERO_CAPTION_OVERRIDES[area.title]) || areaImages[0] || null;
    for (const group of area.groups) {
      const groupImages = [...group.projects, ...(group.supportingProjects || [])].flatMap((project) => project.gallery);
      const groupOverrideKey = `${area.title}::${group.title}`;
      group.heroImage = pickImage(groupImages, GROUP_HERO_CAPTION_OVERRIDES[groupOverrideKey]) || groupImages[0] || area.heroImage;
    }
  }
}

function buildPortfolio() {
  if (!fs.existsSync(contentRoot)) {
    validateBundledSnapshot();
    return;
  }

  emptyDir(mediaRoot);
  ensureDir(path.dirname(dataOutput));
  ensureDir(publicRoot);
  if (fs.existsSync(cvSource)) fs.copyFileSync(cvSource, cvTarget);

  const areas = AREA_ORDER.map((areaName) => {
    const areaPath = path.join(contentRoot, areaName);
    assert(fs.existsSync(areaPath), `Missing area folder: ${areaName}`);
    const areaReadme = readText(path.join(areaPath, "README.md"));
    const groups = listDirectories(areaPath).map((groupEntry) => {
      const groupName = stripPriority(groupEntry.name);
      const publicGroupTitle = GROUP_TITLE_OVERRIDES[groupName] || groupName;
      const groupPriority = getPriority(groupEntry.name);
      const groupReadme = readText(path.join(groupEntry.path, "README.md"));
      const projectFolders = discoverProjectFolders(groupEntry.path);
      const parsedProjects = projectFolders.map((projectPath, index) =>
        parseProject(projectPath, areaName, publicGroupTitle, index + 1, groupPriority),
      );
      const supportingProjects = parsedProjects.filter((project) => project.isSupporting);
      const projects = sortProjectsForDisplay(
        parsedProjects.filter((project) => !project.isSupporting),
        areaName,
        publicGroupTitle,
      );
      return {
        id: slugify(`${areaName}-${publicGroupTitle}`),
        title: publicGroupTitle,
        sourceTitle: groupName,
        folderName: groupEntry.name,
        priority: groupPriority,
        description: GROUP_COPY[groupName] || publicText(extractIntro(groupReadme)),
        projects,
        supportingProjects,
        heroImage: null,
      };
    });
    return {
      id: slugify(areaName),
      title: areaName,
      route: `/${slugify(areaName)}/`,
      description: AREA_COPY[areaName] || publicText(extractIntro(areaReadme)),
      groups,
      heroImage: null,
    };
  });

  assignFallbackImages(areas);

  const allProjects = areas.flatMap((area) => area.groups.flatMap((group) => group.projects));
  const allSupportingProjects = areas.flatMap((area) =>
    area.groups.flatMap((group) => group.supportingProjects || []),
  );
  const publicImageCount = [...allProjects, ...allSupportingProjects].reduce(
    (total, project) => total + project.gallery.length,
    0,
  );
  const manualFeatured = FEATURED_PROJECT_IDS.map((id) => allProjects.find((project) => project.id === id)).filter(Boolean);
  const featuredProjects = [
    ...manualFeatured,
    ...[...allProjects].sort((left, right) => featuredScore(right) - featuredScore(left) || left.priority - right.priority),
  ]
    .filter((project, index, list) => project && list.findIndex((item) => item.id === project.id) === index)
    .slice(0, 8);

  const profile = {
    name: "Cristian Angel Choque Nacho",
    role: "GIS & Remote Sensing Specialist | GIS Analysis | Remote Sensing | UAV Mapping",
    location: "Shenzhen, China",
    nationality: "Bolivian",
    email: "cristiangeocn@gmail.com",
    phone: "+86 159 1118 2644",
    whatsapp: "+591 64333870",
    wechat: "cacn369",
    cvUrl: "/CV-CRIS.pdf",
    whatsappQr: "/media/profile/whatsapp-qr.jpg",
    headline:
      "Geospatial Data Specialist focused on GIS analysis, satellite remote sensing, UAV photogrammetry, GIS analytics and spatial data automation.",
    summary:
      "Experience in GIS analysis, satellite remote sensing and UAV photogrammetry, including GIS analytics, QA/QC, cartography, spatial analysis, orthomosaics, DSM/DTM products, point clouds, remote sensing workflows and Python/ArcPy automation.",
    contact: [
      { label: "Email", value: "cristiangeocn@gmail.com", href: "mailto:cristiangeocn@gmail.com" },
      { label: "Phone", value: "+86 159 1118 2644", href: "tel:+8615911182644" },
      { label: "WhatsApp", value: "+591 64333870", href: "https://wa.me/59164333870" },
      { label: "WeChat", value: "cacn369" },
      { label: "Location", value: "Shenzhen, China" },
      { label: "Nationality", value: "Bolivian" },
    ],
    highlights: [
      "Ph.D. candidate in Civil Engineering at Shenzhen University, focused on geospatial hazard monitoring and multi-source GIS/Remote Sensing.",
      "M.Sc. in Remote Sensing & GIS from Beihang University, with work in satellite SIF reconstruction and downscaling.",
      "Municipal geospatial experience with GIS analytics, route analysis, service coverage, UAV mapping and landfill technical reporting.",
      "Project work includes forest/deforestation data standardization for the Amazon Regional Observatory platform.",
    ],
    focusAreas: [
      {
        title: "GIS Analysis",
        text: "GIS analytics, QA/QC, cartography, spatial analysis, monitoring pipelines, service coverage and route optimization.",
        tools: ["ArcGIS Pro/Desktop", "QGIS", "GEE", "GIS analytics", "QA/QC"],
      },
      {
        title: "Satellite Remote Sensing",
        text: "Image preprocessing, feature extraction, land-cover mapping, change detection, GEE/ENVI workflows and Python/ArcPy automation.",
        tools: ["Python", "ArcPy", "R", "ENVI", "Google Earth Engine"],
      },
      {
        title: "UAV Photogrammetry",
        text: "Flight planning, GNSS/GCP workflows, photogrammetric processing, orthomosaics, DSM/DTM products, point clouds and 3D models.",
        tools: ["Agisoft Metashape", "Pix4DMapper", "GNSS/GPS", "GCP workflows", "3D modeling"],
      },
    ],
    experience: [
      {
        period: "Jan 2020 - Jan 2023",
        role: "Geospatial Data Specialist (Contract)",
        organization: "Municipal Government of La Paz City (GAMLP) - SIREMU, Bolivia",
        points: [
          "Managed operational geospatial datasets for urban-waste supervision, integrating routes, service areas, facility inventories and concessionary operators.",
          "Performed spatial analysis for supervision planning, service coverage verification, route adjustments and operational decision support.",
          "Planned UAV mapping campaigns and produced orthomosaics, DSM/DTM, point clouds, contours, thematic maps, reports and landfill volumetric calculations.",
        ],
      },
      {
        period: "Jan 2022 - Mar 2022",
        role: "Geospatial Data Analyst (Contract)",
        organization: "Amazon Regional Observatory (ORA) - BITS, Bolivia",
        points: [
          "Processed and standardized forest and deforestation geospatial indicators for publication and web visualization on the ORA platform.",
          "Managed dataset ingestion into server-side geospatial data repositories with consistent schemas, metadata and multi-temporal organization.",
          "Validated multi-source geographic layers before release for environmental monitoring workflows.",
        ],
      },
      {
        period: "Feb 2019 - Nov 2019",
        role: "UAV Photogrammetry Mapping Analyst (Internship)",
        organization: "ASTRO Geomatics, Bolivia",
        points: [
          "Planned and executed rotary-wing UAV surveys for topographic mapping across university campuses and adjacent sites.",
          "Established and densified GCP networks using static GNSS for georeferencing and quality control.",
          "Processed imagery in Agisoft Metashape and Pix4D to deliver orthomosaics, DSM/DTM, point clouds and 3D models.",
        ],
      },
    ],
    education: [
      {
        period: "Sep 2024 - Present",
        degree: "Ph.D. Student in Civil Engineering (GIS & Remote Sensing application)",
        institution: "Shenzhen University, China",
        note: "Research focus: geospatial hazard monitoring and multi-source GIS & Remote Sensing.",
      },
      {
        period: "Sep 2022 - Jul 2024",
        degree: "M.Sc. in Remote Sensing & GIS (Space Technology Applications)",
        institution: "Beihang University, Beijing, China",
      },
      {
        period: "2014 - 2019",
        degree: "B.Sc. in Geographical Engineering",
        institution: "Military School of Engineering, La Paz, Bolivia",
        note: "Graduated with Honors (Approval with Excellence).",
      },
    ],
    skillGroups: [
      {
        title: "GIS & Geospatial",
        level: "Advanced",
        items: ["ArcGIS Pro/Desktop", "QGIS", "Google Earth Engine", "Spatial analysis", "Geodatabase management", "Coordinate systems", "Cartography", "QA/QC"],
      },
      {
        title: "UAV Mapping & Photogrammetry",
        level: "Field + processing",
        items: ["Agisoft Metashape", "Pix4DMapper", "Flight planning", "RTK/static GNSS", "Total Station", "GCP workflows", "Orthomosaics", "DSM/DTM", "Point clouds", "3D modeling"],
      },
      {
        title: "Remote Sensing",
        level: "Satellite workflows",
        items: ["Python", "R", "Google Earth Engine", "ENVI", "Image preprocessing", "Feature extraction", "Land-cover mapping", "Change detection"],
      },
      {
        title: "Programming & Automation",
        level: "Workflow automation",
        items: ["Python", "ArcPy", "Pandas", "Geospatial scripting", "RStudio spatial analysis"],
      },
    ],
    capabilities: [
      "Operational GIS analytics and QA/QC",
      "GIS network analysis and route optimization",
      "UAV photogrammetry and 3D modeling",
      "Remote sensing time-series and change analysis",
      "InSAR deformation and hazard assessment",
      "Spatial data automation with Python/ArcPy",
    ],
    languages: [
      { language: "Spanish", level: "Native" },
      { language: "English", level: "C1" },
      { language: "Chinese", level: "HSK3" },
      { language: "Japanese", level: "N5" },
    ],
    training: [
      { year: "2026", title: "Claude Code in Action", provider: "Anthropic Education" },
      { year: "2026", title: "Claude Code 101", provider: "Anthropic Education" },
      { year: "2025", title: "Artificial Intelligence for Civil Engineers", provider: "Shenzhen University Ph.D. coursework" },
      { year: "2024", title: "Geographic Information System: Design and Practice", provider: "Beihang University M.Sc." },
      { year: "2024", title: "Deep Learning for Remote Sensing Image Processing", provider: "Beihang University M.Sc." },
      { year: "2024", title: "Natural Disaster Remote Sensing", provider: "Beihang University M.Sc." },
      { year: "2023", title: "Spatial Analysis & Google Earth Engine with R", provider: "MASTERGIS" },
      { year: "2023", title: "Python Programming in ArcGIS", provider: "MASTERGIS" },
      { year: "2023", title: "Environmental Impact Assessment with ArcGIS", provider: "MASTERGIS" },
      { year: "2021", title: "SfM Photogrammetry with Metashape", provider: "ASTRO Geomatics" },
    ],
    conferences: [
      "6th International Workshop on GIS Technology, Beijing (2023)",
      "3rd Aerospace Bolivian Conference, IEEE (2019)",
      "Ongoing professional development through 40+ additional courses and workshops.",
    ],
  };

  const portfolio = publicObject({ profile, areas, allProjects, allSupportingProjects, featuredProjects });

  const output = `// This file is generated by scripts/generate-content.mjs. Do not edit manually.\n\nexport const portfolio = ${JSON.stringify(
    portfolio,
    null,
    2,
  )} as const;\n\nexport type Portfolio = typeof portfolio;\nexport type PortfolioArea = Portfolio[\"areas\"][number];\nexport type PortfolioGroup = PortfolioArea[\"groups\"][number];\nexport type PortfolioProject = Portfolio[\"allProjects\"][number];\n`;
  fs.writeFileSync(dataOutput, output, "utf8");

  const errors = [];
    if (allProjects.length !== EXPECTED_PUBLIC_PROJECTS) {
    errors.push(`Expected ${EXPECTED_PUBLIC_PROJECTS} public projects, found ${allProjects.length}.`);
  }
  if (publicImageCount !== EXPECTED_PUBLIC_IMAGES) {
    errors.push(`Expected ${EXPECTED_PUBLIC_IMAGES} public images, found ${publicImageCount}.`);
  }
  for (const project of [...allProjects, ...allSupportingProjects]) {
    if (project.hasOwnImages && !project.heroImage) errors.push(`Missing hero image for ${project.title}.`);
    for (const image of project.gallery) {
      const publicPath = path.join(publicRoot, image.src.replace(/^\//, ""));
      if (!fs.existsSync(publicPath)) errors.push(`Copied image missing: ${image.src}`);
    }
  }
  if (!fs.existsSync(cvTarget)) errors.push("CV copy missing in public/CV-CRIS.pdf.");

  if (errors.length) {
    for (const error of errors) console.error(error);
    throw new Error("Content validation failed.");
  }

  console.log(`Generated portfolio data: ${allProjects.length} projects, ${publicImageCount} images.`);
  console.log(`Generated ${path.relative(siteRoot, dataOutput)}.`);
}

try {
  buildPortfolio();
  if (isValidate) console.log("Content validation passed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
