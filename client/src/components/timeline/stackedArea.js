import React, { useEffect, useRef } from "react";
import {
  select,
  axisBottom,
  stack,
  max,
  scaleLinear,
  axisLeft,
  stackOrderAscending,
  area,
  curveCardinal,
  scaleTime,
} from "d3";
import * as d3 from "d3";
import useResizeObserver from "../../functions/useResizeObserver";

/**
 * Component that renders a StackedBarChart
 */

function StackedBarChart(props) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);
  let parseDate = d3.timeParse("%Y-%m-%d %H");

  // will be called initially and on every data change
  useEffect(() => {
    let data = props.data.map((d) => {
      d.date = parseDate(d.date);
      return d;
    });
    const svg = d3.select(svgRef.current);
    const { width, height } =
      dimensions || wrapperRef.current.getBoundingClientRect();

    console.log(width, height);
    // stacks / layers
    const stackGenerator = stack().keys(props.keys).order(stackOrderAscending);
    const layers = stackGenerator(data);
    const extent = [
      0,
      max(layers, (layer) => max(layer, (sequence) => sequence[1])),
    ];

    // scales
    const xScale = scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);

    const yScale = d3.scaleLinear().domain(extent).range([height, 0]);

    // area generator
    const areaGenerator = d3
      .area()
      .x((sequence) => xScale(sequence.data.date))
      .y0((sequence) => yScale(sequence[0]))
      .y1((sequence) => yScale(sequence[1]))
      .curve(curveCardinal);

    // rendering
    svg
      .selectAll(".layer")
      .data(layers)
      .join("path")
      .attr("class", "layer")
      .attr("fill", (layer) => props.colors[layer.key])
      .attr("d", areaGenerator);

    // axes
    const xAxis = axisBottom(xScale);
    svg
      .select(".x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    const yAxis = axisLeft(yScale);
    svg.select(".y-axis").call(yAxis);
  }, [props.colors, props.data, dimensions, props.keys, parseDate]);

  return (
    <React.Fragment>
      <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}>
          <g className="x-axis" />
          <g className="y-axis" />
        </svg>
      </div>
    </React.Fragment>
  );
}

export default StackedBarChart;
