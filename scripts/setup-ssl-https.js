#!/usr/bin/env node
/**
 * SSL/HTTPS Setup Script
 * Configures SSL certificates and HTTPS enforcement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SSLHTTPSSetup {
  constructor() {
    this.sslProviders = {
      letsencrypt: {
        name: "Let's Encrypt (Free)",
        cost: "Free",
        validity: "90 days (auto-renewable)",
        setup: [
          "1. Install certbot",
          "2. Run: certbot --nginx -d yourdomain.com",
          "3. Set up auto-renewal cron job", 
          "4. Test renewal: certbot renew --dry-run"
        ],
        commands: {
          install: "sudo apt-get install certbot python3-certbot-nginx",
          obtain: "sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com",
          renew: "sudo certbot renew"
        }
      },
      cloudflare: {
        name: "Cloudflare SSL",
        cost: "Free",
        validity: "15 years",
        setup: [
          "1. Add domain to Cloudflare",
          "2. Update DNS nameservers",
          "3. Enable SSL in Cloudflare dashboard",
          "4. Set SSL mode to 'Full (strict)'"
        ]
      },
      aws: {
        name: "AWS Certificate Manager", 
        cost: "Free",
        validity: "13 months (auto-renewable)",
        setup: [
          "1. Go to AWS Certificate Manager",
          "2. Request public certificate",
          "3. Validate domain ownership",
          "4. Attach to CloudFront/ALB"
        ]
      },
      hosting: {
        name: "Hosting Provider SSL",
        cost: "Usually Free",
        validity: "Varies",
        setup: [
          "1. Enable SSL in hosting dashboard",
          "2. Upload custom certificate (if needed)",
          "3. Force HTTPS redirects",
          "4. Update security headers"
        ]
      }
    };
  }

  // Generate SSL configuration
  generateSSLConfig(domain, provider = 'letsencrypt') {
    const config = {
      domain: domain,
      provider: provider,
      sslEnabled: true,
      forceHttps: true,
      hstsEnabled: true,
      certificatePaths: {
        cert: `/etc/ssl/certs/${domain}.crt`,
        key: `/etc/ssl/private/${domain}.key`,
        chain: `/etc/ssl/certs/${domain}-chain.crt`
      },
      nginxConfig: this.generateNginxSSLConfig(domain),
      apacheConfig: this.generateApacheSSLConfig(domain),
      securityHeaders: {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
      }
    };

    return config;
  }

  // Generate nginx SSL configuration
  generateNginxSSLConfig(domain) {
    return `# SSL configuration for ${domain}
# Modern SSL configuration following Mozilla recommendations

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${domain} www.${domain};
    return 301 https://$server_name$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain} www.${domain};

    # SSL Certificate paths
    ssl_certificate /etc/ssl/certs/${domain}.crt;
    ssl_certificate_key /etc/ssl/private/${domain}.key;
    ssl_trusted_certificate /etc/ssl/certs/${domain}-chain.crt;

    # SSL Security Configuration
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Document root
    root /var/www/${domain}/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security: Deny access to hidden files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}`;
  }

  // Generate Apache SSL configuration
  generateApacheSSLConfig(domain) {
    return `# Apache SSL configuration for ${domain}

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName ${domain}
    ServerAlias www.${domain}
    Redirect permanent / https://${domain}/
</VirtualHost>

# HTTPS Virtual Host
<VirtualHost *:443>
    ServerName ${domain}
    ServerAlias www.${domain}
    DocumentRoot /var/www/${domain}/dist

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/${domain}.crt
    SSLCertificateKeyFile /etc/ssl/private/${domain}.key
    SSLCertificateChainFile /etc/ssl/certs/${domain}-chain.crt

    # Modern SSL configuration
    SSLProtocol -all +TLSv1.2 +TLSv1.3
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder off
    SSLCompression off

    # OCSP Stapling
    SSLUseStapling On
    SSLStaplingCache "shmcb:logs/ssl_stapling(32768)"

    # Security Headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Handle SPA routing
    FallbackResource /index.html

    # API proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/
    ProxyPassReverse /api/ http://localhost:3001/

    # Error and access logs
    ErrorLog \${APACHE_LOG_DIR}/${domain}_ssl_error.log
    CustomLog \${APACHE_LOG_DIR}/${domain}_ssl_access.log combined
</VirtualHost>`;
  }

  // Create Let's Encrypt setup script
  createLetsEncryptScript(domain) {
    const script = `#!/bin/bash
# Let's Encrypt SSL Certificate Setup for ${domain}

set -e

echo "🔒 Setting up Let's Encrypt SSL certificate for ${domain}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Update package list
echo "📦 Updating package list..."
apt-get update

# Install certbot and nginx plugin
echo "🔧 Installing certbot..."
apt-get install -y certbot python3-certbot-nginx

# Backup existing nginx config
echo "💾 Backing up nginx configuration..."
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Obtain SSL certificate
echo "📜 Obtaining SSL certificate..."
certbot --nginx -d ${domain} -d www.${domain} --non-interactive --agree-tos --email admin@${domain}

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx

# Set up auto-renewal
echo "⏰ Setting up auto-renewal..."
cat > /etc/cron.d/certbot-renew << EOF
# Renew Let's Encrypt certificates twice daily
0 */12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# Test auto-renewal
echo "🧪 Testing auto-renewal..."
certbot renew --dry-run

