export interface Module {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  visualizationCount: number;
  learningObjectives: string[];
}

export const modules: Module[] = [
  {
    id: 1,
    slug: "introduction",
    title: "Introduction",
    description: "Understand why Docker exists, the shift from VMs to Containers, and typical workflows.",
    icon: "HelpCircle",
    visualizationCount: 3,
    learningObjectives: [
      "Explain the 'Works on my machine' problem",
      "Identify the core differences between Virtual Machines and Containers",
      "Explain the fundamental benefits of containerization for development and deployment"
    ]
  },
  {
    id: 2,
    slug: "fundamentals",
    title: "Docker Fundamentals",
    description: "Explore the internal architecture of Docker, its core daemon, objects, and CLI command flow.",
    icon: "Cpu",
    visualizationCount: 3,
    learningObjectives: [
      "Describe the Client-Server architecture of Docker Engine",
      "Distinguish between key Docker objects: Images, Containers, Networks, and Volumes",
      "Trace the flow of a Docker CLI command to the Docker Daemon"
    ]
  },
  {
    id: 3,
    slug: "images",
    title: "Images & Containers",
    description: "Learn how images are composed of read-only layers and how containers add a writable layer.",
    icon: "Layers",
    visualizationCount: 5,
    learningObjectives: [
      "Understand the read-only, stacked structure of Docker Image layers",
      "Explain the difference between a Container and an Image",
      "Visualize how the copy-on-write filesystem mechanism works for writable layers",
      "Describe the full lifecycle states of a container (Created, Running, Paused, Stopped)"
    ]
  },
  {
    id: 4,
    slug: "dockerfiles",
    title: "Dockerfiles",
    description: "Visualize how a Dockerfile is executed line-by-line to build cacheable image layers.",
    icon: "FileCode",
    visualizationCount: 4,
    learningObjectives: [
      "Write and understand basic Dockerfile instructions (FROM, RUN, COPY, CMD)",
      "Explain how Docker caches build steps to speed up subsequent builds",
      "Visualize layer creation step-by-step during a build process"
    ]
  },
  {
    id: 5,
    slug: "volumes",
    title: "Volumes & Storage",
    description: "Explore data persistence and learn the difference between Bind Mounts and Named Volumes.",
    icon: "HardDrive",
    visualizationCount: 4,
    learningObjectives: [
      "Explain why container storage is ephemeral by default",
      "Contrast Bind Mounts and Named Volumes",
      "Visualize how data persists even after container deletion"
    ]
  },
  {
    id: 6,
    slug: "networking",
    title: "Networking",
    description: "Inspect network bridges, port mappings, internal DNS, and container-to-container packet flow.",
    icon: "Network",
    visualizationCount: 4,
    learningObjectives: [
      "Explain how bridge networks isolate containers",
      "Configure and visualize port forwarding from host to container",
      "Trace DNS resolution and packet routing between multiple containers"
    ]
  },
  {
    id: 7,
    slug: "compose",
    title: "Docker Compose",
    description: "Assemble multi-container applications using a visual compose builder and dependency graphs.",
    icon: "Boxes",
    visualizationCount: 4,
    learningObjectives: [
      "Define multi-container applications using compose.yaml",
      "Establish startup order using dependencies (depends_on)",
      "Visualize how services interact on shared custom networks"
    ]
  },
  {
    id: 8,
    slug: "wrapup",
    title: "Wrap Up & Advanced",
    description: "Look at the broader Docker ecosystem, CI/CD pipeline integration, and multi-stage builds.",
    icon: "Award",
    visualizationCount: 3,
    learningObjectives: [
      "Appreciate the benefits of multi-stage builds for optimizing image sizes",
      "Trace a container's journey through a CI/CD automated pipeline",
      "Understand registry interactions and the production lifecycle"
    ]
  }
];

export function getModuleBySlug(slug: string): Module | undefined {
  return modules.find(m => m.slug === slug);
}

export function getModuleIndex(slug: string): number {
  return modules.findIndex(m => m.slug === slug);
}

export function getNextModule(slug: string): Module | undefined {
  const index = getModuleIndex(slug);
  if (index !== -1 && index < modules.length - 1) {
    return modules[index + 1];
  }
  return undefined;
}

export function getPrevModule(slug: string): Module | undefined {
  const index = getModuleIndex(slug);
  if (index > 0) {
    return modules[index - 1];
  }
  return undefined;
}
