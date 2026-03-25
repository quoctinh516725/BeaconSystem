import requests
import cv2
import numpy as np


def verify_image(image_path: str):
    # Tải ảnh về RAM (dữ liệu nhị phân)
    response = requests.get(image_path)

    # Biến dữ liệu nhị phân thành mảng numpy
    arr = np.frombuffer(response.content, np.uint8)

    # Giải mã mảng thành ảnh
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    return img

