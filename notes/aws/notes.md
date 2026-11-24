# AWS

### What is AWS?

- AWS (Amazon Web Services) is a cloud computing platform by Amazon.
- It provides computing resources (servers, storage, databases, networking and more) over the internet, on demand.
- Instead of buying and maintaining our own physical servers, we rent them from AWS and pay only for what we use.
- Analogy: like renting a house instead of building one. AWS handles the building (hardware, power, cooling, security); we just use the space.

### Why use AWS? (problems it solves)

- Without the cloud (own servers):
    - Buy hardware upfront (expensive)
    - Maintain it: power, cooling, repairs, security
    - Hard to scale: more users means buying more machines, which takes weeks
    - If the server fails, the app goes down
- With AWS:
    - No upfront cost: pay as you go (per hour/second/GB)
    - Scalable: add or remove servers in minutes based on traffic
    - Reliable: data centers worldwide with backups and failover
    - Global: deploy close to users (e.g. Mumbai and Hyderabad regions for India)
    - Secure: built-in security, access control (IAM), encryption
    - Managed services: AWS handles maintenance of databases, backups, updates

### Common AWS services

- EC2 (Elastic Compute Cloud) → virtual servers to run applications (e.g. a Node.js backend)
- S3 (Simple Storage Service) → store files: images, videos, backups, static websites
- RDS (Relational Database Service) → managed SQL databases (MySQL, PostgreSQL)
- DynamoDB → managed NoSQL database
- Lambda → run code without managing servers (serverless), pay per execution
- Route 53 → domain names and DNS
- CloudFront → CDN; delivers content fast from locations near the user
- IAM (Identity and Access Management) → users, roles and permissions
- ELB (Elastic Load Balancer) → distributes traffic across multiple servers
- SES (Simple Email Service) → send emails

### Example: deploying a MERN app (DevTinder) on AWS

- Frontend (React build) → served by Nginx on EC2, or S3 + CloudFront
- Backend (Node.js + Express) → EC2 instance, kept running with PM2
- Database → MongoDB Atlas (or self-hosted on EC2)
- Domain → Route 53 (or any domain provider pointing to the EC2 IP)
- Emails → SES

### Key terms

- Region → a geographic location with AWS data centers (e.g. ap-south-1 = Mumbai)
- Availability Zone (AZ) → separate data centers within a region, for backup and high availability
- Instance → one virtual server in EC2
- Free Tier → AWS offers limited free usage for new accounts (check the current terms on the AWS website, as they change)

### Alternatives

- Microsoft Azure, Google Cloud Platform (GCP), DigitalOcean

# DEPLOYING DEVTINDER ON AWS EC2

---

## PART 1: CREATE THE SERVER

### 1. Create the instance

- Create an AWS account
- Search "EC2" in the console search → open the EC2 page
- Click "Launch instances"
    - Name: DevTinder
    - OS image: Ubuntu
    - Instance type: t3.micro

### 2. Create a key pair (for SSH login)

- In the "Launch instance" form → section "Key pair (login)" → click "Create new key pair"
    - Key pair name: devTinder-secret
    - Key pair type: RSA
    - Private key file format: .pem (for Linux/Mac; .ppk is for PuTTY on Windows)
    - Click "Create key pair" → devTinder-secret.pem downloads automatically
- What it is:
    - AWS keeps the public key on the server.
    - We keep the private key (.pem file) on our machine.
    - SSH matches the two to let us log in. No password needed.
- Important:
    - The .pem file can be downloaded ONLY ONCE. If lost, we can't log in with it.
    - Keep it in a safe folder (e.g. ~/.ssh/). Never commit it to Git.

### 3. Launch

- Click "Launch instance"
- Wait until Instance state = Running and Status check = passed

### 4. Connect to the server (SSH)

- Instance → Connect → SSH client tab
- Move the key to a safe folder and restrict its permissions (SSH refuses keys that others can read):

```bash
mv ~/Downloads/devTinder-secret.pem ~/.ssh/
chmod 400 ~/.ssh/devTinder-secret.pem
```

- Connect from the local terminal:

```bash
ssh -i ~/.ssh/devTinder-secret.pem ubuntu@ec2-16-179-223-195.ap-southeast-2.compute.amazonaws.com
```

- "ubuntu" is the default username for Ubuntu servers.

### 5. Setup

