const Dotenv = require('dotenv').config();
const QueuerApi = require('../../src/queuer/queuer');

describe('Queuer Tests', () => {
    beforeEach(() => {
        QueuerApi.queuer.splice(0, QueuerApi.queuer.length);
    });

    test('Queuer was initialized', () => {
        const events = {"test1": ["subtest1.1", "subtest1.2"], "test2": ["subtest2.1", "subtest2.2"]};
        expect(QueuerApi.init(events)).toEqual(6);
    });

    test('Queuer must throw an exception', () => {
        expect(() => QueuerApi.init([])).toThrow(Error);
    });
});