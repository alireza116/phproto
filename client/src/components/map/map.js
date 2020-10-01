import React, { useEffect, useRef } from "react";
import L from "leaflet";

const Map = (props) => {
  const mapRef = useRef(null);
  useEffect(() => {
    mapRef.current = L.map("map", {
      center: [0, 0],
      zoom: 2,
      layers: [
        L.tileLayer(
          "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 20,
            attribution:
              '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
          }
        ),
      ],
    });
  }, []);

  //   add marker
  const geojsonLayer = React.useRef(null);
  useEffect(() => {
    if (props.geojson) {
      mapRef.current.on("moveend", function () {
        let bounds = mapRef.current.getBounds();
        let fInExtent = props.geojson.filter((f) => {
          return bounds.contains([
            f["geometry"]["coordinates"][1],
            f["geometry"]["coordinates"][0],
          ]);
        });
        props.handleExtentFeatures(fInExtent);
      });
      let geojsonMarkerOptions = {
        radius: 5,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };
      geojsonLayer.current = L.geoJSON(props.geojson, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
      }).addTo(mapRef.current);
    }
  }, [props.geojson]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
