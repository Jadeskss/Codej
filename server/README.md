# Server Setup Instructions for Codej

## Prerequisites
- Web server (Apache/Nginx)
- PHP 7.4 or higher
- MySQL 5.7 or higher

## Setup Steps

### 1. Database Setup
Create a MySQL database and user:

```sql
CREATE DATABASE codej_db;
CREATE USER 'codej_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON codej_db.* TO 'codej_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Server Files
1. Upload the `server` folder to your web server
2. Edit `config.php` with your database credentials:
   - `$host` = your database host (usually 'localhost')
   - `$dbname` = 'codej_db'
   - `$username` = 'codej_user'
   - `$password` = your database password

### 3. Web Server Configuration

#### For Apache (.htaccess)
Create `.htaccess` in the server folder:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ api.php [QSA,L]

Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

#### For Nginx
Add to your nginx config:
```nginx
location /codej/server/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    
    try_files $uri $uri/ /codej/server/api.php?$query_string;
}
```

### 4. Client Configuration
1. Edit `cloud-sync.js`:
   - Set `USE_CLOUD_SYNC = true`
   - Update `API_BASE_URL` to your server URL (e.g., 'https://yourdomain.com/codej/server/api.php')

2. Include cloud-sync.js in your HTML:
```html
<script src="cloud-sync.js"></script>
```

### 5. SSL/HTTPS (Recommended)
For production, ensure your server uses HTTPS to protect data transmission.

## Testing
1. Visit `https://yourdomain.com/codej/server/api.php` in browser
2. You should see a JSON response indicating the API is working

## Security Notes
- Change default passwords
- Use HTTPS in production
- Consider adding authentication tokens
- Implement rate limiting
- Regular backups of the database

## Troubleshooting
- Check PHP error logs
- Verify database connection
- Ensure proper file permissions
- Test API endpoints individually
