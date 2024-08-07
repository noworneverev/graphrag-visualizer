import { MRT_ColumnDef } from "material-react-table";

export interface Finding {
    explanation: string;
    summary: string;
}

export interface CommunityReport {
    community: number;
    full_content: string;
    level: number;
    rank: number;
    title: string;
    rank_explanation: string;
    summary: string;
    findings: Finding[];
    full_content_json: string;
    id: string;
}

export const findingColumns: MRT_ColumnDef<Finding>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "explanation",
    header: "Explanation",
  },
  {
    accessorKey: "summary",
    header: "Summary",
  },

]

export const communityReportColumns: MRT_ColumnDef<CommunityReport>[] = [
    {
      accessorKey: "community",
      header: "Community",
    },
    {
      accessorKey: "full_content",
      header: "Full Content",
    },
    {
      accessorKey: "level",
      header: "Level",
    },
    {
      accessorKey: "rank",
      header: "Rank",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "rank_explanation",
      header: "Rank Explanation",
    },
    {
      accessorKey: "summary",
      header: "Summary",
    },
    {
      accessorKey: "findings",
      header: "Findings",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "full_content_json",
      header: "Full Content JSON",
    },
    {
      accessorKey: "id",
      header: "ID",
    },
  ];