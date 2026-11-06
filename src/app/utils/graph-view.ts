import { CustomGraphData, CustomLink, CustomNode } from "../models/custom-graph-data";

export type GroupMode = "auto" | "none" | "community" | "type";

export interface ViewOptions {
  showHubs: boolean;
  hiddenLinkTypes: ReadonlySet<string>;
  groupMode: GroupMode;
  expandedGroups: ReadonlySet<string>;
  focusNodeId: string | null;
}

export function endpointId(endpoint: string | CustomNode): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

export function buildGraphView(input: CustomGraphData, options: ViewOptions) {
  const palette = ["#0072B2", "#E69F00", "#009E73", "#CC79A7", "#D55E00", "#56B4E9",
    "#8C564B", "#9467BD", "#BCBD22", "#E377C2", "#17BECF", "#7F7F7F"];
  const colorKey = (node: CustomNode) => node.communityId !== undefined
    ? `community:${node.communityId}` : `type:${node.type}`;
  const colorKeys = Array.from(new Set(input.nodes.flatMap(node => [colorKey(node), `type:${node.type}`]))).sort();
  const colors = new Map(colorKeys.map((key, index) => [key, palette[index]
    || `hsl(${((index - palette.length) * 137.508) % 360}, 65%, 45%)`]));
  const sourceNodes = new Map(input.nodes.map(node => [node.id, node]));
  const neighbors = new Map(input.nodes.map(node => [node.id, new Set<string>()]));
  const sourceLinks = input.links.filter(link => {
    const source = endpointId(link.source);
    const target = endpointId(link.target);
    if (!sourceNodes.has(source) || !sourceNodes.has(target)) return false;
    if (source !== target) {
      neighbors.get(source)!.add(target);
      neighbors.get(target)!.add(source);
    }
    return true;
  });
  const hubThreshold = Math.max(50, Math.ceil(input.nodes.length * 0.2));
  const hubIds = new Set(input.nodes.filter(node => neighbors.get(node.id)!.size >= hubThreshold).map(node => node.id));
  const types = Array.from(new Set(sourceLinks.map(link => link.type))).sort();
  let nodes = input.nodes.filter(node => options.showHubs || !hubIds.has(node.id));
  const visibleIds = new Set(nodes.map(node => node.id));
  let links = sourceLinks.filter(link => !options.hiddenLinkTypes.has(link.type)
    && visibleIds.has(endpointId(link.source)) && visibleIds.has(endpointId(link.target)));

  if (options.focusNodeId !== null) {
    const localIds = new Set([options.focusNodeId]);
    links.forEach(link => {
      const source = endpointId(link.source);
      const target = endpointId(link.target);
      if (source === options.focusNodeId) localIds.add(target);
      if (target === options.focusNodeId) localIds.add(source);
    });
    nodes = nodes.filter(node => localIds.has(node.id));
    links = links.filter(link => localIds.has(endpointId(link.source)) && localIds.has(endpointId(link.target)));
  }

  const mode = options.groupMode === "auto"
    ? nodes.some(node => node.communityId !== undefined) ? "community"
      : new Set(nodes.map(node => node.type)).size > 1 ? "type" : "none"
    : options.groupMode;
  const groups = new Map<string, { name: string; members: CustomNode[] }>();
  if (mode !== "none" && options.focusNodeId === null) {
    nodes.forEach(node => {
      const key = mode === "community" && node.communityId !== undefined
        ? `community:${node.communityId}` : `type:${node.type}`;
      const name = mode === "community" && node.communityId !== undefined
        ? node.communityName || `Community ${node.communityId}` : node.type;
      const group = groups.get(key) || { name, members: [] };
      group.members.push(node);
      groups.set(key, group);
    });
  }

  const projectedIds = new Map(nodes.map(node => [node.id, node.id]));
  const groupNodes: CustomNode[] = [];
  const reservedIds = new Set(input.nodes.map(node => node.id));
  groups.forEach((group, key) => {
    if (group.members.length < 2 || options.expandedGroups.has(key)) return;
    let id = `__viewer_group__${key}`;
    while (reservedIds.has(id)) id = `_${id}`;
    reservedIds.add(id);
    group.members.forEach(node => projectedIds.set(node.id, id));
    groupNodes.push({ id, uuid: id, name: `${group.name} (${group.members.length})`, type: "VIEW_GROUP",
      groupKey: key, color: colors.get(key), memberCount: group.members.length, neighbors: [], links: [] });
  });
  const drawingNodes = [
    ...nodes.filter(node => projectedIds.get(node.id) === node.id).map(node => ({ ...node, color: colors.get(colorKey(node)), neighbors: [], links: [] } as CustomNode)),
    ...groupNodes,
  ];
  const drawingNodeMap = new Map(drawingNodes.map(node => [node.id, node]));
  const aggregateLinks = new Map<string, CustomLink>();
  const drawingLinks: CustomLink[] = [];
  links.forEach(link => {
    const source = projectedIds.get(endpointId(link.source))!;
    const target = projectedIds.get(endpointId(link.target))!;
    const grouped = source !== endpointId(link.source) || target !== endpointId(link.target);
    if (grouped && source === target) return;
    if (!grouped) {
      drawingLinks.push({ ...link, source, target });
      return;
    }
    const key = JSON.stringify([source, target, link.type]);
    const existing = aggregateLinks.get(key);
    if (existing) {
      existing.representedLinkCount = (existing.representedLinkCount || 1) + 1;
    } else {
      aggregateLinks.set(key, { id: `__viewer_link__${key}`, source, target, type: link.type, representedLinkCount: 1 });
    }
  });
  aggregateLinks.forEach(link => {
    link.description = `Group link: ${link.representedLinkCount} source links of type ${link.type}. Expand the groups to inspect the source links.`;
    drawingLinks.push(link);
  });
  const drawingNeighbors = new Map(drawingNodes.map(node => [node.id, new Set<CustomNode>()]));
  drawingLinks.forEach(link => {
    const source = drawingNodeMap.get(link.source)!;
    const target = drawingNodeMap.get(link.target)!;
    drawingNeighbors.get(source.id)!.add(target);
    drawingNeighbors.get(target.id)!.add(source);
    source.links!.push(link);
    if (target !== source) target.links!.push(link);
  });
  drawingNodes.forEach(node => { node.neighbors = Array.from(drawingNeighbors.get(node.id)!); });
  return {
    data: { nodes: drawingNodes, links: drawingLinks } as CustomGraphData,
    hubThreshold, hubCount: hubIds.size, types, mode,
    groups: Array.from(groups, ([key, group]) => ({ key, name: group.name, count: group.members.length })).filter(group => group.count > 1),
    representedNodes: nodes.length, representedLinks: links.length,
    collapsedGroupCount: groupNodes.length,
  };
}
