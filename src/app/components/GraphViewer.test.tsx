import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import GraphViewer from "./GraphViewer";
import SpriteText from "three-spritetext";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { createTheme, ThemeProvider } from "@mui/material";
import { ThemeModeContext } from "../layout/ThemeModeContext";

let mockGraphProps: any;
const mockDistance = jest.fn();
const mockReheat = jest.fn();
const mockGraphApi = {
  d3Force: jest.fn(() => ({ distance: mockDistance })),
  d3ReheatSimulation: mockReheat,
  zoomToFit: jest.fn(),
};

jest.mock("react-force-graph-3d", () => {
  const React = require("react");
  return React.forwardRef((props: any, ref: any) => {
    mockGraphProps = props;
    React.useImperativeHandle(ref, () => mockGraphApi);
    return null;
  });
});
jest.mock("react-force-graph-2d", () => {
  const React = require("react");
  return React.forwardRef((props: any, ref: any) => {
    mockGraphProps = props;
    React.useImperativeHandle(ref, () => mockGraphApi);
    return null;
  });
});
jest.mock("three-spritetext", () => jest.fn(() => ({ position: { set: jest.fn() } })));
jest.mock("three/examples/jsm/renderers/CSS2DRenderer", () => ({
  CSS2DRenderer: jest.fn(),
  CSS2DObject: jest.fn(),
}));
jest.mock("./SearchDrawer", () => () => null);
jest.mock("./DetailDrawer", () => () => null);
jest.mock("./APISearchDrawer", () => () => null);
jest.mock("../api/agent", () => ({ Status: { check: () => new Promise(() => {}) } }));
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Slider: ({ value, onChange, onChangeCommitted, "aria-label": label }: any) => (
    <input type="range" aria-label={label} min={0} max={2000} step="any" value={value}
      onChange={event => onChange(event, Number(event.target.value))}
      onMouseUp={event => onChangeCommitted(event, Number(event.currentTarget.value))} />
  ),
}));

const nodeA = { id: "A", uuid: "a", name: "A", type: "ENTITY", neighbors: [], links: [] };
const nodeB = { id: "B", uuid: "b", name: "B", type: "ENTITY", neighbors: [], links: [] };
const link = { id: "ab", source: "A", target: "B", type: "RELATED" };
const props = {
  data: { nodes: [nodeA, nodeB], links: [link] },
  graphType: "3d" as const,
  isFullscreen: false,
  onToggleFullscreen: jest.fn(),
  onToggleGraphType: jest.fn(),
  includeDocuments: false, includeTextUnits: false, includeCommunities: false, includeCovariates: false,
  onIncludeDocumentsChange: jest.fn(), onIncludeTextUnitsChange: jest.fn(),
  onIncludeCommunitiesChange: jest.fn(), onIncludeCovariatesChange: jest.fn(),
  hasDocuments: false, hasTextUnits: false, hasCommunities: false, hasCovariates: false,
  maxEntities: 500, totalEntities: 2000, onMaxEntitiesChange: jest.fn(),
  maxNodes: 0, onMaxNodesChange: jest.fn(), maxLinks: 0, onMaxLinksChange: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGraphApi.d3Force.mockImplementation(() => ({ distance: mockDistance }));
  (SpriteText as unknown as jest.Mock).mockImplementation(() => ({ position: { set: jest.fn() } }));
});
afterEach(() => jest.restoreAllMocks());

test("Disabled labels do not allocate custom node or link objects", () => {
  render(<GraphViewer {...props} />);
  expect(mockGraphProps.nodeThreeObject).toBeUndefined();
  expect(mockGraphProps.linkThreeObject).toBeUndefined();
  expect(mockGraphProps.linkPositionUpdate).toBeUndefined();
  expect(SpriteText).not.toHaveBeenCalled();
});

test("Hover preserves the base link width and label factories", () => {
  render(<GraphViewer {...props} />);
  fireEvent.click(screen.getByLabelText("Show Node Labels"));
  fireEvent.click(screen.getByLabelText("Show Link Labels"));
  const before = mockGraphProps;
  act(() => mockGraphProps.onLinkHover(link));
  expect(mockGraphProps.linkWidth).toBe(0);
  expect(mockGraphProps.nodeThreeObject).toBe(before.nodeThreeObject);
  expect(mockGraphProps.linkThreeObject).toBe(before.linkThreeObject);
  expect(mockGraphProps.linkPositionUpdate).toBe(before.linkPositionUpdate);
  expect(mockGraphProps.extraRenderers).toBe(before.extraRenderers);
  expect(CSS2DRenderer).toHaveBeenCalledTimes(1);
  expect(mockGraphProps.linkColor(link)).toBe("orange");
});

