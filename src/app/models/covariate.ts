import { MRT_ColumnDef } from "material-react-table";

export interface Covariate {
    id: string;
    human_readable_id: number;
    covariate_type: string;
    type: string;
    description: string;
    subject_id: string;    
    object_id: string;    
    status: string;
    start_date: string;
    end_date: string;
    source_text: string;
    text_unit_id: string;    
}

export const covariateColumns: MRT_ColumnDef<Covariate>[] = [
    {
      accessorKey: "id",
      header: "id",
    },
    {
      accessorKey: "human_readable_id",
      header: "human_readable_id",
    },
    {
      accessorKey: "covariate_type",
      header: "covariate_type",
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
      accessorKey: "subject_id",
      header: "subject_id",
    },    
    {
      accessorKey: "object_id",
      header: "object_id",
    },    
    {
      accessorKey: "status",
      header: "status",
    },
    {
      accessorKey: "start_date",
      header: "start_date",
    },
    {
      accessorKey: "end_date",
      header: "end_date",
    },
    {
      accessorKey: "source_text",
      header: "source_text",
    },
    {
      accessorKey: "text_unit_id",
      header: "text_unit_id",
    },        
  ];