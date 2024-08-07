import { MRT_ColumnDef } from "material-react-table";

export interface Document {
    id: string;
    text_unit_ids: string[];
    raw_content: string;
    title: string;
}

export const documentColumns: MRT_ColumnDef<Document>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "raw_content",
      header: "Raw Content",
    },
    {
      accessorKey: "title",
      header: "Title",
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