# LDApp

A JavaScript Linked Data stack/stub.

The ISWC 2014 paper [LDApp - A JavaScript Linked Data Stack](http://ceur-ws.org/Vol-1268/paper13.pdf) is a good starting
point to get an overview.

## Quick Start Guide

### Install using npm

- install using npm `npm install ldapp`
- change folder `cd node_modules/ldapp`
- start LDApp using npm `npm start` or node `node ldapp.js`

### Install from sources

- clone git repository `git clone https://github.com/bergos/ldapp.git`
- change to LDApp folder `cd ldapp`
- install dependencies and run build script using npm `npm install`
- start LDApp using npm `npm start` or node `node ldapp.js`

### Install WebID certificate 

- import the WebID PKCS12 certificate/key (`data/webid.p12`) in your browser (password `test`)

### URLs

Now you can access the following URLs in your browser.

- WebID profile: `https://localhost:8443/card`
- raw blog data: `https://localhost:8443/blog`
- blog application: `https://localhost:8443/blog.html`

RDF graph URLs (the WebID profile and the raw blog data) support content negotiation.
By default `application/ld+json`, `text/html` and `text/turtle` will be accepted.

Example: Fetch the profile with curl using WebID authentication:
`curl -v -k -E data/webid.pem -H 'Accept: text/turtle' https://localhost:8443/card`

## Advanced Configuration

### Persistence Triplestore

The default configuration of LDApp uses a in memory triplestore implementation.
You can change this with the property `config.store` in `data/config.js`.
There is already a commented example configuration for a SPARQL store.
See the RDF-Ext documentation for other triplestore implementations.

## Developer Guide

### Folder Structure

- `data` configuration, initial graph data and cert+key files
- `lib` express modules with Promise API
 - `utils` util classes and functions for modules
- `public` static files + HTML5 applications

### Blog Example App

LDApp contains a simple blog example built with React, RDF-JSONify and RDF-Ext.
Everything is rendered in the browser.
Only static files are used.

#### blog.html

Just a simple Bootstrap HTML template.
The `blog-header` DIV block is used by React to insert the blog name and description.
The `blog-posts` DIV block is used by React to insert the blog posts.

#### js/blog.js

The JavaScript file which contains the app itself.
The view and controller logic is implemented in React components.
RDF-JSONify generated/consumed JSON-LD objects are used for the model.

#### js/identity.js

Provides a Mozilla Persona like API to access the authentication assertion.
The standard API function `window.navigator.id.get` returns the authentication assertion via callback.
The `window.navigator.id.get.agent` function returns the agent IRI via Promise.