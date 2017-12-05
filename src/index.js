import json from '../package.json';
import engine from './engine';

export default class World {
  constructor(containerId) {
    console.log('Run ' + json.version);
    this._containerId = containerId;
  }
}

