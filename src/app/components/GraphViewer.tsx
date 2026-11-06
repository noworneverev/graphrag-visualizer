import React, { useState, useCallback, useRef, useEffect, useMemo, useContext } from "react";
import ForceGraph2D from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import {
  CustomGraphData,
  CustomLink,
  CustomNode,
} from "../models/custom-graph-data";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Slider,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import Fuse from "fuse.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { Renderer } from "three";
import SearchDrawer from "./SearchDrawer";
import DetailDrawer from "./DetailDrawer";
import { SearchResult } from "../models/search-result";
import agent from "../api/agent";
import APISearchDrawer from "./APISearchDrawer";
import SpriteText from "three-spritetext";
import GraphViewControls from "./GraphViewControls";
import { buildGraphView, GroupMode } from "../utils/graph-view";
import { LoadedFile } from "../models/loaded-file";
import useElementSize from "../hooks/useElementSize";
import { ThemeModeContext } from "../layout/ThemeModeContext";

type Coords = {
  x: number;
  y: number;
  z: number;
};

interface GraphViewerProps {
  data: CustomGraphData;
  graphType: "2d" | "3d";
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onToggleGraphType: (event: React.ChangeEvent<HTMLInputElement>) => void;
  includeDocuments: boolean;
  onIncludeDocumentsChange: React.Dispatch<React.SetStateAction<boolean>>;
  includeTextUnits: boolean;
  onIncludeTextUnitsChange: React.Dispatch<React.SetStateAction<boolean>>;
  includeCommunities: boolean;
  onIncludeCommunitiesChange: React.Dispatch<React.SetStateAction<boolean>>;
  includeCovariates: boolean;
  onIncludeCovariatesChange: React.Dispatch<React.SetStateAction<boolean>>;
  hasDocuments: boolean;
  hasTextUnits: boolean;
  hasCommunities: boolean;
  hasCovariates: boolean;
  maxEntities: number;
  onMaxEntitiesChange: (value: number) => void;
  totalEntities: number;
  maxNodes: number;
  onMaxNodesChange: (value: number) => void;
  maxLinks: number;
  onMaxLinksChange: (value: number) => void;
  totalRelationships?: number;
  loadedFiles?: LoadedFile[];
}

const NODE_R = 8;

