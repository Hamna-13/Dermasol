# # import torch
# # from PIL import Image
# # from io import BytesIO
# # from torchvision import transforms

# # from .model_loader import get_model, get_device
# # from .classes import DISEASE_CLASSES

# # _transform = transforms.Compose([
# #     transforms.Resize((300, 300)),  # EfficientNet-B3
# #     transforms.ToTensor(),
# #     transforms.Normalize(mean=[0.485, 0.456, 0.406],
# #                          std=[0.229, 0.224, 0.225]),
# # ])

# # @torch.no_grad()
# # def predict_disease(image_bytes: bytes):
# #     model = get_model()
# #     device = get_device()

# #     img = Image.open(BytesIO(image_bytes)).convert("RGB")
# #     x = _transform(img).unsqueeze(0).to(device)

# #     logits = model(x)
# #     probs = torch.softmax(logits, dim=1)[0]

# #     idx = int(torch.argmax(probs).item())
# #     confidence = float(probs[idx].item())

# #     label = DISEASE_CLASSES[idx] if idx < len(DISEASE_CLASSES) else f"class_{idx}"
# #     return idx, label, confidence


# import torch
# import numpy as np
# import cv2
# from PIL import Image
# from io import BytesIO
# from torchvision import transforms

# from .model_loader import get_model, get_device
# from .classes import DISEASE_CLASSES

# # -------------------------------
# # Image Transform (DL model)
# # -------------------------------
# _transform = transforms.Compose([
#     transforms.Resize((300, 300)),  # EfficientNet-B3
#     transforms.ToTensor(),
#     transforms.Normalize(
#         mean=[0.485, 0.456, 0.406],
#         std=[0.229, 0.224, 0.225]
#     ),
# ])

# # -------------------------------
# # 1️⃣ Skin Detection (Fast – CV)
# # -------------------------------
# def is_skin_image(img_bgr: np.ndarray) -> bool:
#     """
#     Detects presence of skin using YCrCb color space.
#     """
#     img_ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
#     y, cr, cb = cv2.split(img_ycrcb)

#     skin_mask = cv2.inRange(
#         img_ycrcb,
#         np.array([0, 133, 77]),
#         np.array([255, 173, 127])
#     )

#     skin_ratio = np.sum(skin_mask > 0) / skin_mask.size
#     return skin_ratio > 0.15  # empirical threshold


# # -------------------------------
# # 2️⃣ Bleeding Detection
# # -------------------------------
# def detect_bleeding(img_bgr: np.ndarray) -> bool:
#     """
#     Detects excessive red regions (blood).
#     """
#     b, g, r = cv2.split(img_bgr)
#     red_ratio = np.mean(r > 150) - np.mean(g > 150)
#     return red_ratio > 0.10


# # -------------------------------
# # 3️⃣ Broken Bone Heuristic
# # -------------------------------
# def detect_broken_bone(img_bgr: np.ndarray) -> bool:
#     """
#     Very coarse heuristic using edge density.
#     Used ONLY to reject non-dermatology images.
#     """
#     gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
#     edges = cv2.Canny(gray, 50, 150)
#     edge_density = np.sum(edges > 0) / edges.size
#     return edge_density > 0.25


# # -------------------------------
# # 4️⃣ Final Prediction Function
# # -------------------------------
# @torch.no_grad()
# def predict_disease(image_bytes: bytes):
#     """
#     Returns only label string:
#     - skin_not_detected
#     - bleeding
#     - broken_bone
#     - normal_skin
#     - disease_name
#     """

#     # Load image
#     img_pil = Image.open(BytesIO(image_bytes)).convert("RGB")
#     img_np = np.array(img_pil)
#     img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

#     # ---- Step 1: Skin Check ----
#     if not is_skin_image(img_bgr):
#         return "skin_not_detected"

#     # ---- Step 2: Reject non-derma issues ----
#     if detect_bleeding(img_bgr):
#         return "bleeding"

#     if detect_broken_bone(img_bgr):
#         return "broken_bone"

#     # ---- Step 3: Deep Learning Model ----
#     model = get_model()
#     device = get_device()

#     x = _transform(img_pil).unsqueeze(0).to(device)
#     logits = model(x)
#     idx = int(torch.argmax(logits, dim=1).item())

#     # ---- Step 4: Class Mapping ----
#     if idx >= len(DISEASE_CLASSES):
#         return "normal_skin"

#     label = DISEASE_CLASSES[idx]

#     if label.lower() in ["normal", "healthy", "none"]:
#         return "normal_skin"

#     return label



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