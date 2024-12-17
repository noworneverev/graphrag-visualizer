import { MRT_ColumnDef } from "material-react-table";
import  {
    GraphData,
    NodeObject,
    LinkObject,
  } from "react-force-graph-2d";
import { Finding } from "./community-report";

export interface CustomNode extends NodeObject {
    uuid: string;
    id: string;
    name: string;
    type: string;
    title?: string;
    description?: string;
    human_readable_id?: number;
    graph_embedding?: number[];
    text_unit_ids?: string[];
    description_embedding?: number[];
    neighbors?: CustomNode[];
    links?: CustomLink[];
    text?: string;
    n_tokens?: number;
    document_ids?: string[];
    entity_ids?: string[];
    relationship_ids?: string[];   
    level?: number;
    raw_community?: number; 
    raw_content?: string;
    rank?: number;
    rank_explanation?: string;
    summary?: string;
    findings?: Finding[]
    full_content?: string;
    explanation?: string;
    subject_id?: string;
    object_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    source_text?: string;
    text_unit_id?: string;
    covariate_type?: string;
    parent?: number;
  }
  
export interface CustomLink extends LinkObject {
    source: string;
    target: string;
    type: string;
    weight?: number;
    description?: string;
    text_unit_ids?: string[];
    id: string;
    human_readable_id?: number;
    combined_degree?: number;
    source_degree?: number;
    target_degree?: number;
    rank?: number;
  }
  
export interface CustomGraphData extends GraphData {
    nodes: CustomNode[];
    links: CustomLink[];
  }


  export const customNodeColumns: MRT_ColumnDef<CustomNode>[] = [
    {
      accessorKey: "uuid",
      header: "id",
    },
    {
      accessorKey: "human_readable_id",
      header: "human_readable_id",
    },
    {
      accessorKey: "name",
      header: "name",
    },
    {
      accessorKey: "title",
      header: "title",
    },    
    {
      accessorKey: "type",
      header: "type",
    },
    {
      accessorKey: "description",
      header: "description",
    },
    {
      accessorKey: "graph_embedding",
      header: "graph_embedding",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "text_unit_ids",
      header: "text_unit_ids",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "description_embedding",
      header: "description_embedding",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "level",
      header: "level",
    },
    {
      accessorKey: "n_tokens",
      header: "n_tokens",
    },
    {
      accessorKey: "rank",
      header: "rank",
    },
    {
      accessorKey: "rank_explanation",
      header: "rank_explanation",
    },
    {
      accessorKey: "summary",
      header: "summary",
    },
    {
      accessorKey: "full_content",
      header: "full_content",
    },
    {
      accessorKey: "explanation",
      header: "explanation",
    },
    {
      accessorKey: "findings",
      header: "findings",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "text",
      header: "text",
    },
    {
      accessorKey: "document_ids",
      header: "document_ids",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "entity_ids",
      header: "entity_ids",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "relationship_ids",
      header: "relationship_ids",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },

  ];

  export const customLinkColumns: MRT_ColumnDef<CustomLink>[] = [
    {
        accessorKey: "source",
        header: "source",
    },
    {
        accessorKey: "target",
        header: "target",
    },
    {
        accessorKey: "type",
        header: "type",
    },
    {
        accessorKey: "weight",
        header: "weight",
    },
    {
        accessorKey: "description",
        header: "description",
    },
    {
        accessorKey: "text_unit_ids",
        header: "text_unit_ids",
        Cell: ({ renderedCellValue }) =>
          Array.isArray(renderedCellValue)
            ? JSON.stringify(renderedCellValue, null, 2)
            : renderedCellValue,
    },
    {
        accessorKey: "id",
        header: "id",
    },
    {
        accessorKey: "human_readable_id",
        header: "human_readable_id",
    },
    {
        accessorKey: "source_degree",
        header: "source_degree",
    },
    {
        accessorKey: "target_degree",
        header: "target_degree",
    },
    {
      accessorKey: "combined_degree",
      header: "combined_degree",
    },
    {
        accessorKey: "rank",
        header: "rank",
    },
];