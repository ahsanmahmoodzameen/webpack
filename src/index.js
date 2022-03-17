import {
  Ion,
  Viewer,
  Cartesian3,
  Math,
  Cesium3DTileset,
  Cesium3DTileStyle,
  ScreenSpaceEventType,
  Color,
  data,
  defined,
  Entity,
  ProviderViewModel,
  buildModuleUrl,
  UrlTemplateImageryProvider,
  knockout,
  BaseLayerPicker,
  Transforms,
  HeadingPitchRange,
  HeadingPitchRoll,
  Matrix4,
  Quaternion,
  Cartographic,
  ScreenSpaceEventHandler,
  Matrix3,
  EasingFunction,
  PostProcessStageLibrary,
  CzmlDataSource,
  JulianDate,
  CesiumWidget,
  viewerCesiumNavigationMixin,
  Rectangle,
  //Math,
  mixinWidget,
  viewerCesium3DTilesInspectorMixin,
  ArcGisMapServerImageryProvider,
  SingleTileImageryProvider,
  SunLight,
} from "cesium";
import "cesium/Widgets/widgets.css";
import { jsPDF } from "jspdf";
//require("jspdf-autotable");
//import "jspdf-autotable";

import CesiumNavigation from "cesium-navigation-es6";

if (process.env.NODE_ENV !== "production") {
  console.log("Looks like we are in development mode!");
}

///variable definition for unit search
var bedRoomCount = {};
var Avaialbility = {};
var maxPrice = 0;
var maxArea = 0,
  FloorValue = 0;
var selectFloor = "false";
var saveCZMLInstanceForRemoving;
var pathCZML = "./CzmlPaths/";
//for compass ring
const options = {};

// for production or for development

var dataPath = "Data";

options.defaultResetView = Rectangle.fromDegrees(80, 22, 130, 50);

options.enableCompass = true;

options.enableZoomControls = false;

options.enableDistanceLegend = false;

options.enableCompassOuterRing = false;

//working fine
//import "../dist/src/css/button.css";

//Unhide the bottom home div so that page load at once
document.getElementById("bottomHomeDiv").hidden = "";
import "../src/css/main.css";
import "../src/css/button.css";

//load file from API
/*
let users;

async function propForceAccess() {
  let response = await fetch(
    "http://54.72.205.173:3011/cpml/units?status=1%2C%202%2C%203%2C%204%2C%205%2C%206%2C%207%2C%208%2C%209%2C%2010&project_id=2010"
  );
  users = await response.json();

  //assign color to each tileset from ListingStatus

  setTilesetOpacity(0);

  console.log(users);
}
*/

//for locally file read json file

let users;

async function propForceAccess() {
  let response = await fetch("./data.json");
  users = await response.json();

  //assign color to each tileset from ListingStatus

  setTilesetOpacity(0);

  console.log(users);
}

propForceAccess();

//mapbox access and adding into cesium viewer
var MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYWhzYW4tbWFobW9vZCIsImEiOiJja3ZrZ20xYzMyZzIwMm9xNTRhZmdydGEyIn0.RckpXRnqso3zRc2RFFlyFQ";
var MAPBOX_STYLE_ID = "ckytscu77000i15l4svzbiqxo";
var MAPBOX_USERNAME = "ahsan-mahmood";
var defaultMap =
  "https://api.mapbox.com/styles/v1/" +
  MAPBOX_USERNAME +
  "/" +
  MAPBOX_STYLE_ID +
  "/tiles/256/{z}/{x}/{y}?access_token=" +
  MAPBOX_ACCESS_TOKEN;

var providerViewModels = [];

providerViewModels.push(
  new ProviderViewModel({
    name: "Satellite Streets-copy",
    //just ignore below image
    iconUrl: buildModuleUrl("./images/cross-white.png"),
    tooltip: "some tooltip text (optional)",
    creationFunction: function () {
      return new UrlTemplateImageryProvider({
        url: defaultMap,
      });
    },
  })
);
var selectedImagery = providerViewModels[0];
var viewer = new Viewer("cesiumContainer", {
  homeButton: false,
  imageryProvider: false,
  navigationHelpButton: false,
  baseLayerPicker: false,
  geocoder: false,
  sceneModePicker: false,
  shouldAnimate: true,
  animation: false,
  infoBox: false,
  fullscreenButton: false,
  timeline: false,
  contextOptions: {
    webgl: {
      alpha: false,
      depth: true,
      stencil: false,
      antialias: false, // This one is the only I’ve modified to false from true, the rest are at default values
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
    },
    allowTextureFilterAnisotropic: false, // this should improve a little bit
  },
});
new CesiumNavigation(viewer, options);
var layers = viewer.imageryLayers;

var baseLayerPicker = new BaseLayerPicker("baseLayerPickerContainer", {
  globe: viewer.scene.globe,
  imageryProviderViewModels: providerViewModels,
  // selectedImageryProviderViewModel: selectedImagery,
});

//viewer.imageryLayers.addImageryProvider(providerViewModels, 0);
//get imagery and update the brightness and values
var imageryLayers = viewer.imageryLayers;

// set the brightness of scene
var viewModel = {
  brightness: 0,
  contrast: 0,
  hue: 0,
  saturation: 0,
  gamma: 0,
};
// Convert the viewModel members into knockout observables.
knockout.track(viewModel);

//var unsubscribeTicks = viewer.clock.onTick.addEventListener(onTickCallback);
//viewer.clock.onTick.addEventListener(onTickCallback);

//rotate the globe at the start
var unsubscribe = viewer.clock.onTick.addEventListener(function (clock) {
  viewer.scene.camera.rotateRight(0.001);
});
//unsubscribe();

// Bind the viewModel to the DOM elements of the UI that call for it.
var toolbar = document.getElementById("toolbar");
knockout.applyBindings(viewModel, toolbar);

// add the brightness and other modules for changes
// Make the active imagery layer a subscriber of the viewModel.
function subscribeLayerParameter(name) {
  knockout.getObservable(viewModel, name).subscribe(function (newValue) {
    if (imageryLayers.length > 0) {
      var layer = imageryLayers.get(0);
      layer[name] = newValue;
    }
  });
}
subscribeLayerParameter("brightness");
subscribeLayerParameter("contrast");
subscribeLayerParameter("hue");
subscribeLayerParameter("saturation");
subscribeLayerParameter("gamma");

//change values here of brightness and other
// Make the viewModel react to base layer changes.
function updateViewModel() {
  if (imageryLayers.length > 0) {
    var layer = imageryLayers.get(0);
    viewModel.brightness = 1.2;
    viewModel.contrast = 1.1;
    viewModel.hue = -0.2;
    viewModel.saturation = 1;
    viewModel.gamma = 1;
  }
}

updateViewModel();

//handler for viewing feature cesium js

var scene = viewer.scene;

// Set the initial camera view to look at Asia
//(74.349753, 31.53545, 150),
var initialPosition = Cartesian3.fromDegrees(
  74.01881302800248,
  31.69114333714821,
  25000000
);
var initialOrientation;
/* = new HeadingPitchRoll.fromDegrees(
  21.27879878293835,
  -21.34390550872461,
  0.0716951918898415
);*/

// set first view
viewer.scene.camera.setView({
  destination: initialPosition,
  orientation: initialOrientation,
  endTransform: Matrix4.IDENTITY,
});

// add the zoom function to each unit search here
var handler = new ScreenSpaceEventHandler(viewer.canvas);

