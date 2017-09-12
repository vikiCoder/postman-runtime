var _ = require('lodash'),
    createAuthInterface;

/**
 * Creates a wrapper around RequestAuth and provides getters and setters helper functions
 *
 * @param {RequestAuth} auth
 * @return {AuthInterface}
 * @throws {Error}
 */
createAuthInterface = function (auth) {
    if (!(auth && auth.parameters && auth.parameters())) {
        throw new Error('runtime~createAuthInterface: invalid auth');
    }

    /**
     * @typedef AuthInterface
     */
    return {
        /**
         * @param {String|Array<String>} keys
         * @return {*} Returns a value for a key or an object having all keys & values depending on the input
         * @example 
         * get('foo') // bar
         * get(['foo', 'alpha']) // {foo: 'bar', 'alpha': 'beta'}
         */
        get: function (keys) {
            var paramVariable;
            if (_.isString(keys)) {
                paramVariable = auth.parameters().one(keys);
                return paramVariable && paramVariable.get();
            }
            if (_.isArray(keys)) {
                return _.transform(keys, function (paramObject, key) {
                    paramVariable = auth.parameters().one(key);
                    paramVariable && (paramObject[key] = paramVariable.get());
                    return paramObject;
                }, {});
            }
            return undefined;
        },

        /**
         * @param {String|Object} key
         * @param {*} [value]
         * @return {AuthInterface}
         * @example set('foo', 'bar') or set({foo: 'bar', 'alpha': 'beta'})
         * @throws {Error}
         */
        set: function (key, value) {
            var modifiedParams = {},
                parameters;

            if (_.isObject(key)) {
                modifiedParams = key;
            }
            else if (_.isString(key)) {
                modifiedParams[key] = value;
            }
            else {
                throw new Error('runtime~AuthInterface: set should be called with `key` as a string or object');
            }

            parameters = auth.parameters();
            _.forEach(modifiedParams, function (value, key) {
                var param;
                // if auth has the param already then update it only when it's a sytem property
                if ((param = parameters.one(key))) {
                    param.system && param.set(value);
                }
                // when param is missing then just add a new param to the variableList
                // do not use append/insert since they don't typecast the item being added
                else {
                    parameters.add({key: key, value: value, system: true});
                }
            });

            return this;
        }
    };
};

module.exports = createAuthInterface;