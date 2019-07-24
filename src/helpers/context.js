function Context() {
  this.events = {}
  this.ctx = {
    command: '',
    keyboard: '',
    papyrus: '',
    currency: '',
    action: '',
    latitude: '',
    longitude: '',
    city: '',
  }
}

Context.prototype.getCurrency = function() {
  return this.ctx.currency
}

Context.prototype.setCurrency = function(currency) {
  this.ctx.currency = currency
}
Context.prototype.getLocation = function() {
  return {
    latitude: this.ctx.latitude,
    longitude: this.ctx.longitude,
  }
}
Context.prototype.setLocation = function(location) {
  this.ctx.latitude = location.latitude
  this.ctx.longitude = location.longitude
}
Context.prototype.getAction = function() {
  return this.ctx.action
}

Context.prototype.setAction = function(action) {
  this.ctx.action = action
}
Context.prototype.getCity = function() {
  return this.ctx.city
}

Context.prototype.setCity = function(city) {
  this.ctx.city = city
}

Context.prototype.clearContext = function() {
  Object.keys(this.ctx).forEach(key => (this.ctx[key] = ''))
}

Context.prototype.on = function(eventName, listener) {
  const event = this.events[eventName]
  event ? event.push(listener) : (this.events[eventName] = [listener])
}
Context.prototype.emit = function(eventName, ...data) {
  const event = this.events[eventName]
  if (event) event.forEach(listener => listener(...data))
}
Context.prototype.setContext = function(obj) {
  this.ctx = { ...this.getContext(), ...obj }
}
Context.prototype.getContext = function() {
  return this.ctx
}

function ContextTree() {
  this.nodes = []
}
function Node(data, parent) {
  this.data = data
  this.children = []
  this.parent = parent
  parent && parent.children.push(this)
}
ContextTree.prototype.insert = function(data, parentName) {
  let foundParent = {}
  if (parentName) {
    foundParent = this.nodes.find(node => (node.data.command === parentName ? node : null))
    this.nodes.push(
      new Node(data, foundParent !== undefined && this.nodes.length !== 0 ? foundParent : null),
    )
  } else this.nodes.push(new Node(data, null))
}
ContextTree.prototype.searchContext = function(command) {
  return this.nodes.find(node => (node.data.command === command ? node : null))
}
ContextTree.prototype.getCurrentCtx = function(command) {
  const node = this.searchContext(command)
  return node ? node.data : null
}
ContextTree.prototype.getParentOfCurContext = function(command) {
  const node = this.searchContext(command)
  return node && node.parent ? node.parent.data : null
}

const context = new Context()
const ctxTree = new ContextTree()

context.on('changeContext', data => context.setContext(data))

export { context, ctxTree }
