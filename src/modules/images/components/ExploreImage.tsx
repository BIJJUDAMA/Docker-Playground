"use client";

import React, { useState } from "react";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { Folder, File, HelpCircle, HardDrive, ShieldCheck, ChevronRight, ChevronDown } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface FileNode {
  name: string;
  type: "folder" | "file";
  originLayer: number;
  createdIn: string;
  size: string;
  children?: FileNode[];
}

const IMAGE_FS_TREE: FileNode[] = [
  {
    name: "app",
    type: "folder",
    originLayer: 4,
    createdIn: "COPY . .",
    size: "142.8 MB",
    children: [
      {
        name: "server.js",
        type: "file",
        originLayer: 4,
        createdIn: "COPY . .",
        size: "4.5 KB"
      },
      {
        name: "node_modules",
        type: "folder",
        originLayer: 3,
        createdIn: "RUN npm install",
        size: "142.8 MB",
        children: [
          { name: "express", type: "folder", originLayer: 3, createdIn: "RUN npm install", size: "12.4 MB" },
          { name: "pg", type: "folder", originLayer: 3, createdIn: "RUN npm install", size: "28.1 MB" },
          { name: "uuid", type: "folder", originLayer: 3, createdIn: "RUN npm install", size: "1.2 MB" }
        ]
      },
      {
        name: "package.json",
        type: "file",
        originLayer: 2,
        createdIn: "COPY package.json package.json",
        size: "820 B"
      }
    ]
  },
  {
    name: "bin",
    type: "folder",
    originLayer: 1,
    createdIn: "FROM node:22-alpine",
    size: "4.2 MB",
    children: [
      { name: "sh", type: "file", originLayer: 1, createdIn: "FROM node:22-alpine", size: "120 KB" },
      { name: "node", type: "file", originLayer: 1, createdIn: "FROM node:22-alpine", size: "38.2 MB" },
      { name: "npm", type: "file", originLayer: 1, createdIn: "FROM node:22-alpine", size: "1.4 MB" }
    ]
  },
  {
    name: "etc",
    type: "folder",
    originLayer: 1,
    createdIn: "FROM node:22-alpine",
    size: "340 KB",
    children: [
      { name: "passwd", type: "file", originLayer: 1, createdIn: "FROM node:22-alpine", size: "1.8 KB" },
      { name: "hosts", type: "file", originLayer: 1, createdIn: "FROM node:22-alpine", size: "220 B" }
    ]
  }
];

const LAYER_SIZES: Record<number, { name: string; size: string; raw: number; cmd: string }> = {
  4: { name: "App Files", size: "24.2 KB", raw: 0.1, cmd: "COPY . ." },
  3: { name: "Dependencies", size: "142.8 MB", raw: 142.8, cmd: "RUN npm install" },
  2: { name: "Config Packages", size: "820 B", raw: 0.05, cmd: "COPY package.json package.json" },
  1: { name: "Node Base OS", size: "115.4 MB", raw: 115.4, cmd: "FROM node:22-alpine" }
};

