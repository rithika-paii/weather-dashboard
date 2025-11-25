# Weather Dashboard (Frontend)

This is the frontend UI for the Weather Dashboard built using:
- HTML
- CSS
- JavaScript
- Leaflet.js
- Chart.js

Backend: FastAPI (Render)

## 🚀 Deploy on GitHub Pages

### 1. Create a new GitHub repo:
`weather-frontend`

### 2. Upload:
- index.html
- styles.css
- script.js

### 3. Go to:
Settings → Pages → Deploy from branch

### 4. Select:
- Branch: **main**
- Folder: **root**

### 5. Save

Your live frontend URL:
https://<your-username>.github.io/weather-frontend/


### 6. Update script.js
Change:
```js
const API_BASE = "http://127.0.0.1:8000";
to
const API_BASE = "https://your-weather-api.onrender.com";
```

# **3. FINAL: Git Commands to Push Each Repo**


## 🟦 Backend Repo Commands

Open terminal inside your backend directory:
cd weather-backend

git init
git add .
git commit -m "Initial commit - Weather Backend"
git branch -M main
git remote add origin https://github.com/
<your-username>/weather-backend.git
git push -u origin main


---

# 🌐 **4. Updating Frontend to use Render**

In `script.js`:

```js
const API_BASE = "https://your-weather-api.onrender.com";