echo "✅ SSL certificate setup complete!"
echo "🌐 Your site is now available at: https://${domain}"
echo "🔄 Certificates will auto-renew every 90 days"

# Display certificate info
echo "📋 Certificate information:"
certbot certificates

echo "🔒 SSL setup completed successfully!"`;

    const scriptsDir = path.join(process.cwd(), 'deploy', 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(scriptsDir, `setup-ssl-${domain}.sh`), script);
    
    // Make script executable (on Unix systems)
    if (process.platform !== 'win32') {
      fs.chmodSync(path.join(scriptsDir, `setup-ssl-${domain}.sh`), 0o755);
    }
    
    console.log(`✅ Created SSL setup script: deploy/scripts/setup-ssl-${domain}.sh`);
  }

  // Update environment with SSL settings
  updateEnvironmentSSL() {
    const envPath = path.join(process.cwd(), '.env.production');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const sslConfig = `
# =============================================================================
# SSL/HTTPS CONFIGURATION
# =============================================================================

# HTTPS Enforcement
ENABLE_HTTPS=true
FORCE_HTTPS=true
HTTPS_PORT=443
HTTP_PORT=80

# SSL Certificate Paths (for custom server deployments)
SSL_CERT_PATH=/etc/ssl/certs/your-domain.crt
SSL_KEY_PATH=/etc/ssl/private/your-domain.key
SSL_CHAIN_PATH=/etc/ssl/certs/your-domain-chain.crt

# HSTS (HTTP Strict Transport Security)
HSTS_ENABLED=true
HSTS_MAX_AGE=63072000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# Additional Security Headers
SECURITY_HEADERS_ENABLED=true
X_CONTENT_TYPE_OPTIONS=nosniff
X_FRAME_OPTIONS=DENY
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin

# Content Security Policy
CSP_ENABLED=true
CSP_DEFAULT_SRC='self'
CSP_SCRIPT_SRC='self' 'unsafe-inline'
CSP_STYLE_SRC='self' 'unsafe-inline'
CSP_IMG_SRC='self' data: https:
CSP_FONT_SRC='self' data:

`;

    // Remove existing SSL config if present
    const lines = envContent.split('\\n');
    const filteredLines = lines.filter(line => 
      !line.includes('ENABLE_HTTPS') && 
      !line.includes('SSL_CERT_PATH') && 
      !line.includes('HSTS_')
    );

    const updatedContent = sslConfig + filteredLines.join('\\n');
    fs.writeFileSync(envPath, updatedContent);
    
    console.log('✅ Updated .env.production with SSL configuration');
  }

  // Create SSL health check script
  createSSLHealthCheck(domain) {
    const healthCheckScript = `#!/bin/bash
# SSL Health Check Script for ${domain}

echo "🔒 SSL Health Check for ${domain}"
echo "================================"

# Check SSL certificate expiration
echo "📅 Certificate expiration:"
echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -dates

# Check SSL grade
echo ""
echo "🏆 SSL Labs grade check:"
curl -s "https://api.ssllabs.com/api/v3/analyze?host=${domain}" | jq '.endpoints[0].grade' 2>/dev/null || echo "Install jq for detailed SSL grade"

# Check certificate chain
echo ""
echo "🔗 Certificate chain validation:"
openssl s_client -servername ${domain} -connect ${domain}:443 -verify_return_error < /dev/null

