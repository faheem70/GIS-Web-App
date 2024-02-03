var map = L.map('map').setView([0, 0], 2);

var drawnItems = new L.FeatureGroup().addTo(map);

// Base layers
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

}).addTo(map);

var overlayLayers = {
    'Editable Features': drawnItems
};
var esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri'
});

// Initialize currentLayer
var currentLayer = osmLayer;

// Initialize the drawControl variable
var drawControl;

// Function to toggle map layers
function toggleMapLayer() {
    // Check if map is defined
    if (!map) {
        console.error('Map not defined');
        return;
    }

    // Remove the current layer from the map
    map.removeLayer(currentLayer);

    // Toggle between layers
    if (currentLayer === osmLayer) {
        esriLayer.addTo(map);
        currentLayer = esriLayer;
    } else {
        osmLayer.addTo(map);
        currentLayer = osmLayer;
    }
}

// Geocoding
var searchControl = L.Control.geocoder({
    defaultMarkGeocode: false
}).addTo(map);

searchControl.on('markgeocode', function (e) {
    map.fitBounds(e.geocode.bbox);
});

// Function to enable drawing
function enableDraw(shapeType) {
    // Remove existing draw control and drawn items
    disableDraw();

    // Initialize the Leaflet Draw control
    drawControl = new L.Control.Draw({
        draw: {
            marker: (shapeType === 'marker') ? true : false,
            polyline: (shapeType === 'polyline') ? true : false,
            polygon: (shapeType === 'polygon') ? true : false,
            circle: false,
            rectangle: false
        },
        edit: {
            featureGroup: drawnItems
        }
    });

    // Add the draw control to the map
    map.addControl(drawControl);

    // Listen to the draw:created event to add the drawn layer to the FeatureGroup
    map.on('draw:created', function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
    });
}

function disableDraw() {
    // Remove existing draw control
    if (drawControl) {
        map.removeControl(drawControl);
    }

    // Remove existing drawn items
    if (drawnItems) {
        map.removeLayer(drawnItems);
        drawnItems = new L.FeatureGroup(); // Reinitialize drawnItems
    }
}

// Zoom control
//L.control.zoom().addTo(map);

// Load GeoJSON, KML, or Shapefile
document.getElementById('fileInput').addEventListener('change', function (e) {
    var file = e.target.files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;

            // Detect format and add layer
            if (file.name.endsWith('.geojson')) {
                var geojsonLayer = L.geoJSON(JSON.parse(data));
                addToLayerControl(geojsonLayer, file.name);
                geojsonLayer.addTo(map);
            } else if (file.name.endsWith('.kml')) {
                var kmlLayer = omnivore.kml.parse(data);
                addToLayerControl(kmlLayer, file.name);
                kmlLayer.addTo(map);
            } else if (file.name.endsWith('.shp')) {
                var shpLayer = omnivore.shp.parseZip(data);
                addToLayerControl(shpLayer, file.name);
                shpLayer.addTo(map);
            }
        };

        reader.readAsText(file);
    }
});

// Additional functionalities (can be extended further)

// Search Address function
function searchAddress() {
    var address = document.getElementById('searchInput').value;

    // Use the geocoder service directly
    L.Control.Geocoder.nominatim().geocode(address, function (results) {
        if (results && results.length > 0) {
            var latlng = results[0].center;
            map.setView(latlng, 15);
        } else {
            alert('Address not found');
        }
    });
}

function addToLayerControl(layer, name) {
    overlayLayers[name] = layer;
    L.control.layers(null, overlayLayers, { collapsed: false }).addTo(map);
}

function openFileInput() {
    document.getElementById('fileInput').click();
}