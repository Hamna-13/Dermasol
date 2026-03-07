import sys
import os

# Ensure backend root is in Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.product_agent.agent import ProductAgent


def run_test():
    query = "vitamin c"

    print(f"\n--- Testing Product Aggregator ---")
    print(f"🔍 Searching for: {query}\n")

    agent = ProductAgent()
    products = agent.fetch_products(query)

    if not products:
        print("❌ No products found.")
        return

    print(f"✅ Found {len(products)} products\n")

    for i, product in enumerate(products, start=1):
        print(f"\nProduct {i}")
        print("Name   :", product.name)
        print("Price  :", product.price)
        print("Source :", product.source)
        print("URL    :", product.product_url)
        print("Image  :", product.image_url)
        print("-" * 60)


if __name__ == "__main__":
    run_test()