#!/usr/bin/env node
/**
 * Production Domain & CORS Setup Script
 * Configures production URLs and CORS settings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionDomainSetup {
  constructor() {
    this.hostingProviders = {
      vercel: {
        name: "Vercel",
        defaultDomain: "your-app-name.vercel.app",
        customDomain: "yourdomain.com",
        sslIncluded: true,
        setup: [
          "1. Connect GitHub repo to Vercel",
          "2. Configure build settings",
          "3. Add custom domain in dashboard",
          "4. Update DNS records",
          "5. SSL certificates auto-configured"
        ]
      },
      netlify: {
        name: "Netlify", 
        defaultDomain: "your-app-name.netlify.app",
        customDomain: "yourdomain.com",
        sslIncluded: true,
        setup: [
          "1. Connect GitHub repo to Netlify",
          "2. Configure build command",
          "3. Add custom domain in dashboard",
          "4. Update DNS records",
          "5. Force HTTPS enabled by default"
        ]
      },
      cloudflare: {
        name: "Cloudflare Pages",
        defaultDomain: "your-app-name.pages.dev",
        customDomain: "yourdomain.com", 
        sslIncluded: true,
        setup: [
          "1. Connect GitHub repo to Cloudflare Pages",
          "2. Configure build settings",
          "3. Add custom domain",
          "4. Configure DNS through Cloudflare",
          "5. SSL/Security settings auto-applied"
        ]
      },
      firebase: {
        name: "Firebase Hosting",
        defaultDomain: "your-project.web.app",
        customDomain: "yourdomain.com",
        sslIncluded: true,
        setup: [
          "1. firebase init hosting",
          "2. Configure firebase.json",
          "3. firebase deploy --only hosting",
          "4. Add custom domain in console",
          "5. SSL certificates auto-provisioned"
        ]
      },
      aws: {
        name: "AWS S3 + CloudFront",
        defaultDomain: "your-bucket.s3-website.region.amazonaws.com",
        customDomain: "yourdomain.com",
        sslIncluded: true,
        setup: [
          "1. Create S3 bucket for static hosting",
          "2. Configure CloudFront distribution", 
          "3. Request SSL certificate via ACM",
          "4. Configure Route 53 DNS",
          "5. Update distribution settings"
        ]
      }
    };
  }

  // Generate domain configuration
  generateDomainConfig(domain) {
    const isCustomDomain = !domain.includes('vercel.app') && 
                          !domain.includes('netlify.app') && 
                          !domain.includes('pages.dev') &&
                          !domain.includes('web.app');

    const config = {
      // Primary domain
      primaryDomain: domain,
      
      // CORS origins (with and without www)
      corsOrigins: isCustomDomain ? 
        [`https://${domain}`, `https://www.${domain}`] :
        [`https://${domain}`],
      
      // API endpoints
      apiUrl: `https://${domain}/api`,
      frontendUrl: `https://${domain}`,
      
      // Security settings
      enforceHttps: true,
      hstsEnabled: true,
      
      // Additional security headers
      securityHeaders: {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    };

    return config;
  }

  // Update environment files with domain configuration
  updateEnvironmentFiles(domain) {
    const config = this.generateDomainConfig(domain);
    
    // Update .env.production
    const envPath = path.join(process.cwd(), '.env.production');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Replace or add domain-specific variables
    const domainVars = `
# =============================================================================
# PRODUCTION DOMAIN CONFIGURATION
# =============================================================================
# Generated for domain: ${domain}

# Frontend Configuration
VITE_API_URL=${config.apiUrl}
VITE_APP_URL=${config.frontendUrl}

# Security & CORS
CORS_ORIGINS=${config.corsOrigins.join(',')}
ENABLE_HTTPS=true
FORCE_HTTPS=true

# Security Headers
HSTS_ENABLED=true
HSTS_MAX_AGE=63072000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# Additional Security
X_CONTENT_TYPE_OPTIONS=nosniff
X_FRAME_OPTIONS=DENY
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin

`;

    // Update existing environment variables
    const envLines = envContent.split('\\n');
    const updatedEnvLines = [];
    const domainKeys = ['VITE_API_URL', 'VITE_APP_URL', 'CORS_ORIGINS', 'ENABLE_HTTPS'];
    
    for (const line of envLines) {
      const isUpdated = domainKeys.some(key => line.startsWith(`${key}=`));
      if (!isUpdated || !line.includes('=')) {
        updatedEnvLines.push(line);
      }
    }

    // Add domain configuration at the beginning
    const updatedContent = domainVars + updatedEnvLines.join('\\n');
    fs.writeFileSync(envPath, updatedContent);
    
    console.log(`✅ Updated .env.production for domain: ${domain}`);
    return config;
  }

  // Create nginx configuration for custom servers
  createNginxConfig(domain) {
    const nginxConfig = `# Nginx configuration for ${domain}
# Production deployment with HTTPS enforcement

server {
    listen 80;
    server_name ${domain} www.${domain};
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${domain} www.${domain};

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/${domain}.crt;
    ssl_certificate_key /etc/ssl/private/${domain}.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Document Root
    root /var/www/${domain}/dist;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if using separate API server)
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

    # Static assets caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}`;

    const configDir = path.join(process.cwd(), 'deploy', 'nginx');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(configDir, `${domain}.conf`), nginxConfig);
    console.log(`✅ Created nginx configuration: deploy/nginx/${domain}.conf`);
  }

  // Create deployment configuration for different platforms
  createDeploymentConfigs(domain) {
    // Vercel configuration
    const vercelConfig = {
      "version": 2,
      "builds": [
        {
          "src": "dist/**",
          "use": "@vercel/static"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "/api/$1"
        },
        {
          "src": "/(.*)",
          "dest": "/dist/$1"
        }
      ],
      "headers": [
        {
          "source": "/(.*)",
          "headers": [
            {
              "key": "Strict-Transport-Security",
              "value": "max-age=63072000; includeSubDomains; preload"
            },
            {
              "key": "X-Content-Type-Options", 
              "value": "nosniff"
            },
            {
              "key": "X-Frame-Options",
              "value": "DENY"
            },
            {
              "key": "X-XSS-Protection",
              "value": "1; mode=block"
            }
          ]
        }
      ]
    };

    // Netlify configuration
    const netlifyConfig = `# Netlify configuration for ${domain}

[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"`;

    // Write configuration files
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    fs.writeFileSync('netlify.toml', netlifyConfig);
    
    console.log('✅ Created vercel.json deployment configuration');
    console.log('✅ Created netlify.toml deployment configuration');
  }

  // Validate domain format
  validateDomain(domain) {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    return domainRegex.test(domain);
  }

  // Display hosting provider instructions
  displayHostingInstructions() {
    console.log('\\n🌐 HOSTING PROVIDER SETUP INSTRUCTIONS');
    console.log('='.repeat(60));

    Object.entries(this.hostingProviders).forEach(([key, provider]) => {
      console.log(`\\n🔧 ${provider.name}`);
      console.log('─'.repeat(provider.name.length + 4));
      console.log(`Default Domain: ${provider.defaultDomain}`);
      console.log(`Custom Domain: ${provider.customDomain}`);
      console.log(`SSL Included: ${provider.sslIncluded ? '✅ Yes' : '❌ No'}`);
      console.log('Setup Steps:');
      provider.setup.forEach(step => console.log(`   ${step}`));
    });
  }

  // Interactive domain setup
  async setupInteractive() {
    console.log('\\n🌐 PRODUCTION DOMAIN SETUP');
    console.log('='.repeat(40));
    
    // For now, we'll use a default domain for the template
    const defaultDomain = "your-rfp-platform.com";
    
    console.log(`\\n📝 Setting up configuration for domain: ${defaultDomain}`);
    console.log('   (You can change this in the generated files)\\n');
    
    // Generate configuration for default domain
    const config = this.updateEnvironmentFiles(defaultDomain);
    this.createNginxConfig(defaultDomain);
    this.createDeploymentConfigs(defaultDomain);
    
    return config;
  }

  // Main setup function
  async run() {
    console.log('🌐 PRODUCTION DOMAIN CONFIGURATION');
    console.log('='.repeat(50));
    
    // Display hosting options
    this.displayHostingInstructions();
    
    // Setup configuration
    const config = await this.setupInteractive();
    
    console.log('\\n🚀 QUICK DEPLOYMENT RECOMMENDATIONS');
    console.log('='.repeat(45));
    console.log('1. 🥇 **Vercel** - Zero config, automatic HTTPS, global CDN');
    console.log('2. 🥈 **Netlify** - Easy setup, great for static sites');
    console.log('3. 🥉 **Cloudflare Pages** - Fast, built-in security');
    console.log('4. ⭐ **Firebase Hosting** - Google Cloud integration');

    console.log('\\n✅ Domain configuration complete!');
    console.log('\\n📋 Next steps:');
    console.log('1. Choose a hosting provider from the list above');
    console.log('2. Update domain name in .env.production');
    console.log('3. Deploy using platform-specific commands');
    console.log('4. Configure custom domain in hosting dashboard');
    console.log('5. Update DNS records to point to your hosting provider');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new ProductionDomainSetup();
  setup.run();
}

export default ProductionDomainSetup;