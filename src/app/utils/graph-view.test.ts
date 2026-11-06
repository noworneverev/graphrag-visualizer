import { buildGraphView, ViewOptions } from "./graph-view";
import { CustomGraphData, CustomLink, CustomNode } from "../models/custom-graph-data";

const node = (id: string, type = "ENTITY"): CustomNode => ({ id, uuid: id, name: id, type });
const link = (source: string, target: string, type = "MENTIONS"): CustomLink => ({ id: `${source}-${target}-${type}`, source, target, type });
const options: ViewOptions = { showHubs: false, hiddenLinkTypes: new Set(), groupMode: "none", expandedGroups: new Set(), focusNodeId: null };

test("High degree hubs and their links are hidden until requested", () => {
  const leaves = Array.from({ length: 60 }, (_, i) => node(String(i)));
  const input = { nodes: [node("document", "DOCUMENT"), ...leaves], links: leaves.map(item => link("document", item.id)) };
  const hidden = buildGraphView(input, options);
  expect(hidden.hubCount).toBe(1);
  expect(hidden.data.nodes).toHaveLength(60);
  expect(hidden.data.links).toHaveLength(0);
  const shown = buildGraphView(input, { ...options, showHubs: true });
  expect(shown.data.nodes).toHaveLength(61);
  expect(shown.data.links).toHaveLength(60);
  expect(input.links).toHaveLength(60);
});

test("Parallel links do not inflate the hub neighbor count", () => {
  const input = { nodes: [node("a"), node("b")], links: Array.from({ length: 100 }, (_, i) => ({ ...link("a", "b"), id: String(i) })) };
  expect(buildGraphView(input, options).hubCount).toBe(0);
});

test("Link type filters also remove hidden links from hover details", () => {
  const input = { nodes: [node("a"), node("b"), node("c")], links: [link("a", "b"), link("a", "c", "REFERS_TO")] };
  const view = buildGraphView(input, { ...options, hiddenLinkTypes: new Set(["MENTIONS"]) });
  expect(view.types).toEqual(["MENTIONS", "REFERS_TO"]);
  expect(view.data.links.map(item => item.type)).toEqual(["REFERS_TO"]);
  expect(view.data.nodes[0].neighbors?.map(item => item.id)).toEqual(["c"]);
});

test("Node focus includes direct neighbors and excludes distant nodes", () => {
  const input = { nodes: [node("a"), node("b"), node("c"), node("d")], links: [link("a", "b"), link("b", "c"), link("c", "d")] };
  const view = buildGraphView(input, { ...options, groupMode: "type", focusNodeId: "a" });
  expect(view.data.nodes.map(item => item.id)).toEqual(["a", "b"]);
  expect(view.data.links).toHaveLength(1);
  expect(view.groups).toHaveLength(0);
});

test("Saved community groups combine external links and can be expanded", () => {
  const input: CustomGraphData = {
    nodes: [{ ...node("a"), communityId: "1", communityName: "First" }, { ...node("b"), communityId: "1", communityName: "First" }, node("c")],
    links: [link("a", "b"), link("a", "c"), link("b", "c")],
  };
  const collapsed = buildGraphView(input, { ...options, groupMode: "community" });
  expect(collapsed.data.nodes).toHaveLength(2);
  expect(collapsed.data.nodes.find(item => item.groupKey)?.memberCount).toBe(2);
  expect(collapsed.data.links).toHaveLength(1);
  expect(collapsed.data.links[0].representedLinkCount).toBe(2);
  expect(collapsed.data.links[0].description).toContain("2 source links");
  expect(collapsed.representedLinks).toBe(3);
  const expanded = buildGraphView(input, { ...options, groupMode: "community", expandedGroups: new Set(["community:1"]) });
  expect(expanded.data.nodes).toHaveLength(3);
  expect(expanded.data.links).toHaveLength(3);
});

test("Automatic groups use entity types when saved communities are absent", () => {
  const view = buildGraphView({ nodes: [node("a", "CASE"), node("b", "CASE"), node("c", "DOCUMENT")], links: [] }, { ...options, groupMode: "auto" });
  expect(view.mode).toBe("type");
  expect(view.groups).toEqual([{ key: "type:CASE", name: "CASE", count: 2 }]);
  expect(view.data.nodes).toHaveLength(2);
});

test("A single entity type remains ungrouped in automatic mode", () => {
  const view = buildGraphView({ nodes: [node("a"), node("b")], links: [] }, { ...options, groupMode: "auto" });
  expect(view.mode).toBe("none");
  expect(view.data.nodes).toHaveLength(2);
});

test("Renderer mutations do not change the source graph or later views", () => {
  const input = { nodes: [node("a"), node("b")], links: [link("a", "b")] };
  const view = buildGraphView(input, options);
  view.data.nodes[0].x = 100;
  (view.data.links[0] as any).source = view.data.nodes[0];
  expect(input.nodes[0].x).toBeUndefined();
  expect(input.links[0].source).toBe("a");
  const next = buildGraphView(view.data, options);
  expect(next.data.links[0].source).toBe("a");
  expect(next.data.nodes[0].neighbors).toHaveLength(1);
});

test("Missing link endpoints are excluded from all views", () => {
  expect(buildGraphView({ nodes: [node("a")], links: [link("a", "missing")] }, options).data.links).toHaveLength(0);
});

test("Each community has a distinct color that its expanded members retain", () => {
  const input = { nodes: Array.from({ length: 20 }, (_, community) => [
    { ...node(`${community}-a`), communityId: String(community) },
    { ...node(`${community}-b`, "DOCUMENT"), communityId: String(community) },
  ]).flat(), links: [] };
  const collapsed = buildGraphView(input, { ...options, groupMode: "community" });
  expect(new Set(collapsed.data.nodes.map(item => item.color)).size).toBe(20);
  const expanded = buildGraphView(input, { ...options, groupMode: "community",
    expandedGroups: new Set(collapsed.groups.map(group => group.key)) });
  expanded.data.nodes.forEach(member => {
    const group = collapsed.data.nodes.find(item => item.groupKey === `community:${member.communityId}`);
    expect(member.color).toBe(group?.color);
  });
  expect(input.nodes.every(item => !("color" in item))).toBe(true);
});

test("Community colors remain the same after focus and input order changes", () => {
  const input = { nodes: [
    { ...node("a"), communityId: "1" }, { ...node("b"), communityId: "2" },
    { ...node("c"), communityId: "3" },
  ], links: [link("a", "b")] };
  const full = buildGraphView(input, options);
  const focused = buildGraphView({ ...input, nodes: [...input.nodes].reverse() }, { ...options, focusNodeId: "a" });
  focused.data.nodes.forEach(item => expect(item.color).toBe(full.data.nodes.find(original => original.id === item.id)?.color));
});