- Install the same Node.js version as local (using nvm)
- Clone the frontend and backend repos

### 6. Open ports in the Security Group

- Security Group = AWS firewall for the server. It blocks all incoming traffic except allowed ports.
- Port 22 (SSH) is allowed at launch. Browsers need port 80 (HTTP) and 443 (HTTPS).
    - Instance → Security tab → click the Security group → Edit inbound rules
    - Add rule: HTTP, port 80, source 0.0.0.0/0
    - Add rule: HTTPS, port 443, source 0.0.0.0/0 (for SSL later)
    - Save

---

## PART 2: DEPLOY THE FRONTEND

### 1. Build the app

```bash
cd devTinder-web
npm install
npm run build      # creates dist/ folder with production files
```

### 2. Install nginx

- nginx is a web server: it sends our website files to the browser.
- It also forwards API calls to the backend (reverse proxy).

```bash
sudo apt update
sudo apt install nginx
sudo systemctl start nginx     # start now
sudo systemctl enable nginx    # start automatically after reboot
```

### 3. Copy the build to nginx

```bash
sudo cp -r dist/* /var/www/html/
```

- Use cp (not scp). scp copies between two machines; here both folders are on the same server.

### 4. Test

- Copy the server's Public IPv4 address → open http://<public-ip> in the browser

---

## PART 3: DEPLOY THE BACKEND

### 1. Install and add environment variables

```bash
cd devTinder
npm install
nano .env          # .env is not in Git, so create it on the server
```

```
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<your secret>
PORT=3000
```

### 2. Allow the server in MongoDB Atlas

- Problem: database connection fails on the server.
- Reason: MongoDB Atlas only allows connections from approved IP addresses.
- Fix: Atlas → Network Access → Add IP Address → add the server's public IP

### 3. Test the backend (optional)

```bash
npm run start
```

- To test directly at http://<public-ip>:3000, temporarily add an inbound rule for port 3000.
- Remove this rule after Part 4. nginx handles API traffic, so port 3000 should not stay public.

### 4. Keep the backend running with PM2

- Problem: when we close the terminal, the backend stops.
- PM2 is a process manager: it keeps the app running in the background and restarts it if it crashes.

```bash
npm i -g pm2
pm2 start npm --name "devtinder-backend" -- start
```

- Useful commands:
    - pm2 list → show running apps
    - pm2 logs → see logs and errors
    - pm2 flush devtinder-backend → clear logs
    - pm2 restart devtinder-backend → restart (after code changes)
    - pm2 stop devtinder-backend → stop
    - pm2 delete devtinder-backend → remove from PM2
- Keep it running after a server reboot:

```bash
pm2 startup     # prints a command; copy and run it
pm2 save        # saves the current app list
```

---

## PART 4: CONFIGURE NGINX

### 1. Why

- React Router: refreshing /feed or /profile gives 404, because nginx looks for a real file with that name. nginx must send index.html instead, so React Router can show the right page.
- API: the frontend calls /api/..., and nginx must forward those requests to the backend on port 3000.
    - Browser → http://<public-ip>/api/login → nginx → http://localhost:3000/login

### 2. Edit the config

```bash
sudo nano /etc/nginx/sites-available/default
```

