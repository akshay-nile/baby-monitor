# 👶 Baby Monitor (WebRTC based)
A simple and free hobby **Web Application** that uses **WebRTC Peer-to-Peer** connections between **single Baby Device** and **multiple Parent Devices**.  
No app installs required — runs directly in your browser!

---

## 🎬 Version
Current Release: **v1.5.7**

---

## 📌 Introduction
The Baby Monitor app allows parents to keep an eye (and ear) on their baby using at least two devices connected the same WiFi network.  
It sets up a **direct connection (P2P)** between one Baby Device (Camera + Mic) and multiple Parent Devices (Monitors).

---

## ✅ Requirements
1. **No app installation** needed — works directly in modern browsers.  
   (Chrome, Firefox, Safari, Edge, etc.)
2. **Two or more devices** are required. At least one should have a camera/mic.  
3. All devices must be connected to the **same Wi-Fi network**.  
   (Connections over Mobile Data are *not guaranteed* to work.)

---

## 🚀 How to Use

### Step 1: Open the App
- Go to 👉 [https://akshaynile.pythonanywhere.com/projects/baby-monitor](https://akshaynile.pythonanywhere.com/projects/baby-monitor) on all devices (at least 2 devices connected to the same WiFi network).

---

### Step 2: Setup Baby Device (camera source)
1. On the device that will act as the baby monitor, click **"Use as Baby Device"**.
2. Click **"Start Camera"** → allow necessary browser permissions.
3. Wait a few seconds until the **local camera feed starts**.  
   The Baby Device now:
   - Polls for incoming Parent connections.
   - Displays the count of connected Parents.
4. Polling lasts **5 minutes (default)**, so all Parent Devices must connect within that window.
5. Polling can be manually turned ON or OFF as needed once camera is started.
6. **Motion Detection** feature can be turned ON in settings and **sensitivity** can be adjusted as needed.
7. At any time, click **"Stop Camera"** to:
   - Stop the local camera feed and polling.
   - Disconnect all Parent Devices.

---

### Step 3: Setup Parent Device(s)
1. On each Parent Device, click **"Use as Parent Device"**.
2. Click **"Connect"** → this registers the connection request with the server.
3. The button will show **"Connecting..."**. 
  - 3.1 => Wait at least **5 seconds** for the connection request to be recieved by the Baby Device.
  - 3.2 => Baby device is shown a conformation dialog to accept the request and remember the Parent ID. 
  - 3.3 => If request is not accepted the parent device will show **"Connection Rejected"** and baby device will continue polling for other parent devices.
4. Once connected:
   - 🎥 Live audio/video feed from Baby Device appears.
   - Button label changes to **"Disconnect"**.
   - Parents can record and save the audio/video stream comming from Baby camera using **Start Recording** button.
   - If motion detection feature on Baby device is turned ON, motion alert notifications can appear on connected Parent devices. Alerts can be turned OFF in settings as needed.
5. Extra controls:
   - Tap the video screen on Baby Device to **Flip Camera** between front/back.
   - Press and hold the video screen on Parent Device to use Push-To-Talk feature.
   - Click **"Disconnect"** to exit and reset the app.
6. Ensure:
   - Baby Device shows **"+" symbol next to parent count** before Parent clicks Connect button.
   - Baby Device’s browser tab should stay **alive/awake** to prevent interruptions.

---

## 🔒 Data Safety & Security
- 100% **web-based**: no third-party apps or services required.
- **Live stream data is never stored on the server**.  
- Server is used **only** for:
  1. Hosting app files (HTML/CSS/JS).  
  2. Handling signaling (polling) to establish P2P connections.  
- Once connected, all audio/video flows **directly between devices** over the local Wi-Fi network.

---

## 🛠 Upcoming/Planned Features
- Only bug fixes and performance improvements

---

## 💡 Contribute
Got ideas, suggestions, or bug reports?  
Contributions are always welcome! Open an issue or drop feedback.

---

## 🙏 Thanks
Thank you for using Baby Monitor!  
Enjoy safe and secure Baby Monitoring 👶🎥