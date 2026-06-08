import { useMemo } from "react";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";
import { Document } from "../models/document";
import { TextUnit } from "../models/text-unit";
import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";
import { Covariate } from "../models/covariate";
import {
  CustomGraphData,
  CustomLink,
  CustomNode,
} from "../models/custom-graph-data";

function buildGraphData(
  entities: Entity[],
  relationships: Relationship[],
  documents: Document[],
  textunits: TextUnit[],
  communities: Community[],
  communityReports: CommunityReport[],
  covariates: Covariate[],
  includeDocuments: boolean,
  includeTextUnits: boolean,
  includeCommunities: boolean,
  includeCovariates: boolean,
  maxEntities: number,
): CustomGraphData {
  const entityRelationshipCount: { [key: string]: number } = {};
  relationships.forEach((rel) => {
    entityRelationshipCount[rel.source] =
      (entityRelationshipCount[rel.source] || 0) + 1;
    entityRelationshipCount[rel.target] =
      (entityRelationshipCount[rel.target] || 0) + 1;
  });

  let filteredEntities = entities;
  if (maxEntities > 0 && entities.length > maxEntities) {
    filteredEntities = [...entities]
      .sort((a, b) => {
        const countA = entityRelationshipCount[a.title] || 0;
        const countB = entityRelationshipCount[b.title] || 0;
        return countB - countA;
      })
      .slice(0, maxEntities);
  }

  const entityTitleByUuid = new Map<string, string>();
  const nodes: CustomNode[] = filteredEntities.map((entity) => {
    entityTitleByUuid.set(entity.id, entity.title);
    return {
      uuid: entity.id,
      id: entity.title,
      name: entity.title,
      title: entity.title,
      type: entity.type,
      description: entity.description,
      human_readable_id: entity.human_readable_id,
      text_unit_ids: entity.text_unit_ids,
      neighbors: [],
      links: [],
    };
  });

  const nodesMap: { [key: string]: CustomNode } = {};
  nodes.forEach((node) => (nodesMap[node.id] = node));

  const links: CustomLink[] = [];
  for (const relationship of relationships) {
    if (!nodesMap[relationship.source] || !nodesMap[relationship.target]) {
      continue;
    }
    links.push({
      source: relationship.source,
      target: relationship.target,
      type: relationship.type,
      weight: relationship.weight,
      description: relationship.description,
      text_unit_ids: relationship.text_unit_ids,
      id: relationship.id,
      human_readable_id: relationship.human_readable_id,
      combined_degree: relationship.combined_degree,
    });
  }

  if (includeDocuments) {
    const documentNodes = documents.map((document) => ({
      uuid: document.id,
      id: document.id,
      name: document.title,
      title: document.title,
      type: "RAW_DOCUMENT",
      text: document.text,
      text_unit_ids: document.text_unit_ids,
      human_readable_id: document.human_readable_id,
      neighbors: [],
      links: [],
    }));

    documentNodes.forEach((node) => (nodesMap[node.id] = node));
    nodes.push(...documentNodes);

    if (includeTextUnits) {
      for (const textunit of textunits) {
        if ((textunit.document_ids ?? []).length === 0) continue;
        for (const documentId of textunit.document_ids) {
          links.push({
            source: textunit.id,
            target: documentId,
            type: "PART_OF",
            id: `${textunit.id}-${documentId}`,
          });
        }
      }
    }
  }

  if (includeTextUnits) {
    const textUnitNodes = textunits.map((textunit) => ({
      uuid: textunit.id,
      id: textunit.id,
      name: `TEXT UNIT ${textunit.id}`,
      type: "CHUNK",
      text: textunit.text,
      n_tokens: textunit.n_tokens,
      document_ids: textunit.document_ids,
      entity_ids: textunit.entity_ids,
      relationship_ids: textunit.relationship_ids,
      human_readable_id: textunit.human_readable_id,
      neighbors: [],
      links: [],
    }));

    textUnitNodes.forEach((node) => (nodesMap[node.id] = node));
    nodes.push(...textUnitNodes);

    for (const textunit of textunits) {
      if ((textunit.entity_ids ?? []).length === 0) continue;
      for (const entityId of textunit.entity_ids) {
        const targetName = entityTitleByUuid.get(entityId);
        if (!targetName) continue;
        links.push({
          source: textunit.id,
          target: targetName,
          type: "HAS_ENTITY",
          id: `${textunit.id}-${entityId}`,
        });
      }
    }
  }

  if (includeCommunities) {
    const communityNodes = communities.map((community) => {
      const report = communityReports.find(
        (r) => r.community.toString() === community.community.toString(),
      );
      return {
        uuid: community.id.toString(),
        id: community.id.toString(),
        name: community.title,
        type: "COMMUNITY",
        entity_ids: community.text_unit_ids,
        relationship_ids: community.relationship_ids,
        full_content: report?.full_content || "",
        level: report?.level || -1,
        rank: report?.rank || -1,
        title: report?.title || "",
        rank_explanation: report?.rank_explanation || "",
        summary: report?.summary || "",
        findings: report?.findings || [],
        neighbors: [],
        links: [],
      };
    });
    communityNodes.forEach((node) => (nodesMap[node.id] = node));
    nodes.push(...communityNodes);

    const uniqueLinks = new Set<string>();
    const communityEntityLinks = communities
      .flatMap((community) =>
        community.relationship_ids.map((relId) => {
          const relationship = relationships.find((rel) => rel.id === relId);
          if (!relationship) return [];

          const sourceLinkId = `${relationship.source}-${community.id}`;
          const targetLinkId = `${relationship.target}-${community.id}`;

          const newLinks = [];

          if (
            !uniqueLinks.has(sourceLinkId) &&
            nodesMap[relationship.source]
          ) {
            uniqueLinks.add(sourceLinkId);
            newLinks.push({
              source: relationship.source,
              target: community.id.toString(),
              type: "IN_COMMUNITY",
              id: sourceLinkId,
            });
          }

          if (
            !uniqueLinks.has(targetLinkId) &&
            nodesMap[relationship.target]
          ) {
            uniqueLinks.add(targetLinkId);
            newLinks.push({
              source: relationship.target,
              target: community.id.toString(),
              type: "IN_COMMUNITY",
              id: targetLinkId,
            });
          }

          return newLinks;
        }),
      )
      .flat();

    links.push(...communityEntityLinks);

    communityNodes.forEach((communityNode) => {
      if (communityNode.findings) {
        communityNode.findings.forEach((finding, idx) => {
          const findingNode = {
            uuid: `community-${communityNode.uuid}-finding-${idx}`,
            id: `${communityNode.id}-finding-${idx}`,
            name: `${communityNode.title}-finding-${idx}`,
            type: "FINDING",
            explanation: finding.explanation,
            summary: finding.summary,
            neighbors: [],
            links: [],
          };

          nodesMap[findingNode.id] = findingNode;
          nodes.push(findingNode);

          links.push({
            source: communityNode.id,
            target: findingNode.id,
            type: "HAS_FINDING",
            id: `${communityNode.id}-finding-${idx}`,
          });
        });
      }
    });
  }

  if (includeCovariates) {
    const covariateNodes = covariates.map((covariate) => ({
      uuid: covariate.id,
      id: covariate.id,
      human_readable_id: covariate.human_readable_id,
      name: `COVARIATE ${covariate.id}`,
      covariate_type: covariate.covariate_type,
      type: covariate.type,
      description: covariate.description || "",
      subject_id: covariate.subject_id,
      object_id: covariate.object_id,
      status: covariate.status,
      start_date: covariate.start_date,
      end_date: covariate.end_date,
      source_text: covariate.source_text,
      text_unit_id: covariate.text_unit_id,
      neighbors: [],
      links: [],
    }));

    covariateNodes.forEach((node) => (nodesMap[node.id] = node));
    nodes.push(...covariateNodes);

    const covariateTextUnitLinks = covariates
      .filter(
        (covariate) =>
          nodesMap[covariate.text_unit_id] && nodesMap[covariate.id],
      )
      .map((covariate) => ({
        source: covariate.text_unit_id,
        target: covariate.id,
        type: "HAS_COVARIATE",
        id: `${covariate.text_unit_id}-${covariate.id}`,
      }));

    links.push(...covariateTextUnitLinks);
  }

  links.forEach((link) => {
    const sourceNode = nodesMap[link.source];
    const targetNode = nodesMap[link.target];
    if (sourceNode && targetNode) {
      if (!sourceNode.neighbors!.includes(targetNode))
        sourceNode.neighbors!.push(targetNode);
      if (!targetNode.neighbors!.includes(sourceNode))
        targetNode.neighbors!.push(sourceNode);
      if (!sourceNode.links!.includes(link)) sourceNode.links!.push(link);
      if (!targetNode.links!.includes(link)) targetNode.links!.push(link);
    }
  });

  return { nodes, links };
}

const useGraphData = (
  entities: Entity[],
  relationships: Relationship[],
  documents: Document[],
  textunits: TextUnit[],
  communities: Community[],
  communityReports: CommunityReport[],
  covariates: Covariate[],
  includeDocuments: boolean,
  includeTextUnits: boolean,
  includeCommunities: boolean,
  includeCovariates: boolean,
  maxEntities: number = 0,
) =>
  useMemo(
    () =>
      buildGraphData(
        entities,
        relationships,
        documents,
        textunits,
        communities,
        communityReports,
        covariates,
        includeDocuments,
        includeTextUnits,
        includeCommunities,
        includeCovariates,
        maxEntities,
      ),
    [
      entities,
      relationships,
      documents,
      textunits,
      communities,
      communityReports,
      covariates,
      includeDocuments,
      includeTextUnits,
      includeCommunities,
      includeCovariates,
      maxEntities,
    ],
  );

export default useGraphData;
