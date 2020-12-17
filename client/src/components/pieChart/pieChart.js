import React from "react";
import { ResponsivePie } from "@nivo/pie";
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

let colorMap = {
  Anger: "red",
  Disgust: "purple",
  Fear: "green",
  Joy: "orange",
  Sadness: "blue",
  Surprise: "teal",
};

const PieChart = (props) => {
  let handleClick = (f) => {
    return props.handleSort(f.id);
  };
  let data = props.data
    ? Object.keys(props.data).map((key) => {
        return { id: key, value: props.data[key].toFixed(3) };
      })
    : [{ id: "str", value: 100 }];
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      // colors={{ scheme: 'nivo' }}
      colors={(pie) => {
        return colorMap[pie.id];
      }}
      borderWidth={1}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      radialLabelsSkipAngle={10}
      radialLabelsTextXOffset={6}
      radialLabelsTextColor="#333333"
      radialLabelsLinkOffset={0}
      radialLabelsLinkDiagonalLength={16}
      radialLabelsLinkHorizontalLength={24}
      radialLabelsLinkStrokeWidth={1}
      radialLabelsLinkColor={{ from: "color" }}
      slicesLabelsSkipAngle={10}
      slicesLabelsTextColor="#333333"
      // animate={true}
      enableRadialLabels={false}
      enableSliceLabels={false}
      motionStiffness={90}
      motionDamping={15}
      onClick={handleClick}
    />
  );
};

export default PieChart;
