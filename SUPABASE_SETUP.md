# Supabase Setup Guide for Codej

## Why Supabase?
- **Free tier**: 500MB database, 50MB file storage
- **Real-time sync**: Automatic updates across devices
- **No server needed**: Fully managed backend
- **Easy setup**: 5-minute configuration
- **Secure**: Built-in authentication and RLS

## Step-by-Step Setup

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub, Google, or email
3. Click "New Project"

### 2. Create Project
1. Choose your organization
2. Enter project name: `codej-app`
3. Enter database password (save this!)
4. Select region closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 3. Get API Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Configure Codej
1. Open your Codej app
2. Click the "Upload" button
3. Enter your Supabase URL and API key
4. Click "Connect & Test"
5. ✅ Success! Your app is now cloud-enabled

### 5. Optional: Enhanced Auto-Sync
For automatic syncing on every change, add this line to your `index.html` before `</body>`:
```html
<script src="enhanced-sync.js"></script>
```

## Features Enabled

### ☁️ Cloud Storage
- All your code programs stored in Supabase
- Automatic backups and version history
- Access from any device with internet

### 🔄 Real-Time Sync
- **Upload**: Send local programs to cloud
- **Download**: Get latest programs from cloud  
- **Auto-merge**: Combines local and cloud data intelligently

### 📱 Cross-Device Access
1. **Device A**: Add/edit programs → Upload to cloud
2. **Device B**: Download from cloud → Access all programs
3. **Device C**: Same Supabase credentials → Instant access

### 🔒 Security
- Data encrypted in transit (HTTPS)
- Private database (only your API key can access)
- No public access to your code

## Usage Examples

### First Time Setup
```
Device 1: Configure Supabase → Add programs → Upload
Device 2: Configure Supabase (same credentials) → Download → All programs available!
```

### Daily Usage
```
Morning: Download latest → See all devices' changes
Work: Add/edit programs → Upload when done
Evening: Upload changes → Available on all devices
```

### Backup Strategy
```
Automatic: Supabase handles backups
Manual: Use Export button for local backups
Redundant: Data stored in both cloud and localStorage
```

## Troubleshooting

### "Connection Failed"
- ✅ Check project URL format: `https://xxx.supabase.co`
- ✅ Verify API key is the **anon public** key (not service role)
- ✅ Ensure project is active (not paused)

### "Table doesn't exist"
- ✅ App will auto-create table on first connection
- ✅ Make sure you have database access
- ✅ Check project isn't in "pausing" state

### "No programs found"
- ✅ Use Upload button to send local programs to cloud first
- ✅ Check if data exists in Supabase dashboard → Table Editor

### "Sync failed"
- ✅ Check internet connection
- ✅ Verify Supabase project is active
- ✅ Try manual Upload/Download buttons

## Advanced Features

### Database Management
- View your data: **Supabase Dashboard** → **Table Editor** → `programs`
- Manual backup: **Database** → **Backups**
- Monitor usage: **Settings** → **Usage**

### Security (Optional)
- Enable Row Level Security (RLS) for multi-user setups
- Add authentication for private access
- Set up email/password login

### Performance
- Free tier: Up to 500MB (thousands of code programs)
- Upgrade options available for larger needs
- Global CDN for fast access worldwide

## Migration from Local-Only

### From localStorage to Supabase:
1. Configure Supabase
2. Click "Upload" → Uploads all existing programs
3. On other devices: Configure + Download

### Backup Before Migration:
1. Click "Export" → Save JSON backup file
2. Configure Supabase
3. Upload programs
4. Keep JSON backup as safety net

## Cost Information

### Free Tier (Forever):
- 500MB database storage
- 2GB bandwidth per month
- 50MB file storage
- Perfect for personal use

### If You Need More:
- Pro Plan: $25/month (8GB database, 250GB bandwidth)
- Only needed for heavy usage or teams

---

## Quick Reference

**Setup**: supabase.com → New Project → Copy URL + Key → Configure in Codej
**Upload**: Send your programs to cloud
**Download**: Get latest programs from cloud  
**Backup**: Export button for local JSON backup

Your code is now accessible from anywhere! 🚀
