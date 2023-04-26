const Dotenv        = require('dotenv').config();
const Utils = require('../../src/misc/utilities');

describe('Utilities Tests', () => {
    test('Exception must be thrown', () => {
        const emptyArray = [];
        expect(() => Utils.arrayIsEmpty(emptyArray, 'emptyArray')).toThrow(Error);
    });

    test('It must be false, if array is not empty', () => {
        const noEmpty = {"test1": ["subtest1.1", "subtest1.2"], "test2": ["subtest2.1", "subtest2.2"]};
        expect(Utils.arrayIsEmpty(noEmpty, 'noEmptyArray')).toBeFalsy();
    });
});