# Setting Up CI/CD Pipeline with SSL Certificates Using Certbot and Docker
**Prerequisites**
- Basic understanding of Docker, Docker Compose, and Nginx.
- GitHub account (for GitHub Actions).
- A domain name pointing to your server IP.
- Ubuntu server with Docker and Docker Compose installed.
See (Jaamat-IaaC repository)

## Generate the SSL Certificate
###  Create a simple config file to handle http request and redirect it to https
For now, nothing will be shown because nginx keeps redirecting you to a 443 port that's not handled by nginx yet. But everything is fine. We only want Certbot to be able to authenticate our server.
```sh
server {
    listen 80;
    server_name yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```
### Generate the certificate
Certbot will write its files into ./certbot/www/ and nginx will serve them on port 80 to every user asking for `/.well-know/acme-challenge/.` That's how Certbot can authenticate our server.
Note that for Certbot we used `:rw` which stands for "read and write" at the end of the volume declaration. If you don't, it won't be able to write into the folder and authentication will fail.
You can now test that everything is working by running `docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --dry-run -d example.org.` You should get a success message like "The dry run was successful".

Now that we can create certificates for the server, we want to use them in nginx to handle secure connections with end users' browsers.

Certbot create the certificates in the `/etc/letsencrypt/` folder. Same principle as for the webroot, we'll use volumes to share the files between containers.
Restart your container using docker compose restart. Nginx should now have access to the folder where Certbot creates certificates.
However, this folder is empty right now. Re-run Certbot without the --dry-run flag to fill the folder with certificates:
`$ docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d example.org`
### Add HTTPS handler
Since we have those certificates, the piece left is the 443 configuration on nginx.

```sh
server {
    listen 80;
    listen [::]:80;

    server_name example.org www.example.org;
    server_tokens off;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://example.org$request_uri;
    }
}

server {
    listen 443 default_server ssl http2;
    listen [::]:443 ssl http2;

    server_name example.org;

    ssl_certificate /etc/nginx/ssl/live/example.org/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/example.org/privkey.pem;
    
     location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Reloading the nginx server  now will make it able to handle secure connection using HTTPS. Nginx is using the certificates and private keys from the Certbot volumes.
```sh
docker compose restart nginx
# or
docker compose down nginx
docker compose up -d nginx
```
### Renewing the certificates
One small issue you can have with Certbot and Let's Encrypt is that the certificates last only 3 months. You will regularly need to renew the certificates you use if you don't want people to get blocked by an ugly and scary message on their browser.

But since we have this Docker environment in place, it is easier than ever to renew the Let's Encrypt certificates!

`$ docker compose run --rm certbot renew --force-renewal`
This small "renew" command is enough to let your system work as expected. You just have to run it once every three months. 
The `--force-renewal` flag forces Certbot to regenerate the certificate even if it isn’t close to expiration. This is useful if you need an immediate refresh.
You could even automate this process…
#### Automated renewal with crontab
The last step is to automatically renew the certificates before they run out. A certificate has a lifetime of 90 days, and it is recommended to update them after a timespan of 60 days. Therefore, we need to rerun our certbot container every 60 days to renew the certificates. I will accomplish this by using crontab.
A crontab can be created on linux systems by running:
```sh
crontab -e
```
And adding a line with the following structure:
```sh
0 5 1 */2 * /usr/bin/docker-compose -f /home/ubuntu/app/docker-compose.yml run --rm certbot renew && /usr/bin/docker-compose -f /home/ubuntu/app/docker-compose.yml exec nginx nginx -s reload
```
The command means: Run docker-compose up -d at 5 am on the first day every 2nd month and reload nginx server.

After implementing this guide, you should have an application behind a reverse proxy accessible via the HTTPS protocol!
### Using Certbot to List Expiry Dates
To check the expiration date of a Certbot SSL certificate within a Docker Compose setup, you can run a one-time command with Docker to view the expiration date from within the certbot container.
Here’s how:
```sh
docker compose run --rm certbot certificates
```
output:
```sh
Creating app_certbot_run ... done
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: api.dev.jaamat.exchange
    Serial Number: 4292eccc8e1cec8b0606bced2d6249c2106
    Key Type: ECDSA
    Domains: api.dev.jaamat.exchange
    Expiry Date: 2025-02-06 23:54:05+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/api.dev.jaamat.exchange/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/api.dev.jaamat.exchange/privkey.pem
```