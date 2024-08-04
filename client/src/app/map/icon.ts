import { icon } from "leaflet";

const ICON_SIZE_SCALE_FACTOR = 0.45;

export const chickenIcon = icon({
  iconUrl: "assets/chicken60x60.png",
  iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 60 * ICON_SIZE_SCALE_FACTOR], // size of the icon
  iconAnchor: [-60 / 2 * ICON_SIZE_SCALE_FACTOR, 0], // point of the icon which will correspond to marker's location
  // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

export const pigIcon = icon({
  iconUrl: "assets/pig60x40.png",
  iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 40 * ICON_SIZE_SCALE_FACTOR], // size of the icon
  iconAnchor: [60 / 2 * ICON_SIZE_SCALE_FACTOR, 0], // point of the icon which will correspond to marker's location
});

export const cowIcon = icon({
  iconUrl: "assets/cow60x38.png",
  iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 38 * ICON_SIZE_SCALE_FACTOR], // size of the icon
  iconAnchor: [0, 40 * ICON_SIZE_SCALE_FACTOR], // point of the icon which will correspond to marker's location
});
