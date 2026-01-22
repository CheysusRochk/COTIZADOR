from pydantic import BaseModel
from typing import List, Optional

class Product(BaseModel):
    id: str  # Could be SKU or URL hash
    name: str
    price: float
    currency: str = "BS" # or USD
    stock: str # "Available", "Out of stock", or specific number if possible
    image_url: Optional[str] = None
    url: str

class SearchResponse(BaseModel):
    results: List[Product]

class QuoteItem(BaseModel):
    product: Product
    quantity: int
    margin_percentage: float

class QuoteRequest(BaseModel):
    items: List[QuoteItem]
    customer_name: str
    date: str
