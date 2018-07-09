const express = require('express');
const expressGraphQL = require('express-graphql'); 
const schema = require('./schema/schema');

const app = express();

app.use('/graphql', expressGraphQL({ // pakottaa app:n käyttämään GraphQL:ää, kun selaimessa on /graphql
	schema, //sama kuin schema: schema
	graphiql: true
}));

app.listen(4000, () => { // portti 4000 localhostissa?
	console.log('Listening');
}); // alustaa express-servin tai jotain