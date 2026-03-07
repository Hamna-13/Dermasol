from pydantic import BaseModel

class Product(BaseModel):
    name: str
    price: str
    image_url: str
    product_url: str
    source: str