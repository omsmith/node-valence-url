'use strict';

const url = require('url');

const
	ValenceVersions = require('./ValenceVersions'),
	ValenceRoute = require('./ValenceRoute'),
	SimpleValenceRoute = ValenceRoute.Simple,
	VersionedValenceRoute = ValenceRoute.Versioned;

class ValenceUrlResolver {
	constructor(opts) {
		if ('object' !== typeof opts) {
			throw new TypeError(`Expected opts to be an object; got ${opts} (${typeof opts}) instead`);
		}
		if ('string' !== typeof opts.tenantUrl) {
			throw new TypeError(`Expected opts.tenantUrl to be a URL-formatted string; got ${opts.tenantUrl} (${typeof opts.tenantUrl}) instead`);
		}
		if (opts.versions && !Array.isArray(opts.versions)) {
			throw new TypeError(`Expected opts.versions to be an Array; got ${opts.versions} (${typeof opts.versions}) instead`);
		}
		if (opts.authToken && 'string' !== typeof opts.authToken) {
			throw new TypeError(`Expected opts.authToken to be a string; got ${opts.versions} (${typeof opts.versions}) instead`);
		}
		if (!opts.versions && !opts.authToken) {
			throw new TypeError('opts.versions or opts.authToken must be specified');
		}

		this._tenantUrl = opts.tenantUrl;
		this._versions = new ValenceVersions(opts);
	}

	get tenantUrl() {
		return this._tenantUrl;
	}

	get versions() {
		return this._versions;
	}

	resolve(route) {
		if (!(route instanceof ValenceRoute) && 'string' !== typeof route) {
			throw new TypeError(`Expected route to be a ValenceRoute or string; got ${route} (${typeof route}) instead`);
		}

		if (route instanceof SimpleValenceRoute) {
			return Promise.resolve(url.resolve(this._tenantUrl, route.path));
		} else if (route instanceof VersionedValenceRoute) {
			const self = this;
			return self._versions.resolveVersion(route.product, route.desiredSemVer)
				.then(function(version) {
					return url.resolve(self._tenantUrl, route.prefix + version + route.suffix);
				});
		} else {
			return Promise.resolve(url.resolve(this._tenantUrl, route));
		}
	}
}

module.exports = ValenceUrlResolver;
