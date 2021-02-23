import React, { useEffect, useRef } from "react";
import L from "leaflet";
import MarkerCluster from "leaflet.markercluster";
import LeafletDraw from "leaflet-draw";
import LeafletHeat from "leaflet.heat";
import { ResponsivePie } from "@nivo/pie";
import { renderToString } from "react-dom/server";
import * as d3 from "d3";

let colorMap = {
  Anger: "red",
  Disgust: "purple",
  Fear: "green",
  Joy: "orange",
  Sadness: "blue",
  Surprise: "teal",
};

const createSimpleMarker = (cluster) => {
  if (cluster) {
    // let childmarkers = cluster.getAllChildMarkers();
    // console.log(childmarkers);
    let tempParent = d3.select("body").append("div");
    // width=100 height=100 transform=translate(-50,-50) z-index=999
    // <circle stroke="white" stroke-width="3" r=${25} cx=${50} cy=${50} fill="lightgrey"></circle>
    let svg = tempParent
      .append("svg")
      .attr("width", 100)
      .attr("height", 100)
      .attr("transform", "translate(-50, -50)")
      .attr("z-index", 999);

    svg
      .append("circle")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("r", 25)
      .attr("cx", 50)
      .attr("cy", 50)
      .attr("fill", "lightgrey");

    svg
      .append("text")
      .attr("font-size", 15)
      .attr("text-anchor", "middle")
      .attr("x", 50)
      .attr("y", 55)
      .text(cluster.getChildCount());
    // <text font-size="15" text-anchor="middle" x=${50} y=${

    let nodeText = tempParent.html();
    // console.log(nodeText);
    tempParent.remove();
    return nodeText;
  }
};

const createPieMarker = (cluster) => {
  if (cluster) {
    let avgEmotions = {
      Anger: 0.0,
      Disgust: 0.0,
      Fear: 0.0,
      Joy: 0.0,
      Sadness: 0.0,
      Surprise: 0.0,
    };
    let childmarkers = cluster.getAllChildMarkers();
    let childcount = cluster.getChildCount();
    // console.log(childmarkers);
    childmarkers.forEach((m) => {
      let f = m.feature;
      Object.keys(avgEmotions).forEach((k) => {
        avgEmotions[k] += f.properties[k];
      });
    });
    Object.keys(avgEmotions).forEach((k) => {
      avgEmotions[k] = avgEmotions[k] / childcount;
    });
    let pieData = Object.keys(avgEmotions).map((e) => {
      return { id: e, value: avgEmotions[e] };
    });
    let tempParent = d3.select("body").append("div");

    let width = 60;
    let height = 60;

    let svg = tempParent
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(-${width / 2}, -${height / 2})`)
      .attr("z-index", 999)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var pie = d3
      .pie()
      .value(function (d) {
        return d.value;
      })
      .sort(null);

    var arc = d3
      .arc()
      .innerRadius(width / 2 - 15)
      .outerRadius(width / 2);

    svg
      .datum(pieData)
      .selectAll("path")
      .data(pie)
      .enter()
      .append("path")
      .attr("fill", function (d, i) {
        return colorMap[d.data.id];
      })
      .attr("stroke", "white")
      .attr("d", arc)
      .each(function (d) {
        this._current = d;
      });

    svg
      .append("text")
      .attr("font-size", 15)
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text(childcount);

    let nodeText = tempParent.html();
    // // console.log(nodeText);
    tempParent.remove();
    // console.log(nodeText);
    return nodeText;
  }
};

const Map = (props) => {
  const mapRef = useRef(null);
  const geojsonLayer = React.useRef(null);
  const editableLayer = React.useRef(null);
  const layerControl = React.useRef(null);
  const markerLayer = React.useRef(null);
  // createMarker();
  useEffect(() => {
    let grey = L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 20,
      }
    );
    // .addTo(mapRef.current);

    var mapInk = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
      }
    );

    mapRef.current = L.map("map", {
      center: [0, 0],
      zoom: 2,
      layers: [grey, mapInk],
    });

    var baseMaps = {
      Grayscale: grey,
      Streets: mapInk,
    };

    layerControl.current = L.control
      .layers(baseMaps, {}, { position: "bottomleft" })
      .addTo(mapRef.current);

    editableLayer.current = new L.FeatureGroup();
    mapRef.current.addLayer(editableLayer.current);
    layerControl.current.addOverlay(editableLayer.current, "Drawn Features");

    markerLayer.current = L.markerClusterGroup({
      iconCreateFunction: function (cluster) {
        // console.log(cluster);
        return L.divIcon({
          className: "custom-div-icon",
          // iconSize: [50, 50],
          // html: `<svg width=100 height=100 transform=translate(-50,-50) z-index=999>
          //   <circle stroke="white" stroke-width="3" r=${25} cx=${50} cy=${50} fill="lightgrey"></circle>
          //   <text font-size="15" text-anchor="middle" x=${50} y=${
          //   50 + 5
          // }>${cluster.getChildCount()}</text>
          // </svg>`,
          html: createPieMarker(cluster),
        });
      },
    });
    // + cluster.getChildCount() +
    layerControl.current.addOverlay(markerLayer.current, "Marker Clusters");
    mapRef.current.addLayer(markerLayer.current);

    let drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: editableLayer.current, //REQUIRED!!
        remove: true,
      },
    });
    mapRef.current.addControl(drawControl);

    mapRef.current.on(L.Draw.Event.CREATED, function (e) {
      var type = e.layerType,
        layer = e.layer;

      layer.on("click", (f) => {
        // console.log(layerGeojson);
        props.handleFeatureSearch(layer, type);
      });

      editableLayer.current.addLayer(layer);
    });

    //  mapRef.current.addControl(drawControl);
  }, []);

  //   add marker

  useEffect(() => {
    if (props.geojson) {
      // mapRef.current.setMaxBounds(mapRef.current.getBounds());
      mapRef.current.on("moveend", function () {
        if (props.mapFilter) {
          let bounds = mapRef.current.getBounds();
          let fInExtent = props.geojson.filter((f) => {
            return bounds.contains([
              f["geometry"]["coordinates"][1],
              f["geometry"]["coordinates"][0],
            ]);
          });
          props.handleExtentFeatures(fInExtent);
        }
      });
      function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties) {
          layer.bindPopup(feature.properties.text);
        }
      }
      let geojsonMarkerOptions = {
        radius: 5,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };

      geojsonLayer.current = L.geoJSON(props.geojson, {
        onEachFeature: onEachFeature,
      });

      // .addTo(mapRef.current);
      // markers.removeLayer(geojsonLayer.current);

      markerLayer.current.clearLayers();
      markerLayer.current.addLayer(geojsonLayer.current);

      // let heat = L.heatLayer(
      //   props.geojson.map((f) => {
      //     return [f.geometry.coordinates[1], f.geometry.coordinates[0], 10];
      //   }),
      //   { radius: 25 }
      // );
      // layerControl.current.addOverlay(heat, "Heat Map");
      // layerControl.current.unSelectLayer(heat)
      // heat.addTo(mapRef.current);
    }
  }, [props.geojson]);

  useEffect(() => {
    if (props.flyFeature) {
      // console.log(props.flyFeature);
      let flyFeatureIndex = +props.flyFeature.index;
      let flyFeature = props.geojson[flyFeatureIndex];
      console.log(flyFeature);
      mapRef.current.flyTo(
        [
          flyFeature.geometry.coordinates[1],
          flyFeature.geometry.coordinates[0],
        ],
        8
      );
    }
  }, [props.flyFeature]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
