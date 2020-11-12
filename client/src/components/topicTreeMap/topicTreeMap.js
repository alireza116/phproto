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
  let data = {
    root: {
      topic: "topics",
      color: "hsl(193, 70%, 50%)",
      children: [],
    },
  };

  let topicCounts = {};
  if (features != null) {
    features.forEach((d) => {
      let id = d.properties.topic;
      //   .toString();
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
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      label={(t) => {
        // console.log(t);
        return t.data.terms;
      }}
      tooltip={(t) => {
        return t.node.data.topic
          ? `Topic terms:\n ${topicTerms[t.node.data.topic]
              .slice(0, 5)
              .join(", ")}`
          : "";
      }}
      labelSkipSize={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
      parentLabelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      borderColor={{ from: "color", modifiers: [["darker", 0.1]] }}
    />
  );
};

export default TreeMap;
