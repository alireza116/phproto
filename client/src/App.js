import React, { Component } from "react";
import { Container, Grid } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import Map from "./components/map/map";
import MessageList from "./components/messagelist/messagelist";
import BarChart from "./components/barchart/barchart";
import logo from "./logo.svg";
import axios from "axios";
import * as turf from "@turf/turf";
import "./App.css";

class App extends Component {
  state = {
    response: "",
    post: "",
    geojson: null,
    extentFeatures: [],
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
    this.setState({ avgEmotions: avgEmotions });
    this.setState({ extentFeatures: features });
  };

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
      });
      this.handleExtentFeatures(geojson);
      this.setState({ geojson: geojson });
    });
  }

  render() {
    return (
      <div className="app" style={{ height: "100%" }}>
        <NavBar height={"8%"} className="navBar"></NavBar>
        <Container
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gridTemplateRows: "repeat(2,1fr)",
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
              gridColumnStart: "1",
              gridColumnEnd: "4",
              gridRowStart: "1",
              gridRowEnd: "3",
            }}
          >
            <Map
              geojson={this.state.geojson}
              handleExtentFeatures={this.handleExtentFeatures}
            ></Map>
          </div>
          <div
            style={{
              gridColumn: "4",
              gridRow: "1",
              overflow: "scroll",
              padding: "10px",
            }}
          >
            <MessageList messages={this.state.extentFeatures}></MessageList>
          </div>
          <div style={{ gridColumn: "4", gridRow: "2" }}>
            <BarChart data={this.state.avgEmotions}></BarChart>
          </div>
        </Container>
      </div>
    );
  }
}

export default App;
