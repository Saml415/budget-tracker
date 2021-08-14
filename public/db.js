// TODO: setup indexedDb connection and create an object store for saving
// transaction data when the user is offline.

let db;

const request = indexedDB.open("BudgetDB", budgetVersion);

request.onerror = function (evt) {
  console.log(evt.target);
  console.log(`Woops! ${evt.target.errorCode}`);
};

request.onupgradeneeded = function (evt) {
  console.log("Upgrade needed in IndexDB");

  const { oldVersion } = evt;
  const newVersion = evt.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = evt.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};
request.onsuccess = function (evt) {
  console.log("success");
  db = evt.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log("Backend online! 🗄️");
    checkDatabase();
  }
};

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
window.addEventListener("online", checkDatabase);
