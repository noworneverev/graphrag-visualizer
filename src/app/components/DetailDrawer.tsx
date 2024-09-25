import React from "react";
import {
  Box,
  Card,
  CardContent,
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('dataview');

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
            {t('detailDrawer.nodeDetails', { name: selectedNode.name.toString() })}
          </Typography>
        ) : (
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {selectedRelationship && t('detailDrawer.relationshipDetails', {
              sourceType: getNodeType(selectedRelationship.source),
              sourceName: getNodeName(selectedRelationship.source),
              relationshipType: selectedRelationship.type,
              targetType: getNodeType(selectedRelationship.target),
              targetName: getNodeName(selectedRelationship.target),
            })}
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
              {t('detailDrawer.nodeInformation')}
            </Typography>
            <Typography>{t('detailDrawer.id')}: {selectedNode.uuid}</Typography>
            <Typography>{t('detailDrawer.name')}: {selectedNode.name}</Typography>
            {selectedNode.covariate_type && (
              <Typography>
                {t('detailDrawer.covariateType')}: {selectedNode.covariate_type}
              </Typography>
            )}
            <Typography>{t('detailDrawer.type')}: {selectedNode.type}</Typography>
            {selectedNode.title && (
              <Typography>{t('detailDrawer.title')}: {selectedNode.title}</Typography>
            )}
            {selectedNode.summary && (
              <Typography>{t('detailDrawer.summary')}: {selectedNode.summary}</Typography>
            )}
            {selectedNode.n_tokens && (
              <Typography>
                {t('detailDrawer.numberOfTokens')}: {selectedNode.n_tokens}
              </Typography>
            )}

            {selectedNode.description && (
              <Typography>{t('detailDrawer.description')}: {selectedNode.description}</Typography>
            )}
            {selectedNode.human_readable_id && (
              <Typography>
                {t('detailDrawer.humanReadableId')}: {selectedNode.human_readable_id}
              </Typography>
            )}
            {selectedNode.raw_content && (
              <Typography>{t('detailDrawer.rawContent')}: {selectedNode.raw_content}</Typography>
            )}
          </CardContent>
        </Card>
      )}
      {selectedRelationship && (
        <Card sx={{ marginBottom: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {t('detailDrawer.relationshipInformation')}
            </Typography>
            <Typography>{t('detailDrawer.id')}: {selectedRelationship.id}</Typography>

            <Typography>
              {t('detailDrawer.source')}: {getNodeName(selectedRelationship.source)}
            </Typography>
            <Typography>
              {t('detailDrawer.target')}: {getNodeName(selectedRelationship.target)}
            </Typography>
            <Typography>{t('detailDrawer.type')}: {selectedRelationship.type}</Typography>
            {selectedRelationship.description && (
              <Typography>
                {t('detailDrawer.description')}: {selectedRelationship.description}
              </Typography>
            )}
            {selectedRelationship.human_readable_id && (
              <Typography>
                {t('detailDrawer.humanReadableId')}: {selectedRelationship.human_readable_id}
              </Typography>
            )}
            {selectedRelationship.weight && (
              <Typography>{t('detailDrawer.weight')}: {selectedRelationship.weight}</Typography>
            )}
            {selectedRelationship.source_degree && (
              <Typography>
                {t('detailDrawer.sourceDegree')}: {selectedRelationship.source_degree}
              </Typography>
            )}
            {selectedRelationship.target_degree && (
              <Typography>
                {t('detailDrawer.targetDegree')}: {selectedRelationship.target_degree}
              </Typography>
            )}
            {selectedRelationship.rank && (
              <Typography>{t('detailDrawer.rank')}: {selectedRelationship.rank}</Typography>
            )}
          </CardContent>
        </Card>
      )}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {t('detailDrawer.linkedNodes')}
        </Typography>
        <DataTable
          columns={filteredColumns}
          data={linkedNodes}
        />
      </Box>
      {selectedNode && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {t('detailDrawer.linkedRelationships')}
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
