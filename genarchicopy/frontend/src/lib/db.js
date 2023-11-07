let request;
let db;
let version = 1;

export const initDB = () => {
    return new Promise((resolve) => {
        request = indexedDB.open("myDB");

        request.onupgradeneeded = () => {
            db = request.result;
            if (!db.objectStoreNames.contains("quotes")) {
                console.log("Creating users store");
                db.createObjectStore("quotes", { keyPath: "_id" });
            }
        };

        request.onsuccess = () => {
            db = request.result;
            version = db.version;
            console.log("request.onsuccess - initDB", version);
            resolve(true);
        };

        request.onerror = () => {
            resolve(false);
        };
    });
};

export const addData = (storeName, data) => {
    return new Promise((resolve) => {
        request = indexedDB.open("myDB", version);

        request.onsuccess = () => {
            console.log("request.onsuccess - addData", data);
            db = request.result;
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            store.add(data);
            resolve(data);
        };

        request.onerror = () => {
            const error = request.error?.message;
            if (error) {
                resolve(error);
            } else {
                resolve("Unknown error");
            }
        };
    });
};

export const deleteData = (storeName, key) => {
    return new Promise((resolve) => {
        request = indexedDB.open("myDB", version);

        request.onsuccess = () => {
            console.log("request.onsuccess - deleteData", key);
            db = request.result;
            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            const res = store.delete(key);

            res.onsuccess = () => {
                resolve(true);
            };
            res.onerror = () => {
                resolve(false);
            };
        };
    });
};

export const getStoreData = (storeName) => {
    return new Promise((resolve) => {
        request = indexedDB.open("myDB");

        request.onsuccess = () => {
            console.log("request.onsuccess - getAllData");
            db = request.result;
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const res = store.getAll();
            res.onsuccess = () => {
                resolve(res.result);
            };
        };
    });
};
