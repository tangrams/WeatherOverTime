// Init tangram
map = (function () {
    'use strict';
    
    // Create a Leaflet Map
    var map = L.map('map',{
        trackResize: true,
        keyboard: false,
        dragging: (window.self !== window.top && L.Browser.touch) ? false : true,
        tap: (window.self !== window.top && L.Browser.touch) ? false : true,
    });

    // Create a Tangram Layer
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="http://openweathermap.org/" target="_blank">OpenWeatherMap</a> | <a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    map.setView([39.825, -98.170], 5); // Default map location
    var hash = new L.Hash(map);

    /***** Once the page is loaded is time to initialize the routines that handles the interaction *****/
    window.addEventListener('load', function () {
        init();
    });

    return map;
}());

function init() {
    // Add Tangram `layer` to Leaflet `map`
    layer.addTo(map);

    setTimeout(function(){
        console.log('Load stations')
        fetch('data/database.json')        
            .then(function (response) {
                // If we get a positive response...
                if (response.status !== 200) {
                    console.log('Error getting data. Status code: ' + response.status);
                    return;
                }
                // ... parse it to JSON
                return response.json();
            })
            .then(function(json) {
                console.log(json);

                samplesTotal = 24
                data = new Data2Image();
                data.setTotalInstances(samplesTotal);

                // Make a GeoJSON POI for every station
                var features = [];
                var idCounter = 0;
                for (var station in json) {
                    features.push(makePOIs(json[station], idCounter++));
                    data.addElement(station, 'color', (instance, element) => {
                        var cycle = addLeadingZeros(instance,2);
                        if (json[element.name].cycles[cycle]) {
                            var obs = json[element.name].cycles[cycle]
                            return [127+parseFloat(obs.temp), obs.wind_speed, (obs.wind_deg/360)*255]
                        }
                        else {
                            return [0,0,0];
                        }
                    })
                }

                scene.config.textures.stationsOverTime.url = data.getUrl();
                scene.styles.wind.shaders.uniforms.u_param = [samplesTotal, idCounter];
                scene.updateConfig({ rebuild: true });

                // console.log(features)
                // Pass the POIs as a GeoJSON FeaturesCollection to tangram
                scene.setDataSource('stations', {type: 'GeoJSON', data: {
                    'type': 'FeatureCollection',
                    'features': features
                }});
            })
             .catch(function(error) {
                console.log('Error parsing the JSON', error);
            });
    },1000);
}

function addLeadingZeros (n, length) {
    var str = (n > 0 ? n : -n) + "";
    var zeros = "";
    for (var i = length - str.length; i > 0; i--)
        zeros += "0";
    zeros += str;
    return n >= 0 ? zeros : "-" + zeros;
}

function makePOIs(station, id) {
    return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [station.lng, station.lat]
            },
            properties: {
                id: id,
                name: station.name,
                kind: 'station'
            }
        };
}