import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

/* Component */
const LineChart = (props) => {
  const d3Container = useRef(null);
  const svg = useRef(null);
  const w = useRef(null);
  const h = useRef(null);
  const xaxis = useRef(null);
  const yaxis = useRef(null);
  const lineChart = useRef(null);
  const margins = useRef(null);
  const line = useRef(null);
  const width = props.width || "100%";
  const height = props.height || "100%";
  let parseDate = d3.timeParse("%Y-%m-%d %H");

  let data = Object.keys(props.data).map((k) => {
    return { date: parseDate(k), value: props.data[k] };
  });
  data.sort((a, b) => a.date - b.date);

  useEffect(() => {
    if (d3Container.current) {
      //svg returned by this component
      svg.current = d3.select(d3Container.current);

      //width of svg
      const width = svg.current.node().getBoundingClientRect().width;
      //height of svg
      const height = svg.current.node().getBoundingClientRect().height;

      const leftMarginPct = 0.05;
      const rightMarginpct = 0.02;
      const topMarginPct = 0.05;
      const bottomMarginPct = 0.15;

      margins.current = {
        left: width * leftMarginPct,
        right: width * rightMarginpct,
        top: height * topMarginPct,
        bottom: height * bottomMarginPct,
      };

      w.current = width;
      h.current = height;

      var x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date))
        .range([margins.current.left, w.current - margins.current.right]);

      var y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([h.current - margins.current.bottom, margins.current.top]);

      xaxis.current = svg.current
        .append("g")
        .attr("class", "x-axis")
        .attr("clip-path", "url(#clip)")
        .attr("transform", `translate(0,${h.current - margins.current.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

      yaxis.current = svg.current
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margins.current.left},0)`)
        .call(d3.axisLeft(y));

      var defs = svg.current
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", margins.current.left)
        .attr("width", w.current - margins.current.right)
        .attr("height", h.current);
      // append the rectangles for the bar chart

      line.current = d3
        .line()
        .defined((d) => !isNaN(d.value))
        .x((d) => x(d.date))
        .y((d) => y(d.value));

      lineChart.current = svg.current
        .append("path")
        .attr("class", "path")
        .attr("fill", "none")
        .attr("clip-path", "url(#clip)")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);
    }
  }, []);

  useEffect(() => {
    if (d3Container.current) {
      //   let g = d3.select(".gContainer");
      console.log(data);

      var x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date))
        .range([margins.current.left, w.current - margins.current.right]);

      var y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([h.current - margins.current.bottom, margins.current.top]);

      line.current = d3
        .line()
        .defined((d) => !isNaN(d.value))
        .x((d) => x(d.date))
        .y((d) => y(d.value));

      xaxis.current.call(d3.axisBottom(x));
      yaxis.current.call(d3.axisLeft(y));

      lineChart.current
        .datum(data)
        .transition()
        .attr("class", "line")
        .attr("d", line.current);

      if (svg.current) {
        svg.current.call(zoom);
      }

      function zoom(svg) {
        var extent = [
          [margins.current.left, margins.current.top],
          [w.current - margins.current.right, h.current - margins.current.top],
        ];

        var zooming = d3
          .zoom()
          .scaleExtent([1, 3])
          .translateExtent(extent)
          .extent(extent)
          .on("zoom", zoomed);

        svg.call(zooming);

        function zoomed() {
          x.range(
            [margins.current.left, w.current - margins.current.right].map((d) =>
              d3.event.transform.applyX(d)
            )
          );

          lineChart.current.attr("d", line.current);

          svg.select(".x-axis").call(d3.axisBottom(x).tickSizeOuter(0));
        }
      }
    }
  }, [data]);

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
export default LineChart;