test("Particles are limited to highlighted links and stop when highlighting is off", () => {
  render(<GraphViewer {...props} />);
  expect(mockGraphProps.linkDirectionalParticles(link)).toBe(0);
  act(() => mockGraphProps.onLinkHover(link));
  expect(mockGraphProps.linkDirectionalParticles(link)).toBe(2);
  expect(mockGraphProps.linkDirectionalParticles({ ...link, id: "other" })).toBe(0);
  fireEvent.click(screen.getByLabelText("Show Highlight"));
  expect(mockGraphProps.linkDirectionalParticles(link)).toBe(0);
});

test("A high degree node animates at most 100 links", () => {
  render(<GraphViewer {...props} />);
  const links = Array.from({ length: 1000 }, (_, id) => ({ ...link, id: String(id) }));
  act(() => mockGraphProps.onNodeHover({ ...nodeA, links }));
  expect(links.filter(item => mockGraphProps.linkDirectionalParticles(item) > 0)).toHaveLength(100);
});

test("Link labels are placed at the midpoint and removed when disabled", () => {
  render(<GraphViewer {...props} />);
  fireEvent.click(screen.getByLabelText("Show Link Labels"));
  const sprite = mockGraphProps.linkThreeObject(link);
  mockGraphProps.linkPositionUpdate(sprite, { start: { x: 0, y: 2, z: 4 }, end: { x: 10, y: 8, z: 6 } });
  expect(sprite.position.set).toHaveBeenCalledWith(5, 5, 5);
  expect(SpriteText).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByLabelText("Show Link Labels"));
  expect(mockGraphProps.linkThreeObject).toBeUndefined();
});

test("The entity limit is applied only when the slider is released", () => {
  render(<GraphViewer {...props} />);
  const slider = screen.getByLabelText("Max Entities");
  fireEvent.change(slider, { target: { value: "1000" } });
  expect(props.onMaxEntitiesChange).not.toHaveBeenCalled();
  fireEvent.mouseUp(slider);
  expect(props.onMaxEntitiesChange).toHaveBeenCalledWith(1000);
});

test("Link spacing changes the link force and restarts a stopped layout in both views", () => {
  const { rerender } = render(<GraphViewer {...props} />);
  expect(mockDistance).toHaveBeenLastCalledWith(30);
  mockReheat.mockClear();
  const slider = screen.getByLabelText("Link spacing");
  fireEvent.change(slider, { target: { value: "3" } });
  expect(mockReheat).not.toHaveBeenCalled();
  fireEvent.mouseUp(slider);
  expect(mockDistance).toHaveBeenLastCalledWith(90);
  expect(mockReheat).toHaveBeenCalledTimes(1);
  rerender(<GraphViewer {...props} graphType="2d" />);
  expect(mockDistance).toHaveBeenLastCalledWith(90);
  expect(mockReheat).toHaveBeenCalledTimes(2);
});

test("Total limits are applied when editing ends", () => {
  render(<GraphViewer {...props} />);
  const nodes = screen.getByLabelText("Max total nodes");
  fireEvent.change(nodes, { target: { value: "1200" } });
  expect(props.onMaxNodesChange).not.toHaveBeenCalled();
  fireEvent.blur(nodes);
  expect(props.onMaxNodesChange).toHaveBeenCalledWith(1200);
  const links = screen.getByLabelText("Max total links");
  fireEvent.change(links, { target: { value: "-2" } });
  fireEvent.blur(links);
  expect(props.onMaxLinksChange).toHaveBeenCalledWith(0);
});

