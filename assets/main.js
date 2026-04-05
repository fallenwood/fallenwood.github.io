var ENTRIES = "ENTRIES", KEYS = "KEYS", VALUES = "VALUES", LEAF = "", TreeIterator = class {
	constructor(o, F) {
		let I = o._tree, L = Array.from(I.keys());
		this.set = o, this._type = F, this._path = L.length > 0 ? [{
			node: I,
			keys: L
		}] : [];
	}
	next() {
		let o = this.dive();
		return this.backtrack(), o;
	}
	dive() {
		if (this._path.length === 0) return {
			done: !0,
			value: void 0
		};
		let { node: o, keys: F } = last$1(this._path);
		if (last$1(F) === LEAF) return {
			done: !1,
			value: this.result()
		};
		let I = o.get(last$1(F));
		return this._path.push({
			node: I,
			keys: Array.from(I.keys())
		}), this.dive();
	}
	backtrack() {
		if (this._path.length === 0) return;
		let o = last$1(this._path).keys;
		o.pop(), !(o.length > 0) && (this._path.pop(), this.backtrack());
	}
	key() {
		return this.set._prefix + this._path.map(({ keys: o }) => last$1(o)).filter((o) => o !== LEAF).join("");
	}
	value() {
		return last$1(this._path).node.get(LEAF);
	}
	result() {
		switch (this._type) {
			case VALUES: return this.value();
			case KEYS: return this.key();
			default: return [this.key(), this.value()];
		}
	}
	[Symbol.iterator]() {
		return this;
	}
}, last$1 = (o) => o[o.length - 1], fuzzySearch = (o, F, I) => {
	let L = /* @__PURE__ */ new Map();
	if (F === void 0) return L;
	let R = F.length + 1, z = R + I, B = new Uint8Array(z * R).fill(I + 1);
	for (let o = 0; o < R; ++o) B[o] = o;
	for (let o = 1; o < z; ++o) B[o * R] = o;
	return recurse(o, F, I, L, B, 1, R, ""), L;
}, recurse = (o, F, I, R, z, B, H, U) => {
	let W = B * H;
	key: for (let G of o.keys()) if (G === LEAF) {
		let F = z[W - 1];
		F <= I && R.set(U, [o.get(G), F]);
	} else {
		let L = B;
		for (let o = 0; o < G.length; ++o, ++L) {
			let R = G[o], B = H * L, V = B - H, U = z[B], W = Math.max(0, L - I - 1), K = Math.min(H - 1, L + I);
			for (let o = W; o < K; ++o) {
				let I = R !== F[o], L = z[V + o] + +I, H = z[V + o + 1] + 1, W = z[B + o] + 1, G = z[B + o + 1] = Math.min(L, H, W);
				G < U && (U = G);
			}
			if (U > I) continue key;
		}
		recurse(o.get(G), F, I, R, z, L, H, U + G);
	}
}, SearchableMap = class z {
	constructor(o = /* @__PURE__ */ new Map(), F = "") {
		this._size = void 0, this._tree = o, this._prefix = F;
	}
	atPrefix(o) {
		if (!o.startsWith(this._prefix)) throw Error("Mismatched prefix");
		let [F, I] = trackDown(this._tree, o.slice(this._prefix.length));
		if (F === void 0) {
			let [F, R] = last(I);
			for (let I of F.keys()) if (I !== LEAF && I.startsWith(R)) {
				let L = /* @__PURE__ */ new Map();
				return L.set(I.slice(R.length), F.get(I)), new z(L, o);
			}
		}
		return new z(F, o);
	}
	clear() {
		this._size = void 0, this._tree.clear();
	}
	delete(o) {
		return this._size = void 0, remove(this._tree, o);
	}
	entries() {
		return new TreeIterator(this, ENTRIES);
	}
	forEach(o) {
		for (let [F, I] of this) o(F, I, this);
	}
	fuzzyGet(o, F) {
		return fuzzySearch(this._tree, o, F);
	}
	get(o) {
		let F = lookup(this._tree, o);
		return F === void 0 ? void 0 : F.get(LEAF);
	}
	has(o) {
		let F = lookup(this._tree, o);
		return F !== void 0 && F.has(LEAF);
	}
	keys() {
		return new TreeIterator(this, KEYS);
	}
	set(o, F) {
		if (typeof o != "string") throw Error("key must be a string");
		return this._size = void 0, createPath(this._tree, o).set(LEAF, F), this;
	}
	get size() {
		if (this._size) return this._size;
		this._size = 0;
		let o = this.entries();
		for (; !o.next().done;) this._size += 1;
		return this._size;
	}
	update(o, F) {
		if (typeof o != "string") throw Error("key must be a string");
		this._size = void 0;
		let I = createPath(this._tree, o);
		return I.set(LEAF, F(I.get(LEAF))), this;
	}
	fetch(o, F) {
		if (typeof o != "string") throw Error("key must be a string");
		this._size = void 0;
		let I = createPath(this._tree, o), R = I.get(LEAF);
		return R === void 0 && I.set(LEAF, R = F()), R;
	}
	values() {
		return new TreeIterator(this, VALUES);
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	static from(o) {
		let F = new z();
		for (let [I, L] of o) F.set(I, L);
		return F;
	}
	static fromObject(o) {
		return z.from(Object.entries(o));
	}
}, trackDown = (o, F, I = []) => {
	if (F.length === 0 || o == null) return [o, I];
	for (let R of o.keys()) if (R !== LEAF && F.startsWith(R)) return I.push([o, R]), trackDown(o.get(R), F.slice(R.length), I);
	return I.push([o, F]), trackDown(void 0, "", I);
}, lookup = (o, F) => {
	if (F.length === 0 || o == null) return o;
	for (let I of o.keys()) if (I !== LEAF && F.startsWith(I)) return lookup(o.get(I), F.slice(I.length));
}, createPath = (o, F) => {
	let I = F.length;
	outer: for (let R = 0; o && R < I;) {
		for (let z of o.keys()) if (z !== LEAF && F[R] === z[0]) {
			let L = Math.min(I - R, z.length), B = 1;
			for (; B < L && F[R + B] === z[B];) ++B;
			let V = o.get(z);
			if (B === z.length) o = V;
			else {
				let I = /* @__PURE__ */ new Map();
				I.set(z.slice(B), V), o.set(F.slice(R, R + B), I), o.delete(z), o = I;
			}
			R += B;
			continue outer;
		}
		let z = /* @__PURE__ */ new Map();
		return o.set(F.slice(R), z), z;
	}
	return o;
}, remove = (o, F) => {
	let [I, R] = trackDown(o, F);
	if (I !== void 0) {
		if (I.delete(LEAF), I.size === 0) cleanup(R);
		else if (I.size === 1) {
			let [o, F] = I.entries().next().value;
			merge(R, o, F);
		}
	}
}, cleanup = (o) => {
	if (o.length === 0) return;
	let [F, I] = last(o);
	if (F.delete(I), F.size === 0) cleanup(o.slice(0, -1));
	else if (F.size === 1) {
		let [I, R] = F.entries().next().value;
		I !== LEAF && merge(o.slice(0, -1), I, R);
	}
}, merge = (o, F, I) => {
	if (o.length === 0) return;
	let [L, R] = last(o);
	L.set(R + F, I), L.delete(R);
}, last = (o) => o[o.length - 1], OR = "or", AND = "and", AND_NOT = "and_not", MiniSearch = class o {
	constructor(o) {
		if (o?.fields == null) throw Error("MiniSearch: option \"fields\" must be provided");
		let F = o.autoVacuum == null || o.autoVacuum === !0 ? defaultAutoVacuumOptions : o.autoVacuum;
		this._options = {
			...defaultOptions,
			...o,
			autoVacuum: F,
			searchOptions: {
				...defaultSearchOptions,
				...o.searchOptions || {}
			},
			autoSuggestOptions: {
				...defaultAutoSuggestOptions,
				...o.autoSuggestOptions || {}
			}
		}, this._index = new SearchableMap(), this._documentCount = 0, this._documentIds = /* @__PURE__ */ new Map(), this._idToShortId = /* @__PURE__ */ new Map(), this._fieldIds = {}, this._fieldLength = /* @__PURE__ */ new Map(), this._avgFieldLength = [], this._nextId = 0, this._storedFields = /* @__PURE__ */ new Map(), this._dirtCount = 0, this._currentVacuum = null, this._enqueuedVacuum = null, this._enqueuedVacuumConditions = defaultVacuumConditions, this.addFields(this._options.fields);
	}
	add(o) {
		let { extractField: F, stringifyField: I, tokenize: L, processTerm: R, fields: z, idField: B } = this._options, V = F(o, B);
		if (V == null) throw Error(`MiniSearch: document does not have ID field "${B}"`);
		if (this._idToShortId.has(V)) throw Error(`MiniSearch: duplicate ID ${V}`);
		let H = this.addDocumentId(V);
		this.saveStoredFields(H, o);
		for (let B of z) {
			let z = F(o, B);
			if (z == null) continue;
			let V = L(I(z, B), B), U = this._fieldIds[B], W = new Set(V).size;
			this.addFieldLength(H, U, this._documentCount - 1, W);
			for (let o of V) {
				let F = R(o, B);
				if (Array.isArray(F)) for (let o of F) this.addTerm(U, H, o);
				else F && this.addTerm(U, H, F);
			}
		}
	}
	addAll(o) {
		for (let F of o) this.add(F);
	}
	addAllAsync(o, F = {}) {
		let { chunkSize: I = 10 } = F, L = {
			chunk: [],
			promise: Promise.resolve()
		}, { chunk: R, promise: z } = o.reduce(({ chunk: o, promise: F }, L, R) => (o.push(L), (R + 1) % I === 0 ? {
			chunk: [],
			promise: F.then(() => new Promise((o) => setTimeout(o, 0))).then(() => this.addAll(o))
		} : {
			chunk: o,
			promise: F
		}), L);
		return z.then(() => this.addAll(R));
	}
	remove(o) {
		let { tokenize: F, processTerm: I, extractField: L, stringifyField: R, fields: z, idField: B } = this._options, V = L(o, B);
		if (V == null) throw Error(`MiniSearch: document does not have ID field "${B}"`);
		let H = this._idToShortId.get(V);
		if (H == null) throw Error(`MiniSearch: cannot remove document with ID ${V}: it is not in the index`);
		for (let B of z) {
			let z = L(o, B);
			if (z == null) continue;
			let V = F(R(z, B), B), U = this._fieldIds[B], W = new Set(V).size;
			this.removeFieldLength(H, U, this._documentCount, W);
			for (let o of V) {
				let F = I(o, B);
				if (Array.isArray(F)) for (let o of F) this.removeTerm(U, H, o);
				else F && this.removeTerm(U, H, F);
			}
		}
		this._storedFields.delete(H), this._documentIds.delete(H), this._idToShortId.delete(V), this._fieldLength.delete(H), --this._documentCount;
	}
	removeAll(o) {
		if (o) for (let F of o) this.remove(F);
		else if (arguments.length > 0) throw Error("Expected documents to be present. Omit the argument to remove all documents.");
		else this._index = new SearchableMap(), this._documentCount = 0, this._documentIds = /* @__PURE__ */ new Map(), this._idToShortId = /* @__PURE__ */ new Map(), this._fieldLength = /* @__PURE__ */ new Map(), this._avgFieldLength = [], this._storedFields = /* @__PURE__ */ new Map(), this._nextId = 0;
	}
	discard(o) {
		let F = this._idToShortId.get(o);
		if (F == null) throw Error(`MiniSearch: cannot discard document with ID ${o}: it is not in the index`);
		this._idToShortId.delete(o), this._documentIds.delete(F), this._storedFields.delete(F), (this._fieldLength.get(F) || []).forEach((o, I) => {
			this.removeFieldLength(F, I, this._documentCount, o);
		}), this._fieldLength.delete(F), --this._documentCount, this._dirtCount += 1, this.maybeAutoVacuum();
	}
	maybeAutoVacuum() {
		if (this._options.autoVacuum === !1) return;
		let { minDirtFactor: o, minDirtCount: F, batchSize: I, batchWait: L } = this._options.autoVacuum;
		this.conditionalVacuum({
			batchSize: I,
			batchWait: L
		}, {
			minDirtCount: F,
			minDirtFactor: o
		});
	}
	discardAll(o) {
		let F = this._options.autoVacuum;
		try {
			this._options.autoVacuum = !1;
			for (let F of o) this.discard(F);
		} finally {
			this._options.autoVacuum = F;
		}
		this.maybeAutoVacuum();
	}
	replace(o) {
		let { idField: F, extractField: I } = this._options, L = I(o, F);
		this.discard(L), this.add(o);
	}
	vacuum(o = {}) {
		return this.conditionalVacuum(o);
	}
	conditionalVacuum(o, F) {
		return this._currentVacuum ? (this._enqueuedVacuumConditions = this._enqueuedVacuumConditions && F, this._enqueuedVacuum ??= this._currentVacuum.then(() => {
			let F = this._enqueuedVacuumConditions;
			return this._enqueuedVacuumConditions = defaultVacuumConditions, this.performVacuuming(o, F);
		}), this._enqueuedVacuum) : this.vacuumConditionsMet(F) === !1 ? Promise.resolve() : (this._currentVacuum = this.performVacuuming(o), this._currentVacuum);
	}
	async performVacuuming(o, F) {
		let I = this._dirtCount;
		if (this.vacuumConditionsMet(F)) {
			let F = o.batchSize || defaultVacuumOptions.batchSize, L = o.batchWait || defaultVacuumOptions.batchWait, R = 1;
			for (let [o, I] of this._index) {
				for (let [o, F] of I) for (let [L] of F) this._documentIds.has(L) || (F.size <= 1 ? I.delete(o) : F.delete(L));
				this._index.get(o).size === 0 && this._index.delete(o), R % F === 0 && await new Promise((o) => setTimeout(o, L)), R += 1;
			}
			this._dirtCount -= I;
		}
		await null, this._currentVacuum = this._enqueuedVacuum, this._enqueuedVacuum = null;
	}
	vacuumConditionsMet(o) {
		if (o == null) return !0;
		let { minDirtCount: F, minDirtFactor: I } = o;
		return F ||= defaultAutoVacuumOptions.minDirtCount, I ||= defaultAutoVacuumOptions.minDirtFactor, this.dirtCount >= F && this.dirtFactor >= I;
	}
	get isVacuuming() {
		return this._currentVacuum != null;
	}
	get dirtCount() {
		return this._dirtCount;
	}
	get dirtFactor() {
		return this._dirtCount / (1 + this._documentCount + this._dirtCount);
	}
	has(o) {
		return this._idToShortId.has(o);
	}
	getStoredFields(o) {
		let F = this._idToShortId.get(o);
		if (F != null) return this._storedFields.get(F);
	}
	search(F, I = {}) {
		let { searchOptions: L } = this._options, R = {
			...L,
			...I
		}, z = this.executeQuery(F, I), B = [];
		for (let [o, { score: F, terms: I, match: L }] of z) {
			let z = I.length || 1, V = {
				id: this._documentIds.get(o),
				score: F * z,
				terms: Object.keys(L),
				queryTerms: I,
				match: L
			};
			Object.assign(V, this._storedFields.get(o)), (R.filter == null || R.filter(V)) && B.push(V);
		}
		return F === o.wildcard && R.boostDocument == null || B.sort(byScore), B;
	}
	autoSuggest(o, F = {}) {
		F = {
			...this._options.autoSuggestOptions,
			...F
		};
		let I = /* @__PURE__ */ new Map();
		for (let { score: L, terms: R } of this.search(o, F)) {
			let o = R.join(" "), F = I.get(o);
			F == null ? I.set(o, {
				score: L,
				terms: R,
				count: 1
			}) : (F.score += L, F.count += 1);
		}
		let L = [];
		for (let [o, { score: F, terms: R, count: z }] of I) L.push({
			suggestion: o,
			terms: R,
			score: F / z
		});
		return L.sort(byScore), L;
	}
	get documentCount() {
		return this._documentCount;
	}
	get termCount() {
		return this._index.size;
	}
	static loadJSON(o, F) {
		if (F == null) throw Error("MiniSearch: loadJSON should be given the same options used when serializing the index");
		return this.loadJS(JSON.parse(o), F);
	}
	static async loadJSONAsync(o, F) {
		if (F == null) throw Error("MiniSearch: loadJSON should be given the same options used when serializing the index");
		return this.loadJSAsync(JSON.parse(o), F);
	}
	static getDefault(o) {
		if (defaultOptions.hasOwnProperty(o)) return getOwnProperty(defaultOptions, o);
		throw Error(`MiniSearch: unknown option "${o}"`);
	}
	static loadJS(o, F) {
		let { index: I, documentIds: L, fieldLength: R, storedFields: z, serializationVersion: B } = o, V = this.instantiateMiniSearch(o, F);
		V._documentIds = objectToNumericMap(L), V._fieldLength = objectToNumericMap(R), V._storedFields = objectToNumericMap(z);
		for (let [o, F] of V._documentIds) V._idToShortId.set(F, o);
		for (let [o, F] of I) {
			let I = /* @__PURE__ */ new Map();
			for (let o of Object.keys(F)) {
				let L = F[o];
				B === 1 && (L = L.ds), I.set(parseInt(o, 10), objectToNumericMap(L));
			}
			V._index.set(o, I);
		}
		return V;
	}
	static async loadJSAsync(o, F) {
		let { index: I, documentIds: L, fieldLength: R, storedFields: z, serializationVersion: B } = o, V = this.instantiateMiniSearch(o, F);
		V._documentIds = await objectToNumericMapAsync(L), V._fieldLength = await objectToNumericMapAsync(R), V._storedFields = await objectToNumericMapAsync(z);
		for (let [o, F] of V._documentIds) V._idToShortId.set(F, o);
		let H = 0;
		for (let [o, F] of I) {
			let I = /* @__PURE__ */ new Map();
			for (let o of Object.keys(F)) {
				let L = F[o];
				B === 1 && (L = L.ds), I.set(parseInt(o, 10), await objectToNumericMapAsync(L));
			}
			++H % 1e3 == 0 && await wait(0), V._index.set(o, I);
		}
		return V;
	}
	static instantiateMiniSearch(F, I) {
		let { documentCount: L, nextId: R, fieldIds: z, averageFieldLength: B, dirtCount: V, serializationVersion: U } = F;
		if (U !== 1 && U !== 2) throw Error("MiniSearch: cannot deserialize an index created with an incompatible version");
		let W = new o(I);
		return W._documentCount = L, W._nextId = R, W._idToShortId = /* @__PURE__ */ new Map(), W._fieldIds = z, W._avgFieldLength = B, W._dirtCount = V || 0, W._index = new SearchableMap(), W;
	}
	executeQuery(F, I = {}) {
		if (F === o.wildcard) return this.executeWildcardQuery(I);
		if (typeof F != "string") {
			let o = {
				...I,
				...F,
				queries: void 0
			}, L = F.queries.map((F) => this.executeQuery(F, o));
			return this.combineResults(L, o.combineWith);
		}
		let { tokenize: L, processTerm: R, searchOptions: z } = this._options, B = {
			tokenize: L,
			processTerm: R,
			...z,
			...I
		}, { tokenize: V, processTerm: H } = B, U = V(F).flatMap((o) => H(o)).filter((o) => !!o).map(termToQuerySpec(B)).map((o) => this.executeQuerySpec(o, B));
		return this.combineResults(U, B.combineWith);
	}
	executeQuerySpec(o, F) {
		let I = {
			...this._options.searchOptions,
			...F
		}, L = (I.fields || this._options.fields).reduce((o, F) => ({
			...o,
			[F]: getOwnProperty(I.boost, F) || 1
		}), {}), { boostDocument: R, weights: z, maxFuzzy: B, bm25: V } = I, { fuzzy: H, prefix: U } = {
			...defaultSearchOptions.weights,
			...z
		}, W = this._index.get(o.term), G = this.termResults(o.term, o.term, 1, o.termBoost, W, L, R, V), K, q;
		if (o.prefix && (K = this._index.atPrefix(o.term)), o.fuzzy) {
			let F = o.fuzzy === !0 ? .2 : o.fuzzy, I = F < 1 ? Math.min(B, Math.round(o.term.length * F)) : F;
			I && (q = this._index.fuzzyGet(o.term, I));
		}
		if (K) for (let [F, I] of K) {
			let z = F.length - o.term.length;
			if (!z) continue;
			q?.delete(F);
			let B = U * F.length / (F.length + .3 * z);
			this.termResults(o.term, F, B, o.termBoost, I, L, R, V, G);
		}
		if (q) for (let F of q.keys()) {
			let [I, z] = q.get(F);
			if (!z) continue;
			let B = H * F.length / (F.length + z);
			this.termResults(o.term, F, B, o.termBoost, I, L, R, V, G);
		}
		return G;
	}
	executeWildcardQuery(o) {
		let F = /* @__PURE__ */ new Map(), I = {
			...this._options.searchOptions,
			...o
		};
		for (let [o, L] of this._documentIds) {
			let R = I.boostDocument ? I.boostDocument(L, "", this._storedFields.get(o)) : 1;
			F.set(o, {
				score: R,
				terms: [],
				match: {}
			});
		}
		return F;
	}
	combineResults(o, F = OR) {
		if (o.length === 0) return /* @__PURE__ */ new Map();
		let I = combinators[F.toLowerCase()];
		if (!I) throw Error(`Invalid combination operator: ${F}`);
		return o.reduce(I) || /* @__PURE__ */ new Map();
	}
	toJSON() {
		let o = [];
		for (let [F, I] of this._index) {
			let L = {};
			for (let [o, F] of I) L[o] = Object.fromEntries(F);
			o.push([F, L]);
		}
		return {
			documentCount: this._documentCount,
			nextId: this._nextId,
			documentIds: Object.fromEntries(this._documentIds),
			fieldIds: this._fieldIds,
			fieldLength: Object.fromEntries(this._fieldLength),
			averageFieldLength: this._avgFieldLength,
			storedFields: Object.fromEntries(this._storedFields),
			dirtCount: this._dirtCount,
			index: o,
			serializationVersion: 2
		};
	}
	termResults(o, F, I, L, R, z, B, V, H = /* @__PURE__ */ new Map()) {
		if (R == null) return H;
		for (let U of Object.keys(z)) {
			let W = z[U], G = this._fieldIds[U], K = R.get(G);
			if (K == null) continue;
			let q = K.size, J = this._avgFieldLength[G];
			for (let R of K.keys()) {
				if (!this._documentIds.has(R)) {
					this.removeTerm(G, R, F), --q;
					continue;
				}
				let z = B ? B(this._documentIds.get(R), F, this._storedFields.get(R)) : 1;
				if (!z) continue;
				let Y = K.get(R), X = this._fieldLength.get(R)[G], Z = calcBM25Score(Y, q, this._documentCount, X, J, V), Q = I * L * W * z * Z, $ = H.get(R);
				if ($) {
					$.score += Q, assignUniqueTerm($.terms, o);
					let I = getOwnProperty($.match, F);
					I ? I.push(U) : $.match[F] = [U];
				} else H.set(R, {
					score: Q,
					terms: [o],
					match: { [F]: [U] }
				});
			}
		}
		return H;
	}
	addTerm(o, F, I) {
		let L = this._index.fetch(I, createMap), R = L.get(o);
		if (R == null) R = /* @__PURE__ */ new Map(), R.set(F, 1), L.set(o, R);
		else {
			let o = R.get(F);
			R.set(F, (o || 0) + 1);
		}
	}
	removeTerm(o, F, I) {
		if (!this._index.has(I)) {
			this.warnDocumentChanged(F, o, I);
			return;
		}
		let L = this._index.fetch(I, createMap), R = L.get(o);
		R == null || R.get(F) == null ? this.warnDocumentChanged(F, o, I) : R.get(F) <= 1 ? R.size <= 1 ? L.delete(o) : R.delete(F) : R.set(F, R.get(F) - 1), this._index.get(I).size === 0 && this._index.delete(I);
	}
	warnDocumentChanged(o, F, I) {
		for (let L of Object.keys(this._fieldIds)) if (this._fieldIds[L] === F) {
			this._options.logger("warn", `MiniSearch: document with ID ${this._documentIds.get(o)} has changed before removal: term "${I}" was not present in field "${L}". Removing a document after it has changed can corrupt the index!`, "version_conflict");
			return;
		}
	}
	addDocumentId(o) {
		let F = this._nextId;
		return this._idToShortId.set(o, F), this._documentIds.set(F, o), this._documentCount += 1, this._nextId += 1, F;
	}
	addFields(o) {
		for (let F = 0; F < o.length; F++) this._fieldIds[o[F]] = F;
	}
	addFieldLength(o, F, I, L) {
		let R = this._fieldLength.get(o);
		R ?? this._fieldLength.set(o, R = []), R[F] = L;
		let z = (this._avgFieldLength[F] || 0) * I + L;
		this._avgFieldLength[F] = z / (I + 1);
	}
	removeFieldLength(o, F, I, L) {
		if (I === 1) {
			this._avgFieldLength[F] = 0;
			return;
		}
		let R = this._avgFieldLength[F] * I - L;
		this._avgFieldLength[F] = R / (I - 1);
	}
	saveStoredFields(o, F) {
		let { storeFields: I, extractField: L } = this._options;
		if (I == null || I.length === 0) return;
		let R = this._storedFields.get(o);
		R ?? this._storedFields.set(o, R = {});
		for (let o of I) {
			let I = L(F, o);
			I !== void 0 && (R[o] = I);
		}
	}
};
MiniSearch.wildcard = Symbol("*");
var getOwnProperty = (o, F) => Object.prototype.hasOwnProperty.call(o, F) ? o[F] : void 0, combinators = {
	[OR]: (o, F) => {
		for (let I of F.keys()) {
			let L = o.get(I);
			if (L == null) o.set(I, F.get(I));
			else {
				let { score: o, terms: R, match: z } = F.get(I);
				L.score += o, L.match = Object.assign(L.match, z), assignUniqueTerms(L.terms, R);
			}
		}
		return o;
	},
	[AND]: (o, F) => {
		let I = /* @__PURE__ */ new Map();
		for (let L of F.keys()) {
			let R = o.get(L);
			if (R == null) continue;
			let { score: z, terms: B, match: V } = F.get(L);
			assignUniqueTerms(R.terms, B), I.set(L, {
				score: R.score + z,
				terms: R.terms,
				match: Object.assign(R.match, V)
			});
		}
		return I;
	},
	[AND_NOT]: (o, F) => {
		for (let I of F.keys()) o.delete(I);
		return o;
	}
}, defaultBM25params = {
	k: 1.2,
	b: .7,
	d: .5
}, calcBM25Score = (o, F, I, L, R, z) => {
	let { k: B, b: V, d: H } = z;
	return Math.log(1 + (I - F + .5) / (F + .5)) * (H + o * (B + 1) / (o + B * (1 - V + V * L / R)));
}, termToQuerySpec = (o) => (F, I, L) => ({
	term: F,
	fuzzy: typeof o.fuzzy == "function" ? o.fuzzy(F, I, L) : o.fuzzy || !1,
	prefix: typeof o.prefix == "function" ? o.prefix(F, I, L) : o.prefix === !0,
	termBoost: typeof o.boostTerm == "function" ? o.boostTerm(F, I, L) : 1
}), defaultOptions = {
	idField: "id",
	extractField: (o, F) => o[F],
	stringifyField: (o, F) => o.toString(),
	tokenize: (o) => o.split(SPACE_OR_PUNCTUATION),
	processTerm: (o) => o.toLowerCase(),
	fields: void 0,
	searchOptions: void 0,
	storeFields: [],
	logger: (o, F) => {
		typeof (console == null ? void 0 : console[o]) == "function" && console[o](F);
	},
	autoVacuum: !0
}, defaultSearchOptions = {
	combineWith: OR,
	prefix: !1,
	fuzzy: !1,
	maxFuzzy: 6,
	boost: {},
	weights: {
		fuzzy: .45,
		prefix: .375
	},
	bm25: defaultBM25params
}, defaultAutoSuggestOptions = {
	combineWith: AND,
	prefix: (o, F, I) => F === I.length - 1
}, defaultVacuumOptions = {
	batchSize: 1e3,
	batchWait: 10
}, defaultVacuumConditions = {
	minDirtFactor: .1,
	minDirtCount: 20
}, defaultAutoVacuumOptions = {
	...defaultVacuumOptions,
	...defaultVacuumConditions
}, assignUniqueTerm = (o, F) => {
	o.includes(F) || o.push(F);
}, assignUniqueTerms = (o, F) => {
	for (let I of F) o.includes(I) || o.push(I);
}, byScore = ({ score: o }, { score: F }) => F - o, createMap = () => /* @__PURE__ */ new Map(), objectToNumericMap = (o) => {
	let F = /* @__PURE__ */ new Map();
	for (let I of Object.keys(o)) F.set(parseInt(I, 10), o[I]);
	return F;
}, objectToNumericMapAsync = async (o) => {
	let F = /* @__PURE__ */ new Map(), I = 0;
	for (let L of Object.keys(o)) F.set(parseInt(L, 10), o[L]), ++I % 1e3 == 0 && await wait(0);
	return F;
}, wait = (o) => new Promise((F) => setTimeout(F, o)), SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/u;
console.info("[search] script loaded");
var DATA_ATTRS = {
	enabled: "data-search-enabled",
	provider: "data-search-provider",
	indexPath: "data-search-index",
	minChars: "data-search-min-chars",
	limit: "data-search-limit",
	fuzzy: "data-search-fuzzy",
	baseUrl: "data-base-url"
};
function readConfig() {
	let o = document.body;
	return o || console.error("[search] document.body missing"), {
		enabled: o.getAttribute(DATA_ATTRS.enabled) === "true",
		provider: (o.getAttribute(DATA_ATTRS.provider) ?? "minisearch").toLowerCase(),
		indexPath: o.getAttribute(DATA_ATTRS.indexPath) ?? "search-index.json",
		minChars: parseInt(o.getAttribute(DATA_ATTRS.minChars) ?? "2", 10),
		limit: parseInt(o.getAttribute(DATA_ATTRS.limit) ?? "12", 10),
		fuzzy: parseFloat(o.getAttribute(DATA_ATTRS.fuzzy) ?? "0.2"),
		baseUrl: o.getAttribute(DATA_ATTRS.baseUrl) ?? "/"
	};
}
var miniSearch = null, allDocs = [], indexPromise = null;
async function ensureIndex(o) {
	miniSearch || allDocs.length || (indexPromise ||= (async () => {
		let F = resolveIndexUrl(o);
		console.info("[search] fetching index", F);
		let I = null;
		try {
			I = await fetch(F, { credentials: "same-origin" });
		} catch (o) {
			console.warn("[search] Fetch failed", o);
		}
		if (!I?.ok) {
			console.error(`[search] Failed to load search index: ${I?.status ?? "(no response)"} from ${F}`), allDocs = [];
			return;
		}
		let L = await I.json();
		console.info(`[search] loaded ${L.length} docs`), allDocs = L.map((o, F) => ({
			id: o.hash ?? String(F),
			title: o.title ?? "",
			url: o.url ?? "",
			description: o.description ?? "",
			date: o.date ?? o.Date ?? "",
			tags: o.tags ?? [],
			categories: o.categories ?? [],
			content: o.content ?? "",
			hash: o.hash ?? String(F)
		})), o.provider === "minisearch" && (miniSearch = new MiniSearch({
			fields: [
				"title",
				"description",
				"content",
				"tags",
				"categories"
			],
			storeFields: [
				"title",
				"url",
				"description",
				"date",
				"tags",
				"categories",
				"hash"
			],
			searchOptions: {
				boost: {
					title: 4,
					description: 2,
					tags: 2,
					categories: 1.5,
					content: 1
				},
				fuzzy: o.fuzzy,
				prefix: !0
			}
		}), miniSearch.addAll(allDocs));
	})(), await indexPromise);
}
function searchDocs(o, F) {
	if (!allDocs.length) return [];
	if (F.provider === "minisearch" && miniSearch) return miniSearch.search(o, { prefix: !0 }) ?? [];
	let I = o.toLowerCase();
	return allDocs.map((o) => ({
		doc: o,
		score: scoreDoc(o, I)
	})).filter((o) => o.score > 0).sort((o, F) => F.score - o.score).map((o) => ({
		...o.doc,
		score: o.score
	}));
}
function scoreDoc(o, F) {
	let I = [
		[o.title, 5],
		[o.description, 3],
		[o.content, 1],
		[(o.tags ?? []).join(" "), 2],
		[(o.categories ?? []).join(" "), 1.5]
	], L = 0;
	for (let [o, R] of I) o && o.toLowerCase().includes(F) && (L += R);
	return L;
}
function resolveIndexUrl(o) {
	let F = o.indexPath.startsWith("/") ? o.indexPath : `/${o.indexPath}`;
	try {
		if (o.baseUrl && /^https?:/i.test(o.baseUrl)) {
			let I = new URL(o.baseUrl), L = window.location;
			if (I.host === L.host) return new URL(F, I).toString();
		}
	} catch {}
	return `${window.location.origin}${F}`;
}
function renderResultItem(o) {
	let F = o.date ? new Date(o.date).toISOString().split("T")[0] : "", I = (o.tags ?? []).slice(0, 3).join(", "), L = o.description || o.content?.slice(0, 140) || "";
	return `
    <li>
      <a class="!justify-start flex flex-col gap-1 px-3 py-2" href="${o.url}">
        <span class="font-medium">${escapeHtml(o.title)}</span>
        <span class="text-xs text-base-content/70">${escapeHtml(L)}</span>
        <span class="text-[11px] text-base-content/60 flex gap-2">${F ? `<time>${F}</time>` : ""}${I ? `<span>${escapeHtml(I)}</span>` : ""}</span>
      </a>
    </li>`;
}
function bindRoot(o, F) {
	let I = [], L = -1, R = async (R) => {
		if (!F.enabled) return;
		let z = R.trim();
		if (z.length < F.minChars) {
			I = [], L = -1, o.list.innerHTML = `<li class="px-3 py-2 text-sm text-base-content/70">Type at least ${F.minChars} characters</li>`, showPanel(o);
			return;
		}
		if (await ensureIndex(F), !allDocs.length) {
			o.list.innerHTML = "<li class=\"px-3 py-2 text-sm text-base-content/70\">Search index unavailable</li>", showPanel(o);
			return;
		}
		I = (searchDocs(z, F) ?? []).slice(0, F.limit), I.length === 0 ? o.list.innerHTML = "<li class=\"px-3 py-2 text-sm text-base-content/70\">No results</li>" : o.list.innerHTML = I.map(renderResultItem).join(""), showPanel(o);
	};
	o.input.addEventListener("input", (o) => {
		let F = o.target.value;
		R(F);
	}), o.input.addEventListener("keypress", (o) => {
		if (o.key === "Enter") {
			o.preventDefault();
			let F = o.target.value;
			R(F);
		}
	}), o.input.addEventListener("keydown", (F) => {
		if (F.key === "Escape") {
			hidePanel(o), L = -1;
			return;
		}
		I.length && (["ArrowDown", "ArrowUp"].includes(F.key) && (F.preventDefault(), L = navigate(L, I.length, F.key === "ArrowDown" ? 1 : -1), highlight(o.list, L)), F.key === "Enter" && L >= 0 && (F.preventDefault(), o.list.querySelectorAll("a")[L]?.click()));
	}), document.addEventListener("click", (F) => {
		!o.panel.contains(F.target) && F.target !== o.input && hidePanel(o);
	});
}
function showPanel(o) {
	o.panel.classList.remove("hidden");
}
function hidePanel(o) {
	o.panel.classList.add("hidden");
}
function navigate(o, F, I) {
	return (o + I + F) % F;
}
function highlight(o, F) {
	o.querySelectorAll("li").forEach((o, I) => {
		o.classList.toggle("bg-base-200", I === F);
	});
}
function escapeHtml(o) {
	return o.replace(/[&<>"']/g, (o) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	})[o]);
}
function bindSearchPage(o) {
	let F = document.getElementById("search-input-page"), I = document.getElementById("search-results-summary"), L = document.getElementById("search-results-page");
	if (!F || !L || !I) return;
	let R = "search-spinner", z = document.getElementById(R);
	z || (z = document.createElement("div"), z.id = R, z.className = "hidden w-full flex items-center gap-2 text-sm text-base-content/70", z.innerHTML = "<span class=\"loading loading-spinner loading-xs\"></span><span>Searching…</span>", F.parentElement?.parentElement?.appendChild(z));
	let B = (o) => {
		z?.classList.toggle("hidden", !o);
	}, V = (o, F) => {
		I.classList.remove("hidden"), I.textContent = `${F.length} result${F.length === 1 ? "" : "s"} for "${o}"`, L.innerHTML = F.map((o) => `
      <article class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body">
          <a href="${o.url}" class="card-title text-lg font-semibold">${escapeHtml(o.title)}</a>
          <p class="text-sm text-base-content/70">${escapeHtml(o.description || o.content || "")}</p>
          <div class="flex flex-wrap gap-2 mt-3">
            ${(o.tags ?? []).map((o) => `<span class="badge badge-outline badge-sm">${escapeHtml(o)}</span>`).join("")}
          </div>
        </div>
      </article>
    `).join("");
	}, H = async (F) => {
		let R = F.trim();
		if (R.length < o.minChars) {
			I.classList.remove("hidden"), I.textContent = `Type at least ${o.minChars} characters`, L.innerHTML = "";
			return;
		}
		if (B(!0), await ensureIndex(o), B(!1), !allDocs.length) {
			I.textContent = "Search index unavailable (check network tab)", I.classList.remove("hidden"), L.innerHTML = "";
			return;
		}
		let z = searchDocs(R, o) ?? [];
		if (!z.length) {
			I.classList.remove("hidden"), I.textContent = `No results for "${R}"`, L.innerHTML = "";
			return;
		}
		V(R, z.slice(0, Math.max(o.limit, 50)));
	}, U = new URLSearchParams(window.location.search).get("q");
	U && (F.value = U, H(U)), F.addEventListener("input", (o) => void H(o.target.value));
}
function initSearch() {
	let o = readConfig();
	if (console.info("[search] init called", o), !o.enabled) {
		console.info("[search] disabled via config");
		return;
	}
	if (ensureIndex(o).catch((o) => {
		console.error("[search] ensureIndex failed", o);
	}), document.getElementById("search-dropdown")) {
		let F = document.getElementById("search-input-desktop"), I = document.getElementById("search-results-panel"), L = document.getElementById("search-results-list");
		!F || !I || !L ? console.warn("[search] desktop elements missing", {
			input: !!F,
			panel: !!I,
			list: !!L
		}) : bindRoot({
			input: F,
			panel: I,
			list: L,
			viewAll: document.getElementById("search-view-all")
		}, o);
	} else console.warn("[search] desktop dropdown not found");
	let F = document.getElementById("search-input-mobile");
	if (F) {
		let I = document.getElementById("search-results-panel-mobile"), L = document.getElementById("search-results-list-mobile");
		!I || !L ? console.warn("[search] mobile panel/list missing", {
			mobilePanel: !!I,
			mobileList: !!L
		}) : bindRoot({
			input: F,
			panel: I,
			list: L,
			viewAll: document.getElementById("search-view-all-mobile")
		}, o);
	}
	window.addEventListener("keydown", (o) => {
		if (o.key === "/" && !isInputActive(o)) {
			let F = document.getElementById("search-input-desktop");
			F && (o.preventDefault(), F.focus());
		}
	}), bindSearchPage(o);
}
function isInputActive(o) {
	let F = o.target;
	return F ? ["INPUT", "TEXTAREA"].includes(F.tagName) || F.isContentEditable : !1;
}
document.addEventListener("DOMContentLoaded", () => {
	initSearch();
});
