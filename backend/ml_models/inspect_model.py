# import torch
# from torchvision.models import efficientnet_b3

# # ---- Step 1: Create model architecture ----
# NUM_CLASSES = 22  

# model = efficientnet_b3(num_classes=NUM_CLASSES)

# # ---- Step 2: Load state dict ----
# state_dict = torch.load("diagnosis_model_optimized.pth", map_location="cpu")

# model.load_state_dict(state_dict)
# model.eval()

# # ---- Step 3: Print parameter counts ----
# total_params = sum(p.numel() for p in model.parameters())
# trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

# print("\nTotal Parameters:", total_params)
# print("Trainable Parameters:", trainable_params)

# # ---- Step 4: Print layer-wise shapes ----
# print("\nLayers:")
# for name, param in model.named_parameters():
#     print(f"{name:40} {tuple(param.shape)}")


import torch
from pathlib import Path
from torchvision.models import efficientnet_b3

# ---------------------------------------
# BASE DIR (robust path handling)
# ---------------------------------------
BASE_DIR = Path(__file__).resolve().parent

# ---------------------------------------
# MODEL PATHS
# ---------------------------------------
DISEASE_MODEL_PATH = BASE_DIR / "diagnosis_model_optimized.pth"
SKIN_TYPE_MODEL_PATH = BASE_DIR / "skin_type_model.pth"

# ---------------------------------------
# DEVICE
# ---------------------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def inspect_model(model_path: Path, num_classes: int, model_name: str):
    print(f"\n{'='*60}")
    print(f"Inspecting: {model_name}")
    print(f"Path: {model_path}")
    print(f"{'='*60}")

    if not model_path.exists():
        print("❌ Model file not found.")
        return

    # Create architecture
    model = efficientnet_b3(weights=None, num_classes=num_classes)

    # Load state dict
    state_dict = torch.load(model_path, map_location=DEVICE)
    model.load_state_dict(state_dict, strict=True)
    model.to(DEVICE)
    model.eval()

    # Parameter counts
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    print("\nTotal Parameters:", total_params)
    print("Trainable Parameters:", trainable_params)

    print("\nLayer-wise shapes:")
    for name, param in model.named_parameters():
        print(f"{name:45} {tuple(param.shape)}")


# ---------------------------------------
# RUN BOTH INSPECTIONS
# ---------------------------------------
if __name__ == "__main__":
    inspect_model(
        DISEASE_MODEL_PATH,
        num_classes=22,
        model_name="Disease Classification Model"
    )

    inspect_model(
        SKIN_TYPE_MODEL_PATH,
        num_classes=3,
        model_name="Skin Type Classification Model"
    )
