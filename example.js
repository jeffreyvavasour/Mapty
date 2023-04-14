'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #crds;
  constructor() {
    this._makeMap();
    form.addEventListener('submit', this._formSubmit.bind(this));
    inputType.addEventListener('change', this._setLastFormRow);
  }

  _makeMap() {
    navigator.geolocation.getCurrentPosition(
      this._getLocation.bind(this),
      function () {
        alert('Could not get location');
      }
    );
  }

  _getLocation(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    this.#crds = [latitude, longitude];
    this.#map = L.map('map').setView(this.#crds, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this._setMarker(this.#crds);

    this.#map.addEventListener('click', this._onMapClick.bind(this));

    this._renderWorkoutsList();
    this._renderWorkoutsMap();
  }

  _setMarker(arr) {
    L.marker(arr).addTo(this.#map);
  }

  _onMapClick(e) {
    form.classList.remove('hidden');
    inputDistance.focus();
    this.#crds = [e.latlng.lat, e.latlng.lng];
  }

  _setLastFormRow() {
    if (inputType.value === 'running') {
      inputElevation.parentElement.classList.add('form__row--hidden');
      inputCadence.parentElement.classList.remove('form__row--hidden');
    }
    if (inputType.value === 'cycling') {
      inputCadence.parentElement.classList.add('form__row--hidden');
      inputElevation.parentElement.classList.remove('form__row--hidden');
    }
  }

  _newPopUp(type) {
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

  _formatDate() {
    const date = new Date();
    const month = date.getMonth();
    const day = date.toLocaleString('default', { month: 'long' });
    return `${month} ${day}`;
  }

  _removeWorkouts() {
    const workouts = document.querySelectorAll('.workout');
    workouts.forEach(workout => {
      workout.remove();
    });
  }

  _resetForm() {
    inputElevation.parentElement.classList.add('form__row--hidden');
    inputCadence.parentElement.classList.remove('form__row--hidden');
    form.reset();
    form.classList.add('hidden');
  }

  _panToMarker(e) {
    let lat;
    let lon;
    const localArr = JSON.parse(localStorage.getItem('existingArr'));
    localArr.forEach(obj => {
      if (
        localArr.findIndex(x => x === obj) ==
        e.target.closest('.workout').dataset.id
      ) {
        [lat, lon] = obj.coordinates;
      }
    });
    this.#map.panTo(new L.LatLng(lat, lon));
  }

  _formSubmit(e) {
    e.preventDefault();

    // Get form input values
    const exerciseType = inputType.value;
    const distance = inputDistance.value;
    const duration = inputDuration.value;
    const cadence = inputCadence.value;
    const elevation = inputElevation.value;

    // Put these values into an object
    const obj = {
      coordinates: this.#crds,
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
    this._removeWorkouts();

    // Render workouts List
    this._renderWorkoutsList.bind(this)();

    // Render workouts Map
    this._renderWorkoutsMap.bind(this)();

    // Reset Form & hide
    this._resetForm();
  }

  _renderWorkoutsList() {
    const arr = JSON.parse(localStorage.getItem('existingArr'));
    // Render workouts in list & map
    arr.forEach(obj => {
      const html = `
        <li class="workout workout--${obj.type}" data-id="${arr.findIndex(
        x => x === obj
      )}">
        <h2 class="workout__title">${obj.type} on ${this._formatDate()}</h2>
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
    });

    const workoutsRendered = document.querySelectorAll('.workout');
    workoutsRendered.forEach(workout => {
      workout.addEventListener('click', this._panToMarker.bind(this));
    });
  }

  _renderWorkoutsMap() {
    const localArr = JSON.parse(localStorage.getItem('existingArr'));
    localArr.forEach(obj => {
      L.marker(obj.coordinates)
        .addTo(this.#map)
        .bindPopup(this._newPopUp(obj.type))
        .openPopup();
    });
  }
}

const app = new App();
