import React from "react";
import {
  Typography,
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

const Introduction: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to the GraphRAG Visualizer
      </Typography>

      <Typography variant="body1" gutterBottom sx={{ color: "error.main" }}>
        If you are using <strong>GraphRAG 0.3.x or below</strong>, please visit
        the legacy site:{" "}
        <Link
          href="https://noworneverev.github.io/graphrag-visualizer-legacy"
          target="_blank"
          rel="noopener"
        >
          GraphRAG Visualizer Legacy
        </Link>
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

      <Box
        component="img"
        src={process.env.PUBLIC_URL + "/demo.png"}
        alt="Demo"
        sx={{ mt: 2, mb: 2, width: "100%" }}
      />

      <Typography variant="h6" gutterBottom>
        Features
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
        <li>
          <Typography variant="body1">
            <strong>Local Processing:</strong> Your artifacts are processed
            locally on your machine. They are not uploaded anywhere, ensuring
            your data remains secure and private.
          </Typography>
        </li>
      </ul>

      <Typography variant="h6" gutterBottom>
        Using the Search Functionality
      </Typography>
      <Typography variant="body1" gutterBottom>
        Once the{" "}
        <Link
          href="https://github.com/noworneverev/graphrag-api"
          target="_blank"
          rel="noopener"
        >
          graphrag-api
        </Link>{" "}
        server is up and running, you can perform searches directly through the
        GraphRAG Visualizer. This allows you to easily search and explore data
        that is hosted on your local server.
      </Typography>

      <Box
        component="img"
        src={process.env.PUBLIC_URL + "/search.png"}
        alt="Search"
        sx={{ mt: 2, mb: 2, width: "100%" }}
      />

      <Typography variant="h6" gutterBottom>
        Graph Data Model
      </Typography>
      <Typography variant="body1" gutterBottom>
        The logic for creating relationships for text units, documents,
        communities, and covariates is derived from the{" "}
        <Link
          href="https://github.com/microsoft/graphrag/blob/main/examples_notebooks/community_contrib/neo4j/graphrag_import_neo4j_cypher.ipynb"
          target="_blank"
          rel="noopener"
        >
          GraphRAG import Neo4j Cypher notebook
        </Link>
        .
      </Typography>

      <Typography variant="h6" gutterBottom>
        Nodes
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Node</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>
                <Chip label="RAW_DOCUMENT" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Text Unit</TableCell>
              <TableCell>
                <Chip label="CHUNK" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Community</TableCell>
              <TableCell>
                <Chip label="COMMUNITY" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Finding</TableCell>
              <TableCell>
                <Chip label="FINDING" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Covariate</TableCell>
              <TableCell>
                <Chip label="COVARIATE" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Entity</TableCell>
              <TableCell>
                <i>Varies</i>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom>
        Relationships
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Source Node</strong>
              </TableCell>
              <TableCell>
                <strong>Relationship</strong>
              </TableCell>
              <TableCell>
                <strong>Target Node</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Entity</TableCell>
              <TableCell>
                <Chip label="RELATED" size="small" />
              </TableCell>
              <TableCell>Entity</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Text Unit</TableCell>
              <TableCell>
                <Chip label="PART_OF" size="small" />
              </TableCell>
              <TableCell>Document</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Text Unit</TableCell>
              <TableCell>
                <Chip label="HAS_ENTITY" size="small" />
              </TableCell>
              <TableCell>Entity</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Text Unit</TableCell>
              <TableCell>
                <Chip label="HAS_COVARIATE" size="small" />
              </TableCell>
              <TableCell>Covariate</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Community</TableCell>
              <TableCell>
                <Chip label="HAS_FINDING" size="small" />
              </TableCell>
              <TableCell>Finding</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Entity</TableCell>
              <TableCell>
                <Chip label="IN_COMMUNITY" size="small" />
              </TableCell>
              <TableCell>Community</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Introduction;
