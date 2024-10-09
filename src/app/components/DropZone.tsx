import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from 'react-i18next';

interface DropZoneProps {
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  getRootProps,
  getInputProps,
  isDragActive,
}) => {
  const { t } = useTranslation('layout');
  const theme = useTheme();

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed gray",
        borderRadius: "4px",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: isDragActive
          ? theme.palette.action.hover
          : theme.palette.background.default,
        color: theme.palette.text.primary,
        height: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        mb: 2,
      }}
    >
      <input {...getInputProps()} {...({ webkitdirectory: "true" } as any)} />
      {isDragActive ? (
        <Typography variant="body1">{t('dropZone.dropFilesHere')}</Typography>
      ) : (
        <Typography variant="body1">
          {t('dropZone.dragAndDrop')}
        </Typography>
      )}
    </Box>
  );
};

export default DropZone;
