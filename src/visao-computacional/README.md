# Computer Vision - Connected Counting System (YOLOv8m)

This directory contains the scripts and resources needed for the project's computer vision module. The system uses the official **YOLOv8m** (Medium) model for robust person detection, implementing image pre-processing for low-light environments and API integration to send data in real time.

## Model Description

The system is based on the **YOLOv8 (You Only Look Once version 8)** architecture from Ultralytics, using weights pre-trained on the COCO dataset.

* **Model:** Uses the `yolov8m.pt` (Medium) weights file. This version was chosen for offering a better balance between accuracy and intelligence compared to the Nano version, being able to distinguish people from other objects more effectively without requiring re-training.
* **Pre-processing (CLAHE):** The script applies *Contrast Limited Adaptive Histogram Equalization* to each frame before inference. This digitally levels out lighting, enabling accurate detections even in complex or low-light scenarios.
* **Hybrid Counting Logic:** The system uses distinct reference points to maximize accuracy at the edges of the frame:
    * **Entry (Blue Line):** Based on the **centroid** (center of the body).
    * **Exit (Red Line):** Based on the **base of the bounding box** (feet), ensuring the count happens before the person fully leaves the frame.
* **Connectivity:** The system sends HTTP (POST) requests to a backend on every counting event, using thread-based processing to avoid video latency.

## Expected Folder Structure

```
src/
└── visao-computacional/
    ├── README.md
    ├── .gitignore.md
    ├── modelo_final.py
    ├── yolov8m.pt
```

## How to Download Pre-trained Weights (`yolov8m.pt`)

The system was built to work with the official model, with no need for external datasets.

**Automatic Method:**
The first time you run the script, the `ultralytics` library will detect that the model is missing and download `yolov8m.pt` automatically.

**Manual Method:**
If you'd rather download it manually, or if the automatic download fails:
[Download yolov8m.pt (GitHub Releases)](https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8m.pt)

Place the downloaded file at the root of this directory.

## Setup and Usage Instructions

When the script starts, the system enters visual calibration mode:

1.  **Defining Virtual Lines:**
    * **1st Click:** Sets the height of the **Blue Line** (Entry/Top).
    * **2nd Click:** Sets the height of the **Red Line** (Exit/Bottom).
2.  **Starting Operation:** Press `SPACE` to confirm the geometry and start monitoring.
3.  **API Integration:** Check the `URL_API` variable in the code to point to your backend's correct endpoint (e.g., `http://localhost:3000/api/room-occupancy`).


## Detailed Operating Logic

The system runs in a continuous capture, inference, and geometric-analysis cycle. Counting stability is ensured by a hybrid tracking approach:

1.  **Pre-processing (Digital Night Vision):**
    * Each captured frame passes through a **CLAHE** (Contrast Limited Adaptive Histogram Equalization) filter. The image is converted to the LAB color space, where brightness is equalized to bring out contours in dark environments, then converted back to BGR.

2.  **Tracking:**
    * The **YOLOv8m** model detects objects of class `0` (Person).
    * The **ByteTrack** algorithm manages ID persistence, ensuring a person keeps the same ID even if there are momentary detection failures or partial occlusion.

3.  **Hybrid Counting Geometry:**
    Unlike traditional systems that only use the object's center, this project uses dynamic reference points to correct perspective errors on exit:
    
    * **Entry (Blue Line):** Monitors the **Centroid** (geometric center of the box).
        * *Trigger:* The center crosses the line top-to-bottom with a validated negative velocity.
    
    * **Exit (Red Line):** Monitors the **Base** (bottom Y coordinate / feet).
        * *Reason:* At overhead camera angles, the feet cross the exit line before the body disappears from the frame.
        * *Trigger:* The base crosses the red line, with a logic lock that ignores upward movements (re-entry) to avoid false positives.

4.  **Asynchronous (Non-blocking) Communication:**
    * Once a count is validated, the script fires off an isolated thread to send the JSON payload to the backend. This isolates the I/O (network) process, preventing internet hiccups from freezing video processing.

## Requirements and Dependencies

The project requires Python 3.8+ and the following libraries. The `requests` library was added for communication with the server.

Main Dependencies:

-   **ultralytics** (Core of YOLO and ByteTrack tracking)
-   **opencv-python** (Video processing and CLAHE)
-   **numpy** (Mathematical calculations)
-   **requests** (Sending HTTP data)

Install Command:

```bash
pip install ultralytics opencv-python numpy requests
```
