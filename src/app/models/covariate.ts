import { MRT_ColumnDef } from "material-react-table";

export interface Covariate {
    id: string;
    human_readable_id: number;
    covariate_type: string;
    type: string;
    description: string;
    subject_id: string;
    subject_type: string;
    object_id: string;
    object_type: string;
    status: string;
    start_date: string;
    end_date: string;
    source_text: string;
    text_unit_id: string;
    document_ids: string[];
    n_tokens: number;
}

export const covariateColumns: MRT_ColumnDef<Covariate>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "human_readable_id",
      header: "Human Readable ID",
    },
    {
      accessorKey: "covariate_type",
      header: "Covariate Type",
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
      accessorKey: "subject_id",
      header: "Subject ID",
    },
    {
      accessorKey: "subject_type",
      header: "Subject Type",
    },
    {
      accessorKey: "object_id",
      header: "Object ID",
    },
    {
      accessorKey: "object_type",
      header: "Object Type",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
    },
    {
      accessorKey: "end_date",
      header: "End Date",
    },
    {
      accessorKey: "source_text",
      header: "Source Text",
    },
    {
      accessorKey: "text_unit_id",
      header: "Text Unit ID",
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
      accessorKey: "n_tokens",
      header: "Number of Tokens",
    },
    
  ];