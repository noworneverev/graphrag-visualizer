import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GraphViewer from "./GraphViewer";
import { Alert, Box, Container, Tab, Tabs, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import DropZone from "./DropZone";
import Introduction from "./Introduction";
import useFileHandler from "../hooks/useFileHandler";
import useGraphData from "../hooks/useGraphData";
import DataTableContainer from "./DataTableContainer";
import ReactGA from "react-ga4";

const GraphDataHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState(0);
  const [graphType, setGraphType] = useState<"2d" | "3d">("2d");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<
    | "entities"
    | "relationships"
    | "documents"
    | "textunits"
    | "communities"
    | "communityReports"
    | "covariates"
  >("entities");
  const [includeDocuments, setIncludeDocuments] = useState(false);
  const [includeTextUnits, setIncludeTextUnits] = useState(false);
  const [includeCommunities, setIncludeCommunities] = useState(false);
  const [includeCovariates, setIncludeCovariates] = useState(false);
  const [maxEntities, setMaxEntities] = useState(500);
  const [maxNodes, setMaxNodes] = useState(0);
  const [maxLinks, setMaxLinks] = useState(0);

  const {
    entities,
    relationships,
    documents,
    textunits,
    communities,
    covariates,
    communityReports,
    handleFilesRead,
    loadDefaultFiles,
    loadedFiles,
    loadError,
    isLoading,
  } = useFileHandler();

  const graphData = useGraphData(
    entities,
    relationships,
    documents,
    textunits,
    communities,
    communityReports,
    covariates,
    includeDocuments,
    includeTextUnits,
    includeCommunities,
    includeCovariates,
    maxEntities,
    maxNodes,
    maxLinks
  );

  const hasDocuments = documents.length > 0;
  const hasTextUnits = textunits.length > 0;
  const hasCommunities = communities.length > 0;
  const hasCovariates = covariates.length > 0;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      loadDefaultFiles();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (measurementId) {
      ReactGA.initialize(measurementId);
    } else {
      console.error("Google Analytics measurement ID not found");
    }
  }, []);

  useEffect(() => {
    // **Set tab index based on the current path**
    switch (location.pathname) {
      case "/upload":
        setTabIndex(0);
        break;
      case "/graph":
        setTabIndex(1);
        break;
      case "/data":
        setTabIndex(2);
        break;
      default:
        setTabIndex(0);
    }
  }, [location.pathname]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (await handleFilesRead(acceptedFiles)) navigate("/graph", { replace: true });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: true,
    accept: {
      "application/x-parquet": [".parquet"],
    },
  });

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
    let path = "/upload";
    if (newValue === 1) path = "/graph";
    if (newValue === 2) path = "/data";
    navigate(path);
    ReactGA.send({
      hitType: "event",
      eventCategory: "Tabs",
      eventAction: "click",
      eventLabel: `Tab ${newValue}`,
    });
  };

  const toggleGraphType = () => {
    setGraphType((prevType) => (prevType === "2d" ? "3d" : "2d"));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <Tabs value={tabIndex} onChange={handleChange} centered sx={{ flexShrink: 0 }}>
        <Tab label="Upload Artifacts" />
        <Tab label="Graph Visualization" />
        <Tab label="Data Tables" />
      </Tabs>
      {isLoading && <Typography role="status" sx={{ px: 3 }}>Loading graph files…</Typography>}
      {loadError && <Alert severity="error">{loadError} Previous data was kept.</Alert>}
      {tabIndex === 0 && (
        <Container
          maxWidth="md"
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DropZone {...{ getRootProps, getInputProps, isDragActive }} />
          <Introduction />
        </Container>
      )}
      {tabIndex === 1 && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <GraphViewer
            data={graphData}
            graphType={graphType}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onToggleGraphType={toggleGraphType}
            includeDocuments={includeDocuments}
            includeTextUnits={includeTextUnits}
            onIncludeDocumentsChange={() =>
              setIncludeDocuments(!includeDocuments)
            }
            onIncludeTextUnitsChange={() =>
              setIncludeTextUnits(!includeTextUnits)
            }
            includeCommunities={includeCommunities}
            onIncludeCommunitiesChange={() =>
              setIncludeCommunities(!includeCommunities)
            }
            includeCovariates={includeCovariates}
            onIncludeCovariatesChange={() =>
              setIncludeCovariates(!includeCovariates)
            }
            hasDocuments={hasDocuments}
            hasTextUnits={hasTextUnits}
            hasCommunities={hasCommunities}
            hasCovariates={hasCovariates}
            maxEntities={maxEntities}
            onMaxEntitiesChange={setMaxEntities}
            totalEntities={entities.length}
            maxNodes={maxNodes}
            onMaxNodesChange={setMaxNodes}
            maxLinks={maxLinks}
            onMaxLinksChange={setMaxLinks}
            totalRelationships={relationships.length}
            loadedFiles={loadedFiles}
          />
        </Box>
      )}

      {tabIndex === 2 && (
        <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
          <DataTableContainer
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            entities={entities}
            relationships={relationships}
            documents={documents}
            textunits={textunits}
            communities={communities}
            communityReports={communityReports}
            covariates={covariates}
          />
        </Box>
      )}
    </Box>
  );
};

export default GraphDataHandler;
