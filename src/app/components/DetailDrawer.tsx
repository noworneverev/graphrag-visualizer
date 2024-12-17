import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "./DataTable";
import {
  CustomLink,
  CustomNode,
  customLinkColumns,
  customNodeColumns,
} from "../models/custom-graph-data";
import { textUnitColumns } from "../models/text-unit";
import { communityColumns } from "../models/community";
import {
  communityReportColumns,
  findingColumns,
} from "../models/community-report";
import { documentColumns } from "../models/document";
import { covariateColumns } from "../models/covariate";
import { MRT_ColumnDef } from "material-react-table";
import { entityColumns } from "../models/entity";

interface DetailDrawerProps {
  bottomDrawerOpen: boolean;
  setBottomDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNode: CustomNode | null;
  selectedRelationship: CustomLink | null;
  linkedNodes: CustomNode[];
  linkedRelationships: CustomLink[];
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  bottomDrawerOpen,
  setBottomDrawerOpen,
  selectedNode,
  selectedRelationship,
  linkedNodes,
  linkedRelationships,
}) => {
  const getNodeName = (node: string | CustomNode) => {
    return typeof node === "object" ? node.name : node;
  };

  const getNodeType = (node: string | CustomNode) => {
    return typeof node === "object" ? node.type : node;
  };

  const getFilteredNodeColumns = (
    types: string[]
  ): MRT_ColumnDef<CustomNode>[] => {
    const validAccessorKeys = new Set<string>();
    if (types.includes("CHUNK")) {
      textUnitColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("COMMUNITY")) {
      communityColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
      communityReportColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("RAW_DOCUMENT")) {
      documentColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("COVARIATE")) {
      covariateColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    if (types.includes("FINDING")) {
      findingColumns.forEach((tc) => {
        if (tc.accessorKey) {
          validAccessorKeys.add(tc.accessorKey);
        }
      });
    }

    entityColumns.forEach((tc) => {
      if (tc.accessorKey) {
        validAccessorKeys.add(tc.accessorKey);
      }
    });

    validAccessorKeys.add("uuid");
    return customNodeColumns.filter(
      (column) =>
        column.accessorKey && validAccessorKeys.has(column.accessorKey)
    );
  };

  const linkedNodeTypes = [...new Set(linkedNodes.map((node) => node.type))];
  const filteredColumns = getFilteredNodeColumns(linkedNodeTypes);

  return (
    <Drawer
      anchor="bottom"
      open={bottomDrawerOpen}
      onClose={() => setBottomDrawerOpen(false)}
      sx={{ zIndex: 1500 }}
    >
      <Box sx={{ width: "100%", padding: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          {selectedNode ? (
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {/* Node Details: {selectedNode.id.toString()} */}
              Node Details: {selectedNode.name.toString()}
            </Typography>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {" "}
              {selectedRelationship && (
                <>
                  {"(:"}
                  {getNodeType(selectedRelationship.source)} {"{name: "}
                  {"'"}
                  {getNodeName(selectedRelationship.source)}
                  {"'"}
                  {"}"}
                  {")"}
                  {"-[:"}
                  {selectedRelationship.type}
                  {"]->"}
                  {"(:"}
                  {getNodeType(selectedRelationship.target)} {"{name: "}
                  {"'"}
                  {getNodeName(selectedRelationship.target)}
                  {"'"}
                  {"}"}
                  {")"}
                </>
              )}
            </Typography>
          )}
          <IconButton
            onClick={() => setBottomDrawerOpen(false)}
            sx={{ marginLeft: "auto" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {selectedNode && (
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Node Information
              </Typography>
              <Typography>ID: {selectedNode.uuid}</Typography>
              <Typography>Title: {selectedNode.name}</Typography>
              {selectedNode.covariate_type && (
                <Typography>
                  Covariate Type: {selectedNode.covariate_type}
                </Typography>
              )}
              <Typography>
                Type: <Chip label={selectedNode.type} size="small" />{" "}
              </Typography>
              {selectedNode.title && (
                <Typography>
                  Community Report Title: {selectedNode.title}
                </Typography>
              )}
              {selectedNode.summary && (
                <Typography>Summary: {selectedNode.summary}</Typography>
              )}
              {selectedNode.n_tokens && (
                <Typography>
                  Number of Tokens: {selectedNode.n_tokens}
                </Typography>
              )}

              {selectedNode.description && (
                <Typography>Description: {selectedNode.description}</Typography>
              )}
              {selectedNode.human_readable_id && (
                <Typography>
                  Human Readable ID: {selectedNode.human_readable_id}
                </Typography>
              )}

              {/* {selectedNode.human_readable_id ||
                (selectedNode.human_readable_id === 0 && (
                  <Typography>
                    Human Readable ID: {selectedNode.human_readable_id}
                  </Typography>
                ))} */}
              {selectedNode.raw_content && (
                <Typography>Raw Content: {selectedNode.raw_content}</Typography>
              )}
            </CardContent>
          </Card>
        )}
        {selectedRelationship && (
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Relationship Information:
              </Typography>
              <Typography>ID: {selectedRelationship.id}</Typography>

              <Typography>
                Source: {getNodeName(selectedRelationship.source)}
              </Typography>
              <Typography>
                Target: {getNodeName(selectedRelationship.target)}
              </Typography>
              <Typography>Type: {selectedRelationship.type}</Typography>
              {selectedRelationship.description && (
                <Typography>
                  Description: {selectedRelationship.description}
                </Typography>
              )}
              {selectedRelationship.human_readable_id && (
                <Typography>
                  Human Readable ID: {selectedRelationship.human_readable_id}
                </Typography>
              )}
              {selectedRelationship.weight && (
                <Typography>Weight: {selectedRelationship.weight}</Typography>
              )}
              {selectedRelationship.source_degree && (
                <Typography>
                  Source Degree: {selectedRelationship.source_degree}
                </Typography>
              )}
              {selectedRelationship.target_degree && (
                <Typography>
                  Target Degree: {selectedRelationship.target_degree}
                </Typography>
              )}
              {selectedRelationship.rank && (
                <Typography>Rank: {selectedRelationship.rank}</Typography>
              )}
            </CardContent>
          </Card>
        )}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Linked Nodes
          </Typography>
          <DataTable columns={filteredColumns} data={linkedNodes} />
        </Box>
        {selectedNode && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Linked Relationships
            </Typography>

            <DataTable
              columns={customLinkColumns}
              data={linkedRelationships.map((link) => ({
                ...link,
                source: getNodeName(link.source),
                target: getNodeName(link.target),
              }))}
            />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default DetailDrawer;
