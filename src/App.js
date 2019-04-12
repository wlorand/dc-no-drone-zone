// impot libs
import React, { Component } from 'react';

// import local components
import Map from './components/Map';

// import app-level css
import './App.css';

class App extends Component {
  // TODO: Lift State here from the Component --closer to a Redux store

  render() {
    return (
      <div className="app-header">
        <p className="center">
          FAA Drone No-Fly-Zone: National Airport, Washington D.C.
        </p>
        <Map />
      </div>
    );
  }
}

export default App;
