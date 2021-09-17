/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file editor.js
 * @version 1.0
 * This file holds the scripts for teh SQL editor
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

  // Setup the dnd listeners.
  var dropZone = document.getElementById('editor');

  document.getElementById('editor').addEventListener("dragover", function(event) {
    hideMenus();
    event.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  });

  document.getElementById('editor').addEventListener("drop", function(event) {
    hideMenus();
    event.preventDefault();
    var data = ev.dataTransfer.getData("text");
    if ( data.toLowerCase().includes("<span") || data.toLowerCase().includes("<div") ) {
        alert ("You can only paste plain text into the editor.");
    } else {
        document.getElementById('editor').innerText = data;
    }
  });

document.getElementById('editor').addEventListener("click", function(event) {
    hideMenus();  
});

 document.getElementById("showSQLEditor").addEventListener("click", function(event) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("showSQLEditor").classList.add("selected");
    document.getElementById("sqlEditorContainer").style.display = "Block";
    document.getElementById("sqlEditorContainer").style.opacity = "1";
});

document.getElementById("runSqlButton").addEventListener("click", function(event) {
    if ( document.getElementById("editor").innerText != "" 
        && document.getElementById("editor").innerText != "--- No SQL Query is currently being run ---" ) {
            if ( CurrentServer == null ) {
                alert ("please connect to a server instance first. Try choosing one in your server list.");
            } else {
                (async () => {
                    var notificationPosition = setNotification("Running editor query.");
                    document.getElementById("resultsTableDiv").style.cursor = "wait";
                    document.getElementById("editor").style.cursor = "wait";
                    //We need to get the server details so we can access it
                    serverMap = await getServerDetails();
                    let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), document.getElementById("editor").innerText);
                    createTableDisplay(response);
                    removeNotification(notificationPosition);
                    document.getElementById("resultsTableDiv").style.cursor = "default";
                    document.getElementById("editor").style.cursor = "default";
                }) ();
            }
        }
});

document.getElementById("openResultsButton").addEventListener("click", function(event) {
    //We will see if we have results, if we do we will display them.
    document.getElementById('waitingHolder').style.display = 'flex';
        (async() => {
            let db = await openFileDatabase();
            let transaction = db.transaction(["omniindex_files"], "readwrite");
            let objectStore = transaction.objectStore("omniindex_files");
            //Remove existing lists oin teh file dialog
            let dialogList = document.getElementById('dialogFileListing');
            while (dialogList.firstChild) {
                dialogList.removeChild(dialogList.firstChild);
            }
            var req = objectStore.openCursor();
            req.onerror = function(event) {
              console.log("case if have an error");
            };
            req.onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor){
                    if(cursor.value.name.includes(".csv")){//we find by id an user we want to update
                        let listItem = document.createElement("div");
                        listItem.className = 'row';
                        const imageType = document.createElement("div");
                        imageType.className = 'itemimage';
                        const image = document.createElement("img");
                        image.setAttribute("src", "images/csv.png");
                        image.setAttribute("alt", "csv File");
                        imageType.appendChild(image);
                        const fileName = document.createElement("div");
                        fileName.className = 'item';
                        fileName.textContent = cursor.value.name;
                        const fileDate = document.createElement("div");
                        fileDate.classList = 'item date';
                        fileDate.textContent = cursor.value.date;
                        listItem.appendChild(imageType);
                        listItem.appendChild(fileName);
                        listItem.appendChild(fileDate);
                        dialogList.appendChild(listItem);
                    }
                    cursor.continue();
                    var items = document.getElementsByClassName("row");
                    for (let iter = 0; iter < items.length; iter++) {
                        items[iter].addEventListener("click", function() {
                            document.getElementById('dialogFilename').value = items[iter].childNodes[1].innerText;
                        });
                        items[iter].addEventListener("dblclick ", function() {
                            document.getElementById('dialogFilename').value = items[iter].childNodes[1].innerText;
                            openFile(items[iter].childNodes[1].innerText);
                        });
                    }
                }
            }
        })();
        document.getElementById('waitingHolder').style.display = 'none';
        document.getElementById("dialogTitle").innerText = "OmniIndex Open Dialog (CSV)";
        document.getElementById("dialogFilename").value = "";
        document.getElementById("dialogOkButton").innerText = "Open";
        document.getElementById("fileDialog").style.display = "flex";
    document.getElementById('waitingHolder').style.display = 'none';
});

document.getElementById("exportResultsButton").addEventListener("click", function(event) {
    //We will see if we have results, if we do we will export it.
    if ( CurrentResultSet != null ) {
        var notificationPosition = setNotification("Exporting current dataset to a scsvcv format.");
        try {
            var blob = new Blob([CurrentResultSet], {type: "text/csv"});
            const READER = new FileReader();
            let url;
            READER.readAsDataURL(blob);
            READER.onload =  function(e){
                window.open(e.target.result);
                URL.revokeObjectURL(blob);     
            };
     } catch (err) {
         console.log("exportResultsButton click event " + err);
     }
    }
    removeNotification(notificationPosition);
});

