import { Node, Edge } from "./types";

export function isNode(obj: any): obj is Node {
  return typeof obj.id === "string" && typeof obj.label === "string" && typeof obj.status === "string";
}

export function isEdge(obj: any): obj is Edge {
  return typeof obj.id === "string" && typeof obj.from === "string" && typeof obj.to === "string";
}
