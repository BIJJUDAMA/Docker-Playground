import React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMarkdownNode(node: React.ReactNode): React.ReactNode {
  if (node === null || node === undefined) return node;

  if (typeof node === "string") {
    if (!node.includes("**")) return node;
    const parts = node.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return React.createElement(
          "strong",
          { key: index, className: "font-extrabold text-[#FAFAFA]" },
          part.slice(2, -2)
        );
      }
      return part;
    });
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement;
    const props = element.props as any;
    if (props && props.children) {
      const children = React.Children.map(props.children, child =>
        formatMarkdownNode(child)
      );
      return React.cloneElement(element, { ...props }, children);
    }
  }

  if (Array.isArray(node)) {
    return node.map((child, index) =>
      React.createElement(React.Fragment, { key: index }, formatMarkdownNode(child))
    );
  }

  return node;
}
