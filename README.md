## DESCRIPTION

This is MEVN(Mongo Database, Express, VueJS, Node) stack project. you will need a cloud server for deploying this project. Below is defined technology. now we are using this vueJS(4.5.11) version

- Mongo database.
- Express is a node framework.
- vueJs is javascript library for user interface.
- node is server side javascript API language.

## INSTALL BELOW DEPENDENCIES AS PER SOFTWARE REQUIREMENT.

- follow for Mongodb install(https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-18-04-source)
- npm install -g @vue/cli@4.5.11
- install node as per your system like(ubuntu, windows).
- node need to express It will be cover with node.
- npm install -g nodemon

## DEVELOPMENT PROCESS

- you can use below process for ahead development.

## => TO RUN API FOR DEVELOPMENT

- cd log-viewers/node-api/
- npm i
- nodemon

## TO RUN UI FOR DEVELOPMENT.

- cd log-viewers/vue-js-ui/
- npm i
- npm run serve

## TO BUILD UI AFTER FINISHED DEVELOPMENT.

- cd log-viewers/vue-js-ui/
- While build Ui you will have to need change Vue.config.baseUrl in log-viewers/vue-js-ui/src/main.js as per development and production also we have defined both url. you can use as per process like(Production, Development).
- npm run build => It will build ui in log-viewers/node-api/public folder. you can see package.json(scripts) in log-viewers/vue-js-ui/ folder.

## HERE IS SOME SAMPLE LOGS AND PATTERNS AS PER SOFTWARE REQUIREMENT.

Demo video url : https://www.loom.com/share/ac927e768f0f4b1a8a6702c1a8e28d17

1. (LOCAL FILE) => You can see sample logs and patterns as well in log-viewers/vue-js-ui/public folder. there will be available some sample logs and patterns.

2. (REMOTE FILE) Use below remote url for remote file testing with remote configuration.
   => Just like your remote machine url with log file: http://www.example.com/Log-Mon-6.txt
   => Just like your remote machine url with log pattern file: http://www.example.com/Log-Mon-6-pattern.txt

## BELOW IS DEFINED MONGO DATABASE FILE. YOU CAN SETUP AS PER INSTALLED MONGODB.

- Database Config file path => log-viewers/node-api/core/db.js
- You will need to changed this path on cloud machine for cloud mongo database.
- No need to change in local system.

## WE CAN DEFINE ADMIN_USERS_LIMIT IN log-viewers/node-api/.env WHATEVER YOU WANT TO GIVE A LIMIT TO ADMIN THEIR UNDER USERS.
