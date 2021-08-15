// TODO: setup indexedDb connection and create an object store for saving
// transaction data when the user is offline.

let db;
const budgetVersion = 1;

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
  console.log("Save recorded");

  const transaction = db.transaction(["BudgetStore"], "readwrite");

  const store = transaction.objectStore("BudgetStore");

  store.add(record);
}

function checkDatabase() {
  console.log("check db invoked");

  // Open a transaction on your BudgetStore db
  const transaction = db.transaction(["BudgetStore"], "readonly");

  // access your BudgetStore object
  const store = transaction.objectStore("BudgetStore");

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = async function () {
    if (getAll.result.length === 0) {
      // no items to post to backend
      return;
    }
    // If there are items in the store, we need to bulk add them when we are back online
    const response = await fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const dbTransactions = await response.json();
    // If our returned response is not empty
    if (dbTransactions.length > 0) {
      // Open another transaction to BudgetStore with the ability to read and write
      const delTxn = db.transaction(["BudgetStore"], "readwrite");

      // Assign the current store to a variable
      const currentStore = delTxn.objectStore("BudgetStore");

      // Clear existing entries because our bulk add was successful
      currentStore.clear();
      console.log("Clearing store 🧹");
    }
  };
  // TODO: this function should check for any saved transactions and post them
  // all to the database. Delete the transactions from IndexedDB if the post
  // request is successful.
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
