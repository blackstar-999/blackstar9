#!/usr/bin/env bash
mkdir -p docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem \
  -subj "/C=UZ/ST=Tashkent/L=Tashkent/O=School/CN=localhost"
echo "✅ SSL certificate generated in docker/nginx/ssl/"
