# Docker-Playground

Docker-Playground is an interactive educational application designed to visually explain containerization concepts prior to hands-on Docker usage. The tool prioritizes visual simulation, interaction, and structural exploration over static slides and text lists.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- Bun (recommended package manager) or npm

### Installation and Development Server

Install the project dependencies and launch the local development environment:

```bash
# Using Bun
bun install
bun run dev

# Using npm
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to explore the dashboard.

## Module Outline

The application is structured into self-contained interactive modules:

### 1. Introduction
Understand why containerization exists, the architectural differences between virtual machines and containers, and deployment lifecycle shifts.
- **The Problem: Works on My Machine**: Interactive reproduction of environment drift errors.
- **Solution: VMs vs Containers**: Structural side-by-side comparison of guest hypervisors vs shared host OS engines.
- **Deployment: Company Workflow**: Comparative pipeline simulation from development to production registry.

### 2. Docker Fundamentals
Inspect the client-server Docker engine architecture and trace how core Docker CLI commands reach backend processes.
- **Docker Architecture**: Dynamic layout of the Client, Host Daemon, and Image Registry layers.
- **Docker Objects Explorer**: Interactive definitions and metadata of key components: Images, Containers, Volumes, and Networks.
- **Engine Internals**: Visualization of container isolation using Linux namespaces and control groups (cgroups).
- **Command Flow**: Interactive command terminal to trace socket execution calls (`docker run`, `docker build`).

### 3. Images & Containers
Explore image compilation structure, read-only layers, writable copy-on-write filesystems, and state transitions.
- **Explore the Image**: Layered assembly block explorer.
- **Create Containers**: Instantiation layer creation tool.
- **Container Lifecycle**: Visual finite-state machine (Created, Running, Paused, Stopped, Deleted).
- **Image vs Container**: Visual representation of shared, immutable layers with separate writable filesystems.
- **Behind the Scenes**: Sequence of pulls, Copy-on-Write events, and Overlay2 storage.

### 4. Dockerfiles
Learn to formulate instructions, stack layers, and optimize cache layers during builds.
- **Dockerfile Builder**: Interactive directive composer (`FROM`, `RUN`, `COPY`, `CMD`).
- **Layer Cache Playground**: Build cache hits and invalidation simulations.
- **Dockerfile Optimizer**: Best practices tool showing multi-stage size improvements and layer order reduction.
- **Docker Build Under the Hood**: Client-Daemon build context archive and execution trace.

### 5. Volumes & Storage
Understand data persistence and contrast bind mount file paths with named Docker volume segments.
- **Docker Storage Map**: Conceptual layouts of Host Storage, Named Volumes, and Bind Mount systems.
- **Follow The File**: Live file sync replication tracker between host directory and container filesystem.
- **Docker Storage Inspector**: Inspect and view host storage mount configurations.
- **Delete Simulator**: Explores data survival behaviors when container nodes are deleted or restarted.

### 6. Networking
Visualize bridge routing configurations, host port mappings, DNS resolvers, and network packet journeys.
- **Network Builder**: Dynamic container IP assigner and bridge segment network visualizer.
- **Packet Journey**: Hop-by-hop packet trace showing port mappings and bridge translations.
- **Isolation vs Communication**: Network subnets simulation comparing isolated container bridges.
- **Living Network Map**: Interactive Network Operations Center (NOC) showing a live distributed cluster with traffic flows, card scaling, and failure injection cascades.

### 7. Docker Compose
Define and deploy multi-container stack templates using compose YAML schema declarations.
- **Compose YAML Editor**: Text validation composer for compose instructions.
- **Compose Stack Builder**: Node orchestration graph generator mapping configuration declarations.
- **Service Orchestration**: Dependency graphs tracing system boot order based on the `depends_on` instruction.
- **Environment Variables Sync**: Live interpolation of env properties from local variables to container tasks.

### 8. Wrap Up & Advanced
Synthesize multi-stage configurations, automated pipeline automation, and production clusters.
- **From Code to Production**: Automated CI/CD pipeline visualizer mapping code commits to production servers.
- **Multi-Stage Build Visualizer**: Build step workflow comparing builder size reduction profiles.
- **Docker in Production**: Visualizer showing production orchestration with host node mappings and ports.
- **Complete System Simulation**: Large-scale distributed architecture mapping developer commits, image builds, registry updates, and cluster deployments.

## Built With

- Next.js (App Router)
- React & TypeScript
- Tailwind CSS
- GSAP (GreenSock Animation Platform)
- Zustand (State Management)
- Lucide React (Icons)
