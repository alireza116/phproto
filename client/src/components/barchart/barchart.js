import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

let colorMap = {
  Anger: "red",
  Disgust: "purple",
  Fear: "green",
  Joy: "orange",
  Sadness: "blue",
  Surprise: "teal",
};

/* Component */
const BarChart = (props) => {
  const d3Container = useRef(null);
  const w = useRef(null);
  const h = useRef(null);
  const xaxis = useRef(null);
  const yaxis = useRef(null);
  const bar = useRef(null);
  const width = props.width || "100%";
  const height = props.height || "100%";

  useEffect(() => {
    if (d3Container.current) {
      let data = props.data
        ? Object.keys(props.data).map((k) => {
            return { emotion: k, value: props.data[k] };
          })
        : [
            { emotion: "Anger", value: 0 },
            { emotion: "Disgust", value: 0 },
            { emotion: "Fear", value: 0 },
            { emotion: "Joy", value: 0 },
            { emotion: "Sadness", value: 0 },
            { emotion: "Surprise", value: 0 },
          ];
      //svg returned by this component
      const svg = d3.select(d3Container.current);
      //width of svg
      const width = svg.node().getBoundingClientRect().width;
      //height of svg
      const height = svg.node().getBoundingClientRect().height;

      const leftMarginPct = 0.2;
      const rightMarginpct = 0.08;
      const topMarginPct = 0.05;
      const bottomMarginPct = 0.05;

      const margins = {
        left: width * leftMarginPct,
        right: width * rightMarginpct,
        top: height * topMarginPct,
        bottom: height * bottomMarginPct,
      };

      w.current = width - margins.left - margins.right;
      h.current = height - margins.top - margins.bottom;

      let g = svg
        .append("g")
        .attr("class", "gContainer")
        .attr(
          "transform",
          "translate(" + margins.left + "," + margins.top + ")"
        );

      // get the data
      // X axis: scale and draw:

      const maxData = d3.max(data, (d) => d.value);

      let y = d3.scaleBand().range([h.current, 0]).padding(0.1);

      let x = d3.scaleLinear().range([0, w.current]);

      x.domain([
        0,
        d3.max(data, function (d) {
          return d.value;
        }),
      ]);
      y.domain(
        data.map(function (d) {
          return d.emotion;
        })
      );

      xaxis.current = g
        .append("g")
        .attr("transform", "translate(0," + h.current + ")")
        .attr("class", "xAxis")
        .call(d3.axisBottom(x));

      yaxis.current = g.append("g").attr("class", "yAxis").call(d3.axisLeft(y));

      // append the rectangles for the bar chart
      bar.current = g
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        //.attr("x", function(d) { return x(d.sales); })
        .attr("width", function (d) {
          return x(d.value);
        })
        .attr("y", function (d) {
          return y(d.emotion);
        })
        .attr("height", y.bandwidth());
    }
  }, []);

  useEffect(() => {
    if (d3Container.current) {
      let data = props.data
        ? Object.keys(props.data).map((k) => {
            return { emotion: k, value: props.data[k] };
          })
        : [];
      let g = d3.select(".gContainer");

      let y = d3.scaleBand().range([h.current, 0]).padding(0.1);

      let x = d3.scaleLinear().range([0, w.current]);

      x.domain([
        0,
        d3.max(data, function (d) {
          return d.value;
        }),
      ]);
      y.domain(
        data.map(function (d) {
          return d.emotion;
        })
      );

      xaxis.current.call(d3.axisBottom(x));
      yaxis.current.call(d3.axisLeft(y));

      console.log(data);

      bar.current
        .data(data)
        .transition()
        .attr("class", "bar")
        //.attr("x", function(d) { return x(d.sales); })
        .attr("width", function (d) {
          return x(d.value);
        })
        .attr("y", function (d) {
          return y(d.emotion);
        })
        .attr("fill", function (d) {
          return colorMap[d.emotion];
        })
        .attr("height", y.bandwidth());
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
export default BarChart;
