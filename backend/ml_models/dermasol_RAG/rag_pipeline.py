from ml_models.dermasol_RAG.retriever import (
    retrieve_medical,
    retrieve_skincare
)
import re

# ✅ NEW IMPORT (ONLY ADDITION)
from services.product_agent.agent import ProductAgent


class DermasolRAG:
    def __init__(self, llm_callable):
        self.llm = llm_callable

    # ---------------------------------------------------
    # 1️⃣ Normalize Disease Label
    # ---------------------------------------------------
    def _normalize_disease(self, disease_raw: str) -> str:
        disease = str(disease_raw).strip()

        if not disease:
            return "Unknown/Normal"

        if "normal" in disease.lower() or "unknown" in disease.lower():
            return "Unknown/Normal"

        return disease

    # ---------------------------------------------------
    # 2️⃣ Skincare Dual Retrieval
    # ---------------------------------------------------
    def _retrieve_skincare_dual(self, context: dict):

        intent = None
        if context.get("nlp"):
            intent = context["nlp"].get("intent")

        skin_type = context.get("skin_type")

        if not intent:
            return []

        print("🔹 Using SKINCARE corpus")

        query_specific = f"{intent} {skin_type} routine guide ingredients"

        specific_chunks = retrieve_skincare(
            query=query_specific,
            intent=intent,
            skin_type=skin_type
        )

        query_general = f"{intent} skincare explanation core ingredients tips"

        general_chunks = retrieve_skincare(
            query=query_general,
            intent=intent,
            skin_type=None
        )

        seen = set()
        combined = []

        for chunk in specific_chunks + general_chunks:
            text = chunk.get("text")
            if text not in seen:
                combined.append(chunk)
                seen.add(text)

        return combined[:8]

    # ---------------------------------------------------
    # 3️⃣ Medical Retrieval
    # ---------------------------------------------------
    def _retrieve_medical(self, context: dict, normalized_disease: str):

        print("🔹 Using MEDICAL corpus")

        query = f"""
Disease: {normalized_disease}

Clinical explanation, causes, management and treatment guidance.
"""

        return retrieve_medical(
            query=query.strip(),
            final_condition=normalized_disease
        )

    # ---------------------------------------------------
    # 4️⃣ Build Final LLM Prompt (UNCHANGED)
    # ---------------------------------------------------
    def _build_prompt(self, context: dict, normalized_disease: str, retrieved_chunks: list):

        context_text = "\n\n".join([chunk["text"] for chunk in retrieved_chunks])

        skin_type = context.get("skin_type", "")
        intent = None
        if context.get("nlp"):
            intent = context["nlp"].get("intent")

        case_type = context.get("context_type")

        display_condition = (
            "Normal skin"
            if normalized_disease == "Unknown/Normal"
            else normalized_disease
        )

        if case_type == "skincare":

            task_instruction = f"""
You are generating a SKINCARE response.

STRICT INSTRUCTIONS:
1. State clearly that no disease was detected in form of user friendly paragraph that they have healthy skin.
2. Mention detected skin type.
3. Use retrieved CONTEXT all the chunks along with your search data to explain in detail how user can manage their skin care routine.
4. Provide detail of products from CONTEXT and tell user how they shall use them.
5. Explain information retrieved from CONTEXT in user friendly way.

Return STRICT JSON:

{{
  "case_type": "skincare",
  "analysis": "",
  "skin_type": "{skin_type}",
  "skin_care_guide": {{
      "intent": "{intent}",
      "routine": "",
      "ingredients": "",
      "products_section": ""
  }},
  "recommended_products": [],
  "disclaimer": "This guidance is educational and not a medical diagnosis."
}}
"""

        else:

            task_instruction = f"""
You are generating a MEDICAL response.

STRICT INSTRUCTIONS:
1. Explain detected condition clearly and in detail.
2. Use only retrieved CONTEXT.
3. Mention symptoms.
4. Mention causes from CONTEXT.
5. Provide all treatments from CONTEXT.
6. Explain when to see a doctor.
7. Do NOT hallucinate beyond CONTEXT.

Return STRICT JSON:

{{
  "case_type": "medical",
  "analysis": "",
  "skin_type": "{skin_type}",
  "symptoms": "",
  "causes": "",
  "treatment": "",
  "precautions": "",
  "when_to_see_doctor": "",
  "disclaimer": "This information is educational and not a confirmed medical diagnosis."
}}
"""

        prompt = f"""
You are a cautious dermatologist assistant.

PATIENT DATA:
Condition: {display_condition}
Skin Type: {skin_type}
User Intent: {intent}

CONTEXT:
{context_text}

TASK:
{task_instruction}

Return VALID JSON only.
"""

        return prompt.strip()

    # ---------------------------------------------------
    # 🔵 Allergy Safety Filter (UNCHANGED)
    # ---------------------------------------------------
    def _filter_allergens(self, response_json: dict, context: dict):

        allergies = []
        if context.get("nlp"):
            allergies = context["nlp"].get("allergies", []) or []

        if not allergies:
            return response_json

        allergies = [a.lower() for a in allergies]

        def scrub_text(text: str):
            if not text:
                return text

            cleaned = text

            for allergen in allergies:
                pattern = re.compile(re.escape(allergen), re.IGNORECASE)
                cleaned = pattern.sub("", cleaned)

            cleaned = re.sub(r"\(\s*\)", "", cleaned)
            cleaned = re.sub(r"\s{2,}", " ", cleaned)
            cleaned = re.sub(r"\s+,", ",", cleaned)
            cleaned = cleaned.strip()

            return cleaned

        if "recommended_products" in response_json:
            filtered = []
            for product in response_json["recommended_products"]:
                if not any(allergen in product.lower() for allergen in allergies):
                    filtered.append(product)

            response_json["recommended_products"] = filtered

        guide = response_json.get("skin_care_guide", {})

        if guide:
            guide["routine"] = scrub_text(guide.get("routine", ""))
            guide["ingredients"] = scrub_text(guide.get("ingredients", ""))
            guide["products_section"] = scrub_text(guide.get("products_section", ""))

            response_json["skin_care_guide"] = guide

        return response_json

    # ---------------------------------------------------
    # 5️⃣ Main Execution
    # ---------------------------------------------------
    def generate(self, context: dict):

        raw_disease = context.get("final_condition")
        normalized_disease = self._normalize_disease(raw_disease)

        context_type = context.get("context_type")

        if context_type == "medical":
            retrieved_chunks = self._retrieve_medical(
                context,
                normalized_disease
            )
        else:
            retrieved_chunks = self._retrieve_skincare_dual(
                context
            )

        print("\n================ RETRIEVED CHUNKS ================\n")

        for i, chunk in enumerate(retrieved_chunks):
            print(f"\n--- CHUNK {i+1} ---")
            print("SOURCE:", chunk.get("source"))
            print("INTENT:", chunk.get("intent"))
            print("SKIN TYPE:", chunk.get("skin_type"))
            print("TEXT PREVIEW:")
            print(chunk.get("text", "")[:600])
            print("\n--------------------------------------------------\n")

        print("===================================================\n")

        prompt = self._build_prompt(
            context,
            normalized_disease,
            retrieved_chunks
        )

        print("\n============= FULL PROMPT =============\n")
        print(prompt)
        print("\n=======================================\n")

        response_json = self.llm(prompt)

        # 🔵 Apply allergy scrub (UNCHANGED)
        response_json = self._filter_allergens(response_json, context)

        # ==================================================
        # ✅ NEW: Inject Real Product Recommendations
        # ==================================================
        if context_type == "skincare":

            try:
                agent = ProductAgent()

                guide = response_json.get("skin_care_guide", {})
                ingredients_text = guide.get("ingredients", "")

                ingredients = [
                    ing.strip()
                    for ing in ingredients_text.split(",")
                    if ing.strip()
                ]

                if ingredients:
                    products = agent.fetch_products_by_ingredients(ingredients)
                    serialized = agent.serialize_products(products)

                    response_json["recommended_products"] = serialized

            except Exception as e:
                print("⚠ Product Agent Error:", e)

        # ==================================================

        return {
            "context_used": context_type,
            "normalized_disease": normalized_disease,
            "structured_response": response_json,
            "sources": retrieved_chunks
        }