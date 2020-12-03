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
import LineChart from "./components/timeline/timeline";
import StackedLine from "./components/timeline/stackedLine";
import StackedArea from "./components/timeline/stackedArea";
import PieChart from "./components/pieChart/pieChart";
import TopicTreeMap from "./components/topicTreeMap/topicTreeMap";
import { makeStyles, withStyles } from "@material-ui/core/styles";

let borderColor = "grey";

let colorMap = {
  Anger: "red",
  Disgust: "purple",
  Fear: "green",
  Joy: "orange",
  Sadness: "blue",
  Surprise: "teal",
};
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
    padding: "30px",
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
});
class App extends Component {
  state = {
    response: "",
    post: "",
    geojson: null,
    extentFeatures: [],
    timeCounts: {},
    emotionTimeData: [],
    avgEmotions: null,
    sortMessages: null,
    topicTerms: null,
    selectedTopic: -1,
  };

  handleSelectedTopic = (topicid) => {
    this.setState({ selectedTopic: topicid });
  };

  handleExtentFeatures = (features) => {
    if (this.state.selectedTopic != -1) {
      features = features.filter((f) => {
        return f.properties.topic == this.state.selectedTopic;
      });
    }
    let avgEmotions = {
      Anger: 0.0,
      Disgust: 0.0,
      Fear: 0.0,
      Joy: 0.0,
      Sadness: 0.0,
      Surprise: 0.0,
    };
    // features.forEach((feature) => {
    // Object.keys(avgEmotions).forEach((k) => {
    //   avgEmotions[k] += feature.properties[k];
    // });
    // });

    let timeCounts = {};
    // let emotionTimeCounts = {
    //   Anger: {},
    //   Disgust: {},
    //   Fear: {},
    //   Joy: {},
    //   Sadness: {},
    //   Surprise: {},
    // };
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
      emotionTimeCounts[d][maxEmotion.emotion]++;
      // ? emotionTimeCounts[d][maxEmotion.emotion]++
      // : (emotionTimeCounts[d][maxEmotion.emotion] = 1);
    });

    // Object.keys(emotionTimeCounts).forEach((emotion) => {
    //   let emotionCounts = emotionTimeCounts[emotion];
    //   emotionTimeCounts[emotion] = Object.keys(emotionCounts).map(
    //     (dateValue) => {
    //       return { x: dateValue, y: emotionCounts[dateValue] };
    //     }
    //   );
    // });
    // console.log(emotionTimeCounts);

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
    console.log(sort);
    this.setState({ sortMessages: sort });
  };

  handleFeatureSearch = (feature, layerType, geojson) => {
    console.log(feature);
    let filteredFeatures;
    if (layerType === "polygon" || layerType === "rectangle") {
      feature = feature.toGeoJSON();
      feature = turf.polygon(feature.geometry.coordinates);

      filteredFeatures = geojson.filter((f) => {
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
      let options = { steps: 64, units: "meters" }; //Change steps to 4 to see what it does.
      let turfCircle = turf.circle(center, theRadius, options);

      filteredFeatures = geojson.filter((f) => {
        let p = turf.point(f.geometry.coordinates);
        return turf.booleanPointInPolygon(p, turfCircle);
      });
    }

    if (filteredFeatures.length > 0) {
      this.handleExtentFeatures(filteredFeatures);
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
        f["properties"]["date"] = moment(f["properties"]["date_time"]);
      });
      // console.log(geojson);
      this.setState({ geojson: geojson });
      this.handleExtentFeatures(geojson);
    });

    axios.get("/api/topics").then((res) => {
      console.log(res.data[1]);
      this.setState({ topicTerms: res.data });
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className="app" style={{ height: "100%" }}>
        <NavBar height={"8%"} className="navBar"></NavBar>
        <Container
          className={classes.root}
          id="root-container"
          maxWidth={false}
        >
          <div className={classes.map}>
            <Map
              geojson={this.state.geojson}
              featureName={this.state.selectedFeature}
              handleExtentFeatures={this.handleExtentFeatures}
              handleFeatureSearch={this.handleFeatureSearch}
            ></Map>
          </div>
          <div className={classes.line}>
            {/* <LineChart data={this.state.timeCounts}></LineChart> */}
            <StackedLine data={this.state.emotionTimeData}></StackedLine>
            {/* <StackedArea
              data={this.state.emotionTimeData}
              keys={["Sadness", "Anger", "Joy", "Surprise", "Disgust", "Fear"]}
              colors={colorMap}
            ></StackedArea> */}
          </div>
          <div className={classes.treemap}>
            <TopicTreeMap
              data={this.state.extentFeatures}
              topicTerms={this.state.topicTerms}
              handleSelectedTopic={this.handleSelectedTopic}
            ></TopicTreeMap>
          </div>
          <div className={classes.messages}>
            <MessageList
              sortMessages={this.state.sortMessages}
              messages={this.state.extentFeatures}
            ></MessageList>
          </div>
          <div className={classes.pie}>
            {/* <BarChart data={this.state.avgEmotions}></BarChart> */}
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
