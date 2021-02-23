import React from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { timeThursday } from "d3";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

const TreeMap = (props) => {
  let topicTerms = props.topicTerms || undefined;
  let features = props.data;
  //   console.log(features);
  //   console.log(topicTerms);
  let handleClick = (node) => {
    if (!(node.data.topic == "All Topics")) {
      props.handleSelectedTopic(node.data.topic);
    } else {
      //   console.log(node);
      props.handleSelectedTopic(-1);
    }
  };
  let data = { topic: "All Topics" };

  let topicCounts = {};
  if (features != null) {
    features.forEach((d) => {
      console.log(d);
      let id = d.properties.topic;
      //   .toString();
      console.log(id);
      if (!(id in topicCounts)) {
        topicCounts[id] = 1;
      } else {
        topicCounts[id]++;
      }
    });
  }

  data.children = Object.keys(topicCounts).map((key) => {
    return {
      topic: key,
      count: topicCounts[key],
      terms: topicTerms[key][0],
    };
  });

  return (
    <ResponsiveTreeMap
      data={data}
      identity="topic"
      value="count"
      // colors={{ scheme: "category10" }}
      colors={(t) => {
        // console.log(+t.data.topic);
        console.log(props.hoverTopic);
        console.log(+t.data.topic);
        return +t.data.topic === props.hoverTopic ? "brown" : "grey";
      }}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      label={(t) => {
        return t.data.terms ? t.data.terms : "All Topics";
      }}
      tooltip={(t) => {
        return t.node.data.topic !== "All Topics"
          ? `Topic terms: ${topicTerms[t.node.data.topic]
              .slice(0, 5)
              .join(", ")}`
          : "All Topics";
      }}
      labelSkipSize={12}
      // labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
      labelTextColor={"black"}
      parentLabelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      borderColor={{ from: "color", modifiers: [["darker", 0.1]] }}
      animate={false}
      onClick={handleClick}
      nodeOpacity={0.3}
    />
  );
};

export default TreeMap;
