import React, { useRef, useEffect } from "react";
import detectPeaks from "../../functions/detectpeaks";
import * as slayer from "slayer";
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
const LineChart = (props) => {
  const d3Container = useRef(null);
  const svg = useRef(null);
  const w = useRef(null);
  const h = useRef(null);
  const xaxis = useRef(null);
  const yaxis = useRef(null);
  const lineChart = useRef(null);
  const areaChart = useRef(null);
  const margins = useRef(null);
  const line = useRef(null);
  const circles = useRef(null);
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

      // x.current = d3
      //   .scaleTime()
      //   .domain(d3.extent(data, (d) => d.date))
      //   .range([margins.current.left, w.current - margins.current.right]);

      // y.current = d3
      //   .scaleLinear()
      //   .domain([0, d3.max(data, (d) => d.value)])
      //   .nice()
      //   .range([h.current - margins.current.bottom, margins.current.top]);

      let legendItemWidth = 20;
      let legendItemHeight = 14;
      let legendItemGap = 3;

      let legend = svg.current.append("g").attr("class", "legend");
      let lText = svg.current.append("g").attr("class", "lText");

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
          console.log(d);
          return d;
        });

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

      line.current = d3
        .line()
        .defined((d) => !isNaN(d.value))
        .x((d) => x.current(d.date))
        .y((d) => y.current(d.value));

      lineChart.current = svg.current
        .append("path")
        .attr("class", "path")
        .attr("fill", "none")
        .attr("clip-path", "url(#clip)")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);

      brush.current = d3
        .brushX()
        .extent([
          [margins.current.left, margins.current.top],
          [w.current - margins.current.right, h.current - margins.current.top],
        ])
        .on("end", brushed);

      svg.current.append("g").attr("class", "brush").call(brush.current);
      console.log("ali");

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
  }, []);

  useEffect(() => {
    if (d3Container.current) {
      //   let g = d3.select(".gContainer");
      let data = Object.keys(props.data).map((k) => {
        return { date: parseDate(k), value: props.data[k] };
      });
      data.sort((a, b) => a.date - b.date);
      let vals = data.map((d) => d.value);
      let peaks;
      // let peaks = data.length > 0 ? detectPeaks(vals) : [];

      x.current = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date))
        .range([margins.current.left, w.current - margins.current.right]);

      y.current = d3
        .scaleLinear()
        // .domain([0, yAxisTier(d3.max(data, (d) => d.value))])
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([h.current - margins.current.bottom, margins.current.top]);

      line.current = d3
        .line()
        .defined((d) => !isNaN(d.value))
        .x((d) => x.current(d.date))
        .y((d) => y.current(d.value));

      xaxis.current.call(d3.axisBottom(x.current));
      yaxis.current.transition().call(d3.axisLeft(y.current));

      lineChart.current
        .datum(data)
        .transition()
        .attr("class", "line")
        .attr("d", line.current);

      // slayer({ minPeakDistance: 2 })
      //   .fromArray(vals)
      //   .then((spikes) => {
      //     peaks = spikes.map((p) => p.x);
      //     svg.current.selectAll("circle").remove();
      //     circles.current = svg.current
      //       .selectAll("circle")
      //       .data(peaks.map((p) => data[p]));

      //     circles.current = circles.current
      //       .enter()
      //       .append("circle")
      //       .attr("cx", function (d) {
      //         return x.current(d.date);
      //       })
      //       .attr("cy", function (d) {
      //         return y.current(d.value) - 10;
      //       })
      //       .attr("r", 5)
      //       .attr("fill", "teal")
      //       .on("mouseenter", function (d) {
      //         console.log(d);
      //       });

      //     circles.current.exit().remove();
      //   });

      peaks = detectPeaks(vals);

      // svg.current.selectAll("circle").remove();
      // circles.current = svg.current
      //   .selectAll("circle")
      //   .data(peaks.map((p) => data[p]));

      // circles.current = circles.current
      //   .enter()
      //   .append("circle")
      //   .attr("cx", function (d) {
      //     return x.current(d.date);
      //   })
      //   .attr("cy", function (d) {
      //     return y.current(d.value) - 10;
      //   })
      //   .attr("r", 5)
      //   .attr("fill", "teal")
      //   .on("mouseenter", function (d) {
      //     console.log(d);
      //   });

      d3.selectAll(".arrow").remove();

      circles.current = svg.current
        .selectAll(".arrow")
        .data(peaks.map((p) => data[p]));

      circles.current = circles.current
        .enter()
        .append("text")
        .attr("class", "arrow")
        .attr("x", function (d) {
          // console.log(d);
          return x.current(d.date);
        })
        .attr("y", function (d) {
          return y.current(d.value) - 10;
        })
        .attr("font-family", "FontAwesome")
        .attr("text-anchor", "middle")
        .attr("font-color", "teal")
        .attr("font-size", function (d) {
          return "30px";
        })
        .text(function (d) {
          return "\uf063";
        })
        .on("mouseenter", function (d) {
          console.log(d);
        });

      circles.current.exit().remove();

      // let brush = d3
      //   .brushX()
      //   .extent([
      //     [margins.current.left, margins.current.top],
      //     [w.current - margins.current.right, h.current - margins.current.top],
      //   ])
      //   .on("end", brushed);

      // areaChart.current.call(brush);

      // function brushed() {
      //   let extent = d3.event.selection;
      //   let timeExtent;
      //   if (extent) {
      //     timeExtent = [
      //       x.current.invert(extent[0]),
      //       x.current.invert(extent[1]),
      //     ];
      //     // console.log(timeExtent);
      //     // console.log(extent);
      //   }
      //   props.handleSelectedTime(timeExtent);
      // }

      // if (svg.current) {
      //   svg.current.call(zoom);
      // }

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
          x.current.range(
            [margins.current.left, w.current - margins.current.right].map((d) =>
              d3.event.transform.applyX(d)
            )
          );

          lineChart.current.attr("d", line.current);

          xaxis.current.call(d3.axisBottom(x.current).tickSizeOuter(0));
          // console.log(circles.current);
          circles.current
            .attr("x", function (d) {
              // console.log("Asdasd");
              return x.current(d.date);
            })
            .attr("y", function (d) {
              return y.current(d.value) - 10;
            });
        }
      }
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
export default LineChart;