# Check HSTS header
echo ""
echo "🛡️  HSTS header check:"
curl -s -I https://${domain} | grep -i strict-transport-security

# Check security headers
echo ""
echo "🔐 Security headers:"
curl -s -I https://${domain} | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)"

echo ""
echo "✅ SSL health check completed"`;

    const scriptsDir = path.join(process.cwd(), 'deploy', 'scripts');
    fs.writeFileSync(path.join(scriptsDir, `ssl-health-check-${domain}.sh`), healthCheckScript);
    
    if (process.platform !== 'win32') {
      fs.chmodSync(path.join(scriptsDir, `ssl-health-check-${domain}.sh`), 0o755);
    }
    
    console.log(`✅ Created SSL health check: deploy/scripts/ssl-health-check-${domain}.sh`);
  }

  // Display SSL provider instructions
  displaySSLInstructions() {
    console.log('\\n🔒 SSL CERTIFICATE PROVIDERS');
    console.log('='.repeat(50));

    Object.entries(this.sslProviders).forEach(([key, provider]) => {
      console.log(`\\n🏆 ${provider.name}`);
      console.log('─'.repeat(provider.name.length + 4));
      console.log(`Cost: ${provider.cost}`);
      console.log(`Validity: ${provider.validity}`);
      console.log('Setup Steps:');
      provider.setup.forEach(step => console.log(`   ${step}`));
      
      if (provider.commands) {
        console.log('Commands:');
        Object.entries(provider.commands).forEach(([action, command]) => {
          console.log(`   ${action}: ${command}`);
        });
      }
    });
  }

  // Main setup function
  async run() {
    console.log('🔒 SSL/HTTPS CONFIGURATION SETUP');
    console.log('='.repeat(50));
    
    const defaultDomain = "your-rfp-platform.com";
    
    // Display SSL provider options
    this.displaySSLInstructions();
    
    // Generate SSL configuration
    console.log(`\\n🔧 Generating SSL configuration for: ${defaultDomain}`);
    const config = this.generateSSLConfig(defaultDomain);
    
    // Create configuration files
    const nginxDir = path.join(process.cwd(), 'deploy', 'nginx');
    const apacheDir = path.join(process.cwd(), 'deploy', 'apache');
    
    if (!fs.existsSync(nginxDir)) {
      fs.mkdirSync(nginxDir, { recursive: true });
    }
    if (!fs.existsSync(apacheDir)) {
      fs.mkdirSync(apacheDir, { recursive: true });
    }

    fs.writeFileSync(path.join(nginxDir, `${defaultDomain}-ssl.conf`), config.nginxConfig);
    fs.writeFileSync(path.join(apacheDir, `${defaultDomain}-ssl.conf`), config.apacheConfig);
    
    console.log(`✅ Created nginx SSL config: deploy/nginx/${defaultDomain}-ssl.conf`);
    console.log(`✅ Created Apache SSL config: deploy/apache/${defaultDomain}-ssl.conf`);
    
    // Create setup scripts
    this.createLetsEncryptScript(defaultDomain);
    this.createSSLHealthCheck(defaultDomain);
    
    // Update environment
    this.updateEnvironmentSSL();
    
    console.log('\\n🚀 SSL SETUP RECOMMENDATIONS');
    console.log('='.repeat(40));
    console.log('1. 🥇 **Let\\'s Encrypt** - Free, automated, trusted');
    console.log('2. 🥈 **Cloudflare SSL** - Free, easy setup, good performance');
    console.log('3. 🥉 **Hosting Provider SSL** - Often included, simple setup');
    console.log('4. ⭐ **AWS Certificate Manager** - Free for AWS services');

    console.log('\\n✅ SSL/HTTPS configuration complete!');
    console.log('\\n📋 Next steps:');
    console.log('1. Choose an SSL provider from the list above');
    console.log('2. Update domain name in the generated configuration files');
    console.log('3. Run the SSL setup script for your domain');
    console.log('4. Test SSL configuration with the health check script');
    console.log('5. Verify HTTPS redirects are working');
    
    console.log('\\n🔧 Quick setup for Let\\'s Encrypt:');
    console.log(`   sudo bash deploy/scripts/setup-ssl-${defaultDomain}.sh`);
  }
}

// Run if called directly  
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new SSLHTTPSSetup();
  setup.run();
}

export default SSLHTTPSSetup;