export default function ExploreImage() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [scaleBySize, setScaleBySize] = useState<boolean>(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "app": true,
    "app/node_modules": false
  });

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes: FileNode[], parentPath = "") => {
    return (
      <div className="flex flex-col gap-1 pl-3 font-mono text-[9px]">
        {nodes.map((node) => {
          const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
          const isFolder = node.type === "folder";
          const isExpanded = expandedNodes[currentPath];

          return (
            <div key={currentPath} className="flex flex-col">
              <div 
                onClick={() => {
                  setSelectedFile(node);
                  if (isFolder) toggleNode(currentPath);
                }}
                className={cn(
                  "flex items-center gap-1.5 py-1 px-2 rounded-[5px] transition-colors cursor-pointer hover:bg-white/5",
                  selectedFile?.name === node.name && selectedFile?.originLayer === node.originLayer
                    ? "bg-white/5 border border-white/10 text-white" 
                    : "text-zinc-400"
                )}
              >
                {isFolder ? (
                  isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-550 shrink-0" /> : <ChevronRight className="w-3 h-3 text-zinc-550 shrink-0" />
                ) : (
                  <div className="w-3 shrink-0" />
                )}
                
                {isFolder ? (
                  <Folder className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                ) : (
                  <File className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                )}
                
                <span className="font-semibold">{node.name}</span>
                <span className="text-[7.5px] text-zinc-600 font-bold font-sans ml-auto uppercase">{node.size}</span>
              </div>

              {isFolder && isExpanded && node.children && (
                <div className="border-l border-zinc-850 ml-3.5 pl-1.5 mt-0.5">
                  {renderTree(node.children, currentPath)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <VisualCanvas
      objective="Inspect the internal files stack and understand how each file inherits properties from its originating layer."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Exploring Layered Filesystems
          </div>
          <p>
            An image is an **Overlay Filesystem**. It appears as a single unified directory tree, but individual folders actually live inside different immutable layers.
          </p>
          <p>
            Toggling **Image Size View** reveals which layers account for the image's disk foot print. Beginners instantly observe that dependencies (`node_modules`) dwarf code folders.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-stretch justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Left Panel: Layers Cross-Section */}
          <div className="flex-1 flex flex-col gap-3 justify-center min-h-[220px]">
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Layer Cross-Section Stack
              </span>
              <button
                onClick={() => setScaleBySize(!scaleBySize)}
                className={cn(
                  "px-2 py-1 rounded-[6px] border text-[8px] font-bold font-sans transition-all cursor-pointer",
                  scaleBySize
                    ? "bg-white text-black border-transparent shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                    : "bg-[#0d0d0e] border-zinc-850 text-zinc-400 hover:border-zinc-700"
                )}
              >
                {scaleBySize ? "Equal Proportions View" : "Image Size View"}
              </button>
            </div>

            {/* Vertical Stack List */}
            <div className="flex flex-col gap-1.5 flex-1 justify-center max-w-sm">
              {[4, 3, 2, 1].map((layerId) => {
                const layer = LAYER_SIZES[layerId];
                
                // Calculate height dynamically based on toggle
                let heightClass = "h-[44px]";
                if (scaleBySize) {
                  if (layerId === 3) heightClass = "h-[110px]";
                  else if (layerId === 1) heightClass = "h-[80px]";
                  else heightClass = "h-[20px]";
                }

                return (
                  <div
                    key={layerId}
                    className={cn(
                      "rounded-[9px] border border-zinc-850 bg-[#0d0d0e]/60 px-3 flex flex-col justify-center gap-0.5 transition-all duration-500 overflow-hidden relative",
                      selectedFile?.originLayer === layerId && "border-white/10 bg-white/5 shadow-sm"
                    )}
                    style={{ height: scaleBySize ? (layerId === 3 ? "110px" : layerId === 1 ? "80px" : "22px") : "48px" }}
                  >
                    <div className="flex justify-between items-center font-mono text-[8.5px] font-bold text-zinc-350">
                      <span>Layer {layerId}: {layer.name}</span>
                      <span className="text-[7.5px] text-zinc-500 font-sans">{layer.size}</span>
                    </div>
                    {(!scaleBySize || layerId === 3 || layerId === 1) && (
                      <span className="text-[7.5px] text-zinc-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap block">
                        {layer.cmd}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Directory Tree browser */}
          <div className="flex-1 flex flex-col p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 min-h-[220px] shadow-inner select-text">
            <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-500 mb-3 flex items-center gap-1.5 select-none font-mono">
              <HardDrive className="w-3.5 h-3.5 text-zinc-450" />
              Unified filesystem Explorer
            </span>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderTree(IMAGE_FS_TREE)}
            </div>
          </div>

        </div>

        {/* Selected File Details sidebar (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              File Inspector
            </span>
            <h4 className="text-sm font-extrabold text-white">
              {selectedFile ? selectedFile.name : "Select a file"}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              {selectedFile 
                ? `Clicking or hovering files details which specific layer they belong to. Notice that directories are virtual mappings combined across distinct snapshots.`
                : "Hover or select any folder node inside the virtual directory browser to inspect its immutable provenance layer."
              }
            </p>
          </div>

          {selectedFile && (
            <div className="flex flex-col gap-3 flex-1 select-text">
              
              {/* Layer properties */}
              <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-1.5 font-sans">
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className="text-zinc-500">Origin Layer</span>
                  <span className="text-zinc-200 font-mono">Layer {selectedFile.originLayer}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold border-t border-zinc-850/40 pt-1.5">
                  <span className="text-zinc-500">File Size</span>
                  <span className="text-zinc-200 font-mono">{selectedFile.size}</span>
                </div>
              </div>

              {/* Created By instruction */}
              <div className="p-3 bg-[#0d0d0e] rounded-[9px] border border-zinc-850 font-mono text-[9px] text-zinc-400">
                <span className="text-zinc-500 block mb-0.5 font-sans font-bold">Created by Dockerfile instruction:</span>
                <code className="text-white font-bold">{selectedFile.createdIn}</code>
              </div>

              {/* Status */}
              <div className="p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[9.5px] text-zinc-450 leading-relaxed flex items-center gap-1.5 font-sans">
                <ShieldCheck className="w-4 h-4 text-zinc-450 shrink-0" />
                <span>
                  {formatMarkdownNode("This file is located inside the immutable image layer, making it completely **Read-Only**.")}
                </span>
              </div>

            </div>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
