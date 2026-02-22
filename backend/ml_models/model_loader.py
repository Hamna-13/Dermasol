import os
import torch
from torchvision.models import efficientnet_b3, efficientnet_b1

# -------------------------
# PATH CONFIG
# -------------------------

DIAGNOSIS_MODEL_PATH = os.getenv(
    "DIAGNOSIS_MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "diagnosis_model_optimized.pth"),
)

SKIN_TYPE_MODEL_PATH = os.getenv(
    "SKIN_TYPE_MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "skin_type_model.pth"),
)

# -------------------------
# DEVICE
# -------------------------

_device = "cuda" if torch.cuda.is_available() else "cpu"

_disease_model = None
_skin_model = None


def get_device():
    return _device


# -------------------------
# DISEASE MODEL (EffNet-B3)
# -------------------------

def get_disease_model():
    global _disease_model
    if _disease_model is not None:
        return _disease_model

    model = efficientnet_b3(weights=None, num_classes=22)

    state_dict = torch.load(DIAGNOSIS_MODEL_PATH, map_location=_device)
    model.load_state_dict(state_dict, strict=True)

    model.to(_device)
    model.eval()

    _disease_model = model
    return _disease_model


# -------------------------
# SKIN TYPE MODEL (EffNet-B1)
# -------------------------

def get_skin_type_model():
    global _skin_model
    if _skin_model is not None:
        return _skin_model

    # B1 architecture
    model = efficientnet_b1(weights=None, num_classes=3)

    state_dict = torch.load(SKIN_TYPE_MODEL_PATH, map_location=_device)
    model.load_state_dict(state_dict, strict=True)

    model.to(_device)
    model.eval()

    _skin_model = model
    return _skin_model
