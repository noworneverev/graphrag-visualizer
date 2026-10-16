import React from "react";
import { Box, Button, Checkbox, FormControlLabel, MenuItem, Switch, TextField, Typography } from "@mui/material";
import { GroupMode } from "../utils/graph-view";

interface Props {
  showHubs: boolean;
  onShowHubsChange: (show: boolean) => void;
  hubCount: number;
  hubThreshold: number;
  types: string[];
  hiddenTypes: ReadonlySet<string>;
  onToggleType: (type: string) => void;
  groupMode: GroupMode;
  onGroupModeChange: (mode: GroupMode) => void;
  hasCommunities: boolean;
  groups: { key: string; name: string; count: number }[];
  expandedGroups: ReadonlySet<string>;
  onToggleGroup: (key: string) => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  selectedName?: string;
  focusName?: string;
  onFocus: () => void;
  onClearFocus: () => void;
  onFit: () => void;
}

export default function GraphViewControls(props: Props) {
  return <Box sx={{ width: 260, display: "flex", flexDirection: "column", gap: 1 }}>
    <Typography variant="subtitle2">Explore the graph</Typography>
    <FormControlLabel control={<Switch checked={props.showHubs} onChange={(_, value) => props.onShowHubsChange(value)} />}
      label={`Show high degree hubs (${props.hubCount})`} />
    <Typography variant="caption">Hubs have at least {props.hubThreshold} neighbors. Hidden hubs and their links are kept in the source data.</Typography>
    <TextField select label="Group by" size="small" value={props.groupMode}
      disabled={props.focusName !== undefined}
      onChange={event => props.onGroupModeChange(event.target.value as GroupMode)}>
      <MenuItem value="auto">Communities or entity types</MenuItem>
      <MenuItem value="none">No groups</MenuItem>
      <MenuItem value="community" disabled={!props.hasCommunities}>Saved communities</MenuItem>
      <MenuItem value="type">Entity type</MenuItem>
    </TextField>
    {props.groups.length > 0 && <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Button size="small" onClick={props.onCollapseAll}>Collapse all groups</Button>
        <Button size="small" onClick={props.onExpandAll}>Expand all groups</Button>
      </Box>
      <details>
        <summary>Groups ({props.groups.length})</summary>
        <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
          {props.groups.slice(0, 50).map(group => <Button key={group.key} size="small" fullWidth
            title={`${group.name} (${group.count} members)`}
            sx={{ textTransform: "none", textAlign: "left", justifyContent: "flex-start", overflowWrap: "anywhere" }}
            onClick={() => props.onToggleGroup(group.key)}>
            {props.expandedGroups.has(group.key) ? "Collapse" : "Expand"} {group.name} ({group.count})
          </Button>)}
          {props.groups.length > 50 && <Typography variant="caption">Click other group dots to expand them.</Typography>}
        </Box>
      </details>
      <Typography variant="caption">Click a group dot to expand it. Group labels show member counts.</Typography>
    </>}
    <details open={props.types.length <= 6}>
      <summary>Link types ({props.types.length})</summary>
      <Box sx={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {props.types.map(type => <FormControlLabel key={type}
          control={<Checkbox checked={!props.hiddenTypes.has(type)} onChange={() => props.onToggleType(type)} />}
          label={`Show ${type} links`} />)}
      </Box>
    </details>
    <Button variant="outlined" disabled={!props.selectedName} onClick={props.onFocus}>Show selected node and neighbors</Button>
    {props.selectedName && <Typography variant="caption">Selected: {props.selectedName}</Typography>}
    {props.focusName !== undefined && <>
      <Typography variant="body2">Node focus: {props.focusName}</Typography>
      <Button onClick={props.onClearFocus}>Show overview</Button>
    </>}
    <Button onClick={props.onFit}>Fit graph to screen</Button>
  </Box>;
}
