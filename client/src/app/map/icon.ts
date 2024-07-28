import { icon } from "leaflet";

const ICON_SIZE_DEFAULT = 24;

export const chickenIcon = icon({
  iconUrl: "assets/chicken.png",
  iconSize: [ICON_SIZE_DEFAULT, ICON_SIZE_DEFAULT], // size of the icon
  iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
  // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

export const pigIcon = icon({
  iconUrl: "assets/pig.png",
  iconSize: [ICON_SIZE_DEFAULT, ICON_SIZE_DEFAULT], // size of the icon
  iconAnchor: [ICON_SIZE_DEFAULT, 0], // point of the icon which will correspond to marker's location
});

export const cowIcon = icon({
  iconUrl: "assets/cow.png",
  iconSize: [ICON_SIZE_DEFAULT, ICON_SIZE_DEFAULT], // size of the icon
  iconAnchor: [-ICON_SIZE_DEFAULT, 0], // point of the icon which will correspond to marker's location
});
