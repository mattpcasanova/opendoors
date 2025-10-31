# 📋 Privacy Policy Options

**Answer:** You MUST have a publicly accessible web URL for your privacy policy. Apple App Store and Google AdMob require this - it cannot be only in the app.

**However:** You can ALSO link to it from within the app (which we'll update to do), but the web URL is the requirement.

---

## ✅ **What's Required**

- **Must be:** A publicly accessible web URL (e.g., `https://yoursite.com/privacy`)
- **Cannot be:** Only in the app (no app-only privacy policy)
- **Why:** Apple and AdMob need to verify your privacy policy during review

---

## 🆓 **Free/Cheap Options**

### Option 1: GitHub Pages (Free) ⭐ **Recommended for Quick Setup**

**Best for:** Simple privacy policy, free hosting

**Steps:**
1. Create a new GitHub repository (e.g., `opendoors-privacy`)
2. Create a simple HTML file: `privacy-policy.html`
3. Enable GitHub Pages (Settings → Pages → Select branch)
4. Your URL will be: `https://yourusername.github.io/opendoors-privacy/privacy-policy.html`

**Time:** ~15 minutes
**Cost:** Free
**Example URL:** `https://mattcasanova.github.io/opendoors-privacy/privacy-policy.html`

---

### Option 2: Simple HTML Hosting (Free Services)

**Services:**
- **Netlify** (free): Drag & drop HTML file
- **Vercel** (free): Connect GitHub repo
- **GitHub Pages** (free): Already mentioned above
- **Google Sites** (free): Simple page builder

**Time:** ~30 minutes
**Cost:** Free

---

### Option 3: Your Existing Website (If You Have One)

If you have `opendoors.app` or any domain:
- Host a simple `/privacy` or `/privacy-policy` page
- Use your existing hosting

**Time:** ~15 minutes if you have hosting
**Cost:** Free if domain already hosted

---

### Option 4: Privacy Policy Generator + Free Hosting

**Services:**
1. Generate privacy policy: [PrivacyPolicyGenerator.net](https://www.privacypolicygenerator.net/) (free)
2. Download the HTML
3. Host on GitHub Pages or Netlify

**Time:** ~20 minutes
**Cost:** Free

---

## 📝 **What to Include in Privacy Policy**

**Minimum Required:**
- What data you collect
- How you use the data
- Third-party services (Supabase, AdMob, Expo)
- User rights (access, delete data)
- Contact information

**Template Sections:**
1. **Information We Collect**
   - Email, location (if collected), device info
2. **How We Use Information**
   - Account creation, app functionality, analytics
3. **Third-Party Services**
   - Supabase (database)
   - Google AdMob (ads)
   - Expo (app framework)
4. **Data Storage**
   - Where data is stored
5. **User Rights**
   - Access, delete account
6. **Contact**
   - Your email for privacy questions

---

## 🎯 **Quick Start (Recommended)**

**Fastest Path: GitHub Pages + Generator**

1. **Generate policy** (5 min):
   - Go to [PrivacyPolicyGenerator.net](https://www.privacypolicygenerator.net/)
   - Fill out basic info (name, email, what data you collect)
   - Download HTML

2. **Host on GitHub Pages** (10 min):
   ```bash
   # Create new repo (or use existing)
   git init
   # Copy privacy-policy.html to repo
   git add privacy-policy.html
   git commit -m "Add privacy policy"
   git branch -M main
   git remote add origin https://github.com/yourusername/opendoors-privacy.git
   git push -u origin main
   ```
   
   Then:
   - GitHub repo → Settings → Pages
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Your URL: `https://yourusername.github.io/opendoors-privacy/privacy-policy.html`

3. **Use in App Store Connect:**
   - Paste the URL in the privacy policy field

**Total Time:** ~15 minutes
**Cost:** Free

---

## 📍 **Where to Use the URL**

1. **App Store Connect:**
   - App Information → Privacy Policy URL

2. **AdMob:**
   - App settings → Privacy Policy URL

3. **In-App (Optional):**
   - You can also link to it from your Profile/Settings screen
   - Users can tap to open in browser

---

## ✅ **Checklist**

- [ ] Generate privacy policy content
- [ ] Host on web (GitHub Pages, Netlify, etc.)
- [ ] Test URL is publicly accessible
- [ ] Add URL to App Store Connect
- [ ] Add URL to AdMob (if applicable)
- [ ] Optional: Add link in app Settings/Profile screen

---

## 💡 **Pro Tips**

- **Keep it simple:** Basic privacy policy is fine for MVP
- **Update later:** You can always update it (just update the HTML file)
- **Match your actual practices:** Make sure it reflects what you actually do
- **Use generator:** Saves time, ensures you cover required elements

---

**Recommendation:** Use GitHub Pages + Privacy Policy Generator for fastest setup (~15 minutes, free).

**Last Updated:** Pre-launch checklist creation

