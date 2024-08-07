import React from "react";
import { Typography, Box, Link } from "@mui/material";

const Introduction: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to the GraphRAG Visualizer
      </Typography>

      <Typography variant="h6" gutterBottom>
        Overview
      </Typography>
      <Typography variant="body1" gutterBottom>
        This application visualizes Microsoft{" "}
        <Link
          href="https://microsoft.github.io/graphrag/"
          target="_blank"
          rel="noopener"
        >
          GraphRAG
        </Link>{" "}
        artifacts. Simply upload the parquet files to visualize the data without
        needing additional software like Gephi, Neo4j, or Jupyter Notebook.
      </Typography>

      <Typography variant="h6" gutterBottom>
        Features
      </Typography>
      <Typography variant="body1" gutterBottom>
        The application offers:
      </Typography>
      <ul>
        <li>
          <Typography variant="body1">
            <strong>Graph Visualization:</strong> View the graph in 2D or 3D in
            the "Graph Visualization" tab.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Data Tables:</strong> Display data from the parquet files in
            the "Data Tables" tab.
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>Search Functionality:</strong> Fully supports search,
            allowing users to focus on specific nodes or relationships.
          </Typography>
        </li>
      </ul>

      <Typography variant="h6" gutterBottom>
        Technical Details
      </Typography>
      <Typography variant="body1" gutterBottom>
        The logic for creating relationships for text units, documents,
        communities, and covariates is derived from the GraphRAG import Neo4j
        Cypher notebook. You can find the notebook{" "}
        <Link
          href="https://github.com/microsoft/graphrag/blob/community/graphrag_import_neo4j_cypher/examples_notebooks/community_contrib/neo4j/graphrag_import_neo4j_cypher.ipynb"
          target="_blank"
          rel="noopener"
        >
          here
        </Link>
        .
      </Typography>
    </Box>
  );
};

export default Introduction;
