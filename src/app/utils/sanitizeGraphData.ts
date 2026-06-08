import {
  CustomGraphData,
  CustomLink,
  CustomNode,
} from "../models/custom-graph-data";

const FORCE_GRAPH_NODE_KEYS = [
  "__indexColor",
  "index",
  "x",
  "y",
  "z",
  "vx",
  "vy",
  "vz",
  "fx",
  "fy",
  "fz",
  "color",
] as const;

const FORCE_GRAPH_LINK_KEYS = ["__indexColor"] as const;

function stripKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: readonly string[],
): T {
  const cleaned = { ...obj };
  keys.forEach((key) => {
    delete cleaned[key];
  });
  return cleaned;
}

function normalizeLinkEndpoint(endpoint: string | CustomNode): string {
  return typeof endpoint === "object" ? endpoint.id : endpoint;
}

export function sanitizeGraphData(data: CustomGraphData): CustomGraphData {
  const nodes: CustomNode[] = data.nodes
    .filter((node): node is CustomNode => node != null)
    .map((node) => {
      const cleaned = stripKeys(node as Record<string, unknown>, [
        ...FORCE_GRAPH_NODE_KEYS,
      ]) as CustomNode;

      return {
        ...cleaned,
        neighbors: [] as CustomNode[],
        links: [] as CustomLink[],
      };
    });

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  const links: CustomLink[] = [];
  for (const link of data.links) {
    if (link == null) continue;

    const cleaned = stripKeys(link as Record<string, unknown>, [
      ...FORCE_GRAPH_LINK_KEYS,
    ]) as CustomLink;

    const sourceId = normalizeLinkEndpoint(cleaned.source);
    const targetId = normalizeLinkEndpoint(cleaned.target);
    if (!nodeById.has(sourceId) || !nodeById.has(targetId)) continue;

    links.push({
      ...cleaned,
      source: sourceId,
      target: targetId,
    });
  }

  links.forEach((link) => {
    const sourceNode = nodeById.get(link.source as string);
    const targetNode = nodeById.get(link.target as string);
    if (!sourceNode || !targetNode) return;

    if (!sourceNode.neighbors!.includes(targetNode))
      sourceNode.neighbors!.push(targetNode);
    if (!targetNode.neighbors!.includes(sourceNode))
      targetNode.neighbors!.push(sourceNode);
    if (!sourceNode.links!.includes(link)) sourceNode.links!.push(link);
    if (!targetNode.links!.includes(link)) targetNode.links!.push(link);
  });

  return { nodes, links };
}
