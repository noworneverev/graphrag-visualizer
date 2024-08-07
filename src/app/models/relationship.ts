import { MRT_ColumnDef } from "material-react-table";

export interface Relationship {
    source: string;
    target: string;
    weight: number;
    description: string;
    text_unit_ids: string[];
    id: string;
    human_readable_id: number;
    source_degree: number;
    target_degree: number;
    rank: number;
    type: string; // Custom field to match neo4j
}

export const relationshipColumns: MRT_ColumnDef<Relationship>[] = [
    {
        accessorKey: "source",
        header: "Source",
    },
    {
        accessorKey: "target",
        header: "Target",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "weight",
        header: "Weight",
    },
    {
        accessorKey: "description",
        header: "Description",
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
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "human_readable_id",
        header: "Human Readable ID",
    },
    {
        accessorKey: "source_degree",
        header: "Source Degree",
    },
    {
        accessorKey: "target_degree",
        header: "Target Degree",
    },
    {
        accessorKey: "rank",
        header: "Rank",
    },
    
    
];