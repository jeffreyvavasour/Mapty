'use strict';
// prettier-ignore
// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let crds;

// Page onLoad - render workouts on map and render workouts list - from local storage
window.addEventListener('load', function () {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      function renderWorkouts(arr) {
        // Render workouts in list & map
        arr.forEach(obj => {
          const date = new Date();
          const month = date.getMonth();
          const day = date.toLocaleString('default', { month: 'long' });
          const html = `
          <li class="workout workout--${obj.type}" data-id="${arr.findIndex(
            x => x === obj
          )}">
          <h2 class="workout__title">${obj.type} on ${month} ${day}</h2>
          <div class="workout__details">
            <span class="workout__icon">${obj.type}</span>
            <span class="workout__value">${obj.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${obj.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${Math.round(
              obj.distance / (obj.duration / 60)
            )}</span>
            <span class="workout__unit">km/h</span>
          </div>
          ${
            obj.cadence !== ''
              ? `<div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${obj.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>`
              : `<div class="workout__details">
              <span class="workout__icon">⛰</span>
              <span class="workout__value">${obj.elevation}</span>
              <span class="workout__unit">m</span>
            </div>`
          }
          </li>`;

          // Put each one into user interface
          containerWorkouts.insertAdjacentHTML('beforeend', html);

          // Panning to map marker on workout list click
          // Select all workouts
          const workoutsRendered = document.querySelectorAll('.workout');
          // Add click event listener for each one
          workoutsRendered.forEach(workout => {
            workout.addEventListener('click', function () {
              let cords;
              let lat;
              let lon;
              // get cords of clicked workout
              const localArr = JSON.parse(localStorage.getItem('existingArr'));
              localArr.forEach(obj => {
                if (localArr.findIndex(x => x === obj) == workout.dataset.id) {
                  cords = obj.coordinates;
                  [lat, lon] = cords;
                  // pan to workout on map
                  map.panTo(new L.LatLng(lat, lon));
                }
              });
            });
          });

          // Render workouts on map
          // Create popup
          L.marker(obj.coordinates)
            .addTo(map)
            .bindPopup(newPopUp(obj.type))
            .openPopup();
        });
      }
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      // Create Map
      crds = [latitude, longitude];
      const map = L.map('map').setView(crds, 13);

      // Add Tile Layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add first popup marker
      L.marker(crds).addTo(map);

      // Map onClick event function
      function onMapClick(e) {
        form.classList.remove('hidden');
        inputDistance.focus();
        crds = [e.latlng.lat, e.latlng.lng];
      }
      map.on('click', onMapClick);

      let existingArr = JSON.parse(localStorage.getItem('existingArr'));
      if (existingArr == null) existingArr = [];

      renderWorkouts(existingArr);

      // Form submit function
      function formSubmit(e) {
        e.preventDefault();

        // Get form input values
        const exerciseType = inputType.value;
        const distance = inputDistance.value;
        const duration = inputDuration.value;
        const cadence = inputCadence.value;
        const elevation = inputElevation.value;

        // Put these values into an object
        const obj = {
          coordinates: crds,
          type: `${exerciseType}`,
          distance: `${distance}`,
          duration: `${duration}`,
          cadence: `${cadence}`,
          elevation: `${elevation}`,
        };

        // Push that object into local storage
        let existingArr = JSON.parse(localStorage.getItem('existingArr'));
        if (existingArr == null) existingArr = [];
        existingArr.push(obj);
        localStorage.setItem('existingArr', JSON.stringify(existingArr));

        // Remove all workouts from Div
        const workouts = document.querySelectorAll('.workout');
        workouts.forEach(workout => {
          workout.remove();
        });

        // Loop over local storage array to create each single exercise box description
        const localArr = JSON.parse(localStorage.getItem('existingArr'));
        renderWorkouts(localArr);

        // Reset Form & hide
        inputElevation.parentElement.classList.add('form__row--hidden');
        inputCadence.parentElement.classList.remove('form__row--hidden');
        form.reset();
        form.classList.add('hidden');
      }

      form.addEventListener('submit', formSubmit);
    },
    function () {
      alert('Could not get location');
    }
  );
});

function newPopUp(type) {
  const date = new Date();
  const month = date.getMonth();
  const day = date.toLocaleString('default', { month: 'long' });
  const new_popup = L.popup({
    maxWidth: 250,
    maxHeight: 100,
    autoClose: false,
    closeOnClick: null,
    className: `${type}-popup`,
  }).setContent(`${type} on ${month} ${day}`);

  return new_popup;
}

inputType.addEventListener('change', function () {
  if (inputType.value === 'running') {
    inputElevation.parentElement.classList.add('form__row--hidden');
    inputCadence.parentElement.classList.remove('form__row--hidden');
  }
  if (inputType.value === 'cycling') {
    inputCadence.parentElement.classList.add('form__row--hidden');
    inputElevation.parentElement.classList.remove('form__row--hidden');
  }
});
