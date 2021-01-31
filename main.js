let cameraView;
let nearbyData;
let myZipData;
// let compass;
// const isIOS = !(
//   navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
//   navigator.userAgent.match(/AppleWebKit/)
// );

import * as merc from "./merc.js";

let constraints = {
  video: {
    // facingMode: {
    //   exact: "environment"
    // },
  },
};
function cameraStart() {
  if (navigator.mediaDevices.getSupportedConstraints().facingMode) {
    console.log("Camera constraint (env) supported");
  } else {
    console.log("Camera constraint (env) not supported!");
  }
  cameraView = document.querySelector("#camera");
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      cameraView.srcObject = stream;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
function getCoords() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
function getHeading() {
  if (window.DeviceOrientationEvent) {
    return new Promise(function(resolve, reject) {
      window.addEventListener("deviceorientation", resolve);
    });
  } else return null;
}
window.addEventListener("load", async () => {
  cameraStart();

  let initialDir;
  const gh = await getHeading();
  if (gh.webkitCompassHeading) {
    initialDir = gh.webkitCompassHeading;
  } else {
    initialDir = gh.alpha;
  }
  document.querySelector("#orientation").setAttribute("text", `
    value: DIR=${initialDir};
    color: #FFFFFF;
  `);
  document.querySelector("#waypoint-container").setAttribute("rotation", `
    0 ${initialDir >= 180 ? 360-initialDir : initialDir} 0
  `);

  const position = await getCoords();
  const { latitude: lat, longitude: lon } = position.coords;
  console.log(lat, lon);
  await fetch(`https://see-covid-backend.herokuapp.com/nearby_zipCodes?lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => {
      const { zipCode } = data;
      nearbyData = data;
      return fetch(`https://see-covid-backend.herokuapp.com/get_info?zipCode=${zipCode}`);
    })
    .then(response => response.json())
    .then(data => { myZipData = data; });
  console.log(nearbyData, myZipData);

  const container = document.querySelector("#waypoint-container");

  const {
    nearbyCoords,
    nearbyCountyNames,
    nearbyZipCodes,
    zipCode,
  } = nearbyData;
  nearbyZipCodes.forEach((zip, i) => {
    const coords = nearbyCoords[i];
    const countyName = nearbyCountyNames[i];

    let a = document.createElement("a-entity");
    a.setAttribute("text", `
      value: zip: ${zip}\ncoords: ${coords}\ncounty: ${countyName};
      color: #FFFFFF;
    `);
    // translate image card to xy 
    // var imagePos = merc.fromLatLngToPoint({lat: -27.470127, lng: 153.0147027});
    const imagePos = merc.fromLatLngToPoint({ lat: coords[0], lng: coords[1] });
    
    // translate current device position to a lat/lng
    const currentDevicePos = merc.fromLatLngToPoint({ lat: lat, lng: lon });

    const imageFinalPosX = imagePos.x - currentDevicePos.x;
    const imageFinalPosY = imagePos.y - currentDevicePos.y;

    a.setAttribute("position", `${imageFinalPosX*90} 1.6 ${imageFinalPosY*90}`);
    console.log(`${zip} placed at ${imageFinalPosX*90} 1.6 ${imageFinalPosY*90}`);

    a.setAttribute("look-at", "#cam");

    container.appendChild(a);
  });

  // document.querySelector('#plane').addEventListener('click', function () {
  //   this.setAttribute('material', 'color', 'red');
  //   console.log('I was clicked!');
  // });
  // const { width, height } = window.screen;
  // if (height >= 750) {
  //   const lc = document.querySelector("#local-container");
  //   lc.setAttribute("position", `0 0 ${width >= 380 ? -1.35 : -1.45}`);
  //   lc.setAttribute(
  //     "geometry",
  //     `primitive: plane; width: 1.1; height: 2.35;`
  //   );
  // }
}, false);