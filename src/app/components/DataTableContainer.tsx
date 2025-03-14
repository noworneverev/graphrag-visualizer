import React from "react";
import {
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import DataTable from "./DataTable";
import { Entity, entityColumns } from "../models/entity";
import { Relationship, relationshipColumns } from "../models/relationship";
import { Document, documentColumns } from "../models/document";
import { TextUnit, textUnitColumns } from "../models/text-unit";
import { Community, communityColumns } from "../models/community";
import {
  CommunityReport,
  communityReportColumns,
} from "../models/community-report";
import { Covariate, covariateColumns } from "../models/covariate";

interface DataTableContainerProps {
  selectedTable: string;
  setSelectedTable: (
    value: React.SetStateAction<
      | "entities"
      | "relationships"
      | "documents"
      | "textunits"
      | "communities"
      | "communityReports"
      | "covariates"
    >
  ) => void;
  entities: Entity[];
  relationships: Relationship[];
  documents: Document[];
  textunits: TextUnit[];
  communities: Community[];
  communityReports: CommunityReport[];
  covariates: Covariate[];
}

const DataTableContainer: React.FC<DataTableContainerProps> = ({
  selectedTable,
  setSelectedTable,
  entities,
  relationships,
  documents,
  textunits,
  communities,
  communityReports,
  covariates,
}) => {
  return (
    <>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
        }}
      >
        <List>
          <ListItemButton
            selected={selectedTable === "entities"}
            onClick={() => setSelectedTable("entities")}
          >
            <ListItemText primary="Entities" />
          </ListItemButton>
          <ListItemButton
            selected={selectedTable === "relationships"}
            onClick={() => setSelectedTable("relationships")}
          >
            <ListItemText primary="Relationships" />
          </ListItemButton>
          <ListItemButton
            selected={selectedTable === "documents"}
            onClick={() => setSelectedTable("documents")}
          >
            <ListItemText primary="Documents" />
          </ListItemButton>
          <ListItemButton
            selected={selectedTable === "textunits"}
            onClick={() => setSelectedTable("textunits")}
          >
            <ListItemText primary="TextUnits" />
          </ListItemButton>
          <ListItemButton
            selected={selectedTable === "communities"}
            onClick={() => setSelectedTable("communities")}
          >
            <ListItemText primary="Communities" />
          </ListItemButton>

          <ListItemButton
            selected={selectedTable === "communityReports"}
            onClick={() => setSelectedTable("communityReports")}
          >
            <ListItemText primary="Community Reports" />
          </ListItemButton>

          <ListItemButton
            selected={selectedTable === "covariates"}
            onClick={() => setSelectedTable("covariates")}
          >
            <ListItemText primary="Covariates" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box p={3} sx={{ flexGrow: 1, overflow: "auto" }}>
        {selectedTable === "entities" && (
          <>
            <Typography variant="h4" gutterBottom>
              Entities (entities.parquet)
            </Typography>
            <DataTable columns={entityColumns} data={entities} />
          </>
        )}
        {selectedTable === "relationships" && (
          <>
            <Typography variant="h4" gutterBottom>
              Relationships (relationships.parquet)
            </Typography>
            <DataTable columns={relationshipColumns} data={relationships} />
          </>
        )}
        {selectedTable === "documents" && (
          <>
            <Typography variant="h4" gutterBottom>
              Documents (documents.parquet)
            </Typography>
            <DataTable columns={documentColumns} data={documents} />
          </>
        )}
        {selectedTable === "textunits" && (
          <>
            <Typography variant="h4" gutterBottom>
              TextUnits (text_units.parquet)
            </Typography>
            <DataTable columns={textUnitColumns} data={textunits} />
          </>
        )}
        {selectedTable === "communities" && (
          <>
            <Typography variant="h4" gutterBottom>
              Communities (communities.parquet)
            </Typography>
            <DataTable columns={communityColumns} data={communities} />
          </>
        )}
        {selectedTable === "communityReports" && (
          <>
            <Typography variant="h4" gutterBottom>
              Community Reports (community_reports.parquet)
            </Typography>
            <DataTable
              columns={communityReportColumns}
              data={communityReports}
            />
          </>
        )}
        {selectedTable === "covariates" && (
          <>
            <Typography variant="h4" gutterBottom>
              Covariates (covariates.parquet)
            </Typography>
            <DataTable columns={covariateColumns} data={covariates} />
          </>
        )}
      </Box>
    </>
  );
};

export default DataTableContainer;