/** We will place teh file dialog bits in here, just because we can.. */

/*async function openFileDatabase() {
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
}  */

document.getElementById("closeFileDialog").addEventListener("click", function(event) {
    document.getElementById("fileDialog").style.display = "None";
});

document.getElementById("dialogCancelButton").addEventListener("click", function(event) {
    document.getElementById("fileDialog").style.display = "None";
});

document.getElementById("saveSqlButton").addEventListener("click", function(event) {
    if ( document.getElementById("editor").innerText == "--- No SQL Query is currently being run ---" ||
    document.getElementById("editor").innerText == "" ) {
        return;
    }
    document.getElementById("dialogTitle").innerText = "OmniIndex Save Dialog (SQL)";
    document.getElementById("dialogOkButton").innerText = "Save";
    document.getElementById("fileDialog").style.display = "flex";
    document.getElementById("dialogFilename").value = "";
});

document.getElementById("saveResultsButton").addEventListener("click", function(event) {
    if ( CurrentResultSet== null || CurrentResultSet == "" ) {
        alert ("Please run a query before saving the reults!");
        return;
    }

    (async() => {
        let db = await openFileDatabase();
        let transaction = db.transaction(["omniindex_files"], "readwrite");
        let objectStore = transaction.objectStore("omniindex_files");
        //Remove existing lists oin teh file dialog
        let dialogList = document.getElementById('dialogFileListing');
        while (dialogList.firstChild) {
            dialogList.removeChild(dialogList.firstChild);
        }
        var req = objectStore.openCursor();
        req.onerror = function(event) {
          console.log("case if have an error");
        };
        req.onsuccess = function(event) {
            var cursor = event.target.result;
            if(cursor){
                if(cursor.value.name.includes(".csv")){//we find by id an user we want to update
                    let listItem = document.createElement("div");
                    listItem.className = 'row';
                    const imageType = document.createElement("div");
                    imageType.className = 'itemimage';
                    const image = document.createElement("img");
                    image.setAttribute("src", "images/csv.png");
                    image.setAttribute("alt", "csv File");
                    imageType.appendChild(image);
                    const fileName = document.createElement("div");
                    fileName.className = 'item';
                    fileName.textContent = cursor.value.name;
                    const fileDate = document.createElement("div");
                    fileDate.classList = 'item date';
                    fileDate.textContent = cursor.value.date;
                    listItem.appendChild(imageType);
                    listItem.appendChild(fileName);
                    listItem.appendChild(fileDate);
                    dialogList.appendChild(listItem);
                }
                cursor.continue();
                var items = document.getElementsByClassName("row");
                for (let iter = 0; iter < items.length; iter++) {
                    items[iter].addEventListener("click", function() {
                        document.getElementById('dialogFilename').value = items[iter].childNodes[1].innerText;
                    });
                    items[iter].addEventListener("dblclick ", function() {
                        document.getElementById('dialogFilename').value = items[iter].childNodes[1].innerText;
                        openFile(items[iter].childNodes[1].innerText);
                    });
                }
            }
        }
    })();


    document.getElementById("dialogTitle").innerText = "OmniIndex Save Dialog (CSV)";
    document.getElementById("fileDialog").style.display = "flex";
    document.getElementById("dialogOkButton").innerText = "Save";
    document.getElementById("dialogFilename").value = "";
});

document.getElementById("openSqlButton").addEventListener("click", function(event) {
    document.getElementById('waitingHolder').style.display = 'flex';
    (async() => {
        let db = await openFileDatabase();
        let transaction = db.transaction(["omniindex_files"], "readwrite");
        let objectStore = transaction.objectStore("omniindex_files");
        //Remove existing lists oin teh file dialog
        let dialogList = document.getElementById('dialogFileListing');
        while (dialogList.firstChild) {
            dialogList.removeChild(dialogList.firstChild);
        }
        var req = objectStore.openCursor();
        req.onerror = function(event) {
          console.log("case if have an error");
        };
        req.onsuccess = function(event) {
            var cursor = event.target.result;
            if(cursor){
                if(cursor.value.name.includes(".sql")){//we find by id an user we want to update
                    let listItem = document.createElement("div");
                    listItem.className = 'row';
                    const imageType = document.createElement("div");
                    imageType.className = 'itemimage';
                    const image = document.createElement("img");
                    image.setAttribute("src", "images/sql.png");
                    image.setAttribute("alt", "sql File");
                    imageType.appendChild(image);
                    const fileName = document.createElement("div");
                    fileName.className = 'item';
                    fileName.textContent = cursor.value.name;
                    const fileDate = document.createElement("div");
                    fileDate.classList = 'item date';
                    fileDate.textContent = cursor.value.date;
                    listItem.appendChild(imageType);
                    listItem.appendChild(fileName);
                    listItem.appendChild(fileDate);
                    dialogList.appendChild(listItem);
                }
                cursor.continue();
                var items = document.getElementsByClassName("row");
                for (let iter = 0; iter < items.length; iter++) {
                    items[iter].addEventListener("click", function() {
                        document.getElementById('dialogFilename').value = items[iter].childNodes[1].innerText;
                    });
                    items[iter].addEventListener("dblclick ", function() {
                        document.getElementById('dialogFilename').value = items[iter].childNodes[1].innerText;
                        openFile(items[iter].childNodes[1].innerText);
                    });
                }
            }
        }
    })();
    document.getElementById('waitingHolder').style.display = 'none';
    document.getElementById("dialogTitle").innerText = "OmniIndex Open Dialog (SQL)";
    document.getElementById("dialogFilename").value = "";
    document.getElementById("dialogOkButton").innerText = "Open";
    document.getElementById("fileDialog").style.display = "flex";
});

