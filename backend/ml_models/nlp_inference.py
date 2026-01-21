import torch
import pickle
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
# -------------------------------------------------
# CONFIG
# -------------------------------------------------
BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "dermasol_bioclinicalbert")
MAX_LENGTH = 128
CONFIDENCE_THRESHOLD = 0.60  # NLP below this is unreliable

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -------------------------------------------------
# LOAD MODEL (ONCE)
# -------------------------------------------------

_tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
_model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
_model.to(_device)
_model.eval()

with open(f"{MODEL_DIR}/label_encoder.pkl", "rb") as f:
    _label_encoder = pickle.load(f)

# -------------------------------------------------
# NLP INFERENCE FUNCTION
# -------------------------------------------------

@torch.no_grad()
def predict_from_history(user_text: str):
    """
    Takes user history / symptoms text and returns:
    - predicted disease label
    - confidence score
    - reliability flag
    """

    if not user_text or len(user_text.strip()) < 10:
        return {
            "label": None,
            "confidence": 0.0,
            "reliable": False,
            "reason": "Input too short"
        }

    encoding = _tokenizer(
        user_text,
        truncation=True,
        padding=True,
        max_length=MAX_LENGTH,
        return_tensors="pt"
    )

    encoding = {k: v.to(_device) for k, v in encoding.items()}

    outputs = _model(**encoding)
    probs = torch.softmax(outputs.logits, dim=1)[0]

    conf, idx = torch.max(probs, dim=0)

    label = _label_encoder.inverse_transform([idx.item()])[0]
    confidence = float(conf.item())

    return {
        "label": label,
        "confidence": confidence,
        "reliable": confidence >= CONFIDENCE_THRESHOLD
    }
