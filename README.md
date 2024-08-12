# GraphRAG Visualizer

👉 [GraphRAG Visualizer](https://noworneverev.github.io/graphrag-visualizer/)<br/>
👉 [GraphRAG Visualizer Demo](https://www.youtube.com/watch?v=Hjx1iTZZtzw)

![demo](public/demo.png)

## Overview
GraphRAG Visualizer is an application designed to visualize Microsoft [GraphRAG](https://github.com/microsoft/graphrag) artifacts. By uploading parquet files generated from the GraphRAG indexing pipeline, users can easily view and analyze data without needing additional software or scripts.

## Features
- **Graph Visualization**: View the graph in 2D or 3D in the "Graph Visualization" tab.
- **Data Tables**: Display data from the parquet files in the "Data Tables" tab.
- **Search Functionality**: Fully supports search, allowing users to focus on specific nodes or relationships.
- **Local Processing**: All artifacts are processed locally on your machine, ensuring data security and privacy.
  

## Using the Search Functionality

Once the [graphrag-api](https://github.com/noworneverev/graphrag-api) server is up and running, you can perform searches directly through the GraphRAG Visualizer. Simply go to the [GraphRAG Visualizer](https://noworneverev.github.io/graphrag-visualizer/) and use the search interface to query the API server. This allows you to easily search and explore data that is hosted on your local server.

![search](public/search.png)

## Graph Data Model
The logic for creating relationships for text units, documents, communities, and covariates is derived from the [GraphRAG import Neo4j Cypher notebook](https://github.com/microsoft/graphrag/blob/community/graphrag_import_neo4j_cypher/examples_notebooks/community_contrib/neo4j/graphrag_import_neo4j_cypher.ipynb).


### Nodes

| Node | Type        |
|-----------|--------------|
| Document  | `RAW_DOCUMENT` |
| Text Unit | `CHUNK`        |
| Community | `COMMUNITY`    |
| Finding   | `FINDING`      |
| Covariate | `COVARIATE`    |
| Entity    | *Varies*       |

### Relationships

| Source Node | Relationship  | Target Node |
|-------------|---------------|-------------|
| Entity      | `RELATED`     | Entity      |
| Text Unit   | `PART_OF`     | Document    |
| Text Unit   | `HAS_ENTITY`  | Entity      |
| Text Unit   | `HAS_COVARIATE` | Covariate |
| Community   | `HAS_FINDING` | Finding     |
| Entity      | `IN_COMMUNITY` | Community  |
