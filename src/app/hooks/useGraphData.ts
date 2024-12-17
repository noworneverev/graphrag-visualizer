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
      id: entity.title, // use title as id because relationships use title as source/target
      name: entity.title, // legacy field for old GraphRAG 0.2.x - 0.3.x
      title: entity.title, // new field for GraphRAG 0.5.0+ (change name to title)
      type: entity.type,
      description: entity.description,
      human_readable_id: entity.human_readable_id,      
      text_unit_ids: entity.text_unit_ids,      
      neighbors: [],
      links: [],
    }));

    const nodesMap: { [key: string]: CustomNode } = {};
    nodes.forEach(node => nodesMap[node.id] = node);

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
        combined_degree: relationship.combined_degree,        
      }))
      .filter((link) => nodesMap[link.source] && nodesMap[link.target]);

    

    if (includeDocuments) {
      const documentNodes = documents.map((document) => ({
        uuid: document.id,
        id: document.id,
        name: document.title,
        title: document.title,
        type: "RAW_DOCUMENT", // avoid conflict with "DOCUMENT" type
        text: document.text,
        text_unit_ids: document.text_unit_ids,
        human_readable_id: document.human_readable_id,
        neighbors: [],
        links: [],
      }));
      
      documentNodes.forEach(node => nodesMap[node.id] = node);
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
        human_readable_id: textunit.human_readable_id,
        neighbors: [],
        links: [],
      }));
      
      textUnitNodes.forEach(node => nodesMap[node.id] = node);
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
          (r) => r.community.toString() === community.community.toString()
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
      communityNodes.forEach(node => nodesMap[node.id] = node);
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
              neighbors: [],
              links: [],
            };

            nodesMap[findingNode.id] = findingNode;
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
        // type: "COVARIATE",
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

      covariateNodes.forEach(node => nodesMap[node.id] = node);
      nodes.push(...covariateNodes);

      const covariateTextUnitLinks = covariates.map((covariate) => ({
        source: covariate.text_unit_id,
        target: covariate.id,
        type: "HAS_COVARIATE",
        id: `${covariate.text_unit_id}-${covariate.id}`,
      }));

      links.push(...covariateTextUnitLinks);
    }

    links.forEach(link => {
      const sourceNode = nodesMap[link.source];
      const targetNode = nodesMap[link.target];
      if (sourceNode && targetNode) {
        if (!sourceNode.neighbors!.includes(targetNode))
          sourceNode.neighbors!.push(targetNode);
        if (!targetNode.neighbors!.includes(sourceNode))
          targetNode.neighbors!.push(sourceNode);
        if (!sourceNode.links!.includes(link))
          sourceNode.links!.push(link);
        if (!targetNode.links!.includes(link))
          targetNode.links!.push(link);
      }
    });


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
