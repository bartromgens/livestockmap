import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeafletModule } from "@bluehalo/ngx-leaflet";
import { circle, latLng, marker, polygon, tileLayer } from "leaflet";
import { BuildingService } from "./core/building.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LeafletModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title: string = 'livestockmap';
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    center: latLng(46.879966, -121.726909)
  };
  layers = [
    circle([ 46.95, -122 ], { radius: 5000 }),
    polygon([[ 46.8, -121.85 ], [ 46.92, -121.92 ], [ 46.87, -121.8 ]]),
    marker([ 46.879966, -121.726909 ])
  ];

  constructor(private buildingService: BuildingService) {}

  ngOnInit(): void {
    this.update();
  }

  private update() {
    const layers : any[] = [];
    this.buildingService.getBuildings().subscribe(buildings => {
      for (const building of buildings) {
        const coordinates : [number, number][] = [];
        for (const coordinate of building.geometry) {
          coordinates.push([coordinate.lat, coordinate.lon]);
        }
        layers.push(polygon(coordinates));
      }
    });
    this.layers = layers;
  }
}
