const Dotenv = require('dotenv').config();
const { processorsInterfaceFactory, processor_interface } = require('../../../src/processors/processor_interface');
let initClass = require('../../../src/processors/starter/init');

describe('Starter event init Tests', () => {

    let init, spy;

    beforeAll(async () => {
        init  = await processorsInterfaceFactory(initClass, null);
        spy = jest.fn();
    });

    afterEach(() => spy.mockRestore());

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test('init start', () => {
        spy = jest.spyOn(init, 'start');
        init.start();
        expect(spy).toBeCalledTimes(1);
    });

    test('init runs', () => {
        expect(init.result).toBe('Im in the init processor');
    });

    test('init end', () => {
        spy = jest.spyOn(init, 'end');
        init.end();
        expect(spy).toBeCalledTimes(1);
    });

});