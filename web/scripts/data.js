/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file data.js
 * @version 1.0
 * This file holds the user creds. We could use IndexedDB completely
 * but it can cause some issues with older browsers. So now we have this
 * 
 * Naming Conventions
 * Global Variables: PascalCase - ThisGlobal
 * Constants: UPPERCASE - THISCONSTANT
 * Local Variables: - CamelCase thisLocal
 * Operators: - Space around - this = this + that;
 * Statement End: Colon let thisAttay = [];
 * Line End: Colon let this = myFunction();
 * Function names: CamelCase - function thisIsMyFunction(){}
 * Quotations:
 * HTML Output: Attributes Single Quote (')
 * Text items: Double Quote (")
 * Back ticks: (`) These are used where we pull variables in to a string so that we can pass the attribute quotes without too much confusion
 * Readability: We try to make the code readable which sometimes means compromising on consicness. In places you will see 
 * a long hand loop instead of a more simple lambda loop (Arrow one). as an example.
 *********************************************************************************************************************/

 var UserDatabase;
 var UserObjs;

 async function openFileDatabase() {
    //var req =  await window.indexedDB.deleteDatabase("omniindex_files");
    let completed = false;
    let request = await window.indexedDB.open("omniindex_files", 1);
    request.onerror = function() {
        console.log('User Database failed to open');
    };
    var fileDb;
    // onsuccess handler signifies that the database opened successfully
    request.onsuccess = function() {
        console.log("Database opened successfully");
        fileDb = request.result;
        completed = true;
      };

    request.onupgradeneeded = function(e) {
        let db = e.target.result;
        let objectStore = db.createObjectStore("omniindex_files", { keyPath: "id", autoIncrement:true });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("content", "content", { unique: false });
        objectStore.createIndex("date", "date", { unique: false });
        console.log("Database setup complete");
  };

  var wait = 1000;
  while ( completed == false ) {
      if ( wait >= MAXSLEEP ) {
          break;
      } else {
          wait = wait + 1000;
          await sleep(1000);
      }
  } 
  return fileDb;
} 



async function openLocalUserDatabase() {
    //Do we have it already?
    let db = await openFileDatabase();
    let transaction = db.transaction(["omniindex_files"], "readwrite");
    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore("omniindex_files");
    const index = objectStore.index("name");
    let data = index.get("oidx.json");
    data.onsuccess = (event) => {
        if ( event.target.result ) {
            var reader = new FileReader();
            reader.onload = function() {
                //UserDatabase = reader.result;
                UserDatabase = JSON.parse(reader.result);
                UserObjs = UserDatabase.user;
            }
            reader.readAsText(event.target.result.content);
        } else {
            (async() => {
                let jasonData = "{\"oidx\" : \"users\", \"user\" : []}";
                let blob = new Blob([jasonData], {type: "text/json"});
                let newItem = { name: "oidx.json", content: blob, date: getCurrentDate() };
                let request = await objectStore.add(newItem);
                request.onsuccess = function() {
                    transaction.commit();
                };
                request.onerror = function(error) {
                    alert ( error );
                }
                })();
        }
    };//yes we do
    data.onerror = (event) => {
        //No we do not
        (async() => {
        let jasonData = "{\"oidx\" : \"users\", \"user\" : []}";
        let blob = new Blob([jasonData], {type: "text/json"});
        let newItem = { name: "oidx.json", content: blob, date: getCurrentDate() };
        let objectStore = transaction.objectStore("omniindex_files");
        let request = await objectStore.add(newItem);
        request.onsuccess = function() {
            transaction.commit();
        };
        request.onerror = function(error) {
            alert ( error );
        }
        })();
    }    
}

openLocalUserDatabase();

async function update(data) {
    let working = true;
    var created = false;
    let json = JSON.stringify(data);
    json = "{\"oidx\" : \"users\", \"user\" : " + json + "}";
    let db = await openFileDatabase();
    let transaction = db.transaction(["omniindex_files"], "readwrite");
    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore("omniindex_files");
    objectStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.name === "oidx.json") {
            var updateData = cursor.value;
            let blob = new Blob([json], {type: "text/json"});
            updateData.content = blob;
            const request = cursor.update(updateData);
            request.onsuccess = function() {
              working = false;
              created = true;
            };
          };
          cursor.continue();
        }
    };
    var wait = 1000;
    while ( working == true ) {
        if ( wait >= MAXSLEEP ) {
            break;
        } else {
            wait = wait + 1000;
            await sleep(1000);
        }
    } 
    return created;    
}