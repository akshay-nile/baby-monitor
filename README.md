# 👶 Baby Monitor (WebRTC based)
A simple and free hobby **Web Application** that uses **WebRTC Peer-to-Peer** connections between a **single Baby Device** and **multiple Parent Devices**.\ 
No app installs required — runs directly in your browser!\
Can be installed for free as a Progressive Web App (PWA)

---

## 🎬 Version
Current Release: **v1.6.9**

---

## 📌 Introduction
The Baby Monitor app allows parents to keep an eye (and ear) on their baby using at least two devices (Phones/PCs with Camera on at least one device) connected over the same WiFi network.\
It sets up a **direct WebRTC connection (P2P)** between one Baby Device (Camera + Mic) and multiple Parent Devices (Monitors).

---

## ✅ Requirements
1. **No app installation** needed — works directly in modern browsers.  
   like Chrome, Firefox, Safari, Edge, etc.\
   (**Google Chrome** is highly recommended)
2. **Two or more devices** are required. At least one should have a camera/mic.  
3. All devices must be connected to the **same WiFi network**.\
   (Connections over Mobile Data are *not guaranteed* to work reliably.)

---

## 🚀 How to Connect

### Step 1: Open the App
- Open 👉 [https://akshaynile.pythonanywhere.com/projects/baby-monitor](https://akshaynile.pythonanywhere.com/projects/baby-monitor) on all the devices connected to the same WiFi network.

### Step 2: Setup Baby Device (camera source)
1. On the device that will act as the baby monitor, click **"Use as Baby Device"**.
2. Click **"Start Camera"** → allow necessary browser permissions to access camera.
3. Wait for a few seconds until the **local camera feed starts**.  
   The Baby Device now:
   - Continuesly polls the server for incoming Parent connections.
   - Displays the count of connected Parents in the status panel.
4. Polling lasts **5 minutes (default)**, so all Parent Devices must connect within that window.
5. Parent connections can be manually Allowed or Disabled as needed once camera is started.
6. At any time, click **"Stop Camera"** to:
   - Stop the local camera feed and polling.
   - Disconnect all the Parent Devices if any.

### Step 3: Setup Parent Device(s)
1. On each Parent Device, click **"Use as Parent Device"**.
2. Click **"Connect"** button on any one Parent Device at a time. 
3. This registers the connection request with the server for the Baby Device which is online.
3. The button will show **"Connecting..."**. 
  - 3.1 => Wait at least 5 seconds for the connection request to be recieved by the Baby Device.
  - 3.2 => Baby device shows a conformation dialog to accept the request and remembers the Parent ID. 
  - 3.3 => If request is not accepted the parent device will show **"Connection Rejected"** and baby device will continue polling for other parent devices.
4. Once connected:
   - Live audio/video feed from Baby Device appears.
   - Button label changes to **"Disconnect"**.
5. Same process should be repeated on other Parent Devices **one-by-one**.

---

## ✨ How to Use Features 

### Motion Detection and Alerts
   - Place the Baby Device on a stable platform so that the camera is facing towards the sleeping Baby.
   - Turn on the Motion Detection feature from the Baby Device toggle panel (or settings).
   - Adjust sensitivity to Low, Medium or High preset, depending on how bright the room is lit.
   - All the Parent Devices will recieve motion alerts if any motion is detected by the Baby Device.
   - Motion alerts can be turned On/Off in Parent Device toggle panel (or settings) as needed.

### Stream Recording Feature
   - Parents can record and save the Audio/Video stream of the Baby camera using Recorder toggle button.
   - Clicking the same toggle button will stop and save the recording (mp4 or webm) on the Parent Device.

### Push-To-Talk Feature
   - Parents can directly talk to the Baby just by press and holding the video screen on their Parent Devices.
   - While pushed, incomming audio from the Baby device is muted and parent's voice can be heard on Baby device. 

### Torchlight Toggle
   - Torchlight toggle gets enabled on all the Parent Devices when baby device camera has flash/torch available.
   - Any parent can turn the Torchlight On/Off on the Baby device for better visibility in the dark rooms.

### Fullscreen & Picture-in-Picture Mode
   - Parents can monitor the Baby in Fullscreen or PiP mode once connected.

### Other Useful Features and Hacks
   - Tap the video screen on the Baby Device to quickly flip between Front/Back facing cameras.
   - Specific camera can be selected from the Camera dropdown menu in Baby Device toggle panel. 
   - Tap the Parents status in Baby device status panel to manage (disconnect) all connected parent devices.
   - Polling automatically starts to allow parent connections when the last Parent Device gets Disconnected.
   - New (unknown) parent connection shows confirmation pop-up on the Baby Device for security reasons. 
   - When connection is accepted, Parent Device ID is marked as Trusted Parent by the Baby Device.
   - Trusted parent's connection request is automatically accepted without any confirmation pop-up.
   - Settings screen provides "Polling Timeout", "Max Parent Connections", "Discard All Trusted Parents" options.

---

## 🔒 Data Privacy & Security
- 100% **web-based** and no third-party apps or services are used.
- **Live stream data is never stored on the server**.  
- Server is used **only** for:
  1. Hosting app files like HTML, CSS, JS, Icons etc only.  
  2. Relaying the connection requests (polling) to establish P2P connections.  
- Once connected, **all audio/video flows directly between the devices** over the local WiFi network.

---

## ⚒️ Upcoming/Planned Features
- Development is freezed!
- Bug fixes and performance improvements continues.

---

## 💡 Contribute
Got any ideas, suggestions, or bug reports?\
Contributions are always welcome!\
Open an issue or drop feedback on my GitHub repo.

---

## 🙏 Thanks
Thank you for using the Baby Monitor! ❤️\
Enjoy safe and secure Baby Monitoring... 👶\