'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Lib = require('..');
const Schemas = require('./schemas');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const connString = 'postgres://postgres:postgres@localhost:5432/postgres';

describe('lib', () => {

    it('exports.test create table', async () => {


        const bookshelf = Lib.initConns(connString).bookshelves.default;

        const profileModel = Object.assign({}, Schemas[0]);
        const anotherModel = Object.assign({}, Schemas[1]);
        const profileModel2 = Object.assign({}, Schemas[2]);

        const soloTable = Lib.loadModel(anotherModel, bookshelf);


        const hasTable = async (model) => {

            const hasTable = await bookshelf.knex.schema.hasTable(model.protoProps.tableName);

            await bookshelf.knex.schema.dropTableIfExists(model.protoProps.tableName);

            return hasTable;
        };

        await hasTable(profileModel);
        await Lib.createTable(profileModel, bookshelf);

        await hasTable(anotherModel);
        await Lib.createTable(anotherModel,bookshelf);

        await hasTable(profileModel2);
        await Lib.createTable(profileModel2,bookshelf);


        await soloTable.do.create({ label: 'sample data are here' });

        await soloTable.do.create({ label: 'sample data are here 2 here' });

        //expect(await hasTable(profileModel)).to.be.true();

    });

});
