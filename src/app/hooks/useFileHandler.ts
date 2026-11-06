import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Entity } from "../models/entity";
import { Relationship } from "../models/relationship";
import { Document } from "../models/document";
import { TextUnit } from "../models/text-unit";
import { Community } from "../models/community";
import { CommunityReport } from "../models/community-report";
import { Covariate } from "../models/covariate";
import { LoadedFile } from "../models/loaded-file";
import { readParquetFile } from "../utils/parquet-utils";

const baseMapping: Record<string, string> = {
  "entities.parquet": "entity",
  "relationships.parquet": "relationship",
  "documents.parquet": "document",
  "text_units.parquet": "text_unit",
  "communities.parquet": "community",
  "community_reports.parquet": "community_report",
  "covariates.parquet": "covariate",
};

const emptyData = {
  entities: [] as Entity[], relationships: [] as Relationship[], documents: [] as Document[],
  textunits: [] as TextUnit[], communities: [] as Community[], covariates: [] as Covariate[],
  communityReports: [] as CommunityReport[], loadedFiles: [] as LoadedFile[],
};

const schemaKeys = {
  entity: "entities", relationship: "relationships", document: "documents", text_unit: "textunits",
  community: "communities", community_report: "communityReports", covariate: "covariates",
} as const;

function describeFile(file: File | string) {
  const name = typeof file === "string" ? file.split("/").pop()! : file.name;
  return {
    file,
    path: typeof file === "string" ? file : file.webkitRelativePath || file.name,
    schema: baseMapping[name.replace(/^create_final_/, "")],
  };
}

const useFileHandler = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyData);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestVersion = useRef(0);

  const loadFiles = async (files: (File | string)[], version: number) => {
    try {
      const selected = files.map(describeFile).filter(file => file.schema);
      if (selected.length === 0) throw new Error("No supported GraphRAG files were selected.");
      const seenSchemas = new Map<string, string>();
      selected.forEach(file => {
        const previous = seenSchemas.get(file.schema);
        if (previous !== undefined) {
          throw new Error(`Select one export. These files have the same data type: ${previous} and ${file.path}.`);
        }
        seenSchemas.set(file.schema, file.path);
      });
      const next = { ...emptyData, loadedFiles: [] as LoadedFile[] };
      for (const item of selected) {
        if (version !== requestVersion.current) return false;
        let file: File;
        if (typeof item.file === "string") {
          const response = await fetch(item.file, { cache: "no-store" });
          if (!response.ok) throw new Error(`Cannot load ${item.path}: HTTP ${response.status}.`);
          file = new File([await response.arrayBuffer()], item.path.split("/").pop()!);
        } else {
          file = item.file;
        }
        const rows = await readParquetFile(file, item.schema);
        const ids = new Set<string>();
        const titles = new Set<string>();
        rows.forEach(row => {
          if (row.id === null || row.id === undefined || String(row.id) === "") {
            throw new Error(`A row in ${item.path} has no id.`);
          }
          const id = String(row.id);
          if (ids.has(id)) throw new Error(`Duplicate id ${id} in ${item.path}. Select a single export.`);
          ids.add(id);
          if (item.schema === "entity") {
            if (!row.title || titles.has(row.title)) throw new Error(`Entity titles must be present and unique in ${item.path}.`);
            titles.add(row.title);
          }
        });
        const key = schemaKeys[item.schema as keyof typeof schemaKeys];
        Object.assign(next, { [key]: rows });
        next.loadedFiles.push({ path: item.path, schema: item.schema, rows: rows.length });
      }
      if (version !== requestVersion.current) return false;
      setData(next);
      setLoadError(null);
      return true;
    } catch (error) {
      if (version === requestVersion.current) setLoadError(error instanceof Error ? error.message : "Cannot read the selected files.");
      return false;
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  };

  const handleFilesRead = async (files: File[]) => {
    const version = ++requestVersion.current;
    setIsLoading(true);
    setLoadError(null);
    return loadFiles(files, version);
  };

  const checkFileExists = async (path: string) => {
    try {
      const response = await fetch(path, { method: "HEAD", cache: "no-store" });
      const type = response.headers.get("Content-Type") || "";
      return response.ok && !type.includes("text/html");
    } catch {
      return false;
    }
  };

  const loadDefaultFiles = async () => {
    const version = ++requestVersion.current;
    setIsLoading(true);
    setLoadError(null);
    const files: string[] = [];
    for (const name of Object.keys(baseMapping)) {
      const current = `${process.env.PUBLIC_URL}/artifacts/${name}`;
      const legacy = `${process.env.PUBLIC_URL}/artifacts/create_final_${name}`;
      if (await checkFileExists(current)) files.push(current);
      else if (await checkFileExists(legacy)) files.push(legacy);
      if (version !== requestVersion.current) return;
    }
    if (files.length === 0) {
      if (version === requestVersion.current) setIsLoading(false);
      return;
    }
    if (await loadFiles(files, version)) navigate("/graph", { replace: true });
  };

  return { ...data, loadError, isLoading, handleFilesRead, loadDefaultFiles };
};

export default useFileHandler;
