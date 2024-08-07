import { MRT_ColumnDef } from "material-react-table";

export interface Entity {
    id: string;
    name: string;
    type: string;
    description: string;
    human_readable_id: number;
    graph_embedding: number[];
    text_unit_ids: string[];
    description_embedding: number[];
}

export const entityColumns: MRT_ColumnDef<Entity>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "human_readable_id",
      header: "Human Readable ID",
    },
    {
      accessorKey: "graph_embedding",
      header: "Graph Embedding",
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
    {
      accessorKey: "description_embedding",
      header: "Description Embedding",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
  ];