class MockHeaders {
  constructor(init = {}) {
    this._h = {}
    if (init && typeof init === 'object' && !Array.isArray(init)) {
      Object.entries(init).forEach(([k, v]) => {
        this._h[k.toLowerCase()] = v
      })
    }
  }
  get(name) {
    return this._h[name.toLowerCase()] ?? null
  }
  set(name, value) {
    this._h[name.toLowerCase()] = value
  }
  has(name) {
    return name.toLowerCase() in this._h
  }
  append(name, value) {
    const key = name.toLowerCase()
    this._h[key] = this._h[key] ? `${this._h[key]}, ${value}` : value
  }
  delete(name) {
    delete this._h[name.toLowerCase()]
  }
}

class MockResponse {
  constructor(body = '', init = {}) {
    this._body = typeof body === 'string' ? body : JSON.stringify(body)
    this.status = init.status ?? 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = init.statusText ?? ''
    this.headers = new MockHeaders(init.headers)
  }
  json() {
    return Promise.resolve(JSON.parse(this._body || '{}'))
  }
  text() {
    return Promise.resolve(this._body ?? '')
  }
  clone() {
    return new MockResponse(this._body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers._h,
    })
  }
}

global.Headers = MockHeaders
global.Response = MockResponse

global.fetch = function () {
  return Promise.resolve(new MockResponse('', { status: 200 }))
}
