import { MRT_ColumnDef } from "material-react-table";

export interface Community {
    id: number;
    human_readable_id: number;
    community: number;
    parent?: number;
    level: number;
    title: string;    
    entity_ids: string[];
    relationship_ids: string[];
    text_unit_ids: string[];
    period: string;
    size: number;
}

export const communityColumns: MRT_ColumnDef<Community>[] = [
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
    {
      accessorKey: "text_unit_ids",
      header: "text_unit_ids",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
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