import torch
from PIL import Image
from io import BytesIO
from torchvision import transforms

from .model_loader import get_model, get_device
from .classes import DISEASE_CLASSES

_transform = transforms.Compose([
    transforms.Resize((300, 300)),  # EfficientNet-B3
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

@torch.no_grad()
def predict_disease(image_bytes: bytes):
    model = get_model()
    device = get_device()

    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    x = _transform(img).unsqueeze(0).to(device)

    logits = model(x)
    probs = torch.softmax(logits, dim=1)[0]

    idx = int(torch.argmax(probs).item())
    confidence = float(probs[idx].item())

    label = DISEASE_CLASSES[idx] if idx < len(DISEASE_CLASSES) else f"class_{idx}"
    return idx, label, confidence
