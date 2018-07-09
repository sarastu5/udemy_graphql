const graphql = require('graphql');
const axios = require('axios');

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,
	GraphQLList,
	GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: () => ({
		id: {type: GraphQLString},
		name: {type: GraphQLString},
		description: {type: GraphQLString},
		users: {
			type: new GraphQLList(UserType), //lista!
			resolve(parentValue, args) { //parentValue on ko. companyn instanssi
				return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
				.then(res => res.data)
			}
		}
	})
});

const UserType = new GraphQLObjectType({ // kertoo, miltä userobject näyttää/mitä sen tulisi sisältää
	name: 'User',
	fields: () => ({
		id: {type: GraphQLString},
		firstName: {type: GraphQLString},
		age: {type: GraphQLInt},
		company: {
			type: CompanyType,
			resolve(parentValue, args) {
				axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
					.then(res => res.data);
			}
		}
	})
});

//RootQuery on objekti
const RootQuery = new GraphQLObjectType({ //osoittaa tiettyyn recordiin siitä kaikesta datasta, joka meillä on käytettävissä
	name: 'RootQueryType',
	fields: { //objekti
		user: { //objekti
			type: UserType,
			args: {id: {type: GraphQLString}}, //id pitää olla string
			//tärkein osa RootQuerya:
			resolve(parentValue, args) { //hakee ja palauttaa tiedon oikeasti raakana javascript-objektina
				return axios.get(`http://localhost:3000/users/${args.id}`) //tee kysely
				.then(resp => resp.data);
			}
		},
		company: {
			type: CompanyType,
			args: {id: {type: GraphQLString}},
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${args.id}`)
				.then(resp => resp.data);
			}		
		}
	}
});

const mutation = new GraphQLObjectType ({
	name: 'Mutation',
	fields: {
		addUser: {
			type: UserType,
			args: { //objekti
				firstName: {type: new GraphQLNonNull(GraphQLString)}, //ei saa olla tyhjä
				age: {type: new GraphQLNonNull(GraphQLInt)}, //ei saa olla tyhjä
				companyId: {type: GraphQLString}
			},
			resolve(parentValue, {firstName, age}) {
				return axios.post(`http://localhost:3000/users`, {firstName, age})
				.then(res => res.data);
			}
		},
		deleteUser: {
			type: UserType,
			args: {
				id: {type: new GraphQLNonNull(GraphQLString)}
			},
			resolve(parentValue, {id}) {
				return axios.delete(`http://localhost:3000/users/${id}`)
				.then(res => res.data);
			}
		},
		updateUser: {
			type: UserType,
			args: {
				id: {type: new GraphQLNonNull(GraphQLString)},
				firstName: {type: GraphQLString},
				age: {type: GraphQLInt},
				companyId: {type: GraphQLString}
			},
			resolve(parentValue, args) {
				return axios.patch(`http://localhost:3000/users/${args.id}`, args)
				.then(res => res.data);
			}
		}
	}
});

module.exports = new GraphQLSchema ({
	query: RootQuery,
	mutation
});