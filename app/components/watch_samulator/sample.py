import tkinter as tk
import requests
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import json
from datetime import datetime
import os
import time

# ---------------- Flask API (with CORS for React Native) ----------------
app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Store latest data globally
latest_data = {
    "heart_rate": 0,
    "bp": "0/0",
    "spo2": 0,
    "status": "Normal",
    "timestamp": ""
}

current_mode = "normal"

@app.route("/health", methods=["GET"])
def get_health():
    global latest_data, current_mode
    mode = request.args.get("mode", current_mode)
    current_mode = mode

    if mode == "normal":
        data = {
            "heart_rate": random.randint(70, 90),
            "bp": f"{random.randint(110,120)}/{random.randint(70,80)}",
            "spo2": random.randint(95, 100),
            "status": "Normal",
            "timestamp": datetime.now().isoformat()
        }
    else:
        data = {
            "heart_rate": random.randint(110, 150),
            "bp": f"{random.randint(140,180)}/{random.randint(90,120)}",
            "spo2": random.randint(80, 94),
            "status": "Abnormal",
            "timestamp": datetime.now().isoformat()
        }
    
    latest_data = data
    
    # Save to data.json file
    try:
        with open("data.json", "a") as f:
            f.write(json.dumps(data) + "\n")
        print(f"✅ Data saved: {data['heart_rate']} BPM, {data['status']}")
    except Exception as e:
        print(f"❌ Error saving data: {e}")
    
    return jsonify(data)

@app.route("/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_data)

@app.route("/mode", methods=["POST"])
def set_mode():
    mode_data = request.json
    mode = mode_data.get("mode", "normal")
    return jsonify({"mode": mode, "status": "updated"})

def run_api():
    """Run Flask API in background thread"""
    print("🚀 Starting Flask API on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

# ---------------- Tkinter GUI ----------------
def create_gui():
    root = tk.Tk()
    root.title("Smartwatch Simulator")
    root.geometry("400x500")
    root.configure(bg="black")

    mode = tk.StringVar(value="normal")

    # Title
    title = tk.Label(root, text="⌚ Smartwatch Simulator", fg="white", bg="black", 
                     font=("Arial", 18, "bold"))
    title.pack(pady=15)

    # Heart Rate
    heart_label = tk.Label(root, text="Heart Rate: -- bpm", fg="red", bg="black", 
                          font=("Arial", 16, "bold"))
    heart_label.pack(pady=10)

    # Blood Pressure
    bp_label = tk.Label(root, text="BP: --/-- mmHg", fg="white", bg="black", 
                       font=("Arial", 14))
    bp_label.pack(pady=5)

    # SpO2
    spo2_label = tk.Label(root, text="SpO2: --%", fg="white", bg="black", 
                         font=("Arial", 14))
    spo2_label.pack(pady=5)

    # Status
    status_label = tk.Label(root, text="Status: --", fg="cyan", bg="black", 
                           font=("Arial", 14, "bold"))
    status_label.pack(pady=10)

    # Separator
    separator = tk.Label(root, text="-" * 30, fg="gray", bg="black")
    separator.pack(pady=10)

    # Mode label
    mode_label = tk.Label(root, text="Current Mode: NORMAL", fg="green", bg="black", 
                         font=("Arial", 12, "bold"))
    mode_label.pack(pady=5)
    
    # API Status
    api_status = tk.Label(root, text="🟢 API Status: Running", fg="green", bg="black", 
                         font=("Arial", 9))
    api_status.pack(pady=5)

    def update_data():
        try:
            url = f"http://127.0.0.1:5000/health?mode={mode.get()}"
            res = requests.get(url, timeout=2)
            if res.status_code == 200:
                data = res.json()

                # Update UI labels
                heart_label.config(text=f"❤️ Heart Rate: {data['heart_rate']} bpm")
                bp_label.config(text=f"💊 BP: {data['bp']} mmHg")
                spo2_label.config(text=f"🫁 SpO2: {data['spo2']}%")
                status_label.config(text=f"📊 Status: {data['status']}")
                api_status.config(text="🟢 API Status: Running", fg="green")
                
                # Change color based on status
                if data['status'] == "Abnormal":
                    status_label.config(fg="red")
                    mode_label.config(text="Current Mode: ABNORMAL ⚠️", fg="red")
                else:
                    status_label.config(fg="green")
                    mode_label.config(text="Current Mode: NORMAL ✅", fg="green")
            else:
                raise Exception(f"HTTP {res.status_code}")
                
        except requests.exceptions.ConnectionError:
            status_label.config(text="📊 Status: Waiting for API...", fg="orange")
            api_status.config(text="🟡 API Status: Starting...", fg="yellow")
        except Exception as e:
            print(f"Error: {e}")
            # Don't show error on GUI, just keep trying
            api_status.config(text="🟡 API Status: Connecting...", fg="yellow")

        root.after(2000, update_data)  # Update every 2 seconds

    def set_normal():
        mode.set("normal")
        print("🟢 Mode changed to NORMAL")
        mode_label.config(text="Current Mode: NORMAL ✅", fg="green")
        status_label.config(text="Switching to Normal Mode...", fg="cyan")
        root.after(1000, lambda: None)

    def set_abnormal():
        mode.set("abnormal")
        print("🔴 Mode changed to ABNORMAL")
        mode_label.config(text="Current Mode: ABNORMAL ⚠️", fg="red")
        status_label.config(text="Switching to Abnormal Mode...", fg="cyan")
        root.after(1000, lambda: None)

    # Buttons
    button_frame = tk.Frame(root, bg="black")
    button_frame.pack(pady=15)

    normal_btn = tk.Button(button_frame, text="✅ NORMAL MODE", command=set_normal, 
                          bg="green", fg="white", font=("Arial", 12, "bold"),
                          width=15, height=2)
    normal_btn.pack(side=tk.LEFT, padx=10)

    abnormal_btn = tk.Button(button_frame, text="⚠️ ABNORMAL MODE", command=set_abnormal, 
                            bg="red", fg="white", font=("Arial", 12, "bold"),
                            width=15, height=2)
    abnormal_btn.pack(side=tk.RIGHT, padx=10)

    # Info label
    info_label = tk.Label(root, text="📡 API: http://localhost:5000/health", 
                         fg="gray", bg="black", font=("Arial", 9))
    info_label.pack(pady=10)
    
    data_label = tk.Label(root, text="💾 Data saved to: data.json", 
                         fg="gray", bg="black", font=("Arial", 9))
    data_label.pack()

    # Start updating data
    update_data()
    
    # Start GUI
    root.mainloop()

# ---------------- Main Execution ----------------
if __name__ == "__main__":
    print("=" * 50)
    print("⌚ Smartwatch Simulator Starting...")
    print("=" * 50)
    
    # Start API in background thread
    api_thread = threading.Thread(target=run_api, daemon=True)
    api_thread.start()
    
    # Wait for API to start
    print("⏳ Waiting for API to start (3 seconds)...")
    time.sleep(3)
    
    print("📡 API Endpoint: http://localhost:5000/health")
    print("💾 Data file: data.json")
    print("🎮 GUI Control Panel Opening...")
    print("=" * 50)
    
    # Create data.json if it doesn't exist
    if not os.path.exists("data.json"):
        with open("data.json", "w") as f:
            f.write("# Smartwatch Data Log\n")
    
    # Start GUI (this will block until window is closed)
    create_gui()