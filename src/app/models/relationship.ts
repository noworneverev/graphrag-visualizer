import { MRT_ColumnDef } from "material-react-table";

export interface Relationship {
    id: string;
    human_readable_id: number;
    source: string;
    target: string;
    description: string;
    weight: number;
    combined_degree: number;
    text_unit_ids: string[];    
    type: string; // Custom field to match neo4j
}

export const relationshipColumns: MRT_ColumnDef<Relationship>[] = [
    {
        accessorKey: "id",
        header: "id",
    },
    {
        accessorKey: "human_readable_id",
        header: "human_readable_id",
    },
    {
        accessorKey: "source",
        header: "source",
    },
    {
        accessorKey: "target",
        header: "target",
    },
    {
        accessorKey: "description",
        header: "description",
    },    
    {
        accessorKey: "weight",
        header: "weight",
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
        accessorKey: "combined_degree",
        header: "combined_degree",
    },
    {
        accessorKey: "type",
        header: "type",
    },            
];