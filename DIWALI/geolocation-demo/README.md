# Safe Geolocation API Educational Demo

A beginner-friendly, privacy-focused demonstration of the browser's Geolocation API (`navigator.geolocation`).

This demo is designed exclusively for learning:
- **100% Client-Side:** No server, no backend, no database.
- **Zero Data Transmission:** No `fetch()`, no `XMLHttpRequest`, no POST requests.
- **Zero Persistence:** No `localStorage`, no `sessionStorage`, no cookies, no log files.
- **Explicit Consent:** A polite context dialog explains what will happen *before* invoking the browser's permission prompt.

---

## What This Teaches You

### 1. `navigator.geolocation.getCurrentPosition(success, error, options)`
The standard browser method to request a one-time snapshot of the user's current geographic position:
```javascript
const options = {
  enableHighAccuracy: true, // Requests GPS when available (mobile)
  timeout: 10000,           // Maximum wait time (10 seconds)
  maximumAge: 0             // Do not use a cached position
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
```

### 2. The `GeolocationPosition` Object
When permission is granted, the browser passes a `position` object to the success callback:
- `position.coords.latitude`: Decimal degrees north (+) or south (-) of the equator.
- `position.coords.longitude`: Decimal degrees east (+) or west (-) of the prime meridian.
- `position.coords.accuracy`: Radius of 95% confidence in **meters**. A value of `15` means the device is within a 15-meter radius of the reported point.

### 3. The Browser Permission & Security Model
- **Secure Contexts Only:** The Geolocation API only functions on `https://` URLs or `http://localhost`. Browsers completely disable it on insecure `http://` sites.
- **User Prompt:** The browser always intercepts the API call and prompts the user with a native, unblockable dialog.
- **No "Silent" Access:** It is technically impossible for client-side JavaScript to bypass the user permission prompt or track a user without their active consent.

### 4. Robust Error Handling
Permission denial (`error.PERMISSION_DENIED`) is a normal, expected user action. Proper applications must handle all three standard error codes gracefully:
1. `PERMISSION_DENIED` (Code 1): The user clicked "Block" or dismissed the prompt.
2. `POSITION_UNAVAILABLE` (Code 2): Device could not resolve satellite, Wi-Fi, or cell tower signals.
3. `TIMEOUT` (Code 3): The device could not retrieve coordinates within the specified `timeout` window.

### 5. Ethical UX: Pre-Permission Context
Surprising users with an unexpected browser prompt causes alarm and immediate denials. By presenting an educational modal explaining **why** the location is requested and **that it is never saved**, users are empowered with full transparency.

---

## How to Run Locally

You can run this demo locally with any static web server:

### Using Python:
```bash
cd geolocation-demo
python -m http.server 8080
```
Open your browser at `http://localhost:8080`.

### Direct Browser Open:
Because this demo requires no backend and uses no external assets, you can also open `index.html` directly in your browser. (Note: some browsers restrict geolocation on `file://` URLs, so using `http://localhost:8080` is recommended).