handler.setInputAction(function (movement) {
  var feature = viewer.scene.pick(movement.position);
  if (!defined(feature)) {
    return;
  }
  zoom(movement, feature);
  // annotate(movement, feature);
}, ScreenSpaceEventType.LEFT_CLICK);

function zoom(movement, feature) {
  var position = scene.pickPosition(movement.position);

  var camera = scene.camera;
  var heading = camera.heading;
  var pitch = camera.pitch;

  var offset = offsetFromHeadingPitchRange(heading, pitch, 100.0);

  var transform = Transforms.eastNorthUpToFixedFrame(position);
  Matrix4.multiplyByPoint(transform, offset, position);
  var pickedFeature = viewer.scene.pick(movement.position);
  //just zoom whenever click on unit having propID
  if (pickedFeature.getProperty("PropForceID")) {
    /*camera.flyTo({
      destination: position,
      orientation: initialOrientation,
      //easingFunction: EasingFunction.QUADRATIC_OUT,
    });*/
    camera.flyTo({
      destination: position,
      orientation: {
        heading: heading,
        pitch: pitch,
      },
      easingFunction: EasingFunction.QUADRATIC_OUT,
    });
  }
}
var height = 50;
function annotate(movement, feature) {
  if (scene.pickPositionSupported) {
    var cartesian = scene.pickPosition(movement.position);
    if (defined(cartesian)) {
      var cartographic = Cartographic.fromCartesian(cartesian);
      // var height = cartographic.height.toFixed(2) + " m";
      height = cartographic.height;
      // console.log(height);
    }
  }
}
function offsetFromHeadingPitchRange(heading, pitch, range) {
  pitch = Math.clamp(pitch, -Math.PI_OVER_TWO, Math.PI_OVER_TWO);
  heading = Math.zeroToTwoPi(heading) - Math.PI_OVER_TWO;

  var pitchQuat = Quaternion.fromAxisAngle(Cartesian3.UNIT_Y, -pitch);
  var headingQuat = Quaternion.fromAxisAngle(Cartesian3.UNIT_Z, -heading);
  var rotQuat = Quaternion.multiply(headingQuat, pitchQuat, headingQuat);
  var rotMatrix = Matrix3.fromQuaternion(rotQuat);

  var offset = Cartesian3.clone(Cartesian3.UNIT_X);
  Matrix3.multiplyByVector(rotMatrix, offset, offset);
  Cartesian3.negate(offset, offset);
  Cartesian3.multiplyByScalar(offset, range, offset);
  return offset;
}

//////////////////////////////////

//set brightness value

viewer._cesiumWidget._creditContainer.style.display = "none";
function hideSurrondings() {
  viewer.entities.removeAll();
}

function drawPathOnMap(filename) {
  //pathCZML = ;
  pathCZML = "./CzmlPaths/" + filename + ".czml";

  viewer.dataSources.remove(saveCZMLInstanceForRemoving);
  viewer.dataSources
    .add(CzmlDataSource.load(pathCZML))
    .then(function (datasource) {
      saveCZMLInstanceForRemoving = datasource;
    });
}

function removePathOnMap() {
  viewer.dataSources.remove(saveCZMLInstanceForRemoving);
}

//load building quadrangle
var building = viewer.scene.primitives.add(
  new Cesium3DTileset({
    //for Production level
    //url: "./output/Placemark/tileset.json",

    //test for production and for live data
    //    url: "./Data/Placemark/tileset.json",
    url: "./" + dataPath + "/Placemark/tileset.json",
    //for development using wampp

    // url: "http://localhost/Data/Placemark/tileset.json",
    tileCacheSize: 1000,
    //set blocks visibility 1 display always, 100 hide when zoom out
    maximumScreenSpaceError: 10,
  })
);

var lahoreData = viewer.scene.primitives.add(
  new Cesium3DTileset({
    //for Production level
    //url: "./output/LahoreData3Dtiles/tileset.json",

    //test for production and for live data
    //url: "./Data/LahoreData3Dtiles/tileset.json",
    url: "./" + dataPath + "/LahoreData3Dtiles/tileset.json",
    //for development using wampp
    //url: "http://localhost/Data/LahoreData3Dtiles/tileset.json",

    tileCacheSize: 1000,
    //set blocks visibility 1 display always, 100 hide when zoom out
    maximumScreenSpaceError: 200,
  })
);

lahoreData.style = new Cesium3DTileStyle({
  color: {
    evaluateColor: function (feature, result) {
      return Color.clone(Color.WHITE.withAlpha(1), result);
      //return Color.clone(Color.fromRandom(), result);
    },
  },
});

//viewer.scene.globe.enableLighting = true;

//////////test case
/*
const czmlPath = "./CzmlPaths/";
let vehicleEntity;

// Add a blank CzmlDataSource to hold our multi-part entity/entities.
const dataSource = new CzmlDataSource();
viewer.dataSources.add(dataSource);

// This demo shows how a single path can be broken up into several CZML streams.
const partsToLoad = [
  {
    url: "MultipartVehicle_part1.czml",
    range: [0, 1500],
    requested: false,
    loaded: false,
  },
];

function processPart(part) {
  part.requested = true;
  // updateStatusDisplay();
  dataSource.process(czmlPath + part.url).then(function () {
    part.loaded = true;
    // updateStatusDisplay();

    // Follow the vehicle with the camera.
    if (!viewer.trackedEntity) {
      viewer.trackedEntity = vehicleEntity =
        dataSource.entities.getById("Vehicle");
    }
  });
}

const moveVehicle = function (a, b) {
  console.log("speed of vehicle is ", a, b);
};
moveVehicle(10, 20);
// Load the first part up front.
processPart(partsToLoad[0]);
*/
//load blocks
var tileset = viewer.scene.primitives.add(
  new Cesium3DTileset({
    //for Production level

    //url: "./output/quadrangleblocks/tileset.json",

    //test for production and for live data
    // url: "./Data/quadrangleblocks/tileset.json",
    url: "./" + dataPath + "/quadrangleblocks/tileset.json",
    //for development using wampp
    //url: "http://localhost/Data/quadrangleblocks/tileset.json",

    tileCacheSize: 1000,
    //set blocks visibility 1 display always, 100 hide when zoom out
    maximumScreenSpaceError: 10,
  })
);

//set opacity of units
function setTilesetOpacity(x) {
  tileset.style = new Cesium3DTileStyle({
    color: {
      evaluateColor: function (feature, result) {
        var propForceIdsTemp = feature.getProperty("PropForceID").split(" ");
        //colors= DARKGREY

        for (var i = 0; i < users.data.length; i++) {
          if (users.data[i].id == propForceIdsTemp) {
            //console.log("first if true");

            if (users.data[i].ListingStatus.name == "Available") {
              return Color.clone(Color.CHARTREUSE.withAlpha(x), result);
            } else if (users.data[i].ListingStatus.name == "Sold/Closed Won") {
              return Color.clone(Color.RED.withAlpha(x), result);
            } else if (users.data[i].ListingStatus.name == "Hold") {
              return Color.clone(Color.AQUA.withAlpha(x), result);
            } else if (
              users.data[i].ListingStatus.name == "Partial Down Payment"
            ) {
              return Color.clone(Color.ORANGE.withAlpha(x), result);
            } else if (users.data[i].ListingStatus.name == "Token Payment") {
              return Color.clone(Color.YELLOW.withAlpha(x), result);
            }
          }
        }
        return Color.clone(Color.CORNSILK.withAlpha(x), result);
      },
    },
  });
}

