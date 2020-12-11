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
    // maxWidth: 360,
    margin: "0 auto",
    padding: "10px",
    // backgroundColor: "theme.palette.background.paper",
    overflow: "scroll",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  messages: {
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    marginBottom: "10px",
    padding: "10px",
    paddingTop: "2.5px",
    paddingBottom: "2.5px",
    borderLeft: "solid 5px",
  },
  messageText: {
    fontFamily: "sans-serif",
  },
}));

export default function MessageList(props) {
  const classes = useStyles();
  if (props.sortMessages) {
    props.messages.sort((a, b) => {
      return (
        +b.properties[props.sortMessages] - +a.properties[props.sortMessages]
      );
    });
  }

  let listItems = props.messages.slice(0, 100).map((f, i) => {
    return (
      <div
        key={`li_t_${i}`}
        className={classes.messages}
        style={{
          borderLeftColor:
            props.emotionColorMap[f.properties.maxEmotion.emotion],
        }}
      >
        <p key={`date_t_${i}`} className={classes.messageText}>
          {f.properties.date_time}
        </p>
        <p key={`p_t_${i}`} className={classes.messageText}>
          {f.properties.text}
        </p>
      </div>
    );
  });

  return <div className={classes.root}>{listItems}</div>;
}
