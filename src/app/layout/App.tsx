import React, { useEffect, useState } from "react";

import GraphDataHandler from "../components/GraphDataHandler";
import {
  CssBaseline,
  Container,
  Box,
  createTheme,
  darkScrollbar,
  ThemeProvider,
  IconButton,
  Tooltip,
  Link,
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { t } = useTranslation('layout');
  const [darkMode, setDarkMode] = useState(true);
  const [categary, setCategary] = useState<string | null>(null);
  const paletteType = darkMode ? "dark" : "light";

  const theme = createTheme({
    palette: {
      mode: paletteType,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: paletteType === "dark" ? darkScrollbar() : null,
        },
      },
      MuiPopover: {
        styleOverrides: {
          root: {
            zIndex: 1600,
          },
        },
      },
      MuiModal: {
        styleOverrides: {
          root: {
            zIndex: 1600,
          },
        },
      },
    },
  });

  function handleThemeChange() {
    setDarkMode(!darkMode);
    localStorage.setItem("theme", darkMode ? "light" : "dark");
  }

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setDarkMode(currentTheme === "dark");

    // 获取 URL 中的 categary 参数
    const queryParams = new URLSearchParams(window?.location?.search);
    const categaryParam = queryParams.get('categary');
    if (categaryParam) {
      setCategary(categaryParam);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container disableGutters maxWidth={false}>
        <CssBaseline />

        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 1,
            padding: { xs: "20px 0px", sm: "0" },
          }}
        >
          <IconButton
            component={Link}
            href="https://github.com/noworneverev/graphrag-visualizer"
            target="_blank"
            rel="noopener"
            color="inherit"
          >
            <GitHubIcon />
          </IconButton>
          {darkMode ? (
            <Tooltip  title={t('tooltip.turnOnLight')}>
              <IconButton onClick={handleThemeChange} color="inherit">
                <DarkModeOutlinedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip  title={t('tooltip.turnOffLight')}>
              <IconButton onClick={handleThemeChange} color="inherit">
                <LightModeOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <GraphDataHandler  categary={categary} />
      </Container>
    </ThemeProvider>
  );
};

export default App;
