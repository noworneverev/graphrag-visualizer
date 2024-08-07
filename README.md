# GraphRAG Visualizer
👉 [GraphRAG Visualizer](https://noworneverev.github.io/graphrag-visualizer/)
## Overview
GraphRAG Visualizer is an application designed to visualize Microsoft [GraphRAG](https://github.com/microsoft/graphrag) artifacts. By uploading parquet files generated from the GraphRAG indexing pipeline, users can easily view and analyze data without needing additional software or scripts.

## Features
- **Graph Visualization**: View the graph in 2D or 3D in the "Graph Visualization" tab.
- **Data Tables**: Display data from the parquet files in the "Data Tables" tab.
- **Search Functionality**: Fully supports search, allowing users to focus on specific nodes or relationships.
- **Local Processing**: All artifacts are processed locally on your machine, ensuring data security and privacy.

## Technical Details
The logic for creating relationships for text units, documents, communities, and covariates is derived from the [GraphRAG import Neo4j Cypher notebook](https://github.com/microsoft/graphrag/blob/community/graphrag_import_neo4j_cypher/examples_notebooks/community_contrib/neo4j/graphrag_import_neo4j_cypher.ipynb).