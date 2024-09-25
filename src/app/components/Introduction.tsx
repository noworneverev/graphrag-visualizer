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
import { useTranslation } from 'react-i18next';

const Introduction: React.FC = () => {
  const { t } = useTranslation('introduction'); // 不使用命名空间

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('welcome')}
      </Typography>

      <Typography variant="h6" gutterBottom>
        {t('overview')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t('overviewDescription')}{" "}
        <Link
          href="https://microsoft.github.io/graphrag/"
          target="_blank"
          rel="noopener"
        >
          GraphRAG
        </Link>{" "}
        {t('overviewDescription2')}
      </Typography>

      <Box
        component="img"
        src={process.env.PUBLIC_URL + "/demo.png"}
        alt={t('demoImageAlt')}
        sx={{ mt: 2, mb: 2, width: "100%" }}
      />

      <Typography variant="h6" gutterBottom>
        {t('features')}
      </Typography>
      <ul>
        <li>
          <Typography variant="body1">
            <strong>{t('feature1Title')}</strong> {t('feature1Description')}
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>{t('feature2Title')}</strong> {t('feature2Description')}
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>{t('feature3Title')}</strong> {t('feature3Description')}
          </Typography>
        </li>
        <li>
          <Typography variant="body1">
            <strong>{t('feature4Title')}</strong> {t('feature4Description')}
          </Typography>
        </li>
      </ul>

      <Typography variant="h6" gutterBottom>
        {t('usingSearchFunctionality')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t('searchDescription1')}{" "}
        <Link
          href="https://github.com/noworneverev/graphrag-api"
          target="_blank"
          rel="noopener"
        >
          graphrag-api
        </Link>{" "}
        {t('searchDescription2')}
      </Typography>

      <Box
        component="img"
        src={process.env.PUBLIC_URL + "/search.png"}
        alt={t('searchImageAlt')}
        sx={{ mt: 2, mb: 2, width: "100%" }}
      />

      <Typography variant="h6" gutterBottom>
        {t('graphDataModel')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {t('graphDataModelDescription')}{" "}
        <Link
          href="https://github.com/microsoft/graphrag/blob/main/examples_notebooks/community_contrib/neo4j/graphrag_import_neo4j_cypher.ipynb"
          target="_blank"
          rel="noopener"
        >
          {t('graphDataModelLinkText')}
        </Link>
        .
      </Typography>

      <Typography variant="h6" gutterBottom>
        {t('nodes')}
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>{t('node')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('type')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{t('document')}</TableCell>
              <TableCell>
                <Chip label="RAW_DOCUMENT" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('textUnit')}</TableCell>
              <TableCell>
                <Chip label="CHUNK" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('community')}</TableCell>
              <TableCell>
                <Chip label="COMMUNITY" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('finding')}</TableCell>
              <TableCell>
                <Chip label="FINDING" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('covariate')}</TableCell>
              <TableCell>
                <Chip label="COVARIATE" size="small" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('entity')}</TableCell>
              <TableCell>
                <i>{t('varies')}</i>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom>
        {t('relationships')}
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>{t('sourceNode')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('relationship')}</strong>
              </TableCell>
              <TableCell>
                <strong>{t('targetNode')}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{t('entity')}</TableCell>
              <TableCell>
                <Chip label="RELATED" size="small" />
              </TableCell>
              <TableCell>{t('entity')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('textUnit')}</TableCell>
              <TableCell>
                <Chip label="PART_OF" size="small" />
              </TableCell>
              <TableCell>{t('document')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('textUnit')}</TableCell>
              <TableCell>
                <Chip label="HAS_ENTITY" size="small" />
              </TableCell>
              <TableCell>{t('entity')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('textUnit')}</TableCell>
              <TableCell>
                <Chip label="HAS_COVARIATE" size="small" />
              </TableCell>
              <TableCell>{t('covariate')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('community')}</TableCell>
              <TableCell>
                <Chip label="HAS_FINDING" size="small" />
              </TableCell>
              <TableCell>{t('finding')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('entity')}</TableCell>
              <TableCell>
                <Chip label="IN_COMMUNITY" size="small" />
              </TableCell>
              <TableCell>{t('community')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Introduction;
