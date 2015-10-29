# OSF.io v2 API Client — Javascript Edition

## Usage
Download and include the `dist/osfclient.min.js` in your project and follow the examples below.

## Examples

### Setup the client
```js
var client = new osfClient(
	'https://api.osf.io/v2/',
	{
		username: 'cosLogin@cos.io',
		password: 'password'
	}
);
```

### Create a node
```js
var nodeData = {
  title: 'api test node',
  description: 'very description, much words',
  category: 'project'
};
var newNode;
client.nodes().create(nodeData)
	.then(
		function(response) {
			newNode = response;
		}
	);
```

### Update a node
```js
var updatedNode;
var nodeId = 'xyz123';
client.nodes(nodeId).update({title: 'A New Title'})
	.then(
		function(response) {
			updatedNode = resp;
		}
	);
```

### Get an array of nodes
```js
var arrayOfNodes;
client.nodes().get()
	.then(
		function(response) {
			arrayOfNodes = response;
		}
	);
```

### Get an array of public nodes
```js
var arrayOfPublicNodes;
client.nodes().get({ query: 'filter[public]': true })
	.then(
		function(response) {
			arrayOfPublicNodes = response;
		}
	);
```

### Get a specific node
```js
var myNodeId = 'xyz123';
var myNode;
client.nodes(myNodeId).get()
	.then(
		function(response) {
			myNode = response;
		}
	);
```

### Update a user
```js
var userId = '123xyz';
var updatedUser;
client.users(userId).update({given_name: 'Bob'})
	.then(
		function(response) {
			updatedUser = response;
		}
	);
```

### Get the nodes that belong to a user
```js
var userId = '123xyz';
var user;
var nodes;
client.users(userId).get()
	.then(
		function(response) {
			user = response;
		}
	);
user.data.magicRelationships.get()
	.then(
		function(response) {
			nodes = response;
		}
	);
```

## Development
The client is written in ES6 and transpiled to ES5 using [Babel](https://babeljs.io/docs/learn-es2015/). It's http request handling is build ontop of [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch) so it is compatible with node and the browser.

- Checkout the repository
- Install dependencies: `npm install`
- Tests: `npm run test`
- Lint: `npm run lint`
- Watchify: `npm run watch`
- Build unminified: `npm run build`
- Build distribution: `npm run build-dist`

#### Running tests
The tests require an authenticated user. They also point to the OSF running on your local machine. Both the user credentials and the base url of the API are located in `test/common.es6.js`. Please change these to match your environment.

#### Roadmap
- Try to remove isomorphic-fetch because it's huge
- Rename magicRelationships to something else
- Add more file abilities
- Hydrate "links" section as well as relationships
- Use ES6 generators for pagination
- More unit tests, specifically focusing on un-happy path scenerios
