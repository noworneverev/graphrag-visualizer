import { MRT_ColumnDef } from "material-react-table";

export interface TextUnit {
    id: string;
    text: string;
    n_tokens: number;
    document_ids: string[];
    entity_ids: string[];
    relationship_ids: string[];    
}

export const textUnitColumns: MRT_ColumnDef<TextUnit>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "text",
      header: "Text",
    },
    {
      accessorKey: "n_tokens",
      header: "Number of Tokens",
    },
    {
      accessorKey: "document_ids",
      header: "Document IDs",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "entity_ids",
      header: "Entity IDs",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
    {
      accessorKey: "relationship_ids",
      header: "Relationship IDs",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
  ];