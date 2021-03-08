import React, { Component } from "react";
import { Container } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import Map from "./components/map/map";
import MessageList from "./components/messagelist/messagelist";
import moment from "moment";
import * as d3 from "d3";
import axios from "axios";
import * as turf from "@turf/turf";
import "./App.css";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import LineChart from "./components/timeline/timeline";
import StackedLine from "./components/timeline/stackedLine";
import PieChart from "./components/pieChart/pieChart";
import TopicTreeMap from "./components/topicTreeMap/topicTreeMap";
import AppBar from "@material-ui/core/AppBar";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import { filter } from "d3";

let borderColor = "grey";
let parseDate = d3.timeParse("%Y-%m-%d %H");

const styles = (theme) => ({
  root: {
    display: "grid",
    gridTemplateColumns: "repeat(12,1fr)",
    gridTemplateRows: "repeat(12,1fr)",
    height: "92%",
    margin: "0 auto",
    width: "100%",
    padding: 0,
    margin: 0,
  },
  map: {
    gridColumn: "1 / 10",
    gridRow: "1 / 8",
    border: "solid",
    borderColor: borderColor,
  },
  messages: {
    gridColumn: "10 / 13",
    gridRow: "1 / 8",
    overflow: "scroll",
    // padding: "30px",
    border: "solid",
    borderColor: borderColor,
  },
  line: {
    gridColumn: "1 / 6",
    gridRow: "8 / 13",
    padding: "10px",
    border: "solid",
    borderColor: borderColor,
  },
  treemap: {
    gridColumn: "6/ 10",
    gridRow: "8 / 13",
    padding: "10px",
    border: "solid",
    borderColor: borderColor,
  },

  pie: {
    gridColumn: "10 /  13",
    gridRow: "8 / 13",
    padding: "30px",
    border: "solid",
    borderColor: borderColor,
  },
  lineTabBar: {
    width: "100%",
    height: "15%",
    margin: 0,
  },
  lineTabs: {
    backgroundColor: "grey",
  },
  linePanels: {
    margin: 0,
    width: "100%",
    height: "85%",
  },
});
class App extends Component {
  state = {
    response: "",
    post: "",
    geojson: [],
    mapFeatures: [],
    extentFeatures: [],
    timeCounts: {},
    emotionTimeData: [],
    avgEmotions: null,
    sortMessages: null,
    topicTerms: { 0: 0 },
    selectedTopic: -1,
    tabValue: 1,
    mapFilter: false,
    timeExtent: [],
    flyFeature: null,
    hoverTopic: null,
  };

  emotionColorMap = {
    Anger: "red",
    Disgust: "purple",
    Fear: "green",
    Joy: "orange",
    Sadness: "blue",
    Surprise: "teal",
  };

  handleFly = (flyFeatureIndex) => {
    this.setState({ flyFeature: flyFeatureIndex });
  };

  handleHoverTopic = (hoverTopic) => {
    console.log(hoverTopic);
    this.setState({ hoverTopic: hoverTopic });
  };

  handleReset = () => {
    this.handleExtentFeatures(this.state.geojson);
    this.setState({ mapFeatures: this.state.geojson });
  };

  handleLineChartTabChange = (event, newValue) => {
    console.log(newValue);
    this.setState({ tabValue: newValue });
  };

  handleSelectedTopic = (topicid) => {
    this.setState({ selectedTopic: topicid });
    if (topicid !== -1) {
      let features = this.state.extentFeatures.filter((f) => {
        return f.properties.topic == topicid;
      });
      this.handleExtentFeatures(features);
      this.setState({ mapFeatures: features });
    } else {
      this.handleExtentFeatures(this.state.geojson);
      this.setState({ mapFeatures: this.state.geojson });
    }
  };

  handleSelectedTime = (timeExtent) => {
    if (timeExtent) {
      let filter = this.state.extentFeatures.filter((f) => {
        return (
          f.properties.date > d3.min(timeExtent) &&
          f.properties.date < d3.max(timeExtent)
        );
      });
      this.setState({ mapFeatures: filter });
      this.handleExtentFeatures(filter);
    } else {
      this.setState({ mapFeatures: this.state.extentFeatures });
    }
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

    let timeCounts = {};
    let emotionTimeCounts = {};
    features.forEach((f) => {
      let d = f.properties.date.format("YYYY-MM-DD HH");
      if (!(d in emotionTimeCounts)) {
        emotionTimeCounts[d] = {
          Anger: 0,
          Disgust: 0,
          Fear: 0,
          Joy: 0,
          Sadness: 0,
          Surprise: 0,
        };
      }
      timeCounts[d] ? timeCounts[d]++ : (timeCounts[d] = 1);
      let fEmotions = [];
      let fEmotVals = [];
      Object.keys(avgEmotions).forEach((k) => {
        avgEmotions[k] += f.properties[k];
        fEmotions.push({ emotion: k, value: f.properties[k] });
        fEmotVals.push(f.properties[k]);
      });

      let maxEmotIndex = fEmotVals.indexOf(d3.max(fEmotVals));
      let maxEmotion = fEmotions[maxEmotIndex];
      f.properties["maxEmotion"] = maxEmotion;
      emotionTimeCounts[d][maxEmotion.emotion]++;
    });

    let emotionTimeData = Object.keys(emotionTimeCounts).map((dateValue) => {
      let d = { date: dateValue };
      Object.keys(emotionTimeCounts[dateValue]).forEach((emot) => {
        d[emot] = emotionTimeCounts[dateValue][emot];
      });
      Object.keys(avgEmotions).forEach((emot) => {
        if (!(emot in d)) {
          d[emot] = 0;
        }
      });
      return d;
    });

    // console.log(emotionTimeData);

    Object.keys(avgEmotions).forEach((k) => {
      avgEmotions[k] = avgEmotions[k] / features.length;
    });

    this.setState({ timeCounts: timeCounts });
    this.setState({ avgEmotions: avgEmotions });
    this.setState({ extentFeatures: features });
    this.setState({ emotionTimeData: emotionTimeData });
  };

