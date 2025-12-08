import os
import torch
from torchvision.models import efficientnet_b3

MODEL_PATH = os.getenv(
    "DIAGNOSIS_MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "diagnosis_model.pth"),
)

_device = "cuda" if torch.cuda.is_available() else "cpu"
_model = None

def get_device():
    return _device

def get_model():
    global _model
    if _model is not None:
        return _model

    model = efficientnet_b3(weights=None, num_classes=22)

    state_dict = torch.load(MODEL_PATH, map_location=_device)  # plain state_dict
    model.load_state_dict(state_dict, strict=True)

    model.to(_device)
    model.eval()

    _model = model
    return _model