//convert number into floor level
//unit search with enabled floor level
function completeUnitSearch1(
  Avaialbility,
  bedRoomCount,
  maxArea,
  maxPrice,
  floorValue
) {
  var FloorValueFromUsersData;
  tileset.style = new Cesium3DTileStyle({
    color: {
      evaluateColor: function (feature, result) {
        var propForceIdsTemp = feature.getProperty("PropForceID").split(" ");
        //colors= DARKGREY

        //Default case for showing All Availability
        //base case
        if (
          Avaialbility[0] == 0 &&
          Avaialbility[1] == 0 &&
          Avaialbility[2] == 0 &&
          Avaialbility[3] == 0 &&
          Avaialbility[4] == 0
        ) {
          Avaialbility[0] = 0.5;
          Avaialbility[1] = 0.5;

          Avaialbility[2] = 0.5;
          Avaialbility[3] = 0.5;
          Avaialbility[4] = 0.5;
        }
        //Default case for showing All Bedroom
        //base case
        if (
          bedRoomCount[0] == -1 &&
          bedRoomCount[1] == -1 &&
          bedRoomCount[2] == -1 &&
          bedRoomCount[3] == -1 &&
          bedRoomCount[4] == -1 &&
          bedRoomCount[5] == -1
        ) {
          //base case ignore studio
          bedRoomCount[0] = 6;
          bedRoomCount[1] = 1;

          bedRoomCount[2] = 2;
          bedRoomCount[3] = 3;
          bedRoomCount[4] = 4;
          bedRoomCount[5] = 0;
        }

        for (var i = 0; i < users.data.length; i++) {
          if (users.data[i].id == propForceIdsTemp) {
            //console.log("first if true");
            //converting floor name to value
            if (users.data[i].ProjectSection.name == "Eleventh") {
              FloorValueFromUsersData = 11;
            } else if (users.data[i].ProjectSection.name == "Tenth") {
              FloorValueFromUsersData = 10;
            } else if (users.data[i].ProjectSection.name == "Ninth") {
              FloorValueFromUsersData = 9;
            } else if (users.data[i].ProjectSection.name == "Eighth") {
              FloorValueFromUsersData = 8;
            } else if (users.data[i].ProjectSection.name == "Seventh") {
              FloorValueFromUsersData = 7;
            } else if (users.data[i].ProjectSection.name == "Sixth") {
              FloorValueFromUsersData = 6;
            } else if (users.data[i].ProjectSection.name == "Fifth") {
              FloorValueFromUsersData = 5;
            } else if (users.data[i].ProjectSection.name == "Fourth") {
              FloorValueFromUsersData = 4;
            } else if (users.data[i].ProjectSection.name == "Third") {
              FloorValueFromUsersData = 3;
            } else if (users.data[i].ProjectSection.name == "Second") {
              FloorValueFromUsersData = 2;
            } else if (users.data[i].ProjectSection.name == "First") {
              FloorValueFromUsersData = 1;
            } else if (users.data[i].ProjectSection.name == "Ground") {
              FloorValueFromUsersData = 0;
            }

            // console.log(users.data[i].id);
            if (users.data[i].id != 59324 && users.data[i].id != 59323) {
              if (
                (users.data[i].bed == bedRoomCount[0] ||
                  users.data[i].bed == bedRoomCount[1] ||
                  users.data[i].bed == bedRoomCount[2] ||
                  users.data[i].bed == bedRoomCount[3] ||
                  users.data[i].bed == bedRoomCount[4] ||
                  users.data[i].bed == bedRoomCount[5]) &&
                users.data[i].landArea <= maxArea &&
                users.data[i].price <= maxPrice &&
                FloorValueFromUsersData == floorValue
              ) {
                if (users.data[i].ListingStatus.name == "Available") {
                  return Color.clone(
                    Color.CHARTREUSE.withAlpha(Avaialbility[0]),
                    result
                  );
                } else if (users.data[i].ListingStatus.name == "Hold") {
                  return Color.clone(
                    Color.AQUA.withAlpha(Avaialbility[1]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Sold/Closed Won"
                ) {
                  return Color.clone(
                    Color.RED.withAlpha(Avaialbility[2]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Partial Down Payment"
                ) {
                  return Color.clone(
                    Color.ORANGE.withAlpha(Avaialbility[3]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Token Payment"
                ) {
                  return Color.clone(
                    Color.YELLOW.withAlpha(Avaialbility[4]),
                    result
                  );
                }
              }
            } else {
              //console.log("condition true", users.data[i].id);

              //for penthouse specifically, with 3 bedrooms and id number 59323, 59324
              if (
                bedRoomCount[4] == 4 &&
                users.data[i].landArea <= maxArea &&
                users.data[i].price <= maxPrice &&
                FloorValueFromUsersData == floorValue
              ) {
                if (users.data[i].ListingStatus.name == "Available") {
                  return Color.clone(
                    Color.CHARTREUSE.withAlpha(Avaialbility[0]),
                    result
                  );
                } else if (users.data[i].ListingStatus.name == "Hold") {
                  return Color.clone(
                    Color.AQUA.withAlpha(Avaialbility[1]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Sold/Closed Won"
                ) {
                  return Color.clone(
                    Color.RED.withAlpha(Avaialbility[2]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Partial Down Payment"
                ) {
                  return Color.clone(
                    Color.ORANGE.withAlpha(Avaialbility[3]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Token Payment"
                ) {
                  return Color.clone(
                    Color.YELLOW.withAlpha(Avaialbility[4]),
                    result
                  );
                }
              }
            }
          }
        }
        // console.log("total price", x);
        return Color.clone(Color.CORNSILK.withAlpha(0), result);
      },
    },
  });
}

//unit search without enabled floor level
function completeUnitSearch2(
  Avaialbility,
  bedRoomCount,
  maxArea,
  maxPrice,
  floorValue
) {
  var FloorValueFromUsersData;
  tileset.style = new Cesium3DTileStyle({
    color: {
      evaluateColor: function (feature, result) {
        var propForceIdsTemp = feature.getProperty("PropForceID").split(" ");
        //colors= DARKGREY

        //Default case for showing All Availability
        //base case
        if (
          Avaialbility[0] == 0 &&
          Avaialbility[1] == 0 &&
          Avaialbility[2] == 0 &&
          Avaialbility[3] == 0 &&
          Avaialbility[4] == 0
        ) {
          Avaialbility[0] = 0.5;
          Avaialbility[1] = 0.5;

          Avaialbility[2] = 0.5;
          Avaialbility[3] = 0.5;
          Avaialbility[4] = 0.5;
        }
        //Default case for showing All Bedroom
        //base case
        if (
          bedRoomCount[0] == -1 &&
          bedRoomCount[1] == -1 &&
          bedRoomCount[2] == -1 &&
          bedRoomCount[3] == -1 &&
          bedRoomCount[4] == -1 &&
          bedRoomCount[5] == -1
        ) {
          //base case ignore studio
          bedRoomCount[0] = 6;
          bedRoomCount[1] = 1;

          bedRoomCount[2] = 2;
          bedRoomCount[3] = 3;
          bedRoomCount[4] = 4;
          bedRoomCount[5] = 0;
        }

        for (var i = 0; i < users.data.length; i++) {
          if (users.data[i].id == propForceIdsTemp) {
            //console.log("first if true");
            //converting floor name to value
            if (users.data[i].ProjectSection.name == "Eleventh") {
              FloorValueFromUsersData = 11;
            } else if (users.data[i].ProjectSection.name == "Tenth") {
              FloorValueFromUsersData = 10;
            } else if (users.data[i].ProjectSection.name == "Ninth") {
              FloorValueFromUsersData = 9;
            } else if (users.data[i].ProjectSection.name == "Eighth") {
              FloorValueFromUsersData = 8;
            } else if (users.data[i].ProjectSection.name == "Seventh") {
              FloorValueFromUsersData = 7;
            } else if (users.data[i].ProjectSection.name == "Sixth") {
              FloorValueFromUsersData = 6;
            } else if (users.data[i].ProjectSection.name == "Fifth") {
              FloorValueFromUsersData = 5;
            } else if (users.data[i].ProjectSection.name == "Fourth") {
              FloorValueFromUsersData = 4;
            } else if (users.data[i].ProjectSection.name == "Third") {
              FloorValueFromUsersData = 3;
            } else if (users.data[i].ProjectSection.name == "Second") {
              FloorValueFromUsersData = 2;
            } else if (users.data[i].ProjectSection.name == "First") {
              FloorValueFromUsersData = 1;
            } else if (users.data[i].ProjectSection.name == "Ground") {
              FloorValueFromUsersData = 0;
            }

            //console.log(users.data[i].bed);
            if (users.data[i].id != 59324 && users.data[i].id != 59323) {
              if (
                (users.data[i].bed == bedRoomCount[0] ||
                  users.data[i].bed == bedRoomCount[1] ||
                  users.data[i].bed == bedRoomCount[2] ||
                  users.data[i].bed == bedRoomCount[3] ||
                  users.data[i].bed == bedRoomCount[4] ||
                  users.data[i].bed == bedRoomCount[5]) &&
                users.data[i].landArea <= maxArea &&
                users.data[i].price <= maxPrice
              ) {
                if (users.data[i].ListingStatus.name == "Available") {
                  return Color.clone(
                    Color.CHARTREUSE.withAlpha(Avaialbility[0]),
                    result
                  );
                } else if (users.data[i].ListingStatus.name == "Hold") {
                  return Color.clone(
                    Color.AQUA.withAlpha(Avaialbility[1]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Sold/Closed Won"
                ) {
                  return Color.clone(
                    Color.RED.withAlpha(Avaialbility[2]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Partial Down Payment"
                ) {
                  return Color.clone(
                    Color.ORANGE.withAlpha(Avaialbility[3]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Token Payment"
                ) {
                  return Color.clone(
                    Color.YELLOW.withAlpha(Avaialbility[4]),
                    result
                  );
                }
              }
            } else {
              //console.log("condition true", users.data[i].id);

              //for penthouse specifically, with 3 bedrooms and id number 59323, 59324
              if (
                bedRoomCount[4] == 4 &&
                users.data[i].landArea <= maxArea &&
                users.data[i].price <= maxPrice
              ) {
                if (users.data[i].ListingStatus.name == "Available") {
                  return Color.clone(
                    Color.CHARTREUSE.withAlpha(Avaialbility[0]),
                    result
                  );
                } else if (users.data[i].ListingStatus.name == "Hold") {
                  return Color.clone(
                    Color.AQUA.withAlpha(Avaialbility[1]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Sold/Closed Won"
                ) {
                  return Color.clone(
                    Color.RED.withAlpha(Avaialbility[2]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Partial Down Payment"
                ) {
                  return Color.clone(
                    Color.ORANGE.withAlpha(Avaialbility[3]),
                    result
                  );
                } else if (
                  users.data[i].ListingStatus.name == "Token Payment"
                ) {
                  return Color.clone(
                    Color.YELLOW.withAlpha(Avaialbility[4]),
                    result
                  );
                }
              }
            }
          }
        }
        // console.log("total price", x);
        return Color.clone(Color.CORNSILK.withAlpha(0), result);
      },
    },
  });
}
//convert number into digits
var a = [
  "",
  "One ",
  "Two ",
  "Three ",
  "Four ",
  "Five ",
  "Six ",
  "Seven ",
  "Eight ",
  "Nine ",
  "Ten ",
  "Eleven ",
  "Twelve ",
  "Thirteen ",
  "Fourteen ",
  "Fifteen ",
  "Sixteen ",
  "Seventeen ",
  "Eighteen ",
  "Nineteen ",
];
var b = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
var n;
function inWords(num) {
  if ((num = num.toString()).length > 9) return "overflow";
  n = ("000000000" + num)
    .slice(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  var str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lac "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred "
      : "";
  /* str +=
    n[5] != 0
      ? (str != "" ? "And " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
        ""
      : "";*/
  return str;
}

// when click on any unit then perform this functionality
var rowCount = 0;
var featureName = "";
var pickedFeature;
var selectedEntity;
var row;
var i = 0;
var valueForSavingData;
var shapesparkLink = "https://hassaam09.shapespark.com/quarangle_studio01/";
var clickHandler = viewer.screenSpaceEventHandler.getInputAction(
  ScreenSpaceEventType.LEFT_CLICK
);
/////////////////////////////////

// Information about the currently selected feature
const selected = {
  feature: undefined,
  originalColor: new Color(),
};
var silhouetteGreen;
if (PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)) {
  // Silhouettes are supported

  silhouetteGreen = PostProcessStageLibrary.createEdgeDetectionStage();
  silhouetteGreen.uniforms.color = Color.ALICEBLUE.withAlpha(0.5);
  silhouetteGreen.uniforms.length = 0.0001;
  silhouetteGreen.selected = [];

  viewer.scene.postProcessStages.add(
    PostProcessStageLibrary.createSilhouetteStage([silhouetteGreen])
  );

  //
  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    // Pick a new feature

    pickedFeature = viewer.scene.pick(movement.position);
    if (!defined(pickedFeature)) {
      clickHandler(movement);

      return;
    }
    if (pickedFeature.getProperty("PropForceID")) {
      // If a feature was previously selected, undo the highlight
      silhouetteGreen.selected = [];

      // Select the feature if it's not already selected
      if (silhouetteGreen.selected[0] === pickedFeature) {
        return;
      }

      // Highlight newly selected feature
      silhouetteGreen.selected = [pickedFeature];
    }

    //setCameraView1(pickedFeature.getProperty("PropForceID"));

    if (pickedFeature.getProperty("PropForceID")) {
      if (
        pickedFeature.getProperty("PropForceID") != "Pool" &&
        pickedFeature.getProperty("PropForceID") != "Cafe" &&
        pickedFeature.getProperty("PropForceID") != "Toilet" &&
        pickedFeature.getProperty("PropForceID") != "Lift" &&
        pickedFeature.getProperty("PropForceID") != "Courtyard" &&
        pickedFeature.getProperty("PropForceID") != "Gym"
      ) {
        // Select the feature if it's not already selected
        document.getElementById("toolbarForDescription").hidden = "";
        ///////////////////////////////////////////

        selectedEntity = new Entity();

        viewer.selectedEntity = selectedEntity;
        featureName = "";
        selectedEntity.name = featureName;

        let check = pickedFeature.getProperty("PropForceID");

        //console.log(pickedFeature.getProperty("PropForceID"));
        for (i = 0; i < users.data.length; i++) {
          if (
            pickedFeature.getProperty("PropForceID") == "Pool" ||
            pickedFeature.getProperty("PropForceID") == "Cafe" ||
            pickedFeature.getProperty("PropForceID") == "Toilet" ||
            pickedFeature.getProperty("PropForceID") == "Lift" ||
            pickedFeature.getProperty("PropForceID") == "Courtyard" ||
            pickedFeature.getProperty("PropForceID") == "Gym"
          ) {
          } else if (
            pickedFeature.getProperty("PropForceID") == users.data[i].id
          ) {
            ////////////////////////////

            ////////////////////
            let videoLink;

            if (users.data[i].bed == 3) {
              if (
                pickedFeature.getProperty("PropForceID") == 59324 ||
                pickedFeature.getProperty("PropForceID") == 59323 ||
                pickedFeature.getProperty("PropForceID") == 59322
              ) {
                featureName = "Penthouse";
                shapesparkLink =
                  "https://saeedanwaraq17.shapespark.com/penthouse_type_c02/";
                videoLink =
                  "https://www.youtube.com/embed/aOwnTqPldK0?playlist=aOwnTqPldK0&loop=1;rel=0&autoplay=1&controls=0&showinfo=0";
              } else {
                featureName = "Three Bed";

                shapesparkLink =
                  "https://atifrazaq03.shapespark.com/quarangle_3bed/";
                videoLink =
                  "https://www.youtube.com/embed/7rgr5-NyDkM?playlist=7rgr5-NyDkM&loop=1;rel=0&autoplay=1&controls=0&showinfo=0";
              }
            } else if (users.data[i].bed == 4) {
              featureName = "Penthouse";
              shapesparkLink =
                "https://saeedanwaraq17.shapespark.com/penthouse_type_c02/";

              videoLink =
                "https://www.youtube.com/embed/aOwnTqPldK0?playlist=aOwnTqPldK0&loop=1;rel=0&autoplay=1&controls=0&showinfo=0";
            } else if (users.data[i].bed == 2) {
              featureName = "Two Bed";
              shapesparkLink =
                "https://atifrazaq03.shapespark.com/quadrangle-two-bed/";

              videoLink =
                "https://www.youtube.com/embed/6M0YgQN2Ouo?playlist=6M0YgQN2Ouo&loop=1;rel=0&autoplay=1&controls=0&showinfo=0";
            } else if (users.data[i].bed == 1) {
              featureName = "One Bed";

              shapesparkLink =
                "https://saeedanwaraq17.shapespark.com/quardangle_single_bed01/";
              videoLink =
                "https://www.youtube.com/embed/HYQjM3IemOw?playlist=HYQjM3IemOw&loop=1;rel=0&autoplay=1&controls=0&showinfo=0";
            } else if (users.data[i].bed == 0) {
              featureName = "Commercial";

              videoLink =
                "https://www.youtube.com/embed/EUt6NL4XnBc?playlist=EUt6NL4XnBc&loop=1;rel=0&autoplay=1&controls=0&showinfo=0";
            }

            let convertedValue = users.data[i].price;
            convertedValue = inWords(convertedValue);
            var myName = document.getElementById("name");
            var age = document.getElementById("age");
            var table = document.getElementById("myTableData");

            if (rowCount == 1) {
              // console.log("called one time");
            }
            if (rowCount == 0) {
              row = table.insertRow(rowCount);
              row.insertCell(0).innerHTML = "";
              rowCount++;
            }

            table.rows[0].cells[0].innerHTML =
              "<table style='word-wrap: break-word;'><tbody style='word-wrap: break-word;'>" +
              "<tr ><td class='descriptionHeadline'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
              featureName +
              "</th></tr>" +
              "<tr ><td class='internalTableDescription'>PropForceID</th></tr>" +
              "<tr ><td class='internalTableDescription1'>" +
              pickedFeature.getProperty("PropForceID") +
              "</td></tr>" +
              "<tr ><td class='internalTableDescription'>UnitNumber</th></tr>" +
              "<tr ><td class='internalTableDescription1'>" +
              users.data[i].unitNumber +
              "</td></tr>" +
              "<tr ><td class='internalTableDescription'>BedRoom</th></tr>" +
              "<tr ><td class='internalTableDescription1'>" +
              users.data[i].bed +
              "</td></tr>" +
              "<tr ><td class='internalTableDescription'>LandArea</th></tr>" +
              "<tr ><td class='internalTableDescription1'>" +
              users.data[i].landArea +
              "</td></tr>" +
              "<tr ><td class='internalTableDescription'>Price</th></tr>" +
              "<tr ><td class='internalTableDescription1' style='overflow-y: scroll; '>" +
              convertedValue +
              "</td></tr>" +
              "<tr ><td class='internalTableDescription'>ListingStatus</th></tr>" +
              "<tr ><td class='internalTableDescription1'>" +
              users.data[i].ListingStatus.name +
              "</td></tr>" +
              "<tr ><td class='internalTableDescription'>Floor</th></tr>" +
              "<tr ><td class='internalTableDescription1'>" +
              users.data[i].ProjectSection.breadcrumbTitle +
              "</td></tr>" +
              /*  "<tr><td>" +
              '<div class="internalTableButtonDiv"><button class="descriptionButton" onclick="view360Photo();">' +
              "Check 360 Photos</button></div>" +
              "</td></tr>" +
              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button id="click-tours-button" class="descriptionButton"  onclick="viewTours(\'' +
              shapesparkLink +
              "');\" >" +
              "Visit Tours</button></div>" +
              "</td></tr>" +
              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button id="click-TVC-button" class="descriptionButton"  onclick="viewTVC();">' +
              "Quadrangle TVC</button></div>" +
              "</td></tr>" +
              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button id="click-plan-button" class="descriptionButton"  onclick="viewPaymentPlan();">' +
              "Check Plan</button></div>" +
              "</td></tr>" +
              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button id="save-plan-button" class="descriptionButton"  onclick={savepaymentPlan();}>' +
              "Save Data</button></div>" +
              "</td></tr>" +*/
              "<tr>" +
              '<div class="imageForDisplayData"><img src="./images/Quadrangle/1.png" style="width: 100%"/></div>' +
              "</tr>" +
              "</tbody></table>";
            valueForSavingData = i;

            /*
              var element = document.getElementById('myTableData');
              newInput = document.createElement('input');
          
          newInput.type = 'button';
          newInput.value = 'X';
          newInput.className = 'CancelButt';
          newInput.onclick = deleteRow.bind(null, value, newInput); // whatever value is?
          
          element.appendChild(newInput);

              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button class="descriptionButton" onclick="view360Photo();">' +
              "Check 360 Photos</button></div>" +
              "</td></tr>" +
            
              "Visit Tours</button></div>" +
              "</td></tr>" +
              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button id="click-TVC-button" class="descriptionButton"  onclick="viewTVC();">' +
              "Quadrangle TVC</button></div>" +
              "</td></tr>" +
              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button id="click-plan-button" class="descriptionButton"  onclick="viewPaymentPlan();">' +
              "Check Plan</button></div>" +
              "</td></tr>" +
              "<tr><td>" +
              '<div class="internalTableButtonDiv"><button id="save-plan-button" class="descriptionButton"  onclick={savepaymentPlan();}>' +
              "Save Data</button></div>" +
              "</td></tr>" +

*/

            // doc.setFontSize(40);
            // doc.text("Octonyan loves jsPDF", 35, 25);
            //// doc.text("ahsanes jsPDF", 35, 40);
            // doc.addImage("./images/Quadrangle/1.png", "PNG", 15, 40, 180, 180);
            /* 
            var doc = new jsPDF();
            var offsetY = 4.797777777777778; //var offsetY is for spacing
            var lineHeight = 6.49111111111111; //var lineHeight is for Spacing
            var fontSize = 12;
            doc.text(85, 10, "Tabla de Prestamo"); //asignate coordinates to the title
            doc.autoTable({
              startY: 15,
              html: ".tftable",
              styles: { halign: "center" },
              headStyles: { fillColor: [124, 95, 240] },
              alternateRowStyles: { fillColor: [231, 215, 252] },
              tableLineColor: [124, 95, 240],
              tableLineWidth: 0.1,
            }); //use headStyles to bring styles to the table head, and alternateRowStyles to color the rows but one yes and one no
            doc.setFontSize(fontSize);
            var img = new Image(); //this mount a variable to img
            img.src = "images/signaturePDF.png"; //asign the src to the img variable
          doc.addImage(
              img,
              "png",
              100,
              doc.autoTable.previous.finalY + lineHeight * 1.5 + offsetY,
              20,
              20
            ); // use the method doc.autoTable.previous.finalY + lineHeight * 1.5 + offsetY to be able to position the image of the signature below the table at a safe distance from it
            doc.text(
              90,
              doc.autoTable.previous.finalY + lineHeight * 5 + offsetY,
              "Juan Jose Urquiza"
            ); // later add the text below the signature
            doc.text(
              89,
              doc.autoTable.previous.finalY + lineHeight * 6 + offsetY,
              "Gerente FinanceAR"
            );*/ //more text
            // doc.save("detallePrestamo.pdf");

            /* const doc = new jsPDF();

            doc.text(10, 10, "Apartment");
            doc.text(50, 10, featureName);
            var dataForPDF;
            dataForPDF = pickedFeature.getProperty("PropForceID");
            doc.text(50, 20, dataForPDF);
            doc.text(10, 20, "PropForceId");
            dataForPDF = users.data[i].unitNumber;
            doc.text(10, 30, "unit Number");
            doc.text(50, 30, dataForPDF);
            var splitTitle = doc.splitTextToSize(users.data[i].landArea, 180);
            // dataForPDF = users.data[i].landArea;
            doc.text(10, 40, "Land Area");
            doc.text(50, 40, splitTitle);
            splitTitle = doc.splitTextToSize(users.data[i].bed, 180);
            doc.text(50, 50, splitTitle);
            doc.text(10, 50, "Bed Room");
            splitTitle = doc.splitTextToSize(
              users.data[i].ListingStatus.name,
              180
            );
            doc.text(10, 60, "Status");
            doc.text(50, 60, splitTitle);
            splitTitle = doc.splitTextToSize(
              users.data[i].ProjectSection.breadcrumbTitle,
              180
            );
            doc.text(10, 70, "Floor Number");
            doc.text(50, 70, splitTitle);
            splitTitle = doc.splitTextToSize(shapesparkLink, 180);
            doc.text(10, 80, "Video Link");
            doc.text(50, 80, splitTitle);
            doc.addImage("./images/Quadrangle/1.png", "PNG", 8, 90, 192, 108);*/

            /*  doc.text(10, 40, dataForPDF);
            doc.text(10, 50, dataForPDF);
            doc.text(10, 60, dataForPDF);
            doc.text(10, 70, dataForPDF);
            doc.text(10, 80, dataForPDF);
            doc.text(10, 90, dataForPDF);
            dataForPDF = users.data[i].bed;
            doc.text(dataForPDF, 10, 40);
            const b = users.data[i].landArea;
            console.log(b);
            doc.text(b, 10, 50);
*/
            // doc.text(10, 60, convertedValue);
            //         const c = users.data[i].ListingStatus.name;
            //       doc.text(10, 70, c);
            /*  dataForPDF = users.data[i].ProjectSection.breadcrumbTitle;
            doc.text(10, 80, dataForPDF);

            doc.text(10, 90, shapesparkLink);*/
            /* var imgData =
              "data:image/jpeg;base64," +
              Base64.encode("./images/Quadrangle/1.png");
            doc.addImage(imgData, "JPEG", 15, 40, 180, 160);
*/
            /*   const doc = new jsPDF();
            doc.text(10, 10, "Apartment");
            doc.text(50, 10, featureName);
            var dataForPDF;
            dataForPDF = pickedFeature.getProperty("PropForceID");
            doc.text(50, 20, dataForPDF);
            doc.text(10, 20, "PropForceId");
            dataForPDF = users.data[i].unitNumber;
            doc.text(10, 30, "unit Number");
            doc.text(50, 30, dataForPDF);
            var splitTitle = doc.splitTextToSize(users.data[i].landArea, 180);
            doc.text(10, 40, "Land Area");
            doc.save("a4.pdf");*/
            //doc.save("a4.pdf");
          }
        }
      } else document.getElementById("toolbarForDescription").hidden = "hidden";
    }
    //////////////////////////////////////////
  }, ScreenSpaceEventType.LEFT_CLICK);
}
/*
var btn = document.getElementById("save-plan-button");
btn.addEventListener(
  "click",
  function () {
    //Do something here
    console.log("ahsan you have done it");
  },
  false
);*/

//document.getElementByID('save-plan-button').onClick = function() { console.log("save is called");/* do somethiing */}
/*
document
  .getElementById("save-plan-button")
  .addEventListener("click", function () {
    console.log("save is called");
  });
*/

document.getElementById("view360").addEventListener("click", function () {
  console.log("button clicked for 360 photo");
  //window.open("https://hassaamsufi6.shapespark.com/miilanapartment01/");
  document.getElementById("panorama-360-view").hidden = "";
  document.getElementById("crossButton").hidden = "";
  pannellum.viewer("panorama-360-view", {
    type: "equirectangular",

    panorama: "./images/360/1-min.JPG",

    autoLoad: true,
  });
});

document.getElementById("visitTours").addEventListener("click", function () {
  window.open(shapesparkLink);
  //window.open("https://hassaamsufi6.shapespark.com/miilanapartment01/");
});

document
  .getElementById("click-TVC-button")
  .addEventListener("click", function () {
    document.getElementById("Video-section").hidden = "";

    $(".youtube-popup > div").click(function () {
      window.open($(this).parent().children("iframe").attr("src"));
    });
  });

document
  .getElementById("click-plan-button")
  .addEventListener("click", function () {
    document.getElementById("ImagePayment-section").hidden = "";
  });

document
  .getElementById("save-plan-button")
  .addEventListener("click", function () {
    const doc = new jsPDF();

    //doc.text(10, 10, "Apartment");
    doc.text(80, 15, featureName);
    var dataForPDF;
    //dataForPDF = pickedFeature.getProperty("PropForceID");
    //doc.text(50, 20, dataForPDF);
    //doc.text(10, 20, "PropForceId");
    dataForPDF = users.data[valueForSavingData].unitNumber;
    doc.text(10, 30, "Unit Number");
    doc.text(50, 30, dataForPDF);

    var splitTitle = doc.splitTextToSize(
      users.data[valueForSavingData].landArea,
      180
    );

    doc.text(10, 40, "Land Area");
    doc.text(50, 40, splitTitle + " SQ. Ft");

    splitTitle = doc.splitTextToSize(users.data[valueForSavingData].bed, 180);
    doc.text(50, 50, splitTitle);
    doc.text(10, 50, "Bed Room");
    splitTitle = doc.splitTextToSize(
      users.data[valueForSavingData].ListingStatus.name,
      180
    );
    const myArray = users.data[valueForSavingData].ListingStatus.name.split(
      "/",
      1
    );
    doc.text(10, 60, "Status");
    doc.text(50, 60, myArray);
    splitTitle = doc.splitTextToSize(
      users.data[valueForSavingData].ProjectSection.breadcrumbTitle,
      180
    );
    const myArray1 = users.data[
      valueForSavingData
    ].ProjectSection.breadcrumbTitle.split("-", 2);
    doc.text(10, 70, "Floor");
    doc.text(50, 70, myArray1[1]);
    splitTitle = doc.splitTextToSize(shapesparkLink, 180);
    //doc.text(10, 80, "Walkthrough");
    //  doc.text(50, 80, splitTitle);
    doc.setTextColor("#0000FF");
    //doc.rect(25, 50, 25, 25, "FD");
    doc.setDrawColor("#0000FF");
    doc.textWithLink("VR-Walkthrough", 10, 80, { url: shapesparkLink });
    doc.line(10, 82, 48, 82);
    doc.textWithLink("Quadrangle TVC", 10, 90, {
      url: "https://www.youtube.com/embed/YWwPyByF3Xk?enablejsapi=1&playlist=YWwPyByF3Xk&loop=1;rel=0&autoplay=1&controls=0&showinfo=0",
    });
    doc.line(10, 92, 53, 92);
    doc.textWithLink("Gallery", 10, 100, {
      url: "https://www.behance.net/gallery/116486803/Zameen-Quadrangle-by-Zameen-Developments",
    });
    doc.line(10, 102, 28, 102);
    //doc.textWithLink("Click here", 50, 80, { url: "http://www.google.com" });
    //doc.setDrawColor(255, 0, 0);
    //doc.line(82, 30, 100, 30);
    // doc.addImage("./images/Quadrangle/1.png", "PNG", 8, 90, 192, 108);
    doc.setTextColor("#000000");

    doc.text(80, 110, "Payment Plan");
    if (users.data[valueForSavingData].landArea < 700)
      doc.addImage("./images/payment/1-bed-plan.jpg", "JPG", 8, 120, 183, 53);
    else if (users.data[valueForSavingData].landArea < 1200)
      doc.addImage("./images/payment/2-bed-plan.jpg", "JPG", 8, 120, 183, 108);
    else if (users.data[valueForSavingData].landArea < 1400)
      doc.addImage("./images/payment/3-bed-plan.jpg", "JPG", 8, 120, 183, 62);
    else if (
      users.data[valueForSavingData].landArea == 2596 ||
      users.data[valueForSavingData].landArea == 3166
    )
      doc.addImage("./images/payment/3B-bed-plan.jpg", "JPG", 8, 120, 183, 29);
    else if (users.data[valueForSavingData].landArea == 2932)
      doc.addImage("./images/payment/4-bed-plan.jpg", "JPG", 8, 120, 183, 25);
    doc.line(10, 82, 55, 82);
    //doc.textWithLink("test", textX, textY, { url: "https://www.google.com/" });
    //doc.addPage();
    doc.save(users.data[valueForSavingData].unitNumber + ".pdf");
    //doc.save("a4.pdf");
  });

//payment plan cross
document.getElementById("payment-cross").addEventListener("click", function () {
  document.getElementById("planImage").hidden = "hidden";
});
//for 360 view
document.getElementById("img-cross").addEventListener("click", function () {
  document.getElementById("panorama-360-view").hidden = "hidden";
  document.getElementById("crossButton").hidden = "hidden";
});

var delayInMilliseconds = 2000; //1 second

document.getElementById("video-cross").addEventListener("click", function () {
  document.getElementById("tvcVideo").hidden = "hidden";
});

var x;
// click on home button
$("#Home-Button").click(function () {
  document.getElementById("unitSearch-Section").hidden = "hidden";
  document.getElementById("Amenities-Section").hidden = "hidden";
  document.getElementById("Surrondings-Section").hidden = "hidden";
  document.getElementById("Gallery-section").hidden = "hidden";
  document.getElementById("toolbarForDescription").hidden = "hidden";

  hideSurrondings();
  removePathOnMap();

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.348342, 31.535983, 30000000),
    duration: 5.0,
  });
});

$("#Gallery-Button").click(function () {
  //actual gallery
  // document.getElementById("Gallery-section").hidden = "";
  //fake gallery
  document.getElementById("behance-section").hidden = "";
  /*window.open(
    "https://www.behance.net/gallery/116486803/Zameen-Quadrangle-by-Zameen-Developments",
    "some_name",
    "width=300,height=200,left=10,top=10"
  );*/

  document.getElementById("Surrondings-Section").hidden = "hidden";
  document.getElementById("Amenities-Section").hidden = "hidden";
  document.getElementById("unitSearch-Section").hidden = "hidden";
  document.getElementById("planImage").hidden = "hidden";
  document.getElementById("toolbarForDescription").hidden = "hidden";
  removePathOnMap();
});
//behance

$("#portfolio-cross-Description").click(function () {
  document.getElementById("behance-section").hidden = "hidden";
});

$("#Surronding-Button").click(function () {
  document.getElementById("Surrondings-Section").hidden = "";

  document.getElementById("Gallery-section").hidden = "hidden";
  document.getElementById("planImage").hidden = "hidden";
  document.getElementById("Amenities-Section").hidden = "hidden";
  document.getElementById("unitSearch-Section").hidden = "hidden";
});

$("#Amenities-Button").click(function () {
  document.getElementById("Amenities-Section").hidden = "";
  document.getElementById("planImage").hidden = "hidden";
  document.getElementById("Gallery-section").hidden = "hidden";
  document.getElementById("Surrondings-Section").hidden = "hidden";

  document.getElementById("unitSearch-Section").hidden = "hidden";
  removePathOnMap();
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.349753, 31.53545, 150),
    duration: 5.0,
    orientation: {
      heading: Math.toRadians(-60.0),
      pitch: Math.toRadians(-45),
      roll: Math.toRadians(0),
    },
  });
});

$("#Search-Button").click(function () {
  document.getElementById("unitSearch-Section").hidden = "";
  document.getElementById("planImage").hidden = "hidden";
  document.getElementById("Gallery-section").hidden = "hidden";
  document.getElementById("Surrondings-Section").hidden = "hidden";
  document.getElementById("Amenities-Section").hidden = "hidden";

  hideSurrondings();
  removePathOnMap();
  building.style = new Cesium3DTileStyle({
    color: "color('#FFFFFF', 1)", //white, alpha = 0.2
    show: true,
  });
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.349753, 31.53545, 150),
    duration: 5.0,
    orientation: {
      heading: Math.toRadians(-60.0),
      pitch: Math.toRadians(-45),
      roll: Math.toRadians(0),
    },
  });

  setTilesetOpacity(0.5);
  $("#unitSearch-Section").load(" #unitSearch-Section > *");
});

$("#project-Section").click(function () {
  // for quadrangle
  if ($(this).val() == "Quadrangle-Button") {
    unsubscribe();

    document.getElementById("unitSearch-Section").hidden = "hidden";

    document.getElementById("Gallery-section").hidden = "hidden";
    document.getElementById("Surrondings-Section").hidden = "hidden";
    document.getElementById("Amenities-Section").hidden = "hidden";
    hideSurrondings();

    removePathOnMap();
    building.style = new Cesium3DTileStyle({
      color: "color('#FFFFFF', 1)", //white, alpha = 0.2
      show: true,
    });

    setTilesetOpacity(0);
    //setTilesetOpacity(0);
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(74.349753, 31.53545, 150),
      duration: 5.0,
      orientation: {
        heading: Math.toRadians(-60.0),
        pitch: Math.toRadians(-45),
        roll: Math.toRadians(0),
      },
    });
  }
});

$("#imgPayment-cross-Description").click(function () {
  document.getElementById("ImagePayment-section").hidden = "hidden";
});

$("#imgVideo-cross-Description").click(function () {
  /* document
    .getElementById("Video-section")
    .contentWindow.postMessage(
      '{"event":"command","func":"stopVideo","args":""}',
      "*"
    );*/

  const iframeVideos = document.querySelectorAll("iframe");

  if (iframeVideos.length > 0) {
    iframeVideos.forEach((iframe) => {
      if (iframe.contentWindow) {
        // Pause Youtube Videos
        if (iframe.src.startsWith("https://www.youtube.com")) {
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"stopVideo","args":""}',
            "*"
          );
        }
      }
    });
  }

  document.getElementById("Video-section").hidden = "hidden";
});

$(document).on(
  "change",
  ".messageCheckbox,.slider,.customCheckBox",
  function (evnt) {
    // All checkbox with
    var data = $(".messageCheckbox");
    var i = 0,
      j = 0,
      k = -1,
      search = 0;
    //area slider
    var data1 = $(".slider");

    //floor slider
    var data2 = $(".customCheckBox");

    data2.each(function () {
      if (search == 0) {
        if (this.checked == true) {
          // console.log($(this).val());
          $("#floorDisabled *").prop("disabled", false);
          selectFloor = "true";
        } else {
          selectFloor = "false";

          $("#floorDisabled *").prop("disabled", true);
        }
        //maxArea = $(this).val();
      }
      search++;
    });

    data1.each(function () {
      if (j == 0) {
        //console.log($(this).val());
        maxArea = $(this).val();
      }
      if (j == 1) {
        // console.log($(this).val());
        maxPrice = $(this).val();
      }
      if (j == 2) {
        // console.log($(this).val());
        FloorValue = $(this).val();
      }

      j++;
    });
    data.each(function () {
      // console.log(this.defaultValue, this.checked);

      if (i <= 5) {
        //check only for bedroom count version

        if (this.checked == true)
          if (i == 5) {
            //treat this as a 0 bedroom because commercial dont have any bedroom
            bedRoomCount[i] = 0;
          } else if (i == 0) {
            //and no studio exist assign -1 value so that it should not cost
            // console.log(bedRoomCount[i]);
            // console.log(i);
            bedRoomCount[i] = 6;
          } else bedRoomCount[i] = i;
        else bedRoomCount[i] = -1;
        i++;
      }
      if (i > 5 && k < 5) {
        // console.log(k);
        //Check only for Availability version
        if (this.checked == true) Avaialbility[k] = 0.5;
        else Avaialbility[k] = 0;
        k++;
      }
    });

    //console.log(bedRoomCount);
    if (selectFloor == "true")
      completeUnitSearch1(
        Avaialbility,
        bedRoomCount,
        maxArea,
        maxPrice,
        FloorValue
      );
    else if (selectFloor == "false")
      completeUnitSearch2(
        Avaialbility,
        bedRoomCount,
        maxArea,
        maxPrice,
        FloorValue
      );
    $("#budgetValue").text("Max : " + parseInt(maxPrice / 100000) + " Lac");
    $("#surfaceValue").text("Max : " + parseInt(maxArea) + " Sq. ft");
    $("#FloorValue").text("Floor : " + parseInt(FloorValue) + "");
  }
);

document
  .getElementById("img-cross-Description")
  .addEventListener("click", function () {
    document.getElementById("toolbarForDescription").hidden = "hidden";
    silhouetteGreen.selected = [];
  });

$("#click-360-button").click(function () {
  //console.log("button clicked for 360 photo");
  document.getElementById("panorama-360-view").hidden = "";
  document.getElementById("crossButton").hidden = "";
  pannellum.viewer("panorama-360-view", {
    type: "equirectangular",

    panorama: "./images/360/1.JPG",

    autoLoad: true,
  });
});

viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
$("#amenities-Entrance").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.3487520889, 31.5357838795, 20),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-45.0),
      pitch: Math.toRadians(-45),
      roll: Math.toRadians(0),
    },
  });
});

