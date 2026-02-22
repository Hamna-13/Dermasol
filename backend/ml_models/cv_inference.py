import torch
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from torchvision import transforms

from .model_loader import (
    get_disease_model,
    get_skin_type_model,
    get_device
)

from .disease_classes import DISEASE_CLASSES
from .skin_type_classes import SKIN_TYPE_CLASSES


# -------------------------------------------------
# TRANSFORMS
# -------------------------------------------------

# EfficientNet-B3 (Disease Model)
_transform_b3 = transforms.Compose([
    transforms.Resize((300, 300)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# EfficientNet-B1 (Skin Type Model)
_transform_b1 = transforms.Compose([
    transforms.Resize((240, 240)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# -------------------------------------------------
# SKIN DETECTION (PRE-CHECK)
# -------------------------------------------------

def detect_skin(image: Image.Image, threshold: float = 0.15) -> bool:
    """
    Classical YCrCb skin detection.
    Returns True if sufficient skin pixels are detected.
    """

    img = np.array(image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    img_ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)

    lower = np.array([0, 133, 77], dtype=np.uint8)
    upper = np.array([255, 173, 127], dtype=np.uint8)

    mask = cv2.inRange(img_ycrcb, lower, upper)

    skin_pixels = cv2.countNonZero(mask)
    total_pixels = mask.size

    skin_ratio = skin_pixels / total_pixels

    return skin_ratio >= threshold


# -------------------------------------------------
# MAIN PREDICTION FUNCTION
# -------------------------------------------------

@torch.no_grad()
def predict_disease(image_bytes: bytes):
    """
    Dual-model inference:
    - Disease classifier (B3)
    - Skin type classifier (B1)

    Returns:
    {
        "label": str,
        "confidence": float,
        "is_skin": bool,
        "skin_type": str | None,
        "skin_type_confidence": float | None
    }
    """

    img = Image.open(BytesIO(image_bytes)).convert("RGB")

    # ------------------------------
    # HARD GATE — No Skin
    # ------------------------------
    has_skin = detect_skin(img)

    if not has_skin:
        return {
            "label": "No skin detected",
            "confidence": 1.0,
            "is_skin": False,
            "skin_type": None,
            "skin_type_confidence": None
        }

    device = get_device()

    # ------------------------------
    # DISEASE MODEL (B3)
    # ------------------------------
    disease_model = get_disease_model()

    x_b3 = _transform_b3(img).unsqueeze(0).to(device)
    disease_logits = disease_model(x_b3)
    disease_probs = torch.softmax(disease_logits, dim=1)[0]

    disease_idx = int(torch.argmax(disease_probs).item())
    disease_conf = float(disease_probs[disease_idx].item())

    disease_label = (
        DISEASE_CLASSES[disease_idx]
        if disease_idx < len(DISEASE_CLASSES)
        else f"class_{disease_idx}"
    )

    # ------------------------------
    # SKIN TYPE MODEL (B1)
    # ------------------------------
    skin_model = get_skin_type_model()

    x_b1 = _transform_b1(img).unsqueeze(0).to(device)
    skin_logits = skin_model(x_b1)
    skin_probs = torch.softmax(skin_logits, dim=1)[0]

    skin_idx = int(torch.argmax(skin_probs).item())
    skin_conf = float(skin_probs[skin_idx].item())

    skin_label = (
        SKIN_TYPE_CLASSES[skin_idx]
        if skin_idx < len(SKIN_TYPE_CLASSES)
        else f"class_{skin_idx}"
    )

    # ------------------------------
    # RETURN STRUCTURED OUTPUT
    # ------------------------------
    return {
        "label": disease_label,
        "confidence": round(disease_conf, 4),
        "is_skin": True,
        "skin_type": skin_label,
        "skin_type_confidence": round(skin_conf, 4),
    }
