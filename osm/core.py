import overpass
import requests

api = overpass.API(timeout=60)


def get_country_area_id():
    query = """
        (area["ISO3166-1"="NL"];)
    """
    return api.get(query, responseformat="json")


def get_api_status():
    return requests.get("https://overpass-api.de/api/status")


def kill_my_queries():
    return requests.get("https://overpass-api.de/api/kill_my_queries")


# def shapely_to_geojson(shapely_polygon: Polygon) -> geojson.Feature:
#     geojson_polygon = shapely.geometry.mapping(shapely_polygon)
#     return geojson.Feature(geometry=geojson_polygon)
#
#
# def shapely_collection_to_geojson(
#     shapely_polygons: List[Polygon],
# ) -> geojson.FeatureCollection:
#     features = [shapely_to_geojson(polygon) for polygon in shapely_polygons]
#     return geojson.FeatureCollection(features)
