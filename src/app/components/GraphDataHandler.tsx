import React, { useState, useEffect } from "react";
import GraphViewer from "./GraphViewer";
import { Box, Container, Tab, Tabs } from "@mui/material";
import { useDropzone } from "react-dropzone";
import DropZone from "./DropZone";
import Introduction from "./Introduction";
import useFileHandler from "../hooks/useFileHandler";
import useGraphData from "../hooks/useGraphData";
import DataTableContainer from "./DataTableContainer";
import { useTranslation } from 'react-i18next';
import AWS from 'aws-sdk';

// 配置 Minio 客户端
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_MINIO_ACCESS_KEY, // 设置环境变量或直接传值
  secretAccessKey: process.env.REACT_APP_MINIO_SECRET_KEY,
  endpoint: process.env.REACT_APP_MINIO_ENDPOINT, // Minio 的 S3 兼容地址
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});


const GraphDataHandler: React.FC<{ categary: string|null }> = ({ categary }) => {
  const { t } = useTranslation('layout');
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

  const {
    entities,
    relationships,
    documents,
    textunits,
    communities,
    covariates,
    communityReports,
    handleFilesRead,
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
    includeCovariates
  );

  const hasDocuments = documents.length > 0;
  const hasTextUnits = textunits.length > 0;
  const hasCommunities = communities.length > 0;
  const hasCovariates = covariates.length > 0;

  useEffect(() => {
    if (entities.length > 0) {
      setTabIndex(1);
    }
  }, [entities]);

  useEffect(() => {
    if (categary) {
      // 从 Minio 加载数据
      loadParquetFilesFromMinio(categary);
    }
  }, [categary]);
  
  // 加载 Parquet 文件
  async function loadParquetFilesFromMinio(categary: string) {
    const bucketName = process.env.REACT_APP_MINIO_BUCKET || 'graphrag'
    try {
      const params = {
        Bucket: bucketName,
        Prefix: categary,  // categary作为目录路径前缀
      };

      const objects = await s3.listObjectsV2(params).promise();
      const buffers: { name: string, buffer: ArrayBuffer }[] = [];
      for (const object of objects.Contents || []) {
        if (object.Key && object.Key.endsWith(".parquet")) {
          const getObjectParams = {
            Bucket: bucketName,
            Key: object.Key!,
          };

          const data = await s3.getObject(getObjectParams).promise();

          let arrayBuffer;
          if (data.Body instanceof Uint8Array) {
            arrayBuffer = data.Body.buffer;  // 转换为 ArrayBuffer
          } else if (data.Body instanceof ArrayBuffer) {
            arrayBuffer = data.Body;  // 已经是 ArrayBuffer
          } else {
            console.error("Unknown data type from S3");
            continue;  // 跳过未知类型
          }

          const lastSlashIndex = object.Key.lastIndexOf("/");
          const fileName = lastSlashIndex !== -1 
            ? object.Key.slice(lastSlashIndex + 1)  // 仅保留文件名部分
            : object.Key;  // 如果没有斜杠，则整个就是文件名
          // 将数据添加到数组中
          buffers.push({
            name: fileName,
            buffer: arrayBuffer,
          });
        }
      }
      await handleFilesRead(buffers);

    } catch (error) {
      console.error('Error loading parquet files from Minio:', error);
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    handleFilesRead(acceptedFiles);
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
  };

  const toggleGraphType = () => {
    setGraphType((prevType) => (prevType === "2d" ? "3d" : "2d"));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <Tabs value={tabIndex} onChange={handleChange} centered>
        <Tab label={t('tabs.uploadArtifacts')} />
        <Tab label={t('tabs.graphVisualization')} />
        <Tab label={t('tabs.dataTables')} />
      </Tabs>
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
          p={3}
          sx={{
            height: isFullscreen ? "100vh" : "calc(100vh - 64px)",
            width: isFullscreen ? "100vw" : "100%",
            position: isFullscreen ? "fixed" : "relative",
            top: 0,
            left: 0,
            zIndex: isFullscreen ? 1300 : "auto",
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
    </>
  );
};

export default GraphDataHandler;