test("Clicking a group expands its members and node focus shows only direct neighbors", () => {
  const data = { nodes: [
    { ...nodeA, type: "CASE" }, { ...nodeB, type: "CASE" },
    { ...nodeA, id: "C", uuid: "c", name: "C", type: "DOCUMENT" },
  ], links: [{ ...link, target: "C" }, { ...link, id: "bc", source: "B", target: "C" }] };
  render(<GraphViewer {...props} data={data} />);
  expect(mockGraphProps.graphData.nodes).toHaveLength(3);
  fireEvent.click(screen.getByRole("button", { name: "Show group overview" }));
  const group = mockGraphProps.graphData.nodes.find((node: any) => node.groupKey);
  expect(group.memberCount).toBe(2);
  expect(mockGraphProps.linkLabel(mockGraphProps.graphData.links[0])).toBe("RELATED: 2 source links (grouped)");
  act(() => mockGraphProps.onNodeClick(group));
  expect(mockGraphProps.graphData.nodes.map((node: any) => node.id)).toEqual(["A", "B", "C"]);
  act(() => mockGraphProps.onNodeClick(mockGraphProps.graphData.nodes[0]));
  fireEvent.click(screen.getByRole("button", { name: "Show selected node and neighbors" }));
  expect(mockGraphProps.graphData.nodes.map((node: any) => node.id)).toEqual(["A", "C"]);
  fireEvent.click(screen.getByRole("button", { name: "Show overview" }));
  expect(mockGraphProps.graphData.nodes).toHaveLength(3);
});

test("Grouping is optional and individual nodes can be restored beside the counts", () => {
  const data = { nodes: [{ ...nodeA, type: "CASE" }, { ...nodeB, type: "CASE" },
    { ...nodeA, id: "C", uuid: "c", type: "DOCUMENT" }], links: [] };
  render(<GraphViewer {...props} data={data} />);
  expect(mockGraphProps.graphData.nodes).toHaveLength(3);
  expect(mockGraphProps.nodeThreeObject).toBeUndefined();
  fireEvent.click(screen.getByRole("button", { name: "Show group overview" }));
  const group = mockGraphProps.graphData.nodes.find((node: any) => node.groupKey);
  expect(group.memberCount).toBe(2);
  expect(screen.getByText(/Grouped view: 1 group dots/)).toBeInTheDocument();
  mockGraphProps.nodeThreeObject(group);
  expect(mockGraphProps.nodeThreeObject(mockGraphProps.graphData.nodes.find((node: any) => !node.groupKey))).toBeUndefined();
  fireEvent.click(screen.getByRole("button", { name: "Show individual nodes" }));
  expect(mockGraphProps.graphData.nodes).toHaveLength(3);
  expect(mockGraphProps.nodeThreeObject).toBeUndefined();
});

test("Group names are drawn in 2D when ordinary node labels are off", () => {
  const data = { nodes: [{ ...nodeA, type: "CASE" }, { ...nodeB, type: "CASE" },
    { ...nodeA, id: "C", uuid: "c", type: "DOCUMENT" }], links: [] };
  render(<GraphViewer {...props} data={data} graphType="2d" />);
  fireEvent.click(screen.getByRole("button", { name: "Show group overview" }));
  const group = mockGraphProps.graphData.nodes.find((node: any) => node.groupKey);
  const ctx = { measureText: () => ({ width: 40 }), beginPath: jest.fn(), moveTo: jest.fn(),
    lineTo: jest.fn(), quadraticCurveTo: jest.fn(), closePath: jest.fn(), fill: jest.fn(), fillText: jest.fn() };
  expect(mockGraphProps.nodeCanvasObjectMode(group)).toBe("after");
  mockGraphProps.nodeCanvasObject({ ...group, x: 0, y: 0 }, ctx);
  expect(ctx.fillText).toHaveBeenCalledWith(group.name, 0, 0);
});

