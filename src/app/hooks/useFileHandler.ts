import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";
import { Document } from "../models/document";
import { TextUnit } from "../models/text-unit";
import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";
import { Covariate } from "../models/covariate";
import { readParquetFile } from "../utils/parquet-utils";

const baseFileNames = [
  "entities.parquet",
  "relationships.parquet",
  "documents.parquet",
  "text_units.parquet",
  "communities.parquet",
  "community_reports.parquet",
  "covariates.parquet",
];

const baseMapping: { [key: string]: string } = {
  "entities.parquet": "entity",
  "relationships.parquet": "relationship",
  "documents.parquet": "document",
  "text_units.parquet": "text_unit",
  "communities.parquet": "community",
  "community_reports.parquet": "community_report",
  "covariates.parquet": "covariate",
};

const fileSchemas: { [key: string]: string } = {};
Object.entries(baseMapping).forEach(([key, value]) => {  
  fileSchemas[key] = value;  
  fileSchemas[`create_final_${key}`] = value;
});

const useFileHandler = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [textunits, setTextUnits] = useState<TextUnit[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [covariates, setCovariates] = useState<Covariate[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(
    []
  );

  const handleFilesRead = async (files: File[]) => {
    await loadFiles(files);
  };

  const loadFiles = async (files: File[] | string[]) => {
    const entitiesArray: Entity[][] = [];
    const relationshipsArray: Relationship[][] = [];
    const documentsArray: Document[][] = [];
    const textUnitsArray: TextUnit[][] = [];
    const communitiesArray: Community[][] = [];
    const communityReportsArray: CommunityReport[][] = [];
    const covariatesArray: Covariate[][] = [];

    for (const file of files) {
      const fileName =
        typeof file === "string" ? file.split("/").pop()! : file.name;      
      const schema = fileSchemas[fileName] || fileSchemas[`create_final_${fileName}`];

      let data;
      if (typeof file === "string") {
        // Fetch default file from public folder as binary data
        const response = await fetch(file);
        if (!response.ok) {
          console.error(`Failed to fetch file ${file}: ${response.statusText}`);
          continue;
        }

        // Convert ArrayBuffer to File object
        const buffer = await response.arrayBuffer();
        const blob = new Blob([buffer], { type: "application/x-parquet" });
        const fileBlob = new File([blob], fileName);

        // Use the File object in readParquetFile
        data = await readParquetFile(fileBlob, schema);
        // console.log(`Successfully loaded ${fileName} from public folder`);
      } else {
        // Handle drag-and-drop files directly
        data = await readParquetFile(file, schema);
        // console.log(`Successfully loaded ${file.name} from drag-and-drop`);
      }

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

    setEntities(entitiesArray.flat());
    setRelationships(relationshipsArray.flat());
    setDocuments(documentsArray.flat());
    setTextUnits(textUnitsArray.flat());
    setCommunities(communitiesArray.flat());
    setCommunityReports(communityReportsArray.flat());
    setCovariates(covariatesArray.flat());
  };

  const checkFileExists = async (filePath: string) => {
    try {
      const response = await fetch(filePath, {
        method: "HEAD",
        cache: "no-store",
      });

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");

        if (contentType === "application/octet-stream") {
          // Updated Content-Type check
          console.log(`File exists: ${filePath}`);
          return true;
        } else {
          // console.warn(
          //   `File does not exist or incorrect type: ${filePath} (Content-Type: ${contentType})`
          // );
          return false;
        }
      } else {
        console.warn(
          `File does not exist: ${filePath} (status: ${response.status})`
        );
        return false;
      }
    } catch (error) {
      console.error(`Error checking file existence for ${filePath}`, error);
      return false;
    }
  };

  const loadDefaultFiles = async () => {
    const filesToLoad = [];

    for (const baseName of baseFileNames) {
      const prefixedPath = process.env.PUBLIC_URL + `/artifacts/create_final_${baseName}`;
      const unprefixedPath = process.env.PUBLIC_URL + `/artifacts/${baseName}`;
  
      if (await checkFileExists(prefixedPath)) {
        filesToLoad.push(prefixedPath);
      } else if (await checkFileExists(unprefixedPath)) {
        filesToLoad.push(unprefixedPath);
      }
    }
    
    if (filesToLoad.length > 0) {
      await loadFiles(filesToLoad);
      navigate("/graph", { replace: true });
    } else {
      console.log("No default files found in the public folder.");
    }
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
    loadDefaultFiles,
  };
};

export default useFileHandler;
