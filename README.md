# Tip Finder

[![Node js](https://nodejs.org/static/images/logos/nodejs-new-pantone-black.ai)](https://nodejs.org/en/)

The TipFinder is a guided selling tool that helps customers to get a fitting “non-brand”-tip for their “brand” pipette

## Features

- SFTP connection
- JSON files parser
- Add tipfinder Data into Elastic Search product index

## Requirements

- [Node JS] - >= 12
- [Elastic search] - 6.8

## Installation

Clone the repository

```sh
git clone git@glab.lemundo.de:lempm/starlab/tipfinder.git
```

Configure the environment - Tipfinder root directory
Change the environment variable "NODE_ENV" to development, test, stage or lie
```sh
cp .env.template .env
vim .env
```

Rename the file .npmrc to bck.npmrc
This file is needed only if you want to create a node js package and push it into gitlab 
```sh
mv .npmrc bck.npmrc
```

Install all the packages
```sh
npm install
```

Configure your environment file
- There's the default file and you can override any variable on that file using your environment file
- Change all the needed variables according to the system
```sh
cd src/config
vim environment (development.json, test.json, stage.json, live.json)
```
Go to the source of the project and run
```sh
npm start
```
