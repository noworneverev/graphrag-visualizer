import { useEffect, useRef, type MutableRefObject } from "react";
import { forceCollide } from "d3-force";
import { CustomGraphData, CustomNode } from "../models/custom-graph-data";

const NODE_R = 8;

export function useGraphForces(
  graphRef: MutableRefObject<any>,
  getNodeSize: (node: CustomNode) => number,
  graphData: CustomGraphData,
) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!graphRef.current) return;

    graphRef.current.d3Force(
      "collide",
      forceCollide((node: any) => {
        const size = getNodeSize(node as CustomNode);
        return Math.sqrt(size) * NODE_R + 8;
      }),
    );
    graphRef.current.d3Force("charge")?.strength(-100);

    if (initialized.current) {
      graphRef.current.d3ReheatSimulation();
    }
    initialized.current = true;
  }, [graphRef, graphData, getNodeSize]);
}
