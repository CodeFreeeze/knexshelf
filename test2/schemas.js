'use strict';

module.exports = [
    {
        name: 'profileTable',
        protoProps: {
            tableName: 'user_profile',
            withUpdatedAt: true
        },
        columns: (table) => {
            table.string('user_name').notNullable();
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.string('first_name');
            table.string('last_name');
            table.string('middle_name');
            table.string('birth_date');
        },
        constraints: (table) => {

            table.primary('user_name');
            table.unique('user_name');


        },
        isComposite: true,
        options: {
            method: {
                obtain: {
                    cache: {
                        expiresIn: 2000,
                        generateTimeout: 100
                    },
                    generateKey: (params, opts) => {

                        return `${params}${opts}`;
                    }
                }
            }
        }
    },
    {
        name: 'soloTable',
        protoProps: {
            tableName: 'solo_table',
            withUpdatedAt: true
        },
        columns: (table) => {

            table.string('label').notNullable();
        },
        constraints: (table) => {

            table.unique('label');
        },
        options: {
            method: {
                obtain: {
                    cache: {
                        expiresIn: 2000,
                        generateTimeout: 100
                    },
                    generateKey: (params, opts) => {

                        return `${params}${opts}`;
                    }
                }
            }
        }
    },
    {
        name: 'compositeTable',
        protoProps: {
            tableName: 'composite_table'
        },
        columns: (table) => {

            table.bigInteger('id1');
            table.bigInteger('id2');
            table.string('text');
        },
        constraints: (table) => {

            table.primary(['id1', 'id2']);
        },
        isComposite: true
    },
    {
        name: 'userProfofile2',
        protoProps: {
            tableName: 'user_profile_second'
        },
        columns: (table) => {

            table.string('user_name').notNullable();
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.string('first_name');
            table.string('last_name');
            table.string('middle_name');
            table.string('birth_date');
        },
        constraints: (table) => {

            table.primary(['user_name','email']);
        },
        isComposite: true
    }
];
