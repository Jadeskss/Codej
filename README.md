# 🚀 Codej - Code ni Jade

A professional web application for storing and managing your code programs with cloud sync capabilities. Access your code from anywhere, on any device!

![Codej Demo](https://img.shields.io/badge/Status-Ready-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![HTML](https://img.shields.io/badge/HTML-5-orange) ![CSS](https://img.shields.io/badge/CSS-3-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

- **🔐 Secure Login** - Password-protected access to your code repository
- **💾 Code Management** - Add, edit, view, and delete code programs with syntax highlighting
- **🔍 Smart Search & Filter** - Find your code quickly with real-time search and language filters
- **📱 Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **🎨 Modern UI** - Professional design with smooth animations and intuitive interface
- **☁️ Cloud Sync** - Multiple sync options for cross-device access
- **🏷️ Tagging System** - Organize your code with custom tags
- **📋 Copy to Clipboard** - One-click code copying
- **💿 Local Storage** - Works offline with browser storage

## 🌟 Cross-Device Sync Options

### 1. 📤 Export/Import (Local)
- Download your data as JSON backup files
- Transfer between devices manually
- Works completely offline

### 2. ☁️ Supabase Cloud Database (Recommended)
- Real-time cloud storage with PostgreSQL
- Access from any device with internet
- Free tier: 500MB database (thousands of programs)
- Professional-grade security and backups

### 3. 🐙 GitHub Gist Sync
- Store backups in private GitHub Gists
- Version history and GitHub integration
- Perfect for developers already using GitHub

## 🚀 Quick Start

### Option 1: Local Only (Instant)
1. **Download** or clone this repository
2. **Open** `index.html` in your browser
3. **Login** with password: `jade123`
4. **Start coding!** Add your first program

### Option 2: With Cloud Sync (5 minutes setup)
1. **Set up Supabase** (free):
   - Go to [supabase.com](https://supabase.com)
   - Create account and new project
   - Get your Project URL and API key
2. **Configure Codej**:
   - Click "Upload" button in the app
   - Enter your Supabase credentials
   - Follow the table creation instructions
3. **Sync everywhere!** Use same credentials on all devices

## 📂 Project Structure

```
Codej/
├── 📄 index.html              # Main application file
├── 🎨 styles.css              # Modern responsive styles  
├── ⚡ script.js               # Core functionality
├── ☁️ supabase-sync.js        # Supabase cloud integration
├── 🐙 github-sync.js          # GitHub Gist integration (optional)
├── 🔧 enhanced-sync.js        # Auto-sync features (optional)
├── 📋 .gitignore              # Git ignore file
├── 📖 README.md               # This file
├── 📚 SUPABASE_SETUP.md       # Detailed Supabase guide
└── 🗃️ server/                 # PHP/MySQL backend (optional)
    ├── api.php                # REST API endpoints
    ├── config.php             # Database configuration
    └── README.md              # Server setup guide
```

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)
- **Storage**: LocalStorage + Cloud options
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Simple password protection
- **Responsive**: CSS Grid + Flexbox

## 📱 Usage

### Adding Code Programs
1. Click **"Add Code"** button
2. Fill in details:
   - **Title**: Name your program
   - **Language**: Select from dropdown
   - **Description**: What it does
   - **Code**: Paste your code
   - **Tags**: Organize with keywords
   - **URL**: Link to repo/demo (optional)
3. **Save** and it's instantly searchable!

### Managing Programs
- **👁️ View**: Click any card to see full details
- **✏️ Edit**: Use edit button or icon
- **🗑️ Delete**: Remove unwanted programs
- **📋 Copy**: One-click code copying
- **🔍 Search**: Type to find programs instantly
- **🏷️ Filter**: Click language filters or use tags

### 🔄 Real-Time Sync (Supabase)
Once connected to Supabase, Codej provides **automatic real-time synchronization**:

#### Features:
- **🌐 Instant Updates**: Code added on one device appears instantly on all others
- **🔄 Auto-Sync**: All CRUD operations automatically sync to cloud
- **📱 Cross-Device**: Access same data on phone, tablet, laptop
- **🔌 Reconnection**: Automatically reconnects if connection drops
- **📡 Status Indicator**: See real-time sync status in header
- **⚡ Conflict-Free**: Latest changes always win (timestamp-based)

#### How It Works:
1. **Background Sync**: WebSocket connection for instant updates
2. **Fallback Mode**: Polling every 10 seconds if WebSocket fails
3. **Local Backup**: Always saves to localStorage as backup
4. **Smart Updates**: Only syncs when actual changes occur

#### Sync Status Indicators:
- **🟢 "Real-time sync active"**: Connected and syncing instantly
- **🔴 "Offline mode"**: Working locally only (will sync when connected)

#### Testing Real-Time Sync:
1. Open Codej on Device A and connect to Supabase
2. Open Codej on Device B with same credentials
3. Add/edit/delete code on Device A
4. Watch it appear instantly on Device B! ✨

#### Troubleshooting:
- **Not syncing?** Check internet connection and Supabase credentials
- **Slow sync?** May be using polling fallback (still works, just slower)
- **Lost connection?** App will auto-reconnect and sync pending changes
- **Conflicts?** Latest timestamp wins; local backup preserved in browser

## 🧪 Testing Real-Time Sync

### Quick Test (Same Device):
1. **Open Codej** in your browser and login
2. **Connect to Supabase** (Upload button → Enter credentials)
3. **Open second tab** with Codej and login
4. **Add code** in Tab 1, watch it appear in Tab 2 instantly! ✨

### Multi-Device Test:
1. **Setup**: Connect Codej to Supabase on Device 1
2. **Share**: Use same Supabase credentials on Device 2  
3. **Test**: Add/edit code on either device
4. **Verify**: Changes appear on both devices in real-time

### Expected Behavior:
- ✅ New programs appear instantly on all devices
- ✅ Edits sync immediately (title, code, tags, etc.)
- ✅ Deletions remove from all devices
- ✅ Sync status shows "Real-time sync active"
- ✅ Works even if one device goes offline temporarily

### Troubleshooting Sync:
- **🔧 No sync?** Check Supabase URL and API key
- **🔧 Slow sync?** Using polling fallback (still works)
- **🔧 Connection lost?** Will auto-reconnect and sync pending changes

## ⚙️ Configuration

### Change Password
Edit `APP_PASSWORD` in `script.js`:
```javascript
const APP_PASSWORD = 'your_new_password';
```

### Add Programming Languages
Add to language dropdown in `index.html`:
```html
<option value="rust">Rust</option>
<option value="go">Go</option>
```

### Customize Styling
All styles in `styles.css` - easily modify colors, fonts, and layout.

## 🔒 Security & Privacy

- **Client-Side**: All processing happens in your browser
- **Local Storage**: Data stays on your device by default
- **Supabase**: Industry-standard security with RLS policies
- **No Tracking**: Zero analytics or user tracking
- **Open Source**: Full transparency - review all code

## 📊 Browser Support

- ✅ Chrome 70+
- ✅ Firefox 65+  
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for excellent database-as-a-service
- **Font Awesome** for beautiful icons
- **Google Fonts** for typography
- **GitHub** for hosting and version control

## 📞 Support

- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Create an issue with enhancement label
- 📖 **Documentation**: Check the `/docs` folder or wiki
- 💬 **Questions**: Start a discussion on GitHub

---

**Made with ❤️ for developers who love organizing their code**

**Codej** - *Code ni Jade* 🚀

[⭐ Star this repo](../../stargazers) | [🍴 Fork it](../../fork) | [📝 Report bug](../../issues) | [✨ Request feature](../../issues)

## Customization

### Changing the Password
Edit the `APP_PASSWORD` variable in `script.js`:
```javascript
const APP_PASSWORD = 'your_new_password';
```

### Adding New Language Options
Add new options to the language select in `index.html`:
```html
<option value="your_language">Your Language</option>
```

### Styling
All styles are in `styles.css`. The app uses CSS custom properties for easy theming.

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Data Storage

All data is stored in your browser's localStorage. This means:
- Your data stays private and local
- No internet connection required after initial load
- Data persists between browser sessions
- Data is lost if you clear browser storage

## Keyboard Shortcuts

- **Ctrl + K**: Focus search bar
- **Escape**: Close any open modal

## Security Notes

- This is a client-side application with basic password protection
- For production use, consider implementing proper authentication
- Regularly backup your code programs as they're stored locally

## Installation

1. Download all files to a folder
2. Open `index.html` in your web browser
3. Enter the password (`jade123` by default)
4. Start adding your code programs!

## Troubleshooting

### "Cloud sync not available" Error

If you see the error "Cloud sync not available. Please check if Supabase sync is properly loaded", try these steps:

1. **Refresh the page** - This usually resolves script loading issues
2. **Clear browser cache** - Hold Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Check browser console** - Press F12 and look for any script errors
4. **Verify file structure** - Make sure all files are in the same folder:
   - `index.html`
   - `script.js` 
   - `supabase-sync.js`
   - `styles.css`

### Debug Console Commands

Open browser console (F12) and run these commands to diagnose issues:

```javascript
// Check if all scripts loaded properly
checkScriptLoading()

// Test sync availability
testSyncAvailability()

// Check Supabase connection
console.log('Supabase instance:', supabaseSync)
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Scripts not loading | Refresh page, check file paths |
| "SupabaseSync not defined" | Ensure `supabase-sync.js` loads before `script.js` |
| Connection fails | Check Supabase URL and API key |
| Table doesn't exist | Follow SQL table creation instructions |
| Real-time not working | Check WebSocket connection, fallback to polling |

Feel free to modify and enhance the application according to your needs. The code is well-commented and organized for easy customization.

---

**Codej** - *Code ni Jade* 🚀
