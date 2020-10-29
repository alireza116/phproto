import React, { Component } from "react";
import { Container, Grid } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import Map from "./components/map/map";
import MessageList from "./components/messagelist/messagelist";
import BarChart from "./components/barchart/barchart";
import TimeLine from "./components/timeline/timeline";
import moment from "moment";
import logo from "./logo.svg";
import axios from "axios";
import * as turf from "@turf/turf";
import "./App.css";
import LineChart from "./components/timeline/timeline";
import PieChart from "./components/pieChart/pieChart"

class App extends Component {
  state = {
    response: "",
    post: "",
    geojson: null,
    extentFeatures: [],
    timeCounts: {},
    avgEmotions: null,
  };

  handleExtentFeatures = (features) => {
    let avgEmotions = {
      Anger: 0.0,
      Disgust: 0.0,
      Fear: 0.0,
      Joy: 0.0,
      Sadness: 0.0,
      Surprise: 0.0,
    };
    features.forEach((feature) => {
      Object.keys(avgEmotions).forEach((k) => {
        avgEmotions[k] += feature.properties[k];
      });
    });
    Object.keys(avgEmotions).forEach((k) => {
      avgEmotions[k] = avgEmotions[k] / features.length;
    });
    let timeCounts = {};
    features.forEach((f) => {
      let d = f.properties.date.format("YYYY-MM-DD HH");
      timeCounts[d] ? timeCounts[d]++ : (timeCounts[d] = 1);
    });
    this.setState({ timeCounts: timeCounts });
    this.setState({ avgEmotions: avgEmotions });
    this.setState({ extentFeatures: features });
  };

  handleFeatureSearch = (feature,layerType,geojson) =>{
    console.log(feature);
    let filteredFeatures;
    if (layerType==="polygon" || layerType==="rectangle"){
      feature = feature.toGeoJSON();
      feature = turf.polygon(feature.geometry.coordinates)

      filteredFeatures = geojson.filter((f)=>{
        let p = turf.point(f.geometry.coordinates)
        return turf.booleanPointInPolygon(p,feature);
      })

    } else if (layerType === "circle"){
      console.log(feature);
      let theCenterPt = feature.getLatLng();

        let center = [theCenterPt.lng,theCenterPt.lat]; 
        console.log(center);

        let theRadius = feature.getRadius();
        console.log(theRadius);
        let options = {steps: 64, units: 'meters'};  //Change steps to 4 to see what it does.
        let turfCircle = turf.circle(center, theRadius, options);

        filteredFeatures = geojson.filter((f)=>{
          let p = turf.point(f.geometry.coordinates)
          return turf.booleanPointInPolygon(p,turfCircle);
        })
    }

    if (filteredFeatures.length > 0){
      this.handleExtentFeatures(filteredFeatures);
    }

  }

  componentDidMount() {
    axios.get("/api/data").then((res) => {
      let geojson = res.data.filter((f) => {
        return !(
          (f.geometry.coordinates[0] == undefined) &
          (f.geometry.coordinates[1] == undefined)
        );
      });
      geojson.forEach((f) => {
        f["properties"]["point"] = turf.point(f["geometry"]["coordinates"]);
        f["properties"]["date"] = moment(f["properties"]["date_time"]);
      });
      // console.log(geojson);
      this.setState({ geojson: geojson });
      this.handleExtentFeatures(geojson);
    });
  }

  render() {
    return (
      <div className="app" style={{ height: "100%" }}>
        <NavBar height={"8%"} className="navBar"></NavBar>
        <Container
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12,1fr)",
            gridTemplateRows: "repeat(12,1fr)",
            height: "92%",
            margin: "0 auto",
            width: "100%",
            padding: 0,
            margin: 0,
          }}
          id="root-container"
          maxWidth={false}
        >
          <div
            style={{
              gridColumn: "1 / 10",
              gridRow: "1 / 8",
            }}
          >
            <Map
              geojson={this.state.geojson}
              handleExtentFeatures={this.handleExtentFeatures}
              handleFeatureSearch = {this.handleFeatureSearch}
            ></Map>
          </div>
          <div
            style={{
              gridColumn: "1 / 10",
              gridRow: "8 / 13",
            }}
          >
            <LineChart data={this.state.timeCounts}></LineChart>
          </div>
          <div
            style={{
              gridColumn: "10 / 13",
              gridRow: "1 / 6",
              overflow: "scroll",
              padding: "30px",
            }}
          >
            <MessageList messages={this.state.extentFeatures}></MessageList>
          </div>
          <div
            style={{
              gridColumn: "10 /  13",
              gridRow: "6 / 13",
              padding: "30px",
            }}
          >
            {/* <BarChart data={this.state.avgEmotions}></BarChart> */}
            <PieChart data={this.state.avgEmotions}></PieChart>
          </div>
        </Container>
      </div>
    );
  }
}

export default App;
