import { useEffect, useState } from "react";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";
import { Document } from "../models/document";
import { TextUnit } from "../models/text-unit";
import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";
import { Covariate } from "../models/covariate";
import { CustomGraphData, CustomLink, CustomNode } from "../models/custom-graph-data";

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
  includeCovariates: boolean
) => {
  const [graphData, setGraphData] = useState<CustomGraphData>({ nodes: [], links: [] });

  useEffect(() => {
    const nodes: CustomNode[] = entities.map((entity) => ({
      uuid: entity.id,
      id: entity.name,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      human_readable_id: entity.human_readable_id,
      graph_embedding: entity.graph_embedding,
      text_unit_ids: entity.text_unit_ids,
      description_embedding: entity.description_embedding,
    }));

    const nodeIds = new Set(nodes.map((node) => node.id));

    const links: CustomLink[] = relationships
      .map((relationship) => ({
        source: relationship.source,
        target: relationship.target,
        type: relationship.type,
        weight: relationship.weight,
        description: relationship.description,
        text_unit_ids: relationship.text_unit_ids,
        id: relationship.id,
        human_readable_id: relationship.human_readable_id,
        source_degree: relationship.source_degree,
        target_degree: relationship.target_degree,
        rank: relationship.rank,
      }))
      .filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target));

    if (includeDocuments) {
      const documentNodes = documents.map((document) => ({
        uuid: document.id,
        id: document.id,
        name: document.title,
        title: document.title,
        type: "RAW_DOCUMENT", // avoid conflict with "DOCUMENT" type
        raw_content: document.raw_content,
        text_unit_ids: document.text_unit_ids,
      }));

      nodes.push(...documentNodes);

      if (includeTextUnits) {
        const textUnitDocumentLinks = textunits
          .filter((textunit) => (textunit.document_ids ?? []).length > 0)
          .flatMap((textunit) =>
            textunit.document_ids.map((documentId) => ({
              source: textunit.id,
              target: documentId,
              type: "PART_OF",
              id: `${textunit.id}-${documentId}`,
            }))
          );

        links.push(...textUnitDocumentLinks);
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
      }));

      nodes.push(...textUnitNodes);

      const textUnitEntityLinks = textunits
        .filter((textunit) => (textunit.entity_ids ?? []).length > 0)
        .flatMap((textunit) =>
          textunit.entity_ids.map((entityId) => ({
            source: textunit.id,
            target: nodes.find((e) => e.uuid === entityId)?.name || "",
            type: "HAS_ENTITY",
            id: `${textunit.id}-${entityId}`,
          }))
        );

      links.push(...textUnitEntityLinks);
    }

    if (includeCommunities) {
      const communityNodes = communities.map((community) => {
        const report = communityReports.find(
          (r) => r.community.toString() === community.id.toString()
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
        };
      });

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

            if (!uniqueLinks.has(sourceLinkId)) {
              uniqueLinks.add(sourceLinkId);
              newLinks.push({
                source: relationship.source,
                target: community.id.toString(),
                type: "IN_COMMUNITY",
                id: sourceLinkId,
              });
            }

            if (!uniqueLinks.has(targetLinkId)) {
              uniqueLinks.add(targetLinkId);
              newLinks.push({
                source: relationship.target,
                target: community.id.toString(),
                type: "IN_COMMUNITY",
                id: targetLinkId,
              });
            }

            return newLinks;
          })
        )
        .flat();

      links.push(...communityEntityLinks);

      //Add finding nodes and links
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
            };

            nodes.push(findingNode);

            const findingLink = {
              source: communityNode.id,
              target: findingNode.id,
              type: "HAS_FINDING",
              id: `${communityNode.id}-finding-${idx}`,
            };

            links.push(findingLink);
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
        type: "COVARIATE",
        description: covariate.description || "",
        subject_id: covariate.subject_id,
        subject_type: covariate.subject_type,
        object_id: covariate.object_id,
        object_type: covariate.object_type,
        status: covariate.status,
        start_date: covariate.start_date,
        end_date: covariate.end_date,
        source_text: covariate.source_text,
        text_unit_id: covariate.text_unit_id,
        document_ids: covariate.document_ids,
        n_tokens: covariate.n_tokens,
      }));

      nodes.push(...covariateNodes);

      const covariateTextUnitLinks = covariates.map((covariate) => ({
        source: covariate.text_unit_id,
        target: covariate.id,
        type: "HAS_COVARIATE",
        id: `${covariate.text_unit_id}-${covariate.id}`,
      }));

      links.push(...covariateTextUnitLinks);
    }

    if (nodes.length > 0) {
      setGraphData({ nodes, links });
    }
  }, [
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
  ]);

  return graphData;
};

export default useGraphData;
