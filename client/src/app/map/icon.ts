import { icon } from 'leaflet';
import { AnimalType } from '../core/animal';

const ICON_SIZE_SCALE_FACTOR = 0.45;

export const chickenIcon = {
  iconUrl: 'assets/chicken60x60.png',
  width: 60,
  height: 60,
  leafletIcon: icon({
    iconUrl: 'assets/chicken60x60.png',
    iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 60 * ICON_SIZE_SCALE_FACTOR], // size of the icon
    iconAnchor: [(-60 / 2) * ICON_SIZE_SCALE_FACTOR, 0], // point of the icon which will correspond to marker's location
    // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  }),
};

export const pigIcon = {
  iconUrl: 'assets/pig60x40.png',
  width: 60,
  height: 40,
  leafletIcon: icon({
    iconUrl: 'assets/pig60x40.png',
    iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 40 * ICON_SIZE_SCALE_FACTOR], // size of the icon
    iconAnchor: [(60 / 2) * ICON_SIZE_SCALE_FACTOR, 0], // point of the icon which will correspond to marker's location
  }),
};

export const cowIcon = {
  iconUrl: 'assets/cow60x38.png',
  width: 60,
  height: 38,
  leafletIcon: icon({
    iconUrl: 'assets/cow60x38.png',
    iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 38 * ICON_SIZE_SCALE_FACTOR], // size of the icon
    iconAnchor: [0, 40 * ICON_SIZE_SCALE_FACTOR], // point of the icon which will correspond to marker's location
  }),
};

export const cowDairyIcon = {
  iconUrl: 'assets/cow_dairy60x38.png',
  width: 60,
  height: 38,
  leafletIcon: icon({
    iconUrl: 'assets/cow_dairy60x38.png',
    iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 38 * ICON_SIZE_SCALE_FACTOR], // size of the icon
    iconAnchor: [0, 40 * ICON_SIZE_SCALE_FACTOR], // point of the icon which will correspond to marker's location
  }),
};

export const goatIcon = {
  iconUrl: 'assets/goat60x60.png',
  width: 60,
  height: 60,
  leafletIcon: icon({
    iconUrl: 'assets/goat60x60.png',
    iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 60 * ICON_SIZE_SCALE_FACTOR], // size of the icon
    iconAnchor: [0, -(60 / 2) * ICON_SIZE_SCALE_FACTOR], // point of the icon which will correspond to marker's location
  }),
};

export const sheepIcon = {
  iconUrl: 'assets/sheep60x46.png',
  width: 60,
  height: 46,
  leafletIcon: icon({
    iconUrl: 'assets/sheep60x46.png',
    iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 46 * ICON_SIZE_SCALE_FACTOR], // size of the icon
    iconAnchor: [0, (60 / 2) * ICON_SIZE_SCALE_FACTOR], // point of the icon which will correspond to marker's location
  }),
};

export const cowGrey = {
  iconUrl: 'assets/cow_grey60x38.png',
  width: 60,
  height: 38,
  leafletIcon: icon({
    iconUrl: 'assets/cow_grey60x38.png',
    iconSize: [60 * ICON_SIZE_SCALE_FACTOR, 38 * ICON_SIZE_SCALE_FACTOR], // size of the icon
    iconAnchor: [0, 40 * ICON_SIZE_SCALE_FACTOR], // point of the icon which will correspond to marker's location
  }),
};

export const ANIMAL_TYPE_ICON = {
  [AnimalType.Chicken]: chickenIcon,
  [AnimalType.Pig]: pigIcon,
  [AnimalType.Cow]: cowIcon,
  [AnimalType.Cow_Dairy]: cowDairyIcon,
  [AnimalType.Cow_Beef]: cowIcon,
  [AnimalType.Goat]: goatIcon,
  [AnimalType.Sheep]: sheepIcon,
  [AnimalType.Combined]: cowGrey,
};
