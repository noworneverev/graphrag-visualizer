import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";

function descriptiveTitle(title?: string): string | undefined {
  const value = title?.trim();
  return value && !/^(?:community|cluster|group)[\s_:#-]*\d+(?:\s*\(\d+\))?(?:\s+(?:report|summary))?$/i.test(value)
    ? value : undefined;
}

export function communityNames(
  communities: Community[], reports: CommunityReport[], entities: Entity[], relationships: Relationship[]
): Map<string, string> {
  const reportTitles = new Map<string, string>();
  const reportTitlesByLevel = new Map<string, string>();
  reports.forEach(report => {
    const title = descriptiveTitle(report.title);
    if (!title) return;
    const id = String(report.community);
    if (!reportTitles.has(id)) reportTitles.set(id, title);
    reportTitlesByLevel.set(`${id}:${report.level}`, title);
  });
  const entitiesById = new Map(entities.map(entity => [entity.id, entity]));
  const entitiesByTitle = new Map(entities.map(entity => [entity.title, entity]));
  const relationshipsById = new Map(relationships.map(relationship => [relationship.id, relationship]));
  return new Map(communities.map(community => {
    const id = String(community.community);
    const title = reportTitlesByLevel.get(`${id}:${community.level}`)
      || reportTitles.get(id) || descriptiveTitle(community.title);
    if (title) return [id, title];

    const members = new Map<string, Entity>();
    (community.entity_ids || []).forEach(id => {
      const entity = entitiesById.get(id);
      if (entity) members.set(entity.title, entity);
    });
    const localLinks = (community.relationship_ids || []).map(id => relationshipsById.get(id))
      .filter((link): link is Relationship => link !== undefined);
    if (members.size === 0) localLinks.forEach(link => {
      [link.source, link.target].forEach(title => {
        const entity = entitiesByTitle.get(title);
        if (entity) members.set(title, entity);
      });
    });
    const degrees = new Map<string, number>();
    localLinks.forEach(link => {
      if (!members.has(link.source) || !members.has(link.target)) return;
      degrees.set(link.source, (degrees.get(link.source) || 0) + 1);
      degrees.set(link.target, (degrees.get(link.target) || 0) + 1);
    });
    const names = Array.from(members.keys()).sort((a, b) =>
      (degrees.get(b) || 0) - (degrees.get(a) || 0) || a.localeCompare(b)).slice(0, 3);
    return [id, names.length ? `Members: ${names.join(" · ")}` : `Community ${id} (no title or member names)`];
  }));
}
