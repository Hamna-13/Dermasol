from abc import ABC, abstractmethod
from typing import List
from ..schemas import Product

class BaseProductProvider(ABC):

    @abstractmethod
    def search_products(self, query: str) -> List[Product]:
        pass