import React, { useRef, useEffect } from "react";
import detectPeaks from "../../functions/detectpeaks";
import * as slayer from "slayer";
import * as d3 from "d3";
import { selectAll } from "d3";

let colorMap = {
  Anger: "red",
  Disgust: "purple",
  Fear: "green",
  Joy: "orange",
  Sadness: "blue",
  Surprise: "teal",
};

let yAxisTier = (max) => {
  if (max < 5) {
    return 5;
  }
  if (max < 10) {
    return 10;
  }
  if (max < 25) {
    return 25;
  }
  if (max < 50) {
    return 50;
  }
  if (max < 100) {
    return 100;
  } else if (max < 250) {
    return 250;
  } else if (max < 500) {
    return 500;
  } else if (max < 1000) {
    return 1000;
  } else {
    return max;
  }
};

/* Component */
const StackedLineChart = (props) => {
  const d3Container = useRef(null);
  const svg = useRef(null);
  const w = useRef(null);
  const h = useRef(null);
  const xaxis = useRef(null);
  const yaxis = useRef(null);
  const areaChart = useRef(null);
  const margins = useRef(null);
  const area = useRef(null);
  const x = useRef(null);
  const y = useRef(null);
  const brush = useRef(null);
  const width = props.width || "100%";
  const height = props.height || "100%";
  const emotions = ["Sadness", "Anger", "Joy", "Surprise", "Disgust", "Fear"];

  let parseDate = d3.timeParse("%Y-%m-%d %H");

  let yAxisTier = (max) => {
    if (max < 5) {
      return 5;
    }
    if (max < 10) {
      return 10;
    }
    if (max < 25) {
      return 25;
    }
    if (max < 50) {
      return 50;
    }
    if (max < 100) {
      return 100;
    } else if (max < 250) {
      return 250;
    } else if (max < 500) {
      return 500;
    } else if (max < 1000) {
      return 1000;
    } else {
      return max;
    }
  };

  useEffect(() => {
    if (d3Container.current) {
      //svg returned by this component
      console.log(props.emotionColorMap);
      svg.current = d3.select(d3Container.current);
      areaChart.current = svg.current.append("g");
      //width of svg
      const width = svg.current.node().getBoundingClientRect().width;
      //height of svg
      const height = svg.current.node().getBoundingClientRect().height;

      const leftMarginPct = 0.05;
      const rightMarginpct = 0.02;
      const topMarginPct = 0.15;
      const bottomMarginPct = 0.15;

      margins.current = {
        left: width * leftMarginPct,
        right: width * rightMarginpct,
        top: height * topMarginPct,
        bottom: height * bottomMarginPct,
      };

      w.current = width;
      h.current = height;

      let legendItemWidth = 20;
      let legendItemHeight = 14;
      let legendItemGap = 3;

      let legend = svg.current.append("g").attr("class", "legend");
      let lText = svg.current.append("g").attr("class", "lText");
      area.current = d3
        .area()
        .x((d) => x(d.data.date))
        .y0((d) => y(d[0]))
        .y1((d) => y(d[1]));

      legend
        .selectAll("rect")
        .data(emotions)
        .enter()
        .append("rect")
        .attr("x", width - margins.current.left - margins.current.right)
        .attr("y", (d, i) => {
          return (i + 1) * (legendItemGap + legendItemHeight);
        })
        .attr("width", legendItemWidth)
        .attr("height", legendItemHeight)
        .attr("fill", (d) => {
          return colorMap[d];
        });

      lText
        .selectAll("text")
        .data(emotions)
        .enter()
        .append("text")
        .attr("x", width - margins.current.left - margins.current.right - 25)
        .attr("y", (d, i) => {
          return (i + 1) * (legendItemGap + legendItemHeight) + 10;
        })
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .text((d) => {
          return d;
        });

      xaxis.current = svg.current
        .append("g")
        .attr("class", "x-axis")
        .attr("clip-path", "url(#clip)")
        .attr(
          "transform",
          `translate(0,${h.current - margins.current.bottom})`
        );

      yaxis.current = svg.current
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margins.current.left},0)`);

      svg.current
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", margins.current.left)
        .attr("width", w.current - margins.current.right)
        .attr("height", h.current);
      // append the rectangles for the bar chart

      brush.current = d3
        .brushX()
        .extent([
          [margins.current.left, margins.current.top],
          [w.current - margins.current.right, h.current - margins.current.top],
        ])
        .on("end", brushed);

      svg.current.append("g").attr("class", "brush").call(brush.current);

      function brushed() {
        let extent = d3.event.selection;
        let timeExtent;
        if (extent) {
          timeExtent = [
            x.current.invert(extent[0]),
            x.current.invert(extent[1]),
          ];
          // console.log(timeExtent);
          // console.log(extent);
          brush.current.clear(d3.select(".brush"));
        }
        props.handleSelectedTime(timeExtent);
      }
    }
  }, [props.tabValue]);

  useEffect(() => {
    if (d3Container.current) {
      console.log(props.tabValue);
      props.data.forEach((d) => {
        if (typeof d.date == "string") {
          d.date = parseDate(d.date);
        }
      });
      let data = props.data;
      data.sort((a, b) => a.date - b.date);
      console.log(data);
      let series = d3.stack().keys(emotions).order(d3.stackOrderAscending)(
        data
      );
      // let peaks = data.length > 0 ? detectPeaks(vals) : [];

      x.current = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date))
        .range([margins.current.left, w.current - margins.current.right]);

      y.current = d3
        .scaleLinear()
        // .domain([0, yAxisTier(d3.max(series, (d) => d3.max(d, (d) => d[1])))])
        .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])

        .nice()
        .range([h.current - margins.current.bottom, margins.current.top]);

      area.current = d3
        .area()
        .x((d) => x.current(d.data.date))
        .y0((d) => y.current(d[0]))
        .y1((d) => y.current(d[1]));

      // svg.current.selectAll(".layer").remove();

      areaChart.current
        .selectAll(".layer")
        .data(series)
        .join("path")
        .transition()
        .attr("class", "layer")
        .attr("d", area.current)
        .attr("fill", ({ key }) => colorMap[key])
        .attr("stroke", "white");

      xaxis.current.call(d3.axisBottom(x.current));
      yaxis.current.call(d3.axisLeft(y.current));

      // let brush = d3
      //   .brushX()
      //   .extent([
      //     [margins.current.left, margins.current.top],
      //     [w.current - margins.current.right, h.current - margins.current.top],
      //   ])
      //   .on("end", brushed);
      // areaChart.current.append("g").attr("class", "brush").call(brush);
      // areaChart.current.call(brush);
    }
  }, [props.data]);

  return (
    <div
      className="histContainer"
      style={{
        width: width,
        height: height,
        margin: "0 auto",
        marginBottom: "10px",
      }}
    >
      <svg
        className="histComponent"
        style={{ cursor: "pointer" }}
        width={"100%"}
        height={"100%"}
        ref={d3Container}
      />
    </div>
  );
};

/* App */
export default StackedLineChart;