document.getElementById("dialogOkButton").addEventListener("click", function(event) {
    var notificationPosition;
    document.getElementById('waitingHolder').style.display = 'flex';
    if ( document.getElementById("dialogOkButton").innerText === "Save" ) {
        var fileDb;
        var transaction;
        (async () => {
            fileDb = await openFileDatabase();
            transaction = fileDb.transaction(["omniindex_files"], "readwrite");
            var content;
            var name;
            if ( document.getElementById("dialogTitle").innerText.includes ("(SQL)" ) ) {
                content = document.getElementById("editor").innerText;
                name = document.getElementById("dialogFilename").value + ".sql";
            } else {
                if ( CurrentResultSet== null || CurrentResultSet == "") {
                    document.getElementById('waitingHolder').style.display = 'none';
                    alert ("Please run a query and then come back to save the resultsset!");
                    return;
                } else {
                    content = CurrentResultSet;
                    name = document.getElementById("dialogFilename").value + ".csv"
                }
            }
            if ( document.getElementById("dialogFilename").value == "" || document.getElementById("dialogFilename").value == null ) {
                    alert ( "Please provide a name for your file!" );
            } else {
                let newItem = { name: name, content: content, date: getCurrentDate() };
                let objectStore = transaction.objectStore("omniindex_files");
                (async () => {
                    let request = await objectStore.add(newItem);
                    request.onsuccess = function() {
                        if ( document.getElementById("dialogTitle").innerText.includes ("(SQL)" ) ) {
                            alert ( document.getElementById("dialogFilename").value + ".sql.\nHas been saved to the local storage.");
                            notificationPosition = setNotification("Saving file " +  document.getElementById("dialogFilename").value + ".sql");
                        } else {
                            alert ( document.getElementById("dialogFilename").value + ".csv.\nHas been saved to the local storage.");
                            notificationPosition = setNotification("Saving file " +  document.getElementById("dialogFilename").value + ".csv");
                        }
                    };
                    request.onerror = function(error) {
                        alert ( error );
                    }
                })();
            }
        })();
    } else {
        openFile(document.getElementById("dialogFilename").value );
    }
    removeNotification(notificationPosition);
    document.getElementById("waitingHolder").style.display = "none";
    document.getElementById("fileDialog").style.display = "none";
});

async function openFile(filename) {
    document.getElementById('fileDialog').style.display = 'flex';
    let completed = false;
    try {
        fileDb = await openFileDatabase();
        transaction = fileDb.transaction(["omniindex_files"], "readwrite");
        // call an object store that's already been added to the database
        let objectStore = transaction.objectStore("omniindex_files");
        const index = objectStore.index("name");
        let query = index.get(filename);
        query.onsuccess = (event) => {
            var notificationPosition = setNotification("Opening the file " + filename);
            document.getElementById('fileDialog').style.display = 'none'; 
            let data = query.result;
            var reader = new FileReader();
            reader.onload = function() {
                if ( filename.toLowerCase().includes(".csv") ) {
                    createTableDisplay(reader.result);
                } else if ( filename.toLowerCase().includes(".sql") ) {
                    document.getElementById('editor').textContent = reader.result;
                } else {
                    const win = window.open(reader.result, "_blank");
                    win.focus();  
                    URL.revokeObjectURL(data.content);    
                }
                removeNotification(notificationPosition);
            }
            if ( filename.toLowerCase().includes(".csv") ) {
                let blob = new Blob([data.content], {type: "text/csv"});
                reader.readAsText(blob);
            } else if ( filename.toLowerCase().includes(".sql") ) {
                let blob = new Blob([data.content], {type: "text/text"});
                reader.readAsText(blob);
            } else {
                let blob = new Blob([data.content], {type: "application/octet-stream"});//probably!
                reader.readAsText(blob);
                reader.readAsDataURL(data.content);
            }
        };
        query.onerror = (event) => {
            console.log(event.target.errorCode);
        }
    } catch ( err ) {
        alert ( err );
    }
    var wait = 1000;
    while ( completed == false ) {
        if ( wait >= MAXSLEEP ) {
            break;
        } else {
            wait = wait + 1000;
            await sleep(1000);
        }
    } 
    document.getElementById('fileDialog').style.display = 'none';
  
}