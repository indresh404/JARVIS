# Swasthya AI - Running Guide

To run the project locally and connect your mobile phone to your computer, follow these steps exactly:

## 1. Start the Backend
1. Open a terminal in `/backend`.
2. Ensure dependencies are installed: `pip install -r requirements.txt`
3. Run the server: `python main.py`
   - *Note: I've configured it to listen on `0.0.0.0`, so it is accessible from your network.*

## 2. Connect Your Mobile Phone (Important!)
To fix the "Network Request Failed" error:
1. Ensure your **Phone and Laptop are on the same Wi-Fi**.
2. **Current IP**: I have updated the code to use your computer's current IP: `172.20.63.69`.
3. **Firewall**: If it still fails, you may need to allow port `8000` through your Windows Firewall:
   - Go to Windows Security > Firewall & network protection > Advanced settings.
   - Inbound Rules > New Rule > Port > TCP > 8000 > Allow connection.

## 3. Run the Mobile App
1. Open a terminal in `/app`.
2. Run: `npx expo start`
3. Open the **Expo Go** app on your phone and (on Android) scan the QR code.

## 4. Run the Web Dashboard
1. Open a terminal in `/web`.
2. Run: `npm run dev`
3. Open `http://localhost:3000` in your browser.

---

### Features to Check:
- **Jan Aushadhi**: Go to the **Meds** tab on your mobile app. Scroll to the bottom to see generic medicine savings.
- **AI Chat**: Go to the **AI Health Assistant** tab. It is now connected to the real FastAPI backend for real-time medical help.
- **Clinical Dashboard**: Visit the web dashboard at `:3000` to see the doctor's view with "Affordability Analysis".