//rooftop

$("#amenities-Roof").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.3484750711, 31.53567343, 120),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(0.0),
      pitch: Math.toRadians(-60.0),
      roll: Math.toRadians(0),
    },
  });
});

//terrace

$("#amenities-Terrace").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.3485291658, 31.5364228969, 60),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-165.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

//left side pool

$("#amenities-Pool").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.3487544693, 31.5363176085, 20),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-135.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

// right side gym and movie

$("#amenities-Gym").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.3481673462, 31.5358415796, 20),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(50.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#amenities-parking").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.3486789186, 31.5356928523, 20),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-45.0),
      pitch: Math.toRadians(-45),
      roll: Math.toRadians(0),
    },
  });
});

$("#amenities-pump").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.351389, 31.535754, 200),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-45.0),
      pitch: Math.toRadians(-45),
      roll: Math.toRadians(0),
    },
  });
});
///////////////

$("#Surrondings-PunjabUni").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("punjab");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.297449, 31.493875, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(50.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-FCUni").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("FC");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.333439, 31.521638, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(50.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-Cinema").click(function () {
  // console.log("button clicked for 360 photo");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.351037, 31.531053, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(50.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-SiddiqueCenter").click(function () {
  // console.log("button clicked for 360 photo");

  drawPathOnMap("Siddique");
  /* viewer.dataSources.remove(ds);
  viewer.dataSources
    .add(CzmlDataSource.load("./CzmlPaths/Siddique.czml"))
    .then(function (datasource) {
      ds = datasource;
    });
*/
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.352654, 31.533892, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

/////////////////
$("#Surrondings-EdenCenter").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.345867, 31.536732, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-GalleriaCenter").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.351954, 31.531993, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-AurigaMall").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.348122, 31.524298, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-LahoreCenter").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.342108, 31.512358, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-HafeezCenter").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.343349, 31.515911, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-fortressMall").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.362911, 31.532608, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

//////////////////

$("#Surrondings-chayekhana").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.349211, 31.51581, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-240.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-Mcdonalds").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.351462, 31.5236, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-10.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-Rare").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.351702, 31.531394, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-120.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-Monal").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.339822, 31.512303, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-180.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});
//////////////////////

$("#Surrondings-CueCinema").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("cue");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.351702, 31.531394, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-120.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-CineStarCinema").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("CineStar");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.349856, 31.517335, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-240.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});
///////////////////

$("#Surrondings-Daewoo").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("Daewoo");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.331594, 31.504786, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(-120.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-Speedo").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("speedo");
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.345384, 31.532251, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(0.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

//update

$("#Surrondings-Qaddafi").click(function () {
  // console.log("button clicked for 360 photo");
  drawPathOnMap("Qaddafi");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.333301, 31.510494, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(0.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});

$("#Surrondings-Airport").click(function () {
  // console.log("button clicked for 360 photo");

  drawPathOnMap("Airport");

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(74.407653, 31.519766, 300),
    duration: 4.0,
    orientation: {
      heading: Math.toRadians(90.0),
      pitch: Math.toRadians(-45.0),
      roll: Math.toRadians(0),
    },
  });
});
///////////////////////
