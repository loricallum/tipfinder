const Dotenv = require('dotenv').config();
const Utilities     = require('../../src/misc/utilities');
const events = Utilities.getEnvironment().events;
const Mediator = require('../../src/mediator/mediator');

describe('Mediator Tests', () => {
    test('Predicate was built', () => {
        Utilities.getLodash().forEach(events, function (processors, event) {
            Utilities.getLodash().forEach(processors, function (processor) {
                let tmpInstance = Mediator.buildPredicate(event, processor);
                expect(tmpInstance).toEqual(expect.any(Function));
            });
        });
    });
});