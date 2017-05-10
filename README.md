# Info

This is the front end interface for [tcea-inventory-server](https://github.com/korylprince/tcea-inventory-server), an inventory system the Tech Team for the annual [TCEA](tcea.org) convention uses.

# Install

```
git clone https://github.com/korylprince/tcea-inventory-client.git
cd tcea-inventory-client
git submodule init
git submodule update
npm install
```

# Development

```
API_BASE="<api_location>" npm run dev
```

# Build for Production

```
API_BASE="<api_location>" npm run build-prod
```

# Linting

```
npm run lint
```

# Libraries

(Of particular note)

* [vue](https://vuejs.org/)
* [vue-material](https://github.com/marcosmoura/vue-material)
* [vee-validate](https://github.com/logaretm/vee-validate)

See package.json for all dependencies.
