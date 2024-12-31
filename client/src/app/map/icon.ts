import { Icon, icon } from 'leaflet';
import { AnimalType } from '../core/animal';

export class AnimalIcon {
  private readonly ICON_SIZE_SCALE_FACTOR = 0.45;
  leafletIcon: Icon;
  constructor(
    public iconUrl: string,
    public width: number,
    public height: number,
    iconAnchor: [number, number],
  ) {
    this.leafletIcon = icon({
      iconUrl: this.iconUrl,
      iconSize: [this.widthDisplay, this.heightDisplay],
      iconAnchor: [
        iconAnchor[0] * this.ICON_SIZE_SCALE_FACTOR,
        iconAnchor[1] * this.ICON_SIZE_SCALE_FACTOR,
      ],
    });
  }

  get widthDisplay(): number {
    return this.width * this.ICON_SIZE_SCALE_FACTOR;
  }

  get heightDisplay(): number {
    return this.height * this.ICON_SIZE_SCALE_FACTOR;
  }
}

export const chickenIcon = new AnimalIcon(
  'assets/chicken60x60.png',
  60,
  60,
  [0, 0],
);

export const pigIcon = new AnimalIcon('assets/pig60x40.png', 60, 40, [0, 0]);

export const cowIcon = new AnimalIcon('assets/cow60x38.png', 60, 38, [0, 40]);

export const cowDairyIcon = new AnimalIcon(
  'assets/cow_dairy60x38.png',
  60,
  38,
  [0, 0],
);

export const cowGreyIcon = new AnimalIcon(
  'assets/cow_grey60x38.png',
  60,
  38,
  [0, 0],
);

export const goatIcon = new AnimalIcon('assets/goat60x60.png', 60, 60, [0, 0]);

export const sheepIcon = new AnimalIcon(
  'assets/sheep60x46.png',
  60,
  46,
  [0, 0],
);

export const ANIMAL_TYPE_ICON: Record<AnimalType, AnimalIcon> = {
  [AnimalType.Chicken]: chickenIcon,
  [AnimalType.Pig]: pigIcon,
  [AnimalType.Cow_Dairy]: cowDairyIcon,
  [AnimalType.Cow_Beef]: cowIcon,
  [AnimalType.Goat]: goatIcon,
  [AnimalType.Sheep]: sheepIcon,
  [AnimalType.Combined]: cowGreyIcon,
};

export const ANIMAL_TYPE_DISPLAY_NAME: Record<AnimalType, string> = {
  [AnimalType.Chicken]: 'Kippen',
  [AnimalType.Pig]: 'Varkens',
  [AnimalType.Cow_Dairy]: 'Melkkoeien',
  [AnimalType.Cow_Beef]: 'Vleeskalveren',
  [AnimalType.Goat]: 'Geiten',
  [AnimalType.Sheep]: 'Shapen',
  [AnimalType.Combined]: 'Gemengd',
};
