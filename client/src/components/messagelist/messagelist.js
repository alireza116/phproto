import React, { useState, useRef, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PieChart from "../pieChart/pieChart";
// import ListSubheader from "@material-ui/core/ListSubheader";
// import List from "@material-ui/core/List";
// import ListItem from "@material-ui/core/ListItem";
// import ListItemText from "@material-ui/core/ListItemText";
// import { Card, Divider } from "@material-ui/core";

var parser = new DOMParser();

function parseString(encodedString) {
  var dom = parser.parseFromString(
    "<!doctype html><body>" + encodedString,
    "text/html"
  );
  var decodedString = dom.body.textContent;
  return decodedString;
}

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
    cursor: "pointer",
  },
  messageText: {
    fontFamily: "sans-serif",
    pointerEvents: "none",
  },
  tooltip: {
    padding: "10px",
    position: "absolute",
    width: "200px",
    height: "200px",
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    pointerEvents: "none",
    zIndex: 999,
  },
}));

export default function MessageList(props) {
  const classes = useStyles();
  const [showTip, setShowTip] = useState(false);
  const [tipLeft, setTipLeft] = useState("50%");
  const [tipTop, setTipTop] = useState(0);
  const parentNode = useRef(null);
  const [hoverItem, setHoverItem] = useState(null);
  const [hoverEmotions, setHoverEmotions] = useState({
    Anger: 0.0,
    Disgust: 0.0,
    Fear: 0.0,
    Joy: 0.0,
    Sadness: 0.0,
    Surprise: 0.0,
  });
  // if (props.sortMessages) {
  //   props.messages.sort((a, b) => {
  //     return (
  //       +b.properties[props.sortMessages] - +a.properties[props.sortMessages]
  //     );
  //   });
  // }

  const handleClick = (ev) => {
    // console.log(ev);
    props.handleFly(ev.currentTarget.dataset);
  };
  const handleMouseOver = (ev) => {
    if (!showTip) setShowTip(true);

    setShowTip(true);
  };

  const handleMouseEnter = (ev) => {
    // setTipLeft(ev.pageX);
    console.log(ev.currentTarget.dataset);
    let hi = props.messages[+ev.currentTarget.dataset.index];
    props.handleHoverTopic(hi.properties.topic);
    let hEmotions = {};
    Object.keys(hoverEmotions).forEach((k) => {
      hEmotions[k] = hi.properties[k];
    });
    setHoverEmotions(hEmotions);
    setHoverItem(hi);

    console.log(ev.currentTarget.getBoundingClientRect().top);
    // setTipTop(ev.pageY);
    setTipTop(ev.currentTarget.getBoundingClientRect().top);
  };

  const handleMouseLeave = (ev) => {
    props.handleHoverTopic(null);
    if (showTip) setShowTip(false);
  };

  useEffect(() => {
    if (parentNode.current) {
      let bounds = parentNode.current.getBoundingClientRect();
      setTipLeft(bounds.left - 200 - 20);
    }
  }, [parentNode]);

  let listItems = props.messages.slice(0, 100).map((f, i) => {
    return (
      <div
        key={i}
        data-index={i}
        // onClick={(ev) => {
        //   props.handleFly(ev.currentTarget.dataset);
        // }}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        className={classes.messages}
        style={{
          borderLeftColor:
            props.emotionColorMap[f.properties.maxEmotion.emotion],
        }}
      >
        <p key={`date_t_${i}`} className={classes.messageText}>
          {f.properties.date.format("dddd, MMMM Do YYYY, h:mm:ss a")}
        </p>
        <p key={`p_t_${i}`} className={classes.messageText}>
          {parseString(f.properties.text)}
        </p>
      </div>
    );
  });

  return (
    <div className={classes.root} ref={parentNode}>
      {listItems}{" "}
      <div
        style={{
          opacity: showTip ? 1 : 0,
          left: tipLeft,
          top: tipTop,
        }}
        id="tooltip"
        className={classes.tooltip}
      >
        {/* {hoverItem !== null
          ? props.topicTerms[hoverItem.properties.topic]
          : null} */}
        <PieChart data={hoverEmotions}></PieChart>
      </div>
    </div>
  );
}
