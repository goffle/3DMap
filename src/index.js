import json from '../package.json';
import engine from './engine';

module.exports = class World {
  constructor(containerId) {
    console.log('Run ' + json.version);
    this._containerId = containerId;
  }

  setView(lat, lon) {

  }
}

