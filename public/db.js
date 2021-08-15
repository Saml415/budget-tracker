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

  const transaction = db.transaction(["BudgetStore"], "readonly");

  const store = transaction.objectStore("BudgetStore");

  const getAll = store.getAll();

  getAll.onsuccess = async function () {
    if (getAll.result.length === 0) {
      return;
    }

    const response = await fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const dbTransactions = await response.json();

    if (dbTransactions.length > 0) {
      const delTxn = db.transaction(["BudgetStore"], "readwrite");

      const currentStore = delTxn.objectStore("BudgetStore");

      currentStore.clear();
      console.log("Clearing store 🧹");
    }
  };
}

window.addEventListener("online", checkDatabase);
