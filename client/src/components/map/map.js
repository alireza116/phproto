import React, { useEffect, useRef } from "react";
import L from "leaflet";
import MarkerCluster from "leaflet.markercluster";
import LeafletDraw from "leaflet-draw";
import LeafletHeat from "leaflet.heat";

const Map = (props) => {
  const mapRef = useRef(null);
  const geojsonLayer = React.useRef(null);
  const editableLayer = React.useRef(null);
  const layerControl = React.useRef(null);
  const markerLayer = React.useRef(null);
  useEffect(() => {
    let grey = L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      }
    );
    // .addTo(mapRef.current);

    var mapInk = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

    layerControl.current = L.control.layers(baseMaps).addTo(mapRef.current);

    editableLayer.current = new L.FeatureGroup();
    mapRef.current.addLayer(editableLayer.current);
    layerControl.current.addOverlay(editableLayer.current, "Drawn Features");

    markerLayer.current = L.markerClusterGroup();
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
        remove: false,
      },
    });
    mapRef.current.addControl(drawControl);
    //  mapRef.current.addControl(drawControl);
  }, []);

  //   add marker

  useEffect(() => {
    if (props.geojson) {
      mapRef.current.setMaxBounds(mapRef.current.getBounds());
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

      mapRef.current.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
          layer = e.layer;

        layer.on("click", (f) => {
          // console.log(layerGeojson);
          console.log(type);
          props.handleFeatureSearch(layer, type, props.geojson);
        });

        editableLayer.current.addLayer(layer);
      });
    }
  }, [props.geojson]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
