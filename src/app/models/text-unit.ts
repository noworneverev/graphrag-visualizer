import { MRT_ColumnDef } from "material-react-table";

export interface TextUnit {
    id: string;
    human_readable_id: number;
    text: string;
    n_tokens: number;
    document_ids: string[];
    entity_ids: string[];
    relationship_ids: string[];    
}

export const textUnitColumns: MRT_ColumnDef<TextUnit>[] = [
    {
      accessorKey: "id",
      header: "id",
    },
    {
      accessorKey: "text",
      header: "text",
    },
    {
      accessorKey: "n_tokens",
      header: "n_tokens",
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