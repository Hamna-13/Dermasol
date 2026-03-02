# from .providers.woocommerce_provider import WooCommerceProvider
# from .providers.shopify_provider import ShopifyProvider


# class ProductAgent:

#     def __init__(self):

#         self.providers = [
#             WooCommerceProvider(),  # Ordinary
#             ShopifyProvider("cerave-pakistan.com.pk", "CeraVe Pakistan"),
#             ShopifyProvider("conaturalintl.com", "Conatural")
#         ]

#     def fetch_products(self, query: str):

#         all_products = []

#         for provider in self.providers:
#             try:
#                 results = provider.search_products(query)
#                 all_products.extend(results)
#             except Exception:
#                 continue

#         return all_products

from .providers.woocommerce_provider import WooCommerceProvider
from .providers.shopify_provider import ShopifyProvider
from .schemas import Product


class ProductAgent:

    def __init__(self):

        self.providers = [
            WooCommerceProvider(),  # Ordinary
            ShopifyProvider("cerave-pakistan.com.pk", "CeraVe Pakistan"),
            ShopifyProvider("conaturalintl.com", "Conatural")
        ]

    # -------------------------------------------------
    # Ingredient-based search
    # Returns ONE top product per site
    # -------------------------------------------------
    def fetch_products_by_ingredients(self, ingredients: list):

        selected_products = []

        for provider in self.providers:

            top_product = None

            for ingredient in ingredients:
                try:
                    results = provider.search_products(ingredient)

                    if results:
                        top_product = results[0]   # take first match
                        break  # stop searching more ingredients for this provider

                except Exception:
                    continue

            if top_product:
                selected_products.append(top_product)

        return selected_products  # max 3 (one per provider)

    # -------------------------------------------------
    # Serialize for API response (thumbnail-ready)
    # -------------------------------------------------
    def serialize_products(self, products: list[Product]):

        return [product.dict() for product in products]