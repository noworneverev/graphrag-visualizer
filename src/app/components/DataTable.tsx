import React from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import { Box } from "@mui/material";

interface DataTableProps<T extends object> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
}

const DataTable = <T extends object>({
  data,
  columns,
}: DataTableProps<T>): React.ReactElement => {
  const table = useMaterialReactTable<T>({
    data,
    columns,
    initialState: {
      columnVisibility: {
        graph_embedding: false,
        description_embedding: false,
        // text_unit_ids: false,
        // relationship_ids: false,
      },
      density: "compact",
    },
  });

  return (
    <Box sx={{ zIndex: 1500 }}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default DataTable;
