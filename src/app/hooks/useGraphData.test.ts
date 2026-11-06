import { renderHook } from "@testing-library/react";
import useGraphData from "./useGraphData";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";
import { Document } from "../models/document";
import { TextUnit } from "../models/text-unit";
import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";

const empty: never[] = [];

const entities: Entity[] = ["A", "B", "C"].map((title, index) => ({
  id: title.toLowerCase(), title, human_readable_id: index, type: "ENTITY", description: "", text_unit_ids: [],
}));
const relationships: Relationship[] = ["B", "C"].map((target, index) => ({
  id: `A-${target}`, source: "A", target, human_readable_id: index, description: "", weight: 1,
  combined_degree: 1, text_unit_ids: [], type: "RELATED",
}));
const documents: Document[] = [{ id: "doc", title: "Document", human_readable_id: 0, text: "", text_unit_ids: [] }];
const textunits: TextUnit[] = [{ id: "chunk", human_readable_id: 0, text: "", n_tokens: 0,
  document_ids: ["doc", "missing"], entity_ids: ["a"], relationship_ids: [] }];

test("The total node limit includes extra node types and removes links to excluded nodes", () => {
  const { result } = renderHook(() => useGraphData(
    entities, relationships, documents, textunits, empty, empty, empty, true, true, false, false, 2, 3, 0
  ));
  expect(result.current.nodes.map(node => node.id)).toEqual(["A", "B", "doc"]);
  expect(result.current.links.map(link => link.id)).toEqual(["A-B"]);
  expect(result.current.nodes[0].neighbors?.map(node => node.id)).toEqual(["B"]);
});

test("The link limit also limits hover neighbors and linked relationships", () => {
  const { result } = renderHook(() => useGraphData(
    entities, relationships, empty, empty, empty, empty, empty, false, false, false, false, 0, 0, 1
  ));
  expect(result.current.links).toHaveLength(1);
  expect(result.current.nodes[0].neighbors?.map(node => node.id)).toEqual(["B"]);
  expect(result.current.nodes[2].links).toHaveLength(0);
});

test("Unlimited graphs keep valid links and reject missing endpoints", () => {
  const { result } = renderHook(() => useGraphData(
    entities, relationships, documents, textunits, empty, empty, empty, true, true, false, false, 0, 0, 0
  ));
  expect(result.current.nodes).toHaveLength(5);
  expect(result.current.links).toHaveLength(4);
  expect(result.current.links.some(link => link.target === "missing")).toBe(false);
});

test("Removing all data clears the previous graph", () => {
  const emptyEntities: Entity[] = [];
  const emptyLinks: Relationship[] = [];
  const { result, rerender } = renderHook(({ populated }) => useGraphData(
    populated ? entities : emptyEntities, populated ? relationships : emptyLinks,
    documents, textunits, empty, empty, empty, false, false, false, false
  ), { initialProps: { populated: true } });
  expect(result.current.nodes).toHaveLength(3);
  rerender({ populated: false });
  expect(result.current).toEqual({ nodes: [], links: [] });
});

test("Saved community membership is available when community dots are not included", () => {
  const communities: Community[] = [{ id: 10, human_readable_id: 10, community: 10, level: 0,
    title: "Group A", entity_ids: ["a", "b"], relationship_ids: [], text_unit_ids: [], period: "", size: 2 }];
  const { result } = renderHook(() => useGraphData(
    entities, relationships, empty, empty, communities, empty, empty, false, false, false, false
  ));
  expect(result.current.nodes[0].communityId).toBe("10");
  expect(result.current.nodes[1].communityName).toBe("Group A");
  expect(result.current.nodes[2].communityId).toBeUndefined();
  expect(result.current.nodes).toHaveLength(3);
});

test("Explicit community members take precedence over relationship fallback", () => {
  const base = { human_readable_id: 0, level: 0, text_unit_ids: [], period: "", size: 1 };
  const communities: Community[] = [
    { ...base, id: 1, community: 1, title: "First", entity_ids: ["a"], relationship_ids: ["A-B"] },
    { ...base, id: 2, community: 2, title: "Second", entity_ids: ["b"], relationship_ids: [] },
  ];
  const { result } = renderHook(() => useGraphData(
    entities, relationships, empty, empty, communities, empty, empty, false, false, false, false
  ));
  expect(result.current.nodes[0].communityId).toBe("1");
  expect(result.current.nodes[1].communityId).toBe("2");
});

test("Community groups and dots use the descriptive report title", () => {
  const communities: Community[] = [{ id: 9, human_readable_id: 9, community: 9, level: 0,
    title: "Community 9", entity_ids: ["a", "b"], relationship_ids: [], text_unit_ids: [], period: "", size: 2 }];
  const reports: CommunityReport[] = [{ id: "report-9", human_readable_id: 9, community: 9, level: 0,
    title: "Recording recovery and audio files", summary: "", full_content: "", rank: 0,
    rank_explanation: "", findings: [], full_content_json: "", period: "", size: 2 }];
  const { result } = renderHook(() => useGraphData(
    entities, relationships, empty, empty, communities, reports, empty, false, false, true, false
  ));
  expect(result.current.nodes[0].communityName).toBe("Recording recovery and audio files");
  expect(result.current.nodes.find(node => node.type === "COMMUNITY")?.name).toBe("Recording recovery and audio files");
});