test("Link type controls update the drawing without changing loaded counts", () => {
  render(<GraphViewer {...props} totalEntities={2} totalRelationships={1} />);
  fireEvent.click(screen.getByLabelText("Show RELATED links"));
  expect(mockGraphProps.graphData.links).toHaveLength(0);
  expect(screen.getByText("Loaded relationships: 1")).toBeInTheDocument();
  expect(screen.getByText("Visible: 2 dots, 0 links")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Show RELATED links"));
  expect(mockGraphProps.graphData.links).toHaveLength(1);
});

test("High degree hubs are hidden by default and can be restored", () => {
  const leaves = Array.from({ length: 60 }, (_, i) => ({ ...nodeA, id: String(i), uuid: String(i) }));
  const data = { nodes: [{ ...nodeA, id: "hub" }, ...leaves], links: leaves.map(node => ({ ...link, id: node.id, source: "hub", target: node.id })) };
  render(<GraphViewer {...props} data={data} />);
  expect(mockGraphProps.graphData.nodes).toHaveLength(60);
  expect(mockGraphProps.graphData.links).toHaveLength(0);
  fireEvent.click(screen.getByLabelText("Show high degree hubs (1)"));
  expect(mockGraphProps.graphData.nodes).toHaveLength(61);
  expect(mockGraphProps.graphData.links).toHaveLength(60);
});

test("Loaded file paths and row counts remain visible beside the view counts", () => {
  render(<GraphViewer {...props} loadedFiles={[{ path: "run/output/entities.parquet", schema: "entity", rows: 2000 }]} />);
  expect(screen.getByText("run/output/entities.parquet: 2000 rows")).toBeInTheDocument();
  expect(screen.getByText("Before view filters: 2 nodes, 1 links")).toBeInTheDocument();
});

test("The canvas follows its container in both graph views and full screen", () => {
  let bounds = { width: 900, height: 600 };
  jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
    ...bounds, top: 0, left: 0, right: bounds.width, bottom: bounds.height, x: 0, y: 0, toJSON: () => ({}),
  }));
  const { rerender } = render(<GraphViewer {...props} />);
  expect(mockGraphProps.width).toBe(900);
  expect(mockGraphProps.height).toBe(600);
  bounds = { width: 1600, height: 1000 };
  rerender(<GraphViewer {...props} isFullscreen graphType="2d" />);
  fireEvent(window, new Event("resize"));
  expect(mockGraphProps.width).toBe(1600);
  expect(mockGraphProps.height).toBe(1000);
  expect(screen.getByTestId("graph-viewport")).toHaveStyle({ position: "fixed", height: "100dvh" });
});

test("The camera fits a settled graph once and preserves the camera during hover", () => {
  render(<GraphViewer {...props} />);
  mockGraphApi.zoomToFit.mockClear();
  act(() => mockGraphProps.onEngineStop());
  expect(mockGraphApi.zoomToFit).toHaveBeenCalledTimes(1);
  act(() => mockGraphProps.onLinkHover(link));
  act(() => mockGraphProps.onEngineStop());
  expect(mockGraphApi.zoomToFit).toHaveBeenCalledTimes(1);
});

test("Dark mode updates the canvas and both label types from the full screen control", () => {
  function ThemeViewer() {
    const [mode, setMode] = React.useState<"light" | "dark">("light");
    return <ThemeProvider theme={createTheme({ palette: { mode } })}>
      <ThemeModeContext.Provider value={() => setMode(previous => previous === "light" ? "dark" : "light")}>
        <GraphViewer {...props} isFullscreen />
      </ThemeModeContext.Provider>
    </ThemeProvider>;
  }
  render(<ThemeViewer />);
  expect(mockGraphProps.backgroundColor).toBe("#fff");
  fireEvent.click(screen.getByLabelText("Show Node Labels"));
  fireEvent.click(screen.getByLabelText("Show Link Labels"));
  const lightColor = createTheme().palette.text.primary;
  expect(mockGraphProps.linkThreeObject(link).color).toBe(lightColor);
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
  expect(mockGraphProps.backgroundColor).toBe("#121212");
  expect(mockGraphProps.linkOpacity).toBe(0.45);
  const darkColor = createTheme({ palette: { mode: "dark" } }).palette.text.primary;
  expect(mockGraphProps.linkThreeObject(link).color).toBe(darkColor);
  mockGraphProps.nodeThreeObject(nodeA);
  const label = (CSS2DObject as unknown as jest.Mock).mock.calls.slice(-1)[0][0] as HTMLElement;
  expect(label).toHaveStyle({ color: darkColor });
  expect(label.style.backgroundColor).toBe("rgba(18, 18, 18, 0.88)");
  expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
});

test("Both renderers use community colors for individual nodes", () => {
  const data = { nodes: [{ ...nodeA, communityId: "1" }, { ...nodeB, communityId: "2" }], links: [link] };
  const { rerender } = render(<GraphViewer {...props} data={data} />);
  const colors = mockGraphProps.graphData.nodes.map((node: any) => mockGraphProps.nodeColor(node));
  expect(new Set(colors).size).toBe(2);
  rerender(<GraphViewer {...props} data={data} graphType="2d" />);
  expect(mockGraphProps.graphData.nodes.map((node: any) => mockGraphProps.nodeColor(node))).toEqual(colors);
});
