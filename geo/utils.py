from pydantic import BaseModel


class BBox(BaseModel):
    lon_min: float
    lon_max: float
    lat_min: float
    lat_max: float

    @classmethod
    def parse_bbox(cls, bbox_str) -> "BBox":
        values = bbox_str.split(",")
        assert len(values) == 4
        return BBox(
            lon_min=values[0], lat_min=values[1], lon_max=values[2], lat_max=values[3]
        )

    def __str__(self) -> str:
        return f"{self.lon_min}, {self.lon_max}, {self.lat_min}, {self.lat_max}"
