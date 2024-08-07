import React from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { CustomLink, CustomNode } from "../models/custom-graph-data";

interface SearchDrawerProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  searchResults: (CustomNode | CustomLink)[];
  rightDrawerOpen: boolean;
  toggleDrawer: (open: boolean) => () => void;
  handleFocusButtonClick: (node: CustomNode) => void;
  handleNodeClick: (node: CustomNode) => void;
  handleFocusLinkClick: (link: CustomLink) => void;
  handleLinkClick: (link: CustomLink) => void;
}

const SearchDrawer: React.FC<SearchDrawerProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  searchResults,
  rightDrawerOpen,
  toggleDrawer,
  handleFocusButtonClick,
  handleNodeClick,
  handleFocusLinkClick,
  handleLinkClick,
}) => {
  return (
    <Drawer
      anchor="right"
      open={rightDrawerOpen}
      onClose={toggleDrawer(false)}
      sx={{ zIndex: 1500 }}
    >
      <Box sx={{ width: 700, padding: 2 }}>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search Node or Relationship"
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} color="primary">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {searchResults.filter((item) => "neighbors" in item).length > 0 && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">Nodes</Typography>
            <TableContainer
              component={Paper}
              sx={{ marginTop: 2, maxHeight: "400px", overflow: "auto" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults
                    .filter((item) => "neighbors" in item)
                    .map((node) => (
                      <TableRow key={node.id}>
                        <TableCell>{node.name}</TableCell>
                        <TableCell>{node.type}</TableCell>
                        <TableCell>
                          <Box display="flex" justifyContent="space-between">
                            <Button
                              onClick={() =>
                                handleFocusButtonClick(node as CustomNode)
                              }
                            >
                              Focus
                            </Button>
                            <Button
                              onClick={() =>
                                handleNodeClick(node as CustomNode)
                              }
                              sx={{ marginLeft: 1 }}
                            >
                              Details
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {searchResults.filter((item) => "source" in item && "target" in item)
          .length > 0 && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">Relationships</Typography>
            <TableContainer
              component={Paper}
              sx={{ marginTop: 2, maxHeight: "400px", overflow: "auto" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults
                    .filter((item) => "source" in item && "target" in item)
                    .map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          {typeof link.source === "object"
                            ? (link.source as CustomNode).name
                            : link.source}
                        </TableCell>
                        <TableCell>
                          {typeof link.target === "object"
                            ? (link.target as CustomNode).name
                            : link.target}
                        </TableCell>
                        <TableCell>{link.description}</TableCell>
                        <TableCell>
                          <Box display="flex" justifyContent="space-between">
                            <Button
                              onClick={() =>
                                handleFocusLinkClick(link as CustomLink)
                              }
                            >
                              Focus
                            </Button>
                            <Button
                              onClick={() =>
                                handleLinkClick(link as CustomLink)
                              }
                              sx={{ marginLeft: 1 }}
                            >
                              Details
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default SearchDrawer;
