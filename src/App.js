// impot libs
import React, { Component } from 'react';

// import local components
import Map from './components/Map';

// import app-level css
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app-header">
        <p className="center">
          Drone No-Fly-Zone: National Airport, Washington D.C.
        </p>
        <Map />
      </div>
    );
  }
}

export default App;
