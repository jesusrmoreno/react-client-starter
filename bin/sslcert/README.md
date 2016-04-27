This directory contains self-signed root CA certificate and a server certificate signed with that root CA cert.

The server is signed to serve from the domain `local.server.com`.  So you need to add an entry to your machine's
`hosts` file to map this DNS to your localhost.

# How to regenerate these certificates?

I followed this guide: https://github.com/coolaj86/node-ssl-root-cas/wiki/Painless-Self-Signed-Certificates-in-node.js

Here's a *Windows Git Bash* set of commands.  Note this is slightly different than Normal Unix commands due to some
[funniness with MinGW/MSYS](http://stackoverflow.com/a/31990313/674326)

```bash
mkdir -p server client all
openssl genrsa -out all/private-root-ca.key.pem 2048
openssl req -x509 -new -nodes -key all/private-root-ca.key.pem -days 1024 -out all/private-root-ca.crt.pem -subj "//C=US\ST=Utah\
L=Provo\O=ACME Signing Authority Inc\CN=example.com"
openssl genrsa -out all/server.key.pem 2048
openssl req -new -key all/server.key.pem -out all/server.csr.pem -subj "//C=US\ST=Utah\L=Provo\O=ACME Tech Inc\CN=local.server.co
m"
openssl x509 -req -in all/server.csr.pem -CA all/private-root-ca.crt.pem -CAkey all/private-root-ca.key.pem -CAcreateserial -out
all/server.crt.pem -days 500
```
