import { communityNames } from "./community-names";
import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";

const community: Community = { id: 9, community: 9, human_readable_id: 9, level: 0, title: "Community 9",
  entity_ids: ["a", "b", "c", "d"], relationship_ids: ["ab", "bc"], text_unit_ids: [], period: "", size: 4 };
const entities: Entity[] = ["Audio recording", "Recovery", "File storage", "Upload"].map((title, i) => ({
  id: String.fromCharCode(97 + i), human_readable_id: i, title, type: "ENTITY", description: "", text_unit_ids: [],
}));
const relationships: Relationship[] = [
  { id: "ab", source: "Audio recording", target: "Recovery", human_readable_id: 0, type: "RELATED", description: "", weight: 1, combined_degree: 1, text_unit_ids: [] },
  { id: "bc", source: "Recovery", target: "File storage", human_readable_id: 1, type: "RELATED", description: "", weight: 1, combined_degree: 1, text_unit_ids: [] },
];
const report: CommunityReport = { id: "r9", community: 9, human_readable_id: 9, level: 0,
  title: "Recording recovery and audio files", summary: "", full_content: "", rank: 0, rank_explanation: "",
  findings: [], full_content_json: "", period: "", size: 4 };

test("A descriptive report title replaces a numbered community title", () => {
  expect(communityNames([community], [report], entities, relationships).get("9")).toBe(report.title);
});

test("Report titles are matched to the community level", () => {
  expect(communityNames([community], [{ ...report, level: 1, title: "Different level" }, report], entities, relationships).get("9")).toBe(report.title);
});

test("A descriptive community title is used when the report title is generic", () => {
  expect(communityNames([{ ...community, title: "Audio capture" }], [{ ...report, title: "Community 9" }], entities, relationships).get("9")).toBe("Audio capture");
});

test("Missing descriptive titles use connected member names without inventing a topic", () => {
  expect(communityNames([community], [{ ...report, title: "Community 9" }], entities, relationships).get("9"))
    .toBe("Members: Recovery · Audio recording · File storage");
});

test("Relationship endpoints supply names when explicit member ids are absent", () => {
  expect(communityNames([{ ...community, entity_ids: [] }], [], entities, relationships).get("9"))
    .toBe("Members: Recovery · Audio recording · File storage");
});

test("Missing titles and members are stated explicitly", () => {
  expect(communityNames([community], [], [], []).get("9")).toBe("Community 9 (no title or member names)");
});
