var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const getMarkerOptions = (targetElectorate, normalizedName, name) => {
    if (targetElectorate) {
        return {
            icon: L.divIcon({
                className: 'elect-div-label',
                html: `<div style="font-size: 24px"><a href="#${targetElectorate ? normalizedName : ''}" class="elect-div-link">${name}</a></div>`,
                iconSize: undefined,
                iconAnchor: [0, 0]
            })
        }
    } else {
        return {
            icon: L.divIcon({
                className: 'elect-div-label',
                html: `<div style="font-size: 22px">${name}</div>`,
                iconSize: undefined,
                iconAnchor: [0, 0]
            })
        }
    }
};

const STATES = ["nsw", "qld", "sa", "vic", "wa", "nt", "tas"];

const clickStateForTarget = (targetElement) => {
    const parentClasses = targetElement.parentElement.classList.value.split(" ");
    const stateClass = parentClasses.find(className => STATES.includes(className));
    if (stateClass) {
        const stateButton = document.querySelector(`button[data-filter=".${stateClass}"]`);
        if (stateButton) {
            stateButton.click();
        }
    }
};

function init() {
    return __awaiter(this, void 0, void 0, function* () {
        var map = L.map('osm-map', {
            preferCanvas: true,
            zoomControl: true,
            attributionControl: false
        }).setView([-25.871165, 133.133], 4); // Centered on Australia
        setTimeout(() => map.invalidateSize(), 100);
        // Ugly tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        let geoJsonLayer = null;
        let userLocation = null;
        let userElectorate = null;
        function getCentroid(feature, layer) {
            var _a, _b;
            if ((_b = (_a = feature.properties) === null || _a === void 0 ? void 0 : _a.centroid) === null || _b === void 0 ? void 0 : _b.latitude) {
                return [
                    feature.properties.centroid.latitude,
                    feature.properties.centroid.longitude
                ];
            }
            else {
                console.warn(`${feature.properties.Elect_div} is missing a pre-computed centroid`);
                return layer.getBounds().getCenter();
            }
        }
        function getNormalizedName(electorateName) {
            return electorateName.toLowerCase().replace(' ', '_');
        }
        function findUserElectorate(layer, location) {
            let relevantElectorate = null;
            layer.eachLayer((featureLayer) => {
                if (featureLayer instanceof L.Polygon) {
                    const feature = featureLayer.feature;
                    const normalizedName = getNormalizedName(feature.properties.Elect_div);
                    // This function contains() relies on https://github.com/hayeswise/Leaflet.PointInPolygon
                    if (featureLayer.contains(location)) {
                        console.log(`User is in ${normalizedName}`);
                        featureLayer.setStyle({ color: "#ddb0f6", weight: 5, fill: true, fillOpacity: 0.15 });
                        relevantElectorate = normalizedName;
                    }
                }
            });
            return relevantElectorate;
        }
        // Load and render all features immediately
        function loadElectorateData() {
            fetch('https://fusionparty.space/geography/electorates_with_centroids.topojson')
                .then(response => response.json())
                .then(topology => {
                    const geojson = topojson.feature(topology, topology.objects.electorates_with_centroids)
                    geoJsonLayer = L.geoJSON(geojson, {
                    style: { color: "#6e267b", weight: 5, opacity: 0.6, fill: false },
                    onEachFeature: (feature, layer) => {
                        var _a, _b;
                        const centroid = getCentroid(feature, layer);
                        const normalizedName = getNormalizedName(feature.properties.Elect_div);
                        const targetElectorate = document.getElementById(normalizedName);
                        // Create a label for the feature
                        const markerOptions = getMarkerOptions(targetElectorate, normalizedName, feature.properties.Elect_div)
                        const label = L.marker(centroid, markerOptions).addTo(map);
                        // Add click event listener to the link
                        (_b = (_a = label.getElement()) === null || _a === void 0 ? void 0 : _a.querySelector('.elect-div-link')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function (event) {
                            return __awaiter(this, void 0, void 0, function* () {
                                event.preventDefault(); // Prevent default link behavior
                                const targetElement = document.getElementById(normalizedName);
                                if (targetElement) {
                                    clickStateForTarget(targetElement);
                                    // Wait for isotope filtering to finish readjusting the page.
                                    setTimeout(() => {
                                        targetElement.scrollIntoView({ behavior: 'smooth' });
                                    }, 405);  // milliseconds
                                }
                            });
                        });
                    }
                }).addTo(map);
                // If we already have user location, find their electorate
                if (userLocation && !userElectorate) {
                    const found = findUserElectorate(geoJsonLayer, userLocation);
                    if (found) {
                        userElectorate = found;
                    }
                }
            })
                .catch(console.error);
        }
        // Handle geolocation
        function handleGeolocationSuccess(position) {
            userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
            map.setView(userLocation, 12);
            L.marker(userLocation).addTo(map);
            // If GeoJSON is already loaded, check location
            if (geoJsonLayer && !userElectorate) {
                const found = findUserElectorate(geoJsonLayer, userLocation);
                if (found) {
                    userElectorate = found;
                }
            }
        }
        function geoFindMe() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, () => console.error("Geolocation failed"));
            }
            else {
                console.error("Geolocation not supported");
            }
        }
        // Start loading data immediately
        loadElectorateData();
        // Set up button click handler
        const findMeButton = document.getElementById("find-me");
        if (findMeButton) {
            findMeButton.addEventListener("click", geoFindMe);
        }
        else {
            console.error("Location button not found in DOM");
        }
    });
}
document.addEventListener("DOMContentLoaded", init);
