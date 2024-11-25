import { MRT_ColumnDef } from "material-react-table";

export interface Entity {
    id: string;
    human_readable_id: number;
    title: string;    
    type: string;
    description: string;
    text_unit_ids: string[];        
}

export const entityColumns: MRT_ColumnDef<Entity>[] = [
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
      accessorKey: "type",
      header: "type",
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
  ];