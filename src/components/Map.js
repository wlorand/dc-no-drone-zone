// react lib
import React, { Component } from 'react';

// mapbox lib
import mapboxgl from 'mapbox-gl';

// turf for buffer  // todo: go modular! just import the buffer module
import * as turf from '@turf/turf';

// dcPolygon sample data
import dcPolygon from '../data/dc.bounds.geojson.js';

console.log('here is dcPolygon: ', dcPolygon);

// mapbox api key // TODO: make this an ENV property
mapboxgl.accessToken =
  'pk.eyJ1IjoibW0zIiwiYSI6InI5OGJ0NU0ifQ.0nE3dCbDkeY1Cko21RKKVA';

class Map extends Component {
  // store center location and initial zoom in local component state
  state = {
    lng: -77.0424202,
    lat: 38.851242,
    zoom: 8.5
  };

  componentDidMount() {
    // instantiate a mapbox gl map
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/navigation-guidance-night-v2', // || streets: 'mapbox://styles/mapbox/streets-v9',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    // on Map load, add sources and layers -- notice still in componentDidMount
    this.map.on('load', () => {
      // set a Marker
      // eslint-disable-next-line
      let marker = new mapboxgl.Marker()
        .setLngLat([this.state.lng, this.state.lat])
        .addTo(this.map);

      // create turf buffers
      const point = turf.point([this.state.lng, this.state.lat]);
      let buffer15 = turf.buffer(point, 15, { units: 'miles' });
      let buffer30 = turf.buffer(point, 30, { units: 'miles' });

      // geojson dev inspect
      // console.log('buffer15 as a geojson single feature: ', buffer15);

      // add turf buffers to the map: first source, then layer
      // TODO: refactor to use the layers: [] to control drawing order
      this.map.addSource('buffer15', {
        type: 'geojson',
        data: buffer15
      });

      this.map.addSource('buffer30', {
        type: 'geojson',
        data: buffer30
      });

      this.map.addLayer({
        id: 'buff30',
        type: 'fill',
        source: 'buffer30',
        paint: {
          'fill-color': 'rgb(238, 210, 2)',
          'fill-opacity': 0.25,
          'fill-outline-color': 'black'
        }
      });

      this.map.addLayer({
        id: 'bufferred',
        type: 'fill',
        source: 'buffer15',
        paint: {
          'fill-color': 'rgb(178, 34, 34)',
          'fill-opacity': 0.45
        }
      });

      // add dcPolygon source
      this.map.addSource('dcPolygon', {
        type: 'geojson',
        data: dcPolygon
      });

      // add dcPolygon layer
      this.map.addLayer({
        id: 'dcBounds',
        type: 'line',
        source: 'dcPolygon',
        paint: {
          'line-width': 2,
          'line-opacity': 0.75,
          'line-color': 'rgb(255, 255, 255)',
          'line-dasharray': [1, 1.75, 1],
          'line-translate': [-3, 2] // attempt to line up dc poly with basemap
        }
      });

      // II. Try Animate point on a Line for a Drone Flight into the DC No Drone Zone
      // Perhaps this is better as its own component (?)

      // a- Origin -> Destination Data Points  -- long listed first
      const origin = [-78.2039474, 39.1679128]; // Winchester, VA (from gmaps url window)
      const destination = [-77.0424202, 38.851242]; // DCA

      // b- create GeoJSON line and point feature
      let route = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [origin, destination]
            }
          }
        ]
      };

      let drone = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: origin
            }
          }
        ]
      };

      // c- use Turf to calculate distance
      const lineDistance = turf.lineDistance(route.features[0], {
        units: 'miles'
      });
      console.log(`${lineDistance} miles`);

      // d- create an arc of many points betw origin and destination
      // hack to stop the line at the no-fly zone
      let flightArc = [];

      for (let i = 0; i < lineDistance; i++) {
        // segment is key
        var segment = turf.along(
          route.features[0],
          (i / 80) * lineDistance, // distance
          { units: 'miles' }
        );
        flightArc.push(segment.geometry.coordinates);
      }

      // Update the route with calculated arc coordinates
      route.features[0].geometry.coordinates = flightArc;

      // d- add the route line to the map (as source and layer)
      this.map.addSource('route', {
        type: 'geojson',
        data: route
      });

      this.map.addLayer({
        id: 'route',
        source: 'route',
        type: 'line',
        paint: {
          'line-width': 2,
          'line-color': 'rgb(255, 255, 255)'
        }
      });

      this.map.addSource('drone', {
        type: 'geojson',
        data: drone
      });

      // add drone point -- helicopter icon closest Maki icon w/o using Assembly.css
      this.map.addLayer({
        id: 'drone',
        source: 'drone',
        type: 'symbol',
        layout: {
          'icon-image': 'heliport-15', // maki icons
          'icon-rotate': 0,
          'icon-size': 2
        }
      });

      // get a count of the map layers  (whoa! -- does all layers, not just user added)
      // TODO: Refactor this code to use the layers: [] and better code organization
      let layers = this.map.getStyle().layers;
      // console.log(`layers fukll list ${JSON.stringify(layers)}`);
      console.log(`layers array length: ${layers.length}`); // [] with length === 5 (?) -- whoa 149
    }); // map onLoad
  }

  // cleanup: remove map instance
  componentWillUnmount() {
    this.map.remove();
  }

  render() {
    // set Map style
    const fullScreenMapStyle = {
      position: 'absolute',
      top: 60,
      bottom: 0,
      width: '100%'
    };

    // return mapbox mount point
    return (
      <div ref={el => (this.mapContainer = el)} style={fullScreenMapStyle} />
    );
  }
}

export default Map;