- The main server block should look like this:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html;
    server_name _;

    # Frontend: unknown paths → React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend: forward /api requests to Node
    location /api/ {
        proxy_pass http://localhost:3000/;    # trailing slash removes /api before forwarding
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- The trailing slash in proxy_pass matters:
    - proxy_pass http://localhost:3000/; → /api/login reaches Express as /login ✅
    - proxy_pass http://localhost:3000; → /api/login reaches Express as /api/login ❌ (404)
- Save in nano: Ctrl + O → Enter → Ctrl + X

### 3. Apply the changes

```bash
sudo nginx -t                   # check config for errors
sudo systemctl restart nginx    # apply changes
```

- Saving the file alone does nothing. nginx reads the config only on start/restart.

---

## PART 5: CONNECT FRONTEND AND BACKEND

### 1. Update the frontend API URL

- In the frontend code (constant.js):

```js
export const API_BASE_URL = "/api";
```

- Push the change to Git, then on the server:

```bash
cd devTinder-web
git pull
npm run build
sudo cp -r dist/* /var/www/html/
```

### 2. Update backend CORS

- Set the CORS origin to the live site:

```js
app.use(cors({ origin: "http://<public-ip>", credentials: true }));
```

```bash
cd devTinder
git pull
pm2 restart devtinder-backend
```

---

## UPDATING THE APP LATER

- Frontend: git pull → npm run build → sudo cp -r dist/\* /var/www/html/
- Backend: git pull → npm install (if packages changed) → pm2 restart devtinder-backend
- nginx config changed: sudo nginx -t → sudo systemctl restart nginx

---

## TROUBLESHOOTING (LESSONS LEARNED)

### apt install fails with 404 Not Found

- Ubuntu's package server is updating. Fix:

```bash
sudo apt clean
sudo apt update
sudo apt install nginx -y
```

- Still failing → wait 5–10 minutes and retry.

### Site works in Chrome but not in Brave

- Browsers hide "http://" / "https://" in the address bar. Click the address bar to see the real URL.
- Brave was using https://, but the server has no SSL yet.
    - Port 443 closed → timeout
    - Port 443 open → ERR_CONNECTION_REFUSED
- Pressing Reload repeats the same https:// URL.
- Fix: type the full http://<public-ip> and press Enter, or set up SSL so https works.

### Page refresh gives 404 (but clicking links works)

- Clicking a link: React Router changes the URL in the browser, with no request to nginx ✅
- Refresh: the browser asks nginx for a file with that name → 404 ❌
- Fix: try_files $uri $uri/ /index.html; in location / → nginx -t → restart nginx

### Config changed but nothing happens

- Did you restart nginx? (sudo systemctl restart nginx)
- Test from the server: curl -I http://localhost/<path> → 200 means the server is fine
- Server returns 200 but the browser shows the old error → hard reload (Ctrl + Shift + R)
- Check which config is active: ls -l /etc/nginx/sites-enabled/

### Testing tips

- curl -I http://localhost (on the server) → checks nginx works on the server
- curl -I http://<public-ip> (on your laptop) → checks the server is reachable from outside
- Both 200 but the browser fails → the problem is in the browser (cache, https upgrade, extensions)

---

````markdown
# DNS & CUSTOM DOMAIN SETUP (GODADDY + CLOUDFLARE)

---

## PART 1: UNDERSTANDING THE BASICS

### What is DNS?

- DNS (Domain Name System) is the internet's phone book.
- Computers connect using IP addresses (e.g. 16.179.223.195), but humans remember names (e.g. sakthivelmunusami.in).
- DNS converts a domain name into an IP address.
- Analogy: like the contacts app on a phone. We tap a name; the phone looks up the number.

### Key terms

- Domain name → the website name: sakthivelmunusami.in
- Subdomain → a name under a domain: api.sakthivelmunusami.in, www.sakthivelmunusami.in
- Registrar → the company where we buy and own a domain (GoDaddy, Namecheap, Hostinger)
- DNS provider → the company that stores our domain's DNS records (Cloudflare, GoDaddy)
- Nameservers → tell the internet WHICH DNS provider to ask for our domain
- DNS record → one entry in the DNS phone book
- TTL (Time To Live) → how long DNS results are cached (e.g. 300 seconds)

### Common DNS record types

- A → domain → IPv4 address (sakthivelmunusami.in → 16.179.223.195)
- AAAA → domain → IPv6 address
- CNAME → domain → another domain (www.sakthivelmunusami.in → sakthivelmunusami.in)
- MX → mail server for the domain (for emails)
- TXT → text info (used for verification, e.g. Google, email security)

### Analogy for registrar, nameservers and DNS records

- We buy a house from GoDaddy (registrar).
- GoDaddy says: "For this house's address details, ask Cloudflare" (nameservers).
- Cloudflare's address book says: "sakthivelmunusami.in lives at 16.179.223.195" (A record).

### How a browser finds our site

```
1. User types sakthivelmunusami.in
2. Browser asks DNS: "What is the IP of sakthivelmunusami.in?"
3. Internet checks the nameservers → Cloudflare
4. Cloudflare answers with the IP (A record)
5. Browser connects (through Cloudflare, if proxied) to the EC2 server
6. nginx serves the React app and forwards /api to Node
```

---

## PART 2: BUY THE DOMAIN AND CONNECT CLOUDFLARE

### Why this setup?

- GoDaddy → to buy and own the domain
- Cloudflare → to manage DNS, because it gives (free plan):
    - Free SSL (HTTPS)
    - Fast DNS updates
    - Security: hides the server's real IP, DDoS protection
    - CDN: faster loading of static files

### Step 1: Buy the domain on GoDaddy

- Go to godaddy.com → search for a domain → add to cart → purchase
- Tips:
    - Compare the renewal price, not just the first-year price
    - Skip add-ons (hosting, email, website builder, SSL): we already have EC2, and SSL is free
    - Take domain privacy if it's free (hides personal details from public WHOIS)
- Domain appears in GoDaddy → My Products
- If the domain doesn't appear right after payment: check email for the order confirmation, check Orders/Billing, and don't buy again. Contact support with the transaction ID if needed.

### Step 2: Add the domain to Cloudflare

- Sign up on cloudflare.com
- Click "Add a domain" → enter the domain → Continue
- Choose the Free plan
- Cloudflare scans existing DNS records → Continue
- Cloudflare shows 2 nameservers, for example:
    - ana.ns.cloudflare.com
    - bob.ns.cloudflare.com
- Keep this page open; we need these values in the next step.

### Step 3: Change the nameservers on GoDaddy

- GoDaddy → My Products → the domain → Manage DNS (or Domain Settings)
- Nameservers section → Change Nameservers
- Select "I'll use my own nameservers"
- Remove GoDaddy's nameservers → add the 2 Cloudflare nameservers → Save
- Result: Cloudflare now manages the DNS for this domain, not GoDaddy.

### Step 4: Wait for the nameserver update

- Usually ~15 minutes; sometimes up to 24 hours
- Cloudflare shows the domain as "Active" and sends an email when ready
- Check from a terminal:

```bash
nslookup -type=ns sakthivelmunusami.in
```

- It should show the Cloudflare nameservers.

### Step 5: Add DNS records in Cloudflare

- Cloudflare → the domain → DNS → Records → Add record
- Root domain:
    - Type: A
    - Name: @ (means the root domain)
    - IPv4 address: <EC2 public IP / Elastic IP>
    - Proxy status: Proxied (orange cloud)
- www version:
    - Type: CNAME
    - Name: www
    - Target: sakthivelmunusami.in
    - Proxy status: Proxied
- Proxy status explained:
    - Proxied (orange cloud) → traffic goes through Cloudflare: free SSL, hidden server IP, protection
    - DNS only (grey cloud) → the domain points directly to our server; no Cloudflare features

---

## PART 3: HTTPS (SSL) WITH CLOUDFLARE

### How SSL works with Cloudflare proxy

- With Proxied records, there are two connections:

```
Browser ──(1)──► Cloudflare ──(2)──► EC2 server
```

- (1) Browser ↔ Cloudflare → Cloudflare handles SSL automatically
- (2) Cloudflare ↔ Server → depends on the SSL mode

### SSL modes (Cloudflare → SSL/TLS → Overview)

- Flexible
    - (2) is plain HTTP; the server needs no certificate
    - Easiest, but not fully secure
    - Use only temporarily
- Full (strict) (recommended)
    - HTTPS all the way to the server
    - The server needs a valid certificate:
        - Option A: Cloudflare Origin Certificate (recommended)
        - Option B: Let's Encrypt with Certbot
- ⚠️ Don't combine Flexible mode with an HTTP → HTTPS redirect on the server. Cloudflare connects over HTTP, the server redirects to HTTPS, and it loops forever ("too many redirects").

### Option A: Cloudflare Origin Certificate (recommended)

- Free, valid up to 15 years, no renewal needed
- Trusted only by Cloudflare, which is fine because all traffic comes through Cloudflare (Proxied)

#### Step 1: Create the certificate

- Cloudflare → SSL/TLS → Origin Server → Create Certificate
- Keep the defaults (covers sakthivelmunusami.in and \*.sakthivelmunusami.in) → Create
- Copy both boxes:
    - Origin Certificate
    - Private Key (shown ONLY ONCE; copy it now)

#### Step 2: Save it on the server

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/cert.pem      # paste the Origin Certificate
sudo nano /etc/ssl/cloudflare/key.pem       # paste the Private Key
sudo chmod 600 /etc/ssl/cloudflare/key.pem  # only root can read the key
```

#### Step 3: Configure nginx

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak   # backup
sudo nano /etc/nginx/sites-available/default
```

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sakthivelmunusami.in www.sakthivelmunusami.in;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name sakthivelmunusami.in www.sakthivelmunusami.in;

    ssl_certificate     /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    root /var/www/html;
    index index.html;

    # Frontend: unknown paths → React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend: forward /api requests to Node
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: Cloudflare settings

- SSL/TLS → Overview → mode: Full (strict)
- SSL/TLS → Edge Certificates → Always Use HTTPS: On
- DNS records: Proxied (orange cloud)

### Option B: Let's Encrypt with Certbot (alternative)

- Free, but renews every 90 days (automatic)
- Steps:
    1. Set server_name in nginx → nginx -t → restart
    2. Temporarily switch the DNS records to DNS only (grey cloud), so Let's Encrypt can reach the server directly on port 80
    3. Install and run Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d sakthivelmunusami.in -d www.sakthivelmunusami.in
```

4. Switch the records back to Proxied → SSL mode Full (strict)
5. Test renewal:

```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

### Test

```bash
nslookup sakthivelmunusami.in
```

- Proxied → shows Cloudflare's IPs (not the EC2 IP); this is normal
- DNS only → shows the EC2 IP
- Open https://sakthivelmunusami.in → 🔒 lock should appear

---

## PART 4: AFTER ADDING THE DOMAIN

### 1. Security Group

- Ports 80 (HTTP) and 443 (HTTPS) must be open
- Remove the port 3000 rule if added for testing (nginx handles API traffic)

### 2. Backend CORS

```js
app.use(cors({ origin: "https://sakthivelmunusami.in", credentials: true }));
```

### 3. Secure login cookie (only after HTTPS works)

```js
res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true on the live HTTPS site
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
});
```

```bash
git pull
pm2 restart devtinder-backend
```

### 4. Frontend

- No change needed if API_BASE_URL is "/api" (relative path follows the domain and https automatically).

### 5. Use an Elastic IP

- The EC2 public IP changes when the instance is stopped and started.
- Then the A record points to the wrong server.
- Elastic IP = a fixed public IP:
    - EC2 → Network & Security → Elastic IPs → Allocate → Associate with the instance
    - Update the Cloudflare A record with the Elastic IP
    - Note: free while attached to a running instance; charged if left unattached.

### 6. GoDaddy

- Check auto-renew and the renewal price
- Confirm domain privacy is on

---

## PART 5: TROUBLESHOOTING

- Domain doesn't open the site
    - Nameservers not updated yet → wait; check the domain shows "Active" in Cloudflare
    - A record has the wrong IP → update it
- "Too many redirects"
    - Flexible SSL + server redirect → switch Cloudflare to Full (strict)
- Error 521 (web server is down)
    - nginx not running, or ports 80/443 not open in the Security Group
- Error 525 / 526 (SSL problem)
    - Full (strict) mode but the server has no valid certificate → add the Origin Certificate (or Certbot)
- Certbot fails
    - Records are Proxied → switch to DNS only while running Certbot
    - Port 80 not open → add an HTTP rule in the Security Group
- HTTPS works but login fails
    - CORS origin still http:// or the IP → update to https://<domain> → pm2 restart
- Site stopped working after restarting the instance
    - Public IP changed → update the A record → use an Elastic IP

---

## QUICK REFERENCE

```bash
nslookup <domain>                         # check which IP the domain points to
nslookup -type=ns <domain>                # check nameservers
sudo nginx -t && sudo systemctl restart nginx
sudo certbot --nginx -d <domain>          # (Option B) get SSL certificate
sudo certbot renew --dry-run              # (Option B) test auto-renewal
pm2 restart devtinder-backend             # apply backend changes
```
````

# SENDING EMAIL WITH RESEND (DEVTINDER)

### Setup

- Provider: Resend
- Sender: DevTinder <noreply@sakthivelmunusami.in>
- DNS: Cloudflare (sakthivelmunusami.in)
- Email logic lives in one file (sendEmail.js) → easy to change later

---

## PART 1: DMARC RECORD (CLOUDFLARE)

- Tells email providers (Gmail, Outlook) what to do with emails that fail checks → less spam.
- Cloudflare → DNS → Records → Add record
    - Type: TXT
    - Name: \_dmarc
    - Content: v=DMARC1; p=none; rua=mailto:<your-email>
- p=none → only monitor (safe to start with); rua → where reports are sent (optional)

### Note

- Cloudflare may say "Email cannot reach @sakthivelmunusami.in" (no MX record).
- That's only for RECEIVING email. We only send, so it can be ignored.
- Optional: Cloudflare Email Routing (free) forwards emails sent to our domain to Gmail.

---

## PART 2: RESEND SETUP

### Step 1: Sign up and add the domain

1. Sign up at resend.com
2. Domains → Add Domain → sakthivelmunusami.in
3. DNS Records → Auto configure (signs in to Cloudflare and adds the records automatically)
    - Or Manual setup → copy each record into Cloudflare exactly
4. Records Resend adds:
    - DKIM: TXT → resend.\_domainkey
    - SPF (sending): CNAME → send, rsend (DNS only)
5. Status → Verified (took ~2 minutes)
6. Leave "Enable receiving" off (we only send)

- Existing records (A, www, \_dmarc) are not affected.

### Step 2: Create an API key

- API keys → Create API key
    - Name: devtinder
    - Permission: Sending access (not Full access → limits damage if leaked)
    - Domain: sakthivelmunusami.in
- Copy the key (shown only once)
- Delete unused old keys

### Step 3: .env (local and server)

```
RESEND_API_KEY=re_xxxxxxxx
```

- Never commit .env. Never paste real keys in chats or screenshots.

---

## PART 3: CODE

### Install

```bash
npm install resend dotenv
```

### Load env first (src/app.js)

- dotenv MUST be line 1, before any other require (route/util files read process.env as soon as they're required).

```js
require("dotenv").config();

const express = require("express");
// ...rest of the file
```

- On startup: injected env (N) from .env

### Send email (src/utils/sendEmail.js)

```js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = "DevTinder <noreply@sakthivelmunusami.in>"; // must use the verified domain

const sendMail = async ({ to, subject, html, text }) => {
    const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text: text || subject,
    });

    if (error) throw new Error(error.message);
    return data; // { id: '...' }
};

module.exports = { sendMail };
```

### Use it (src/routes/request.js → /request/send/:status/:toUserId)

```js
const { sendMail } = require("../utils/sendEmail"); // path must match the file name

// ...
await connectionRequest.save();

if (status === "interested") {
    try {
        const emailRes = await sendMail({
            to: toUser.emailId,
            subject: "New connection request on DevTinder",
            html: `<p><b>${req.user.firstName}</b> is interested in connecting with you on DevTinder.</p>`,
            text: `${req.user.firstName} is interested in connecting with you on DevTinder.`,
        });
        console.log("Email sent:", emailRes);
    } catch (err) {
        console.error("Email failed:", err.name, err.message); // email failure never breaks the request
    }
}

res.json({ message: "Connection request sent", data: connectionRequest });
```

- Send the email AFTER saving, inside its own try/catch.
- Don't name the result "res" → it hides Express's res object. Use emailRes.
- The catch variable name must match what's used inside: catch (err) → err.message.

---

## PART 4: TESTING

### Gmail alias trick

- Sign up test users with: sakthiviji019+test1@gmail.com, +test2, +test3...
- Gmail ignores everything after "+" → all emails arrive in the same inbox.
- DevTinder treats each as a separate user.

### Test flow

1. Sign up a new user with a +test alias → log out
2. Log in as another user → Feed → click "Interested" on the new user
3. Check:
    - Terminal: Email sent: { id: '...' }
    - Gmail inbox (also Spam / Promotions)
    - Resend → Emails → status Delivered

### Important

- Test users with fake emails (e.g. kim@gmail.com) are REAL addresses owned by real people → emails really go out. Use your own +aliases.
- Never log passwords or password hashes (e.g. console.log of the user object).

---

## PART 5: DEPLOY TO EC2

```bash
# local
git add -A && git commit -m "Send email with Resend" && git push

# server
cd ~/devTinder
git pull
npm install
nano .env                      # add RESEND_API_KEY (and all other variables)
pm2 restart devtinder-backend
pm2 logs devtinder-backend
```

### .env on the server

- .env is in .gitignore → git pull does NOT bring it. Create it manually on the server.
- PM2 keeps running the old code in memory until restart.
- Rule: create/update .env BEFORE restarting after any pull that adds new process.env variables.
    - Otherwise: DB connection fails / port undefined → site down (502).

---

## TROUBLESHOOTING

- "API key is invalid" → RESEND_API_KEY wrong or not loaded → check .env, restart
- "domain is not verified" → FROM_ADDRESS must use @sakthivelmunusami.in
- No email, no error → request was "ignored" (email only for "interested") or the route didn't run
- Email in spam → check DKIM/SPF verified in Resend and DMARC exists
- process.env values undefined → dotenv missing, not line 1, or .env in the wrong folder
- "Cannot find module" → import path doesn't match the file name (sendEmail vs sendMail)
- "Connection already exists" → use a new +test user

---

## RELATED: WHY CLOUDFLARE "FLEXIBLE" FIXED ERROR 521

- With Cloudflare proxy there are two connections:
    1. Browser ↔ Cloudflare → always HTTPS (Cloudflare's certificate)
    2. Cloudflare ↔ Server → depends on the SSL mode
- Full / Full (strict): Cloudflare connects on port 443 → our nginx had no 443 listener → Error 521.
- Flexible: Cloudflare connects on port 80 → nginx answers → site works.
- Downside: Cloudflare ↔ server traffic isn't encrypted in Flexible mode.
- Proper fix: Cloudflare Origin Certificate on nginx (port 443) → switch to Full (strict).
- Error 521 = Cloudflare is fine, but the server refused / didn't answer.
- Lesson: update nginx config BEFORE deleting a certificate; nginx -t shows the exact error.

# SCHEDULING JOBS (CRON) — DEVTINDER

## What is a cron job?

- A task that runs automatically at a fixed time or interval.
- "cron" comes from Linux, where it schedules commands on servers.
- In Node.js we use the node-cron package to run JS functions on a schedule.

### Common use cases

- Daily summary / reminder emails (our case: pending connection requests)
- Cleaning old data (expired tokens, old logs)
- Generating reports
- Sending birthday or subscription expiry reminders
- Syncing data with another service

### Our use case

- Every morning at 8 AM, email users who received connection requests yesterday and haven't responded.

---

## CRON SYNTAX

```
* * * * *
│ │ │ │ │
│ │ │ │ └── Day of week (0–7, Sun = 0 or 7)
│ │ │ └──── Month (1–12)
│ │ └────── Day of month (1–31)
│ └──────── Hour (0–23)
└────────── Minute (0–59)
```

- node-cron also supports an optional 6th field at the start for seconds.

### Examples

- `* * * * *` → every minute (testing only)
- `*/5 * * * *` → every 5 minutes
- `0 * * * *` → every hour (at minute 0)
- `0 8 * * *` → every day at 8:00 AM
- `30 21 * * *` → every day at 9:30 PM
- `0 9 * * 1` → every Monday at 9:00 AM
- `0 0 1 * *` → 1st of every month at midnight
- `0 8 * * 1-5` → weekdays at 8:00 AM

### Symbols

- `*` → every value
- `*/n` → every n units
- `a-b` → range (1-5 = Mon to Fri)
- `a,b` → list (1,15 = 1st and 15th)

- Tool to check expressions: crontab.guru

---

## SETUP

### Install

```bash
npm install node-cron date-fns
```

- node-cron → schedules the job
- date-fns → date helpers (yesterday, start of day, end of day)

### Create the job file (src/utils/cronJobs.js)

```js
const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequest = require("../models/connectionRequest");
const { sendMail } = require("./sendEmail");

// 8:00 AM every day, India time
cron.schedule(
    "0 8 * * *",
    async () => {
        try {
            // 1. Yesterday's time range
            const yesterday = subDays(new Date(), 1);
            const start = startOfDay(yesterday);
            const end = endOfDay(yesterday);

            // 2. Find requests sent yesterday that are still pending
            const pendingRequests = await ConnectionRequest.find({
                status: "interested",
                createdAt: { $gte: start, $lte: end },
            }).populate("toUserId", "firstName emailId"); // only needed fields

            // 3. Unique email list (one email per user, skip deleted users)
            const emailIds = [
                ...new Set(
                    pendingRequests
                        .map((item) => item.toUserId?.emailId)
                        .filter(Boolean),
                ),
            ];

            console.log(
                `[cron] ${emailIds.length} users with pending requests`,
            );

            // 4. Send emails one by one
            for (const email of emailIds) {
                try {
                    await sendMail({
                        to: email,
                        subject:
                            "You have pending connection requests on DevTinder",
                        html: `<p>You have new connection requests waiting on DevTinder.</p>
                   <p><a href="https://sakthivelmunusami.in/requests">Review them now</a></p>`,
                        text: "You have new connection requests waiting on DevTinder: https://sakthivelmunusami.in/requests",
                    });
                    console.log(`[cron] Email sent to ${email}`);
                } catch (err) {
                    console.error(
                        `[cron] Email failed for ${email}:`,
                        err.message,
                    );
                }
            }
        } catch (err) {
            console.error("[cron] Job failed:", err.message);
        }
    },
    { timezone: "Asia/Kolkata" },
);
```

### Start it (src/app.js)

- Just requiring the file starts the schedule:

```js
require("dotenv").config();
// ...other requires
require("./utils/cronJobs");
```

- The job runs inside the same Node process as the server.

---

## IMPORTANT RULES

### 1. populate paths are space-separated

```js
.populate("fromUserId toUserId");   // ✅
.populate("fromUserId, toUserId");  // ❌ error: Cannot populate path `fromUserId,`
```

- Second argument selects fields: `.populate("toUserId", "firstName emailId")`
- Never load passwords or other sensitive fields when not needed.

### 2. Don't use forEach with async

```js
emailIds.forEach(async (email) => { await sendMail(...) });  // ❌ doesn't wait, errors lost
for (const email of emailIds) { await sendMail(...) }        // ✅ one by one, waits
```

- forEach fires everything at once → can hit the email provider's rate limit.

### 3. Always handle errors

- Wrap the whole job in try/catch.
- Wrap each email in its own try/catch → one failure doesn't stop the rest.
- Never leave an empty catch (e) {} → failures become invisible.

### 4. Guard against null

- If a user was deleted, populate returns null → item.toUserId.emailId crashes.
- Use optional chaining: item.toUserId?.emailId, then .filter(Boolean).

### 5. Avoid duplicates

- Use new Set(...) → a user with 5 requests gets one email, not five.

### 6. Time zone

- EC2 servers run in UTC by default.
- Without a timezone, "0 8 \* \* \*" runs at 8 AM UTC = 1:30 PM IST.
- Fix: pass { timezone: "Asia/Kolkata" } to cron.schedule.
- Note: date-fns startOfDay/endOfDay use the server's time zone (UTC on EC2), so "yesterday" is a UTC day.

---

## TESTING SAFELY

- Temporarily change the schedule to "\* \* \* \* \*" (every minute) to see it run.
- Make sure yesterday's requests only went to test users you own (Gmail +aliases), because real emails are sent every minute.
- Watch the terminal for [cron] logs.
- Switch back to "0 8 \* \* \*" BEFORE committing and pushing.
- Never deploy an every-minute job that sends emails.

---

## DEPLOYMENT NOTES

- The job runs as long as the Node process runs (PM2 keeps it alive and restarts it).
- After code changes: git pull → npm install → pm2 restart devtinder-backend.
- PM2 cluster mode / multiple instances → each instance runs the job → duplicate emails. Run cron in only ONE instance (or a separate process).
- If the server is down at 8 AM, that day's job is skipped (node-cron doesn't catch up missed runs).
- Check logs: pm2 logs devtinder-backend → look for [cron] lines.

---

## WHEN TO USE SOMETHING BIGGER

- node-cron is great for simple jobs in a single server.
- For many emails / retries / multiple servers, use a job queue:
    - BullMQ (Node + Redis) → queue jobs, retries, rate limiting
    - AWS EventBridge Scheduler / Lambda → scheduled jobs without keeping a server running
- Typical pattern: cron finds the users → adds one job per email to a queue → workers send emails with retries.

---

## TROUBLESHOOTING

- "Cannot populate path `fromUserId,`" → comma in populate → use spaces
- Job runs at the wrong time → set timezone: "Asia/Kolkata"
- Emails sent every minute → schedule left as "\* \* \* \* \*"
- No emails, no logs → cronJobs.js not required in app.js
- "Cannot read properties of null (reading 'emailId')" → deleted user → use ?. and filter(Boolean)
- Duplicate emails → multiple PM2 instances, or no Set() for unique emails
