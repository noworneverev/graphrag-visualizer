import { MRT_ColumnDef } from "material-react-table";

export interface Community {
    id: number;
    title: string;
    level: number;
    raw_community: number;
    relationship_ids: string[];
    text_unit_ids: string[];
}

export const communityColumns: MRT_ColumnDef<Community>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "level",
      header: "Level",
    },
    {
      accessorKey: "raw_community",
      header: "Raw Community",
    },
    {
      accessorKey: "relationship_ids",
      header: "Relationship IDs",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "text_unit_ids",
      header: "Text Unit IDs",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
  ];