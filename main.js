var hours = [];
var time = 0;

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

    fetch('data/hours.json')
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
            hours = json;

            var timeSlider = document.getElementById('time');
            var slider = noUiSlider.create(timeSlider, {
                start: 2,
                step: 0.04,
                range: {
                        'min': 0,
                        'max': hours.length
                    }
            });
            window.timeSlider = timeSlider;

            timeSlider.noUiSlider.on('update', function( values, handle ) {
                scene.styles.wind.shaders.uniforms.u_offset = parseFloat(values);
            });
        })
        //  .catch(function(error) {
        //     console.log('Error parsing the JSON', error);
        // });

    setTimeout(function(){
        var downloadingImage = new Image();
        downloadingImage.onload = function(){
            console.log(this.width,this.height);
            scene.styles.wind.shaders.uniforms.u_param = [this.width,this.height];
        };
        downloadingImage.src = 'data/data.png'
        window.setInterval('update()', 100);
    }, 2000);
}

function update() {
    time += 0.05;
    if (time > hours.length) {
        time = 0;
    }
    window.timeSlider.noUiSlider.set(time);
}