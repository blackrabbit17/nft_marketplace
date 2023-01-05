
# PactumX NFT Marketplace - Frontend Code

## Getting Started

1) Check out the code
```
git@github.com:PactumX/nft_marketplace_frontend.git
```

2) Install depdendencies
```
npm install
```

3) Run development server
```
npm start
```

Now an auto-reloading development server will be running on localhost:3000

By default, the frontend code talks to the production API backend server, if you need to change this, edit
src/index.js and change "axios.defaults.baseURL" to point to your local django backend server (typically
http://localhost:8000/)

## Making a build

1) Compile a production build
```
npm run build
```

2) This will create a folder called "dist" which contains the production build, this needs to be copied to the backend repo
in the marketplace/web/templates and marketplace/ui folders.

If the directory layout of your frontend and backend code is like this:

```
marketplace/
nft_marketplace_frontend/
```

Where "marketplace" is the backend repo,
and "nft_marketplace_frontend" is the frontend repo,

Then the required commands to deploy the frontend code is:

```
#!/bin/bash

rm -rf ./marketplace/marketplace/web/templates/index.html
rm -rf ./marketplace/marketplace/ui/*

cp -r nft_marketplace_frontend/build/index.html ./marketplace/marketplace/web/templates
cp -r nft_marketplace_frontend/build/static/* ./marketplace/marketplace/ui
```
Now commit the code to the backend repo main branch, by convention with the commit message "Build" or "Build vX.YY" where X.YY are version numbers
