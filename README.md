# Lazenie Challenge

## Task Documentation

This documentation explains how you can get the project up and running with minnimal effort.

### Steps to run the application

1. Clone the repository on your pc
2. cd in to the working directory of the project, and follow the instructions below

**Running application using docker 3a.**

**Requirements:** Docker must be installed and running.

**3a (i)** run:

```sh
docker compose up
```

**NB:** make sure you are inside the projcet folder.

This might take a while depending on the speed of your network

once complete you will see a log similar to

```sh
LOG [Bootstrap] Server running on port http://localhost:3000
```

The Swagger documentation for all the endpoints can be accessed on the browser via [localhost:3000/api](http://localhost:3000/api 'localhost:3000/api')

**Running using npm or yarn 3b.**

**Requirements:** Node, npm or yarn should be installed locally.

I added the versions I used for the project so that when you encounter any issue using your own versions you can revert to the versions shared here to verify If it is a versions issue.

| Tool | version                                                            |
| ---- | ------------------------------------------------------------------ |
| Node | [v14.16.1](https://nodejs.org/en/)                                 |
| NPM  | [7.11.1](https://nodejs.org/en/)                                   |
| Yarn | [1.22.10](https://classic.yarnpkg.com/en/docs/install/#mac-stable) |

**3b (i) Install dependencies.**
run (for yarn)

```sh
Yarn
```

or (for npm)

```sh
npm install
```

**3b (i) Run the application**
run

```sh
yarn start
```

or

```sh
npm start
```

**4. Steps to run test**

**To run all the integration or end to end test**
run

```sh
Yarn test:e2e
```

or

```sh
npm run test:e2e
```

**For unit tests**
run

```sh
yarn test
```

or

```sh
npm test
```

#### Final notes

In as much as this is an assessment I would like to get a sincere feedback about anything you think I should do better.

This will go a long way in helping me get better at what I do.

I am entirely open to feedbacks.

Thank you.

Enjoy!
