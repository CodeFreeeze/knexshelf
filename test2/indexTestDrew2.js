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

    it('exports.loadModel', async () => {

        const bookshelf = Lib.initConns(connString).bookshelves.default;

        const Model0 = Object.assign({}, Schemas[0]);
        const Model1 = Object.assign({}, Schemas[0]);
        const Model3 = Object.assign({}, Schemas[2]);
        const Model4 = Object.assign({}, Schemas[3]);
        const Model5 = Object.assign({}, Schemas[4]);
        const Model6 = Object.assign({}, Schemas[5]);

        await bookshelf.knex.schema.dropTableIfExists(Model4.protoProps.tableName);
        await bookshelf.knex.schema.dropTableIfExists(Model3.protoProps.tableName);
        await bookshelf.knex.schema.dropTableIfExists(Model1.protoProps.tableName);
        await bookshelf.knex.schema.dropTableIfExists(Model5.protoProps.tableName);
        await bookshelf.knex.schema.dropTableIfExists(Model6.protoProps.tableName);

        await Lib.createTable(Model3, bookshelf);
        await Lib.createTable(Model4, bookshelf);
        await Lib.createTable(Model1, bookshelf);
        await Lib.createTable(Model5, bookshelf);
        await Lib.createTable(Model6, bookshelf);

        const soloTable = Lib.loadModel(Model1, bookshelf);
        const bookModel = Lib.loadModel(Model4, bookshelf);
        const authorModel = Lib.loadModel(Model3, bookshelf);
        const updatedModel = Lib.loadModel(Model6, bookshelf);
        const formatterModel = Lib.loadModel(Model5, bookshelf);

        await updatedModel.do.create({ label: 'updateme' });

        expect(authorModel.do.testing()).to.equal('author');

        Model0.name = 'soloTablex';
        Model0.bookshelf = bookshelf;

        Lib.loadModel(Model0);

        let res;

        expect(await soloTable.do.browse({
            perPage: 2,
            page: 2
        })).to.equal([]);

        expect(await soloTable.do.browse({
            perPage: 2,
            page: 2,
            custom: (query) => {

                query.orderByRaw('id DESC');
            }
        })).to.equal([]);

        expect(await soloTable.do.browse({
            perPage: 2,
            custom: (query) => {

                query.orderByRaw('id DESC');
            }
        })).to.equal([]);

        expect(await soloTable.do.browse({
            custom: (query) => {

                query.orderByRaw('id DESC');
            }
        })).to.equal([]);

        expect(await soloTable.do.browse()).to.equal([]);

        expect(await soloTable.do.obtain()).to.equal(null);

        await soloTable.do.create({ label: 'test' });

        res = await soloTable.do.browse();

        expect(res[0].label).to.equal('test');

        await soloTable.do.update({ id: 1 }, { label: 'foobar' });

        res = await soloTable.do.browse();

        expect(res[0].label).to.equal('foobar');

        await expect(soloTable.do.delete()).to.reject(Error, 'No Rows Deleted');

        await expect(soloTable.do.delete({
            label: 'foobars'
        })).to.reject(Error, 'No Rows Deleted');

        await soloTable.do.delete({ label: 'foobar' });

        expect(await soloTable.do.browse()).to.equal([]);

        const author = await authorModel.do.create({ name: 'tolkien' });
        await bookModel.do.create({ author: author.id, title: 'the hobbit' });

        res = await authorModel.do.browse();

        expect(res[0].name).to.equal('tolkien');

        res = await bookModel.do.browse({ page: 1, perPage: 10 });

        expect(res[0].title).to.equal('the hobbit');

        const qb = bookModel.model.query();

        res = await qb.where({id: 1}).select();

        expect(res[0].title).to.equal('the hobbit');

        res = await bookModel.do.obtain({ id: 1 });

        expect(res.author.name).to.equal('tolkien');

        expect(await bookModel.do.obtain({ id: 3 })).to.equal(null);

        await bookModel.do.delete({ title: 'the hobbit' });
        await authorModel.do.delete({ id: 1 });

        expect(await bookModel.do.browse()).to.equal([]);

        await formatterModel.do.create();

        res = await formatterModel.do.browse({}, {
            formatter: async (query, schema) => {
                return { query, schema };
            }
        });
        console.log('record result 1:')
        console.log(res);
        expect(res[0].label).to.equal('fixed');
        console.log('record result 2:')
        console.log(res);
        expect(await formatterModel.do.browse()).to.equal([]);

        await formatterModel.do.create();

        res = await formatterModel.do.browse();
        console.log('record result 3:')
        console.log(res);
        expect(res[0].label).to.equal('fixed');

        await formatterModel.do.update({ id: 2 }, { label: 'foobar' });

        res = await formatterModel.do.browse();
        console.log('record result 4:')
        console.log(res);
        expect(res[0].label).to.equal('updated');
        res = await formatterModel.do.browse({}, {
            formatter: async (query, schema) => {
                return { query, schema };
            }
        });
        console.log('record result 5:')
        console.log(res);
        expect(res[0].label).to.equal('fixed');

        await expect(formatterModel.do.update()).to.reject(Error,
            'A model cannot be updated without a "where" clause or an idAttribute.');

        await expect(formatterModel.do.delete({
            label: 'foobar'
        })).to.reject(Error, 'No Rows Deleted');

        await expect(formatterModel.do.delete({
            id: 1
        })).to.reject(Error, 'No Rows Deleted');

        await expect(soloTable.do.create()).to.reject(Error,
            'insert into "solo_table" default values returning "id" - null value in column "label" violates not-null constraint');

        await timeout(1000);

        await updatedModel.do.update({ id: 1 }, { label: 'updated' });

        res = await updatedModel.do.browse();

        const delay = res[0].updated_at.getTime() - res[0].created_at.getTime();

        expect(delay).to.be.above(1000);
        expect(delay).to.be.below(2000);


        // await bookshelf.knex.schema.dropTableIfExists(Model4.protoProps.tableName);
        // await bookshelf.knex.schema.dropTableIfExists(Model3.protoProps.tableName);
        // await bookshelf.knex.schema.dropTableIfExists(Model1.protoProps.tableName);
        // await bookshelf.knex.schema.dropTableIfExists(Model5.protoProps.tableName);
        // await bookshelf.knex.schema.dropTableIfExists(Model6.protoProps.tableName);

        expect(() => {

            Lib.loadModel(Model1);
        }).to.throw(Error, 'Bookshelf instance is invalid');

        expect(() => {

            Lib.loadModel(Model1, {});
        }).to.throw(Error, 'Bookshelf instance is invalid');
    });

});
