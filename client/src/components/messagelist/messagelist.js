import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import ListSubheader from "@material-ui/core/ListSubheader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Card, Divider } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    margin: "0 auto",
    padding: 0,
    backgroundColor: theme.palette.background.paper,
    overflow: "scroll",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  card: {
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
}));

export default function MessageList(props) {
  const classes = useStyles();

  let listItems = props.messages.slice(0, 100).map((f, i) => {
    return (
      <ListItem divider key={`li_${i}`} style={{ width: "100%" }}>
        <ListItemText primary={f.properties.text} key={`li_t_${i}`} />
      </ListItem>
    );
  });

  return (
    <List component="nav" className={classes.root}>
      {listItems}
    </List>
  );
}
