import { MRT_ColumnDef } from "material-react-table";

export interface Finding {
    explanation: string;
    summary: string;
}

export interface CommunityReport {
    id: string;
    human_readable_id: number;
    community: number;
    parent?: number;
    level: number;
    title: string;
    summary: string;
    full_content: string;
    rank: number;
    rank_explanation: string;
    findings: Finding[];
    full_content_json: string;
    period: string;
    size: number;
}

export const findingColumns: MRT_ColumnDef<Finding>[] = [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "explanation",
    header: "explanation",
  },
  {
    accessorKey: "summary",
    header: "summary",
  },

]

export const communityReportColumns: MRT_ColumnDef<CommunityReport>[] = [
    {
      accessorKey: "id",
      header: "id",
    },  
    {
      accessorKey: "human_readable_id",
      header: "human_readable_id",
    },
    {
      accessorKey: "community",
      header: "community",
    },
    {
      accessorKey: "parent",
      header: "parent",
    },
    {
      accessorKey: "level",
      header: "level",
    },
    {
      accessorKey: "title",
      header: "title",
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
      accessorKey: "rank",
      header: "rank",
    },
    {
      accessorKey: "rank_explanation",
      header: "rank_explanation",
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
      accessorKey: "full_content_json",
      header: "full_content_json",
    },
    {
      accessorKey: "period",
      header: "period",
    },
    {
      accessorKey: "size",
      header: "size",
    },
  ];