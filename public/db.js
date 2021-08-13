// TODO: setup indexedDb connection and create an object store for saving
// transaction data when the user is offline.

function saveRecord(record) {
  // TODO: this function should save a transaction object to indexedDB so that
  // it can be synced with the database when the user goes back online.
}

function checkDatabase() {
  // TODO: this function should check for any saved transactions and post them
  // all to the database. Delete the transactions from IndexedDB if the post
  // request is successful.
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