const GraphViewer: React.FC<GraphViewerProps> = ({
  data,
  graphType,
  isFullscreen,
  includeDocuments,
  onIncludeDocumentsChange,
  includeTextUnits,
  onIncludeTextUnitsChange,
  includeCommunities,
  onIncludeCommunitiesChange,
  includeCovariates,
  onIncludeCovariatesChange,
  onToggleFullscreen,
  onToggleGraphType,
  hasDocuments,
  hasTextUnits,
  hasCommunities,
  hasCovariates,
  maxEntities,
  onMaxEntitiesChange,
  totalEntities,
  maxNodes,
  onMaxNodesChange,
  maxLinks,
  onMaxLinksChange,
  totalRelationships = data.links.length,
  loadedFiles = [],
}) => {
  const autoGroup = hasCommunities && totalEntities >= 1000;
  const theme = useTheme();
  const toggleTheme = useContext(ThemeModeContext);
  const { ref: containerRef, width, height } = useElementSize();
  const [highlightNodes, setHighlightNodes] = useState<Set<CustomNode>>(
    new Set()
  );
  const [highlightLinks, setHighlightLinks] = useState<Set<CustomLink>>(
    new Set()
  );
  const [hoverNode, setHoverNode] = useState<CustomNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    (CustomNode | CustomLink)[]
  >([]);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [selectedRelationship, setSelectedRelationship] =
    useState<CustomLink | null>(null);
  const [linkedNodes, setLinkedNodes] = useState<CustomNode[]>([]);
  const [linkedRelationships, setLinkedRelationships] = useState<CustomLink[]>(
    []
  );
  const [showLabels, setShowLabels] = useState(false);
  const [showLinkLabels, setShowLinkLabels] = useState(false);
  const [showHighlight, setShowHighlight] = useState(true);
  const graphRef = useRef<any>();
  const fitPending = useRef(true);
  const extraRenderers = useMemo(() => [new CSS2DRenderer() as any as Renderer], []);
  const [entityLimitDraft, setEntityLimitDraft] = useState(maxEntities);
  const [nodeLimitDraft, setNodeLimitDraft] = useState(String(maxNodes));
  const [linkLimitDraft, setLinkLimitDraft] = useState(String(maxLinks));
  const [linkSpacing, setLinkSpacing] = useState(autoGroup ? 2 : 1);
  const [linkSpacingDraft, setLinkSpacingDraft] = useState(autoGroup ? 2 : 1);

  const [apiDrawerOpen, setApiDrawerOpen] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState<SearchResult | null>(
    null
  );
  const [serverUp, setServerUp] = useState<boolean>(false);

  const [graphData, setGraphData] = useState<CustomGraphData>(data);
  const [showHubs, setShowHubs] = useState(false);
  const [hiddenLinkTypes, setHiddenLinkTypes] = useState<Set<string>>(
    new Set(autoGroup ? ["DECLARES"] : [])
  );
  const [groupMode, setGroupMode] = useState<GroupMode>(autoGroup ? "auto" : "none");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const view = useMemo(() => buildGraphView(graphData, {
    showHubs, hiddenLinkTypes, groupMode, expandedGroups, focusNodeId,
  }), [graphData, showHubs, hiddenLinkTypes, groupMode, expandedGroups, focusNodeId]);
  const nodeValue = useCallback((node: CustomNode) => node.memberCount ? Math.min(16, 1 + Math.log2(node.memberCount)) : 1, []);
  const nodeColor = useCallback((node: CustomNode) => node.color || "#7F7F7F", []);
  const linkLabel = useCallback((link: CustomLink) => link.representedLinkCount === undefined
    ? link.type : `${link.type}: ${link.representedLinkCount} source links (grouped)`, []);
  const fitGraph = useCallback(() => {
    graphRef.current?.zoomToFit?.(400, Math.min(160, width * 0.1, height * 0.1));
  }, [width, height]);
  const handleEngineStop = useCallback(() => {
    if (!fitPending.current) return;
    fitPending.current = false;
    fitGraph();
  }, [fitGraph]);

  useEffect(() => {
    fitPending.current = true;
  }, [view.data, graphType]);

  useEffect(() => {
    const frame = requestAnimationFrame(fitGraph);
    return () => cancelAnimationFrame(frame);
  }, [fitGraph, graphType, isFullscreen]);

  const toggleGroup = (key: string) => setExpandedGroups(previous => {
    const next = new Set(previous);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });

  useEffect(() => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    setHoverNode(null);
    setBottomDrawerOpen(false);
  }, [view.data]);

  useEffect(() => setEntityLimitDraft(maxEntities), [maxEntities]);
  useEffect(() => setNodeLimitDraft(String(maxNodes)), [maxNodes]);
  useEffect(() => setLinkLimitDraft(String(maxLinks)), [maxLinks]);

  useEffect(() => {
    const linkForce = graphRef.current?.d3Force("link");
    if (linkForce) {
      linkForce.distance(30 * linkSpacing);
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphType, view.data, linkSpacing]);

  const initialGraphData = useRef<CustomGraphData>(data);

  useEffect(() => {
    setGraphData(data);
    initialGraphData.current = data;
    setSelectedNode(null);
    setSelectedRelationship(null);
    setFocusNodeId(null);
    setExpandedGroups(new Set());
    setHiddenLinkTypes(new Set());
    setApiSearchResults(null);
  }, [data]);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const toggleApiDrawer = (open: boolean) => () => {
    setApiDrawerOpen(open);
  };

  const handleApiSearch = async (
    query: string,
    searchType: "local" | "global"
  ) => {
    try {
      const data: SearchResult =
        searchType === "local"
          ? await agent.Search.local(query)
          : await agent.Search.global(query);

      setApiSearchResults(data);
      // Process the search result to update the graph data
      updateGraphData(data.context_data);
    } catch (err) {
      console.error("An error occurred during the API search.", err);
    } finally {
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await agent.Status.check();
      if (response.status === "Server is up and running") {
        setServerUp(true);
      } else {
        setServerUp(false);
      }
    } catch (error) {
      setServerUp(false);
    }
  };

  const updateGraphData = (contextData: any) => {
    if (!contextData) return;

    const newNodes: CustomNode[] = [];
    const newLinks: CustomLink[] = [];

    const baseGraphData = initialGraphData.current;

    // Assuming contextData has keys like entities, reports, relationships, sources
    Object.entries(contextData).forEach(([key, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (key === "relationships") {
            // Handle links
            const existingLink = baseGraphData.links.find(
              (link) =>
                link.human_readable_id?.toString() === item.id.toString()
            );

            if (existingLink) {
              newLinks.push(existingLink);
            }
          } else if (key === "entities") {
            const existingNode = baseGraphData.nodes.find(
              (node) =>
                node.human_readable_id?.toString() === item.id.toString() &&
                !node.covariate_type
            );
            if (existingNode) {
              newNodes.push(existingNode);
            }
          } else if (key === "reports") {
            const existingNode = baseGraphData.nodes.find(
              (node) => node.uuid === item.id.toString()
            );
            if (existingNode) {
              newNodes.push(existingNode);
            }
          } else if (key === "sources") {
            const existingNode = baseGraphData.nodes.find(
              (node) => node.text?.toString() === item.text
            );
            if (existingNode) {
              newNodes.push(existingNode);
            }
          } else if (key === "covariates" || key === "claims") {
            const existingNode = baseGraphData.nodes.find(
              (node) =>
                node.human_readable_id?.toString() === item.id.toString() &&
                node.covariate_type
            );
            if (existingNode) {
              newNodes.push(existingNode);
            }
          }
        });
      }
    });

    // Update the graph data with the new nodes and links
    const updatedGraphData: CustomGraphData = {
      nodes: [...newNodes],
      links: [...newLinks],
    };

    // Set the updated data to trigger re-render
    setGraphData(updatedGraphData);
  };

  const fuse = useMemo(() => new Fuse([...view.data.nodes, ...view.data.links], {
    keys: [
      "uuid",
      "id",
      "name",
      "type",
      "description",
      "source",
      "target",
      "title",
      "summary",
    ],
    threshold: 0.3,
  }), [view.data]);

  const handleNodeHover = useCallback((node: CustomNode | null) => {
    const newHighlightNodes = new Set<CustomNode>();
    const newHighlightLinks = new Set<CustomLink>();

    if (node) {
      newHighlightNodes.add(node);
      node.neighbors?.forEach((neighbor) => newHighlightNodes.add(neighbor));
      node.links?.forEach((link) => newHighlightLinks.add(link));
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
    setHoverNode(node);
  }, []);

  const handleLinkHover = useCallback((link: CustomLink | null) => {
    const newHighlightNodes = new Set<CustomNode>();
    const newHighlightLinks = new Set<CustomLink>();

    if (link) {
      newHighlightLinks.add(link);
      if (typeof link.source !== "string") newHighlightNodes.add(link.source);
      if (typeof link.target !== "string") newHighlightNodes.add(link.target);
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, []);

  const paintRing = useCallback(
    (node: CustomNode, ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, NODE_R * 1.4, 0, 2 * Math.PI, false);
      if (highlightNodes.has(node)) {
        ctx.fillStyle = node === hoverNode ? "red" : "orange";
        ctx.globalAlpha = 1; // full opacity
      } else {
        ctx.fillStyle = "gray";
        ctx.globalAlpha = 0.3; // reduced opacity for non-highlighted nodes
      }
      ctx.fill();
      ctx.globalAlpha = 1; // reset alpha for other drawings
    },
    [hoverNode, highlightNodes]
  );

  const handleSearch = () => {
    const results = fuse.search(searchTerm).map((result) => result.item);
    const nodeResults = results.filter((item) => "neighbors" in item);
    const linkResults = results.filter(
      (item) => "source" in item && "target" in item
    );
    setSearchResults([...nodeResults, ...linkResults]);
    setRightDrawerOpen(true);
  };

  const toggleDrawer = (open: boolean) => () => {
    setRightDrawerOpen(open);
  };

  const handleFocusButtonClick = (node: CustomNode) => {
    if (node.groupKey) {
      toggleGroup(node.groupKey);
      setRightDrawerOpen(false);
      return;
    }
    handleNodeHover(node);
    setSelectedNode(node);
    if (graphRef.current && node.x !== undefined && node.y !== undefined) {
      if (graphType === "2d") {
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(8, 1000);
      } else {
        graphRef.current.cameraPosition(
          { x: node.x, y: node.y, z: (node.z || 0) + 300 },
          { x: node.x, y: node.y, z: node.z || 0 },
          1000
        );
      }
    }

    setRightDrawerOpen(false);
  };

  const handleFocusLinkClick = (link: CustomLink) => {
    const newHighlightNodes = new Set<CustomNode>();
    const newHighlightLinks = new Set<CustomLink>();

    newHighlightLinks.add(link);
    let sourceNode: CustomNode | undefined;
    let targetNode: CustomNode | undefined;

    if (typeof link.source !== "string") {
      newHighlightNodes.add(link.source);
      sourceNode = link.source;
    }

    if (typeof link.target !== "string") {
      newHighlightNodes.add(link.target);
      targetNode = link.target;
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);

    if (
      graphRef.current &&
      sourceNode &&
      targetNode &&
      sourceNode.x &&
      targetNode.x &&
      sourceNode.y &&
      targetNode.y
    ) {
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;

      if (graphType === "2d") {
        graphRef.current.centerAt(midX, midY, 1000);
        graphRef.current.zoom(8, 1000);
      } else {
        graphRef.current.cameraPosition(
          { x: midX, y: midY, z: 300 }, // new position
          { x: midX, y: midY, z: 0 }, // lookAt
          3000 // ms transition duration
        );
      }
    }

    // Simulate mouse hover on the focused link
    setTimeout(() => {
      handleLinkHover(link);
    }, 1000); // Adjust delay as needed

    setRightDrawerOpen(false);
  };

  const handleNodeClick = (node: CustomNode) => {
    if (node.groupKey) {
      toggleGroup(node.groupKey);
      return;
    }
    setSelectedRelationship(null);
    setSelectedNode(node);
    setLinkedNodes(node.neighbors || []);
    setLinkedRelationships(node.links || []);
    setBottomDrawerOpen(true);
  };

  const handleLinkClick = (link: CustomLink) => {
    setSelectedNode(null);
    setSelectedRelationship(link);
    const linkSource =
      typeof link.source === "object"
        ? (link.source as CustomNode).id
        : link.source;
    const linkTarget =
      typeof link.target === "object"
        ? (link.target as CustomNode).id
        : link.target;
    const sourceNode = view.data.nodes.find((node) => node.id === linkSource);
    const targetNode = view.data.nodes.find((node) => node.id === linkTarget);
    if (sourceNode && targetNode) {
      const linkedNodes = [sourceNode, targetNode];
      setLinkedNodes(linkedNodes);
      const linkedRelationships = [link];
      setLinkedRelationships(linkedRelationships);
      setBottomDrawerOpen(true);
    }
  };

  const getBackgroundColor = () => theme.palette.background.default;

  const getLinkColor = (link: CustomLink) =>
    theme.palette.mode === "dark" ? "gray" : "lightgray";

  const get3DLinkColor = useCallback((link: CustomLink) =>
    showHighlight && highlightLinks.has(link)
      ? "orange"
      : theme.palette.mode === "dark" ? "lightgray" : "gray",
    [showHighlight, highlightLinks, theme.palette.mode]
  );

  const particleLinks = useMemo(() => new Set(Array.from(highlightLinks).slice(0, 100)), [highlightLinks]);
  const get3DParticleCount = useCallback((link: CustomLink) =>
    showHighlight && particleLinks.has(link) ? 2 : 0,
    [showHighlight, particleLinks]
  );

  const getlinkDirectionalParticleColor = (link: CustomLink) =>
    theme.palette.mode === "dark" ? "lightgray" : "gray";

  const renderNodeLabel = (node: CustomNode, ctx: CanvasRenderingContext2D) => {
    if (!showLabels && !node.groupKey) return;

    const label = node.name || "";
    const fontSize = 4;
    const padding = 2;
    ctx.font = `${fontSize}px Sans-Serif`;

    // Set the styles based on the theme mode
    const backgroundColor =
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0.6)"
        : "rgba(255, 255, 255, 0.6)";

    // Calculate label dimensions
    const textWidth = ctx.measureText(label).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = fontSize + padding * 2;

    if (node.x !== undefined && node.y !== undefined) {
      // Draw the background rectangle with rounded corners
      ctx.fillStyle = backgroundColor;
      ctx.beginPath();
      ctx.moveTo(node.x - boxWidth / 2 + 5, node.y - boxHeight / 2);
      ctx.lineTo(node.x + boxWidth / 2 - 5, node.y - boxHeight / 2);
      ctx.quadraticCurveTo(
        node.x + boxWidth / 2,
        node.y - boxHeight / 2,
        node.x + boxWidth / 2,
        node.y - boxHeight / 2 + 5
      );
      ctx.lineTo(node.x + boxWidth / 2, node.y + boxHeight / 2 - 5);
      ctx.quadraticCurveTo(
        node.x + boxWidth / 2,
        node.y + boxHeight / 2,
        node.x + boxWidth / 2 - 5,
        node.y + boxHeight / 2
      );
      ctx.lineTo(node.x - boxWidth / 2 + 5, node.y + boxHeight / 2);
      ctx.quadraticCurveTo(
        node.x - boxWidth / 2,
        node.y + boxHeight / 2,
        node.x - boxWidth / 2,
        node.y + boxHeight / 2 - 5
      );
      ctx.lineTo(node.x - boxWidth / 2, node.y - boxHeight / 2 + 5);
      ctx.quadraticCurveTo(
        node.x - boxWidth / 2,
        node.y - boxHeight / 2,
        node.x - boxWidth / 2 + 5,
        node.y - boxHeight / 2
      );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = theme.palette.text.primary;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, node.x, node.y);
    }
  };

  const nodeThreeObject = useCallback((node: CustomNode) => {
    try {
      const nodeEl = document.createElement("div");
      nodeEl.textContent = node.name || node.id;
      nodeEl.style.color = theme.palette.text.primary;
      nodeEl.style.backgroundColor = alpha(theme.palette.background.paper, 0.88);
      nodeEl.style.padding = "2px 4px";
      nodeEl.style.borderRadius = "4px";
      nodeEl.style.fontSize = "12px";
      nodeEl.className = "node-label";

      return new CSS2DObject(nodeEl);
    } catch (error) {
      console.error("Error creating 3D object:", error);
      return new CSS2DObject(document.createElement("div"));
    }
  }, [theme.palette.text.primary, theme.palette.background.paper]);

  const groupNodeThreeObject = useCallback((node: CustomNode) =>
    node.groupKey ? nodeThreeObject(node) : undefined, [nodeThreeObject]);

  const linkThreeObject = useCallback((link: CustomLink) => {
    const sprite = new SpriteText(`${link.type}`);
    sprite.color = theme.palette.text.primary;
    sprite.textHeight = 1.5;
    return sprite;
  }, [theme.palette.text.primary]);

  const linkPositionUpdate = useCallback((sprite: any, { start, end }: { start: Coords; end: Coords }) => {
    sprite.position.set(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      (start.z + end.z) / 2
    );
  }, []);

  const localSearchEnabled = hasCovariates
    ? includeTextUnits && includeCommunities && includeCovariates
    : includeTextUnits && includeCommunities;

  const clearSearchResults = () => {
    setGraphData(initialGraphData.current);
    setApiSearchResults(null);
  };

  return (
    <Box
      ref={containerRef}
      data-testid="graph-viewport"
      sx={{
        height: isFullscreen ? "100dvh" : "100%",
        width: "100%",
        position: isFullscreen ? "fixed" : "relative",
        top: 0,
        left: 0,
        zIndex: isFullscreen ? 1300 : "auto",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        backgroundColor: getBackgroundColor(),
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "flex-end",
          maxHeight: "calc(100% - 20px)",
          overflowY: "auto",
          paddingRight: 1,
          padding: 2,
          borderRadius: 1,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            variant="contained"
            onClick={toggleDrawer(true)}
            startIcon={<SearchIcon />}
          >
            Search Nodes/Links
          </Button>
          {/* <FormControlLabel
            control={
              <Switch
                checked={graphType === "3d"}
                onChange={onToggleGraphType}
              />
            }
            label="3D View"
          /> */}
          {/* <FormControlLabel
            control={
              <Switch
                checked={showLabels}
                onChange={() => setShowLabels(!showLabels)}
              />
            }
            label="Show Node Labels"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showLinkLabels}
                onChange={() => setShowLinkLabels(!showLinkLabels)}
              />
            }
            label="Show Relationship Labels"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showHighlight}
                onChange={() => setShowHighlight(!showHighlight)}
              />
            }
            label="Show Highlight"
          /> */}
          <Tooltip title={isFullscreen ? "Exit Full Screen" : "Full Screen"}>
            <IconButton onClick={onToggleFullscreen} color="inherit">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}>
            <IconButton aria-label={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}
              onClick={toggleTheme} color="inherit">
              {theme.palette.mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <GraphViewControls
          showHubs={showHubs} onShowHubsChange={setShowHubs}
          hubCount={view.hubCount} hubThreshold={view.hubThreshold}
          types={view.types} hiddenTypes={hiddenLinkTypes}
          onToggleType={type => setHiddenLinkTypes(previous => {
            const next = new Set(previous);
            if (next.has(type)) next.delete(type); else next.add(type);
            return next;
          })}
          groupMode={groupMode} onGroupModeChange={setGroupMode}
          hasCommunities={graphData.nodes.some(node => node.communityId !== undefined)}
          groups={view.groups} expandedGroups={expandedGroups} onToggleGroup={toggleGroup}
          onCollapseAll={() => setExpandedGroups(new Set())}
          onExpandAll={() => setExpandedGroups(new Set(view.groups.map(group => group.key)))}
          selectedName={selectedNode?.name}
          focusName={focusNodeId === null ? undefined : graphData.nodes.find(node => node.id === focusNodeId)?.name || focusNodeId}
          onFocus={() => { if (selectedNode) setFocusNodeId(selectedNode.id); }}
          onClearFocus={() => setFocusNodeId(null)}
          onFit={() => { fitPending.current = false; fitGraph(); }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={graphType === "3d"}
                onChange={onToggleGraphType}
              />
            }
            label="3D View"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showLabels}
                onChange={() => setShowLabels(!showLabels)}
              />
            }
            label="Show Node Labels"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showLinkLabels}
                onChange={() => setShowLinkLabels(!showLinkLabels)}
              />
            }
            label="Show Link Labels"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showHighlight}
                onChange={() => setShowHighlight(!showHighlight)}
              />
            }
            label="Show Highlight"
          />
        </Box>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeDocuments}
                onChange={() => onIncludeDocumentsChange(!includeDocuments)}
                disabled={!hasDocuments || apiSearchResults !== null}
              />
            }
            label="Include Documents"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeTextUnits}
                // onChange={() => onIncludeTextUnitsChange(!includeTextUnits)}
                onChange={() => {
                  if (!includeTextUnits) {
                    onIncludeTextUnitsChange(true);
                  } else if (includeTextUnits && !includeCovariates) {
                    onIncludeTextUnitsChange(false);
                  } else {
                    onIncludeTextUnitsChange(false);
                    onIncludeCovariatesChange(false); // Uncheck Covariates when Text Units is unchecked
                  }
                }}
                disabled={!hasTextUnits || apiSearchResults !== null}
              />
            }
            label="Include Text Units"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeCommunities}
                onChange={() => onIncludeCommunitiesChange(!includeCommunities)}
                disabled={!hasCommunities || apiSearchResults !== null}
              />
            }
            label="Include Communities"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={includeCovariates}
                onChange={() => {
                  if (!includeCovariates) {
                    if (!includeTextUnits) {
                      onIncludeTextUnitsChange(true);
                    }
                    onIncludeCovariatesChange(true);
                  } else {
                    onIncludeCovariatesChange(false);
                  }
                }}
                disabled={!hasCovariates || apiSearchResults !== null}
              />
            }
            label="Include Covariates"
          />
        </FormGroup>

        {totalEntities > 0 && (
          <Box sx={{ width: 200, mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Max Entities: {entityLimitDraft === 0 ? "All" : entityLimitDraft}
              {totalEntities > 0 && ` / ${totalEntities}`}
            </Typography>
            <Slider
              aria-label="Max Entities"
              value={entityLimitDraft}
              onChange={(_, value) => setEntityLimitDraft(value as number)}
              onChangeCommitted={(_, value) => onMaxEntitiesChange(value as number)}
              min={0}
              max={Math.max(totalEntities, 1000)}
              step={50}
              marks={[
                { value: 0, label: "All" },
                { value: 500, label: "500" },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => (value === 0 ? "All" : value)}
              disabled={apiSearchResults !== null}
            />
          </Box>
        )}
        <Box sx={{ width: 200 }}>
          <Typography variant="body2">Link spacing: {linkSpacingDraft}×</Typography>
          <Slider
            aria-label="Link spacing"
            value={linkSpacingDraft}
            min={0.25}
            max={10}
            step={0.25}
            onChange={(_, value) => setLinkSpacingDraft(value as number)}
            onChangeCommitted={(_, value) => setLinkSpacing(value as number)}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption">Higher values spread linked nodes apart.</Typography>
        </Box>
        <TextField
          label="Max total nodes"
          type="number"
          size="small"
          value={nodeLimitDraft}
          inputProps={{ min: 0, step: 100 }}
          helperText="0 = All. Includes all node types."
          disabled={apiSearchResults !== null}
          onChange={(event) => setNodeLimitDraft(event.target.value)}
          onBlur={() => {
            const value = Number(nodeLimitDraft);
            const limit = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : maxNodes;
            setNodeLimitDraft(String(limit));
            onMaxNodesChange(limit);
          }}
          onKeyDown={(event) => { if (event.key === "Enter") (event.target as HTMLInputElement).blur(); }}
        />
        <TextField
          label="Max total links"
          type="number"
          size="small"
          value={linkLimitDraft}
          inputProps={{ min: 0, step: 100 }}
          helperText="0 = All. Applied after the node limit."
          disabled={apiSearchResults !== null}
          onChange={(event) => setLinkLimitDraft(event.target.value)}
          onBlur={() => {
            const value = Number(linkLimitDraft);
            const limit = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : maxLinks;
            setLinkLimitDraft(String(limit));
            onMaxLinksChange(limit);
          }}
          onKeyDown={(event) => { if (event.key === "Enter") (event.target as HTMLInputElement).blur(); }}
        />
      </Box>

      <APISearchDrawer
        apiDrawerOpen={apiDrawerOpen}
        toggleDrawer={toggleApiDrawer}
        handleApiSearch={handleApiSearch}
        apiSearchResults={apiSearchResults}
        localSearchEnabled={localSearchEnabled}
        globalSearchEnabled={includeCommunities}
        hasCovariates={hasCovariates}
        serverUp={serverUp}
      />

      <SearchDrawer
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        searchResults={searchResults}
        rightDrawerOpen={rightDrawerOpen}
        toggleDrawer={toggleDrawer}
        handleFocusButtonClick={handleFocusButtonClick}
        handleNodeClick={handleNodeClick}
        handleFocusLinkClick={handleFocusLinkClick}
        handleLinkClick={handleLinkClick}
      />

      <DetailDrawer
        bottomDrawerOpen={bottomDrawerOpen}
        setBottomDrawerOpen={setBottomDrawerOpen}
        selectedNode={selectedNode}
        selectedRelationship={selectedRelationship}
        linkedNodes={linkedNodes}
        linkedRelationships={linkedRelationships}
      />

      {graphType === "2d" ? (
        <ForceGraph2D
          ref={graphRef}
          width={width}
          height={height}
          onEngineStop={handleEngineStop}
          graphData={view.data}
          nodeColor={nodeColor}
          nodeVal={nodeValue}
          linkLabel={linkLabel}
          nodeRelSize={NODE_R}
          autoPauseRedraw={false}
          linkWidth={(link) =>
            showHighlight && highlightLinks.has(link) ? 5 : 1
          }
          linkDirectionalParticles={get3DParticleCount}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={
            showHighlight ? getlinkDirectionalParticleColor : undefined
          }
          nodeCanvasObjectMode={(node) =>
            showLabels || node.groupKey
              ? "after"
              : showHighlight && highlightNodes.has(node) ? "before" : undefined
          }
          nodeCanvasObject={(node, ctx) => {
            if (showHighlight && highlightNodes.has(node)) {
              paintRing(node as CustomNode, ctx);
            }
            if (showLabels || node.groupKey) {
              renderNodeLabel(node as CustomNode, ctx);
            }
          }}
          linkCanvasObjectMode={() => (showLinkLabels ? "after" : undefined)}
          linkCanvasObject={(link, ctx) => {
            if (showLinkLabels) {
              const label = link.type || "";
              const fontSize = 4;
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle =
                theme.palette.mode === "dark" ? "lightgray" : "darkgray";
              const source =
                typeof link.source !== "string"
                  ? (link.source as CustomNode)
                  : null;
              const target =
                typeof link.target !== "string"
                  ? (link.target as CustomNode)
                  : null;

              if (
                source &&
                target &&
                source.x !== undefined &&
                target.x !== undefined &&
                source.y !== undefined &&
                target.y !== undefined
              ) {
                const textWidth = ctx.measureText(label).width;
                const posX = (source.x + target.x) / 2 - textWidth / 2;
                const posY = (source.y + target.y) / 2;
                ctx.fillText(label, posX, posY);
              }
            }
          }}
          onNodeHover={showHighlight ? handleNodeHover : undefined}
          onLinkHover={showHighlight ? handleLinkHover : undefined}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          backgroundColor={getBackgroundColor()}
          linkColor={getLinkColor}
        />
      ) : (
        <ForceGraph3D
          ref={graphRef}
          width={width}
          height={height}
          onEngineStop={handleEngineStop}
          extraRenderers={extraRenderers}
          graphData={view.data}
          nodeColor={nodeColor}
          nodeVal={nodeValue}
          linkLabel={linkLabel}
          nodeRelSize={NODE_R}
          linkWidth={0}
          linkDirectionalParticles={get3DParticleCount}
          linkDirectionalParticleWidth={2}
          nodeThreeObject={showLabels ? nodeThreeObject
            : view.collapsedGroupCount > 0 ? groupNodeThreeObject as typeof nodeThreeObject : undefined}
          nodeThreeObjectExtend={true}
          onNodeHover={showHighlight ? handleNodeHover : undefined}
          onLinkHover={showHighlight ? handleLinkHover : undefined}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          backgroundColor={getBackgroundColor()}
          linkColor={get3DLinkColor}
          linkOpacity={theme.palette.mode === "dark" ? 0.45 : 0.35}
          linkThreeObjectExtend={true}
          linkThreeObject={showLinkLabels ? linkThreeObject : undefined}
          linkPositionUpdate={showLinkLabels ? linkPositionUpdate : undefined}
        />
      )}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
          maxWidth: 280,
          maxHeight: "calc(100% - 20px)",
          overflowY: "auto",
          padding: 1,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="body2">Loaded entities: {totalEntities}</Typography>
        <Typography variant="body2">Loaded relationships: {totalRelationships}</Typography>
        <Typography variant="body2">Before view filters: {graphData.nodes.length} nodes, {graphData.links.length} links</Typography>
        <Typography variant="body2">Visible: {view.data.nodes.length} dots, {view.data.links.length} links</Typography>
        {view.collapsedGroupCount > 0 && <Typography variant="body2">
          Grouped view: {view.collapsedGroupCount} group dots, {view.data.nodes.length - view.collapsedGroupCount} individual nodes.
          Click a named group to expand it.
        </Typography>}
        {groupMode !== "none" && <Button variant="contained" onClick={() => setGroupMode("none")}>
          Show individual nodes
        </Button>}
        {groupMode === "none" && <Button variant="outlined" onClick={() => setGroupMode("auto")}>
          Show group overview
        </Button>}
        {view.groups.length > 0 && <Typography variant="caption">
          {view.mode === "community" ? "Community" : "Type"} groups represent {view.representedNodes} nodes and {view.representedLinks} links. Internal group links are hidden.
        </Typography>}
        {view.data.nodes.length === 0 && <Typography role="status">No nodes match this view. Show hubs or change the filters.</Typography>}
        <Typography variant="caption">Screen distance does not measure meaning or importance.</Typography>
        {loadedFiles.length > 0 && <details>
          <summary>Loaded files ({loadedFiles.length})</summary>
          {loadedFiles.map(file => <Typography key={file.schema} variant="caption" component="p" sx={{ overflowWrap: "anywhere" }}>
            {file.path}: {file.rows} rows
          </Typography>)}
        </details>}
        <Button
          variant="contained"
          onClick={toggleApiDrawer(true)}
          startIcon={<SearchIcon />}
        >
          Ask Query (Local/Global Search)
        </Button>
        <Button
          variant="contained"
          onClick={clearSearchResults}
          startIcon={<DeleteIcon />}
          color="warning"
          disabled={apiSearchResults === null}
        >
          Clear Query Results
        </Button>
      </Box>
    </Box>
  );
};

export default GraphViewer;
