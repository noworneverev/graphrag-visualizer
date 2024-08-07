import { useState } from "react";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";
import { Document } from "../models/document";
import { TextUnit } from "../models/text-unit";
import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";
import { Covariate } from "../models/covariate";
import { readParquetFile } from "../utils/parquet-utils";

const fileSchemas: { [key: string]: string } = {
  "create_final_entities.parquet": "entity",
  "create_final_relationships.parquet": "relationship",
  "create_final_text_units.parquet": "text_unit",
  "create_final_communities.parquet": "community",
  "create_final_community_reports.parquet": "community_report",
  "create_final_documents.parquet": "document",
  "create_final_covariates.parquet": "covariate",
};

const useFileHandler = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [textunits, setTextUnits] = useState<TextUnit[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [covariates, setCovariates] = useState<Covariate[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);

  const handleFilesRead = async (files: File[]) => {
    const entitiesArray: Entity[][] = [];
    const relationshipsArray: Relationship[][] = [];
    const documentsArray: Document[][] = [];
    const textUnitsArray: TextUnit[][] = [];
    const communitiesArray: Community[][] = [];
    const communityReportsArray: CommunityReport[][] = [];
    const covariatesArray: Covariate[][] = [];

    for (const file of files) {
      const schema = fileSchemas[file.name];
      const data = await readParquetFile(file, schema);

      if (schema === "entity") {
        entitiesArray.push(data);
      } else if (schema === "relationship") {
        relationshipsArray.push(data);
      } else if (schema === "document") {
        documentsArray.push(data);
      } else if (schema === "text_unit") {
        textUnitsArray.push(data);
      } else if (schema === "community") {
        communitiesArray.push(data);
      } else if (schema === "community_report") {
        communityReportsArray.push(data);
      } else if (schema === "covariate") {
        covariatesArray.push(data);
      }
    }

    const allEntities = entitiesArray.flat();
    const allRelationships = relationshipsArray.flat();
    const allDocuments = documentsArray.flat();
    const allTextUnits = textUnitsArray.flat();
    const allCommunities = communitiesArray.flat();
    const allCommunityReports = communityReportsArray.flat();
    const allCovariates = covariatesArray.flat();

    setEntities(allEntities);
    setRelationships(allRelationships);
    setDocuments(allDocuments);
    setTextUnits(allTextUnits);
    setCommunities(allCommunities);
    setCommunityReports(allCommunityReports);
    setCovariates(allCovariates);
  };

  return {
    entities,
    relationships,
    documents,
    textunits,
    communities,
    covariates,
    communityReports,
    handleFilesRead,
  };
};

export default useFileHandler;
