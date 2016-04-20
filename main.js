var hours = [];
var time = 0;
var pause = false;
var selected = -1;
var displayContainer = null;
var display = null;

// Init tangram
map = (function () {
    'use strict';

    var map_start_location = [39.825, -98.170, 5];
    
    // Create a Leaflet Map
    var map = L.map('map',{
        trackResize: true,
        keyboard: false,
        dragging: (window.self !== window.top && L.Browser.touch) ? false : true,
        tap: (window.self !== window.top && L.Browser.touch) ? false : true,
    });

    var url_hash = window.location.hash.slice(1).split('/');
    if (url_hash.length == 3) {
        map_start_location = [url_hash[1], url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }

    // Create a Tangram Layer
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://twitter.com/patriciogv" target="_blank">@patriciogv</a> | <a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | <a href="https://mapzen.com/" target="_blank">Mapzen</a> | &copy; OSM contributors'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    map.setView(map_start_location.slice(0, 2), map_start_location[2]);
    var hash = new L.Hash(map);

    /***** Once the page is loaded is time to initialize the routines that handles the interaction *****/
    window.addEventListener('load', function () {
        // Add Tangram `layer` to Leaflet `map`
        layer.addTo(map);
        setTimeout(init, 2000);
    });

    return map;
}());

function init() {
    // Make TimeLine
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
            var dataLabel = document.getElementById('date');

            var slider = noUiSlider.create(timeSlider, {
                start: 0,
                step: 0.04,
                range: {
                        'min': 0,
                        'max': hours.length-1
                    },
                pips: {
                    mode: 'positions',
                    values: [0,25,50,75,100],
                    density: 4,
                    format: wNumb({
                            decimals: 0,
                            edit: function ( value ) {
                                return formatTime(value);
                            }
                    })
                }
            });
            window.timeSlider = timeSlider;

            timeSlider.noUiSlider.on('update', function( values, handle ) {
                var t = parseFloat(values);
                scene.styles.wind.shaders.uniforms.u_offset = t;
                dataLabel.innerHTML = formatTime(values, true);
                if (display) {
                    display.setUniform('u_hour',t,0);
                }
            });

            timeSlider.noUiSlider.on('start', function(){
                pause = true;
            });
            timeSlider.noUiSlider.on('end', function(){
                time = parseFloat(timeSlider.noUiSlider.get());
                pause = false;
            });
        })

    // Load the image with the data
    var downloadingImage = new Image();
    downloadingImage.onload = function(){
        // console.log(this.width,this.height);
        scene.styles.wind.shaders.uniforms.u_param = [this.width,this.height];
    };
    downloadingImage.src = 'data/data.png'
    window.setInterval('update()', 100);

    var dataDisplay = document.getElementById('display_shader');
    display = new GlslCanvas(dataDisplay);

    displayContainer = document.getElementById('display');
    displayContainer.style.visibility = 'hidden';

    // Init the feature selection
    map.getContainer().addEventListener('click', function (event) {
        var pixel = { x: event.clientX, y: event.clientY };
        scene.getFeatureAt(pixel).then( function (selection) {
            if (selection.feature && selected !== selection.feature.properties.id) {
                selected = selection.feature.properties.id;
                scene.config.global.hovered = selected;
                scene.rebuild();
                if (displayContainer.style.visibility === 'hidden') {
                    displayContainer.style.visibility = 'visible';
                }
                display.setUniform('u_id',selection.feature.properties.id,0)
            }
            else if (selected && selected !== -1) {
                selected = -1;
                scene.config.layers.station.properties.hovered = selected;
                scene.rebuild();
                displayContainer.style.visibility = 'hidden';
            }
        });
    });
}

function update() {
    if (!pause) {
        if (typeof time === 'string') {
            time = parseFloat(time);
        }
        time += 0.5;
        if (time > hours.length) {
            time = 0;
        }
        window.timeSlider.noUiSlider.set(time);
    }
}

function formatTime(values, showHour) {
    var date = hours[Math.floor(values)].split('-');
    var time = date[1]+'/'+date[2]+'/'+date[0]
    if (showHour) {
        time += ' '+date[3]+'hs';
    }
    return time;  
}