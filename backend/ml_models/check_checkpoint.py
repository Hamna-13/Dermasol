# check_checkpoint.py
import torch
from collections import OrderedDict

PATH = r"D:\FYP\Dermasol\ml-models\diagnosis_model_optimized.pth"  # update if needed
obj = torch.load(PATH, map_location="cpu")

print("TYPE:", type(obj))

if isinstance(obj, (dict, OrderedDict)):
    print("TOP KEYS (first 10):", list(obj.keys())[:10])
    # If it's a wrapper dict, it will have keys like 'state_dict'
    for k in ["state_dict", "model_state_dict", "model", "net"]:
        if isinstance(obj, dict) and k in obj:
            print(f"FOUND WRAPPER KEY: {k}, inner type:", type(obj[k]))
            if hasattr(obj[k], "keys"):
                print("INNER KEYS sample:", list(obj[k].keys())[:5])
