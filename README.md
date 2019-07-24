## Instructions
Out of the box are going all the needed toolset to write code in a unite style: .eslintrc.json && prettierrc. To enable code prettifying you need to install [Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). We assume you use VS Code as an IDE.

### In a nutshell about the default scripts in package.json:
* yarn build - uses [Rollup.js](https://rollupjs.org/guide/en/) with config file: rollup.config.js in a root folder directory. It takes our entry point: ./src/app.js and converts our application to common js syntax into ./dist/index.js;
* yarn eslint-test - uses to check source code for available syntax errors. Due to we use [husky](https://www.npmjs.com/package/husky) with git hooks: "pre-commit" & "pre-push". It means each time we use git push or git commit - will run the scrips pointed in package.json, husky configuration. In our case it's eslint-test script;
* yarn live - using in development mode. It uses [nodemon](https://www.npmjs.com/package/nodemon) with it's configuration file - nodemon.json, which is in the root folder, to watch the command and reload it on changes, - live reloading;
* yarn start - uses [forever](https://www.npmjs.com/package/forever) tool for which takes care about our process. In case when process crashes on error, it would raise it back. Forever is also useful thing to process management. Preferable to have installed it on your vps server globally. Due to you could in any place you're call ```forever list``` to watch all the process it serves and status of them. You're free to stop any of the running processes by runing the command: ```forever stop <process_name>```;
* yarn stop - stops your application throught mentioned above forever tool.

** In cases you work with locally installed packages, you should call them through folder ```./node_modules/.bin/<package_name>```.

### File structure
![Resource is not available](https://s3.eu-central-1.amazonaws.com/bots-business/Screen+Shot+2019-05-29+at+16.10.47.png "Default file structure")

dist - folder where is located our built code and which is executable on production;

src - source code folder. Where we write our code;

  -> helpers // Consists of helpers like markup.js, logger, etc;

  -> index.js // Here we gathering our helpers as an entry point for halpers importing/exporting;

app.js - application entry point;

.eslintrc.json - configuration file for eslint;

.gitignore - name speaks for itself;

nodemon.json - configuration file for nodemon tool (described above);

rollup.config.js - configuration file for rollup.js (also described above);