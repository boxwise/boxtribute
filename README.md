# Boxwise react client 
This is the FE repo for the new mobile web-app of Boxwise. It goes with the BE Flask app at [boxwise-flask](https://github.com/boxwise/boxwise-flask).
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Preparation for Installation

* Get in touch with the [Boxwise team](mailto:hello@boxwise.co) to get access to the Auth0 development tenant.
* [install yarn](https://classic.yarnpkg.com/en/docs/install)

## How do I get set up?

1. Create a .env-file with the environment variables. Therefore, copy/paste `example.env` and rename it `.env`

2. Enter the credentials from Auth0 into the `.env`-file. The following three variables need to be added. In the brackets there is a description of the location in the Auth0 dashboard. Let us know if you run into problems.

        REACT_APP_AUTH0_DOMAIN (Applications --> <your application> --> Settings --> Basic Information --> Domain)
        REACT_APP_AUTH0_CLIENT_ID (Applications --> <your application> --> Settings --> Basic Information --> Client ID)
        REACT_APP_AUTH0_AUDIENCE (Applications --> APIs --> API Audience)

3. To start the development server, run

        yarn start

4. Start the [Flask backend](https://github.com/boxwise/boxwise-flask) for the full development environment.

## Development Database Seed 

Boxwise is an application for organisations who run distribution/warehouses in multiple bases.
Therefore the development database seed holds at least two organisations and three bases:
* Organisation `BoxAid` working on `Lesvos` and
* Organisation `BoxCare` working on `Samos` and in `Thessaloniki`.

Each organisation has at least 3 user groups with different access levels in the app:
* `Head of Operations` (Admin access)
* `Coordinator`
* `Volunteer`

For each of these three user groups of each of the two organisations we created an login credential for development purposes:
* `dev_headofops@boxaid.org`
* `dev_coordinator@boxaid.org`
* `dev_volunteer@boxaid.org`
* `dev_headofops@boxcare.org`
* `dev_coordinator@boxcare.org`
* `dev_volunteer@boxcare.org`

The password of all of these users is `password`.


## All available Create-React-Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

## License

See the LICENSE file for license rights and limitations (Apache 2.0).
