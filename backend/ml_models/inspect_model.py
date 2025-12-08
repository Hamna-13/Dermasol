import torch
from torchvision.models import efficientnet_b3

# ---- Step 1: Create model architecture ----
NUM_CLASSES = 22  

model = efficientnet_b3(num_classes=NUM_CLASSES)

# ---- Step 2: Load state dict ----
state_dict = torch.load("diagnosis_model.pth", map_location="cpu")

model.load_state_dict(state_dict)
model.eval()

# ---- Step 3: Print parameter counts ----
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

print("\nTotal Parameters:", total_params)
print("Trainable Parameters:", trainable_params)

# ---- Step 4: Print layer-wise shapes ----
print("\nLayers:")
for name, param in model.named_parameters():
    print(f"{name:40} {tuple(param.shape)}")
