var PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-mapreduce'))
  .plugin(require('pouchdb-adapter-memory'))
var test = require('tap').test

var getApi = require('../../')

test('walkthrough', function (t) {
  t.plan(12)

  var api = getApi({
    PouchDB: PouchDB,
    secret: 'secret'
  })

  api.accounts.on('change', function (eventName) {
    t.pass('change event emitted') // gets emitted twice
  })
  api.accounts.on('add', function (account) {
    t.pass('add event emitted')
    t.is(account.username, 'foo', '"add" event emmited with account.username')
    t.is(account.id, 'user123', '"add" event emmited with account.id')
  })
  api.accounts.on('remove', function (account) {
    t.pass('remove event emitted')
    t.is(account.username, 'foo', '"remove" event emmited with account.username')
    t.is(account.id, 'user123', '"remove" event emmited with account.id')
  })

  api.accounts.add({
    id: 'user123',
    username: 'foo',
    password: 'foosecret'
  })

  .then(function (account) {
    t.is(account.username, 'foo', 'creates account')

    return api.sessions.add({username: account.username})
  })

  .then(function (session) {
    t.ok(session.id, 'creates session')

    return api.sessions.remove(session.id, {include: 'account.profile'})
  })

  .then(function (session) {
    t.ok(session.account.id, 'removes session')

    return api.accounts.remove(session.account.id)
  })

  .then(function (account) {
    t.pass('deletes account')
  })

  .catch(t.error)
})
