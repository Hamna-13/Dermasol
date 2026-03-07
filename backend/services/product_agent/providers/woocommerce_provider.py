import requests
from bs4 import BeautifulSoup
from .base_provider import BaseProductProvider
from ..schemas import Product


class WooCommerceProvider(BaseProductProvider):

    def search_products(self, query: str):

        base_url = "https://ordinarypakistan.pk"
        url = f"{base_url}/?s={query.replace(' ', '+')}&post_type=product"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept-Language": "en-US,en;q=0.9"
        }

        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            print("Request failed:", response.status_code)
            return []

        soup = BeautifulSoup(response.text, "html.parser")

        products = []

        product_cards = soup.find_all("li", class_="product")

        # Debug (optional — remove later)
        print("Total product cards found:", len(product_cards))

        for card in product_cards[:6]:

            title_tag = card.find("h2", class_="woocommerce-loop-product__title")
            price_tag = card.find("span", class_="price")
            link_tag = card.find("a", href=True)
            img_tag = card.find("img")

            if not title_tag or not link_tag:
                continue

            # -------- Robust Price Extraction --------
            price = "N/A"

            if price_tag:
                # Try sale price first
                ins_tag = price_tag.find("ins")
                if ins_tag:
                    price = ins_tag.get_text(strip=True)
                else:
                    # Otherwise get first visible amount
                    amount_tag = price_tag.find("span", class_="woocommerce-Price-amount")
                    if amount_tag:
                        price = amount_tag.get_text(strip=True)
                    else:
                        price = price_tag.get_text(strip=True)

            # -------- Image Extraction --------
            image_url = ""

            if img_tag:
                image_url = img_tag.get("src") or img_tag.get("data-src") or ""

            # -------- Create Product --------
            product = Product(
                name=title_tag.get_text(strip=True),
                price=price,
                image_url=image_url,
                product_url=link_tag["href"],
                source="Ordinary Pakistan"
            )

            products.append(product)

        return products