import requests
import re
from typing import List
from .base_provider import BaseProductProvider
from ..schemas import Product


class ShopifyProvider(BaseProductProvider):

    def __init__(self, domain: str, source_name: str):
        self.domain = domain
        self.source_name = source_name

    def search_products(self, query: str) -> List[Product]:

        url = f"https://{self.domain}/products.json?limit=250"

        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                return []
        except Exception:
            return []

        data = response.json()
        products = []

        query_words = query.lower().split()

        for item in data.get("products", []):

            title = item.get("title", "").lower()
            body_html = item.get("body_html", "").lower()

            # Clean HTML
            body_text = re.sub("<.*?>", " ", body_html)

            combined_text = f"{title} {body_text}"

            # Strict full-word matching
            product_words = re.findall(r"\b\w+\b", combined_text)

            if not all(word in product_words for word in query_words):
                continue

            # Get first available variant
            variants = item.get("variants", [])
            if not variants:
                continue

            variant = variants[0]

            # ✅ Only current price (no compare price)
            price_value = variant.get("price", "N/A")

            # Format similar to Ordinary style
            price_display = f"Rs {price_value}"

            # Image
            images = item.get("images", [])
            image_url = images[0].get("src") if images else ""

            product = Product(
                name=item.get("title", "N/A"),
                price=price_display,
                image_url=image_url,
                product_url=f"https://{self.domain}/products/{item.get('handle')}",
                source=self.source_name
            )

            products.append(product)

        return products[:6]