  handleSort = (sort) => {
    this.setState({ sortMessages: sort });
  };

  handleFeatureSearch = (feature, layerType) => {
    let filteredFeatures;
    if (layerType === "polygon" || layerType === "rectangle") {
      feature = feature.toGeoJSON();
      feature = turf.polygon(feature.geometry.coordinates);

      filteredFeatures = this.state.mapFeatures.filter((f) => {
        let p = turf.point(f.geometry.coordinates);
        return turf.booleanPointInPolygon(p, feature);
      });
    } else if (layerType === "circle") {
      console.log(feature);
      let theCenterPt = feature.getLatLng();

      let center = [theCenterPt.lng, theCenterPt.lat];
      console.log(center);

      let theRadius = feature.getRadius();
      console.log(theRadius);
      let options = { steps: 32, units: "meters" }; //Change steps to 4 to see what it does.
      let turfCircle = turf.circle(center, theRadius, options);

      filteredFeatures = this.state.mapFeatures.filter((f) => {
        let p = turf.point(f.geometry.coordinates);
        return turf.booleanPointInPolygon(p, turfCircle);
      });
    }
    // console.log(filteredFeatures);

    if (filteredFeatures.length > 0) {
      this.handleExtentFeatures(filteredFeatures);
      this.setState({ mapFeatures: filteredFeatures });
    }
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
        // f["properties"]["date"] = moment(f["properties"]["created_at"]);
        f["properties"]["date"] = moment(f["properties"]["time"]);

        // time
        // f["properties"]["date"] = moment(f["properties"]["date_time"]);
      });
      // console.log(geojson);
      this.setState({ geojson: geojson });
      this.setState({ mapFeatures: geojson });
      this.handleExtentFeatures(geojson);
    });

    axios.get("/api/topics").then((res) => {
      console.log(res.data);
      this.setState({ topicTerms: res.data });
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className="app" style={{ height: "100%" }}>
        <NavBar
          handleReset={this.handleReset}
          height={"8%"}
          className="navBar"
          count={this.state.extentFeatures.length}
          totalCount={this.state.geojson.length}
        ></NavBar>
        <Container
          className={classes.root}
          id="root-container"
          maxWidth={false}
        >
          <div className={classes.map}>
            <Map
              mapFilter={this.state.mapFilter}
              geojson={this.state.mapFeatures}
              featureName={this.state.selectedFeature}
              handleExtentFeatures={this.handleExtentFeatures}
              handleFeatureSearch={this.handleFeatureSearch}
              flyFeature={this.state.flyFeature}
            ></Map>
          </div>
          <div className={classes.line}>
            <AppBar position="static" className={classes.lineTabBar}>
              <Tabs
                className={classes.lineTabs}
                variant="fullWidth"
                value={this.state.tabValue}
                onChange={this.handleLineChartTabChange}
                aria-label="simple tabs example"
              >
                <Tab label="Total + Peaks" />
                <Tab label="Emotions" />
              </Tabs>
            </AppBar>
            {/* */}
            <div className={classes.linePanels}>
              {this.state.tabValue === 0 ? (
                <LineChart
                  data={this.state.timeCounts}
                  handleSelectedTime={this.handleSelectedTime}
                ></LineChart>
              ) : (
                <StackedLine
                  handleSelectedTime={this.handleSelectedTime}
                  emotionColorMap={this.emotionColorMap}
                  tabValue={this.state.tabValue}
                  data={this.state.emotionTimeData}
                ></StackedLine>
              )}
            </div>
          </div>
          <div className={classes.treemap}>
            <TopicTreeMap
              hoverTopic={this.state.hoverTopic}
              data={this.state.extentFeatures}
              topicTerms={this.state.topicTerms}
              handleSelectedTopic={this.handleSelectedTopic}
            ></TopicTreeMap>
          </div>
          <div className={classes.messages}>
            <MessageList
              handleFly={this.handleFly}
              handleHoverTopic={this.handleHoverTopic}
              emotionColorMap={this.emotionColorMap}
              sortMessages={this.state.sortMessages}
              messages={this.state.extentFeatures}
              topicTerms={this.state.topicTerms}
            ></MessageList>
          </div>
          <div className={classes.pie}>
            <PieChart
              handleSort={this.handleSort}
              data={this.state.avgEmotions}
            ></PieChart>
          </div>
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(App);
