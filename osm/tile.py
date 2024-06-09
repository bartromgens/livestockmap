def generate_tiles(min_lat, min_lon, max_lat, max_lon, delta_lat, delta_lon):
    lat_lon_tiles = []
    lat = min_lat
    while lat < max_lat:
        lon = min_lon
        while lon < max_lon:
            max_lat_cur = min(lat + delta_lat, max_lat)
            max_lon_cur = min(lon + delta_lon, max_lon)
            lat_lon_tiles.append((lat, lon, max_lat_cur, max_lon_cur))
            lon += delta_lon
        lat += delta_lat
    return lat_lon_tiles
