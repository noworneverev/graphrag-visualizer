import { MRT_ColumnDef } from "material-react-table";

export interface Document {
    id: string;
    human_readable_id: number;
    title: string;
    text: string;
    text_unit_ids: string[];    
}

export const documentColumns: MRT_ColumnDef<Document>[] = [
    {
      accessorKey: "id",
      header: "id",
    },
    {
      accessorKey: "human_readable_id",
      header: "human_readable_id",
    },
    {
      accessorKey: "title",
      header: "title",
    },
    {
      accessorKey: "text",
      header: "text",
    },    
    {
      accessorKey: "text_unit_ids",
      header: "text_unit_ids",
      Cell: ({ renderedCellValue }) =>
        Array.isArray(renderedCellValue)
          ? JSON.stringify(renderedCellValue, null, 2)
          : renderedCellValue,
    },
  ];