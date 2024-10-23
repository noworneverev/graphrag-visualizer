import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ReactGA from "react-ga4";

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

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
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
  }, []);

  useEffect(() => {
    const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    if (measurementId) {
      ReactGA.initialize(measurementId);
      ReactGA.send({
        hitType: "pageview",
        page: window.location.pathname + window.location.search,
      });
    } else {
      console.error("Google Analytics measurement ID not found");
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
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
              <Tooltip title="Turn on the light">
                <IconButton onClick={handleThemeChange} color="inherit">
                  <DarkModeOutlinedIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Turn off the light">
                <IconButton onClick={handleThemeChange} color="inherit">
                  <LightModeOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />{" "}
            <Route path="/upload" element={<GraphDataHandler />} />{" "}
            <Route path="/graph" element={<GraphDataHandler />} />{" "}
            <Route path="/data" element={<GraphDataHandler />} />{" "}
            <Route path="*" element={<Navigate to="/upload" replace />} />{" "}
          </Routes>

          {/* <GraphDataHandler /> */}
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
