var sinon = require('sinon'),
    expect = require('chai').expect;

describe('case insensitive headers', function () {
    var testrun;

    describe('request headers', function () {
        before(function (done) {
            this.run({
                collection: {
                    item: [{
                        request: {
                            url: 'https://postman-echo.com/get',
                            method: 'GET',
                            header: [
                                {key: 'alpha', value: 'foo'},
                                {key: 'ALPHA', value: 'bar', disabled: true},
                                {key: 'Alpha', value: 'baz'},
                                {key: 'ALPHA', value: 'next'},
                                {key: 'AlPhA', value: 'other'},
                                {key: 'aLpHa'}
                            ]
                        }
                    }]
                }
            }, function (err, results) {
                testrun = results;
                done(err);
            });
        });

        it('should handle case sensitive headers correctly', function () {
            sinon.assert.calledOnce(testrun.request);
            sinon.assert.calledWith(testrun.request.getCall(0), null);

            sinon.assert.calledOnce(testrun.response);
            sinon.assert.calledWith(testrun.response.getCall(0), null);

            var response = testrun.request.getCall(0).args[2].stream.toString();

            expect(JSON.parse(response)).to.have.property('headers').that.deep.include({
                alpha: 'foo, baz, next, other, '
            });
        });

        it('should complete the run', function () {
            expect(testrun).to.be.ok;
            sinon.assert.calledOnce(testrun.start);
            sinon.assert.calledOnce(testrun.done);
            sinon.assert.calledWith(testrun.done.getCall(0), null);
        });
    });

    describe('sandbox: response header', function () {
        before(function (done) {
            this.run({
                collection: {
                    item: [{
                        event: [{
                            listen: 'test',
                            script: {
                                // eslint-disable-next-line max-len
                                exec: 'tests[\'Case-insensitive header checking\'] = postman.getResponseHeader(\'contenT-TypE\')===\'application/json; charset=utf-8\';'
                            }
                        }],
                        request: {
                            url: 'https://postman-echo.com/get',
                            method: 'GET'
                        }
                    }]
                }
            }, function (err, results) {
                testrun = results;
                done(err);
            });
        });

        it('should have run the test script successfully', function () {
            var assertions = testrun.assertion.getCall(0).args[1];

            expect(testrun).to.be.ok;
            sinon.assert.calledOnce(testrun.test);
            sinon.assert.calledWith(testrun.test.getCall(0), null);
            expect(assertions[0]).to.deep.include({
                name: 'Case-insensitive header checking',
                passed: true
            });
        });

        it('should complete the run', function () {
            expect(testrun).to.be.ok;
            sinon.assert.calledOnce(testrun.start);
            sinon.assert.calledOnce(testrun.done);
            sinon.assert.calledWith(testrun.done.getCall(0), null);
        });
    });
});
