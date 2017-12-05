import json from '../package.json';

export default class World {
  constructor(containerId) {
    console.log('Run ' + json.version);
    this._containerId = containerId;
  }
}

