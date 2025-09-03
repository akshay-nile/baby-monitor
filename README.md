# 👶 Baby Monitor (WebRTC-based)

A simple and free hobby **web application** that uses **WebRTC Peer-to-Peer** connections between **one Baby Device** and **multiple Parent Devices**.  
No app installs required — runs directly in your browser!

---

## 📌 Introduction
The Baby Monitor app allows parents to keep an eye (and ear 👂) on their baby using just their devices’ browsers.  
It sets up a **direct connection (P2P)** between one Baby Device (camera + mic) and multiple Parent Devices (viewers).

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
- Go to 👉 [https://akshaynile.pythonanywhere.com/baby-monitor](https://akshaynile.pythonanywhere.com/baby-monitor) on all devices.

---

### Step 2: Setup Baby Device (camera source)
1. On the device that will act as the baby monitor, click **"Use as Baby Device"**.
2. Click **"Start Camera"** → allow necessary browser permissions.
3. Wait a few seconds until the **local camera feed starts**.  
   The Baby Device now:
   - Polls for incoming Parent connections.
   - Displays the count of connected Parents.
4. ⚠️ Polling lasts **only 5 minutes**, so all Parent Devices must connect within that window.
5. At any time, click **"Stop Camera"** to:
   - Stop the local feed.
   - Disconnect all Parent Devices.

---

### Step 3: Setup Parent Device(s)
1. On each Parent Device, click **"Use as Parent Device"**.
2. Click **"Request Connection"** → this registers the connection with the server.
3. The button will show **"Connecting..."**. Wait at least **5 seconds** for Baby Device to accept.
4. Once connected:
   - 🎥 Live audio/video feed from Baby Device appears.
   - Button label changes to **"Disconnect"**.
5. Extra controls:
   - Tap the video screen to **mute/unmute** audio temporarily.
   - Click **"Disconnect"** to exit and reset the app.
6. Ensure:
   - Baby Device shows **"polling..."** before Parent requests.
   - Baby Device’s browser tab stays **alive/awake** to prevent interruptions.

---

## 🔒 Data Safety & Security
- 100% **web-based**: no third-party apps or services required.
- **Live stream data is never stored on the server**.  
- Server is used **only** for:
  1. Hosting app files (HTML/CSS/JS).  
  2. Handling signaling (polling & requests) to establish P2P connections.  
- Once connected, all audio/video flows **directly between devices** over the local Wi-Fi.

---

## 🛠 Upcoming Features
1. **Unique Auto-Generated User IDs**  
   - Unique BrowserID (Like UserID).  
2. **Settings Screen**  
   - Allow users to configure some preferences (Settings Page).

---

## 💡 Contribute
Got ideas, suggestions, or bug reports?  
Contributions are always welcome! Open an issue or drop feedback.

---

## 🙏 Thanks
Thank you for using Baby Monitor!  
Enjoy safe and simple baby monitoring 👶🎥