'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Lib = require('..');
const Methods = require('./methods');
const Schemas = require('./schemas');
const Testlib = require('./testlib');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const connString = 'postgres://postgres:postgres@localhost:5432/postgres';

const timeout = (ms) => {

    return new Promise((res) => {

        return setTimeout(res, ms);
    });
};

describe('lib', () => {




    it('exports.createTable', async () => {

        const knex = Lib.initConns(connString).knexes.default;

        const Model1 = Object.assign({}, Schemas[0]);
        const Model2 = Object.assign({}, Schemas[1]);

        const hasTable = async (model) => {

            const hasTable = await knex.schema.hasTable(model.protoProps.tableName);

            await knex.schema.dropTableIfExists(model.protoProps.tableName);

            return hasTable;
        };

        await hasTable(Model1);
        await hasTable(Model2);

        await Lib.createTable(Model1, knex);
        await Lib.createTable(Model1, knex);


    });



});
