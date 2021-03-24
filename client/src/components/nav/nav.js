import React, { useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import Grid from "@material-ui/core/Grid";

const AntSwitch = withStyles((theme) => ({
  root: {
    width: 28,
    height: 16,
    padding: 0,
    display: "flex",
  },
  switchBase: {
    padding: 2,
    color: theme.palette.grey[500],
    "&$checked": {
      transform: "translateX(12px)",
      color: theme.palette.common.white,
      "& + $track": {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: "none",
  },
  track: {
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: theme.palette.common.white,
  },
  checked: {},
}))(Switch);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  offset: theme.mixins.toolbar,
  navBar: {
    height: "100%",
    backgroundColor: "grey",
  },
  allTweetsButton: {
    marginRight: "30px",
  },
}));

export default function NavBar(props) {
  const classes = useStyles();
  const [emotionMarkerChecked, setEmotionMarkerChecked] = useState(true);
  const handleEmotionSwitch = (event) => {
    console.log(event.target.checked);
    props.handleMapEmotionMarker(event.target.checked);
    setEmotionMarkerChecked(event.target.checked);
  };
  return (
    <div className={classes.root} style={{ height: props.height }}>
      <AppBar position="sticky" className={classes.navBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            PHIMATICS
          </Typography>
          <Typography component="div" style={{ paddingRight: 20 }}>
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item>Simple Markers</Grid>
              <Grid item>
                <AntSwitch
                  checked={emotionMarkerChecked}
                  onChange={handleEmotionSwitch}
                  name="checkedC"
                />
              </Grid>
              <Grid item>Emotion Markers</Grid>
            </Grid>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className={classes.allTweetsButton}
            onClick={props.handleReset}
          >
            Reset Filter
          </Button>
          <Typography variant="h6">
            {props.count} of {props.totalCount} tweets visible in the current
            map extent
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
