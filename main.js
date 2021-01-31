let cameraView;
let data;

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
function fetchData(position) { 
  const { latitude: lat, longitude: lon } = position.coords;

  fetch(`https://see-covid-backend.herokuapp.com/nearby_zipCodes?lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => console.log(data));
}
function getCoords() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
window.addEventListener("load", async () => {
  cameraStart();
  const position = await getCoords();
  const { latitude: lat, longitude: lon } = position.coords;
  console.log(lat, ",", lon);
  const a = await fetch(`https://see-covid-backend.herokuapp.com/nearby_zipCodes?lat=${lat}&lon=${lon}`);
  console.log("res", a.json());
  // if(!navigator.geolocation) {
  //   console.log('Geolocation is not supported by your browser');
  // } else {
  //   console.log('Locating…');
  //   navigator.geolocation.getCurrentPosition(
  //     fetchData,
  //     () => console.log('Unable to retrieve your location')
  //   );
  // }

  // https://see-covid-backend.herokuapp.com/nearby_zipCodes?lat=40.743919&lon=-73.899131
  // http://see-covid-backend.herokuapp.com/get_info?zipCode=11377
  // fetch('http://example.com/movies.json')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
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