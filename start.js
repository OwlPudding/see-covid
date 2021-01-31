import * as merc from "./merc.js";

window.addEventListener("load", init, false);

let cameraView;
let nearbyData;
let myZipData;
let cityData;

let constraints = {
  video: {
    // facingMode: {
    //   exact: "environment"
    // },
  },
};
function fmt(n) {
  if (n > 9999) {
    return `${(n / 1000).toFixed(0)}K`;
  } else {
    return n;
  }
}
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
function insertZipData() {
  // ZIP
  const { zipCode } = myZipData;
  document.querySelector("#local-title").innerHTML = `${zipCode['zipCode']} - ${nearbyData['presentCounty']}`;
  // ZIP WEEKLY
  const z_weekly = document.querySelector("#zip #weekly");
  document.querySelector("#zip .weekly-title").innerHTML = "Weekly";
  document.querySelector("#zip .weekly-title").style.margin = "10px";

  const zw_posCases = document.createElement("div");
  zw_posCases.setAttribute("class", "stat-container");
  zw_posCases.innerHTML = `
    <span class="stat">${fmt(zipCode['people_positive_7day'])}</span>
    <span class="desc">Positive cases <br />(last 7 days)</span>
  `;
  const zw_positivityRate = document.createElement("div");
  zw_positivityRate.setAttribute("class", "stat-container");
  zw_positivityRate.innerHTML = `
    <span class="stat">${zipCode['percentpositivity_7day']}%</span>
    <span class="desc">Positivity rate <br />(of ${zipCode['people_tested_7day']} tested)</span>
  `;
  const zw_infectionRate = document.createElement("div");
  zw_infectionRate.setAttribute("class", "stat-container");
  zw_infectionRate.innerHTML = `
    <span class="stat">${zipCode['infection_rate_7day'].toFixed(2)}</span>
    <span class="desc">Infection rate <br />(per 100,000 people)</span>
  `;

  z_weekly.appendChild(zw_posCases);
  z_weekly.appendChild(zw_positivityRate);
  z_weekly.appendChild(zw_infectionRate);

  // ZIP TOTAL
  const z_total = document.querySelector("#zip #total");

  document.querySelector("#zip .total-title").innerHTML = "Total";
  document.querySelector("#zip .total-title").style.margin = "10px";

  const zt_posCases = document.createElement("div");
  zt_posCases.setAttribute("class", "stat-container");
  zt_posCases.innerHTML = `
    <span class="stat">${fmt(zipCode['total_cases'])}</span>
    <span class="desc">Total positive cases</span>
  `;
  const zt_positivityRate = document.createElement("div");
  zt_positivityRate.setAttribute("class", "stat-container");
  zt_positivityRate.innerHTML = `
    <span class="stat">${fmt(zipCode['total_deaths'])}</span>
    <span class="desc">Total deaths</span>
  `;
  const zt_infectionRate = document.createElement("div");
  zt_infectionRate.setAttribute("class", "stat-container");
  zt_infectionRate.innerHTML = `
    <span class="stat">${fmt(zipCode['total_tests'])}</span>
    <span class="desc">Total tests</span>
  `;

  z_total.appendChild(zt_posCases);
  z_total.appendChild(zt_positivityRate);
  z_total.appendChild(zt_infectionRate);
}
function insertCityData() {
  // ZIP
  document.querySelector("#city-title").innerHTML = `New York City`;
  // ZIP WEEKLY
  const c_weekly = document.querySelector("#city #weekly");
  document.querySelector("#city .weekly-title").innerHTML = "Weekly";
  document.querySelector("#city .weekly-title").style.margin = "10px";

  const cw_posCases = document.createElement("div");
  cw_posCases.setAttribute("class", "stat-container");
  cw_posCases.innerHTML = `
    <span class="stat">${fmt(cityData['cases_7day'])}</span>
    <span class="desc">Positive cases <br />(last 7 days)</span>
  `;
  const cw_positivityRate = document.createElement("div");
  cw_positivityRate.setAttribute("class", "stat-container");
  cw_positivityRate.innerHTML = `
    <span class="stat">${cityData['percentpositivity_7day']}%</span>
    <span class="desc">Positivity rate <br />(of ${cityData['tests_7day']} tested)</span>
  `;
  const cw_infectionRate = document.createElement("div");
  cw_infectionRate.setAttribute("class", "stat-container");
  cw_infectionRate.innerHTML = `
    <span class="stat">${cityData['infection_rate_7day'].toFixed(2)}</span>
    <span class="desc">Infection rate <br />(per 100,000 people)</span>
  `;

  c_weekly.appendChild(cw_posCases);
  c_weekly.appendChild(cw_positivityRate);
  c_weekly.appendChild(cw_infectionRate);

  // ZIP TOTAL
  const c_total = document.querySelector("#city #total");

  document.querySelector("#city .total-title").innerHTML = "Total";
  document.querySelector("#city .total-title").style.margin = "10px";

  const ct_posCases = document.createElement("div");
  ct_posCases.setAttribute("class", "stat-container");
  ct_posCases.innerHTML = `
    <span class="stat">${fmt(cityData['total_cases'])}</span>
    <span class="desc">Total positive cases</span>
  `;
  const ct_positivityRate = document.createElement("div");
  ct_positivityRate.setAttribute("class", "stat-container");
  ct_positivityRate.innerHTML = `
    <span class="stat">${fmt(cityData['total_deaths'])}</span>
    <span class="desc">Total deaths</span>
  `;
  const ct_infectionRate = document.createElement("div");
  ct_infectionRate.setAttribute("class", "stat-container");
  ct_infectionRate.innerHTML = `
    <span class="stat">${fmt(cityData['total_tests'])}</span>
    <span class="desc">Total tests</span>
  `;

  c_total.appendChild(ct_posCases);
  c_total.appendChild(ct_positivityRate);
  c_total.appendChild(ct_infectionRate);
}
function getHeading() {
  if (window.DeviceOrientationEvent) {
    return new Promise(function(resolve, reject) {
      window.addEventListener("deviceorientation", resolve);
    });
  } else return null;
}
async function beginARMode(lat, lon) {
  const {
    nearbyCoords,
    nearbyCountyNames,
    nearbyZipCodes,
  } = nearbyData;
  document.querySelector("#local-data").remove();
  document.querySelector("#main-scene").setAttribute("visible", "true");

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
    0 ${initialDir >= 180 ? 360 - initialDir : initialDir} 0
  `);
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
}

async function init() {
  cameraStart();

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
    .then(data => {
      myZipData = data;
      return fetch(`https://see-covid-backend.herokuapp.com/city_data`);
    })
    .then(response => response.json())
    .then(data => {
      cityData = data;
    });
  console.log(nearbyData, myZipData, cityData);

  document.querySelector("#local-data #loading").style.display = "none";
  document.querySelector("#local-data #zip").style = `flex: 2; width: 100%;`;
  document.querySelector("#local-data #city").style = `flex: 1; width: 100%;`;

  insertZipData();
  insertCityData();

  document.querySelector("#ar-mode").style.display = "initial";
  document.querySelector("#ar-mode").addEventListener("click", () => {
    beginARMode(lat, lon);
  });
}
// setTimeout(() => {
// document.querySelector("body").innerHTML = `
// <a-scene vr-mode-ui="enabled: false;">
//     <!-- Origin at 0 1.6 0 in Desktop Mode -->
//     <!-- Average height | human eye level -->
//     <!-- user-height="1.6 by default" -->
//     <!-- <a-entity position="0 0 0" > -->
//     <!-- <a-entity raycaster="objects: .link" cursor position="0 0 -1"
//           geometry="primitive: sphere; radius: 0.005"
//           material="color: #000000; shader: flat; opacity: 0.5;" ></a-entity> -->
//     <a-entity>
//       <a-camera id="cam">
//           <a-entity id="orientation" position="0 1 -2"></a-entity>
//       </a-camera>
//     </a-entity>
//     <!-- <a-circle color="#00AA00" radius="3" rotation="-90 0 0"></a-circle> -->
//     <a-entity id="waypoint-container"></a-entity>
//     <a-sphere position="0 1.6 -1" radius="0.01" color="white"></a-sphere>
//     <a-sphere position="1 1.6 0" radius="0.01" color="white"></a-sphere>
//     <a-sphere position="0 1.6 1" radius="0.01" color="white"></a-sphere>
//     <a-sphere position="-1 1.6 0" radius="0.01" color="white"></a-sphere>
//   </a-scene>
// `;}, 3000);