/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file servers.js
 * @version 1.0
 * This file holds the connection details for the server/s
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
/** This is the nickname of the current chosen server.  */
var CurrentServer;


document.getElementById("connectedServers").addEventListener("click", function(event) {
    getServerList();
});

/** event handler for teh add server icon */
document.getElementById("addDataSourceDiv").addEventListener("click", function(event) {
    document.getElementById("newServerConnection").style.display = "flex";
});


/** This function will get a list of teh connected servers and display them in teh left pane. */
async function getServerList() {
    let cleanContent = "<img id='connectedServers' src='images/data.png' alt='Connected Servers'/><span></span>";
    document.getElementById("leftContent").innerHTML = cleanContent;
    var notificationPosition = setNotification("Getting server listings.");
    let itemCount = -1;
    var serverData = "<ul id='serverList'>";
    var serverObj = new Map();
    UserObjs.forEach(async function(userdetails) {
        if ( userdetails.host != "localhost" ) {
            //Is this one for the current user. It should be but we had better make sure
            if ( userdetails.localusername === document.getElementById("userDetails").innerText ) {
                itemCount++;
                serverData += "<li nickname='" + userdetails.nickname + "'><span class='caret toplevel nickname' id='" + userdetails.nickname + ".server' nickname='" + userdetails.nickname + "'>" + userdetails.nickname + "</span><ul class='nested'>";
                serverData += "<li nickname='" + userdetails.nickname + "'><span class='title' nickname='" + userdetails.nickname + "'>User:</span> " + userdetails.username + "</li>";
                serverData += "<li nickname='" + userdetails.nickname + "'><span class='title' nickname='" + userdetails.nickname + "'>Host:</span> " + userdetails.host + "</li>";
                serverData += "<li nickname='" + userdetails.nickname + "'><span class='caret toplevel' id='" + userdetails.nickname + ".tables' nickname='" + userdetails.nickname + "'>Tables</span>";
                serverData += "<ul class='nested' nickname='" + userdetails.nickname + "'></ul></li>";
                serverData += "<li nickname='" + userdetails.nickname + "'><span class='caret toplevel' id='" + userdetails.nickname + ".views' nickname='" + userdetails.nickname + "'>Views</span>";
                serverData += "<ul class='nested' nickname='" + userdetails.nickname + "'></ul></li>";
                serverData += "</ul></li>";
                serverObj.set("user", userdetails.username);
                serverObj.set("password", userdetails.password);
                serverObj.set("host", userdetails.host);
                serverObj.set("nickname", userdetails.nickname);                
            }
        }
    });  
    if ( itemCount <0 ) {
        //Display the server login dialog
        alert ( "You currently do not have any server setup" );
        document.getElementById("newServerConnection").style.display = "flex";
    } else {
        document.getElementById("leftContent").innerHTML += serverData + "</ul>";
        //Event listner for the server list
        var servers = document.getElementsByClassName("toplevel");
        for (let iter = 0; iter < servers.length; iter++) {
            servers[iter].addEventListener("click", function() {
                updateNicknameText(this.getAttribute("nickname"));
                //Is this a top level server click. If so we will fill the CurrentServer
                if ( this.id.includes(".server") ) {
                    CurrentServer = this.id.substr(0, this.id.indexOf(".") );
                    updateNicknameText(CurrentServer);
                }
                var parent;
                try {
                    parent= document.getElementById(this.id).parentElement.childNodes[1];
                    
                } catch ( error ){}
                this.parentElement.querySelector(".nested").classList.toggle("active");
                hideMenus();
                let tog = this.classList.toggle("caret-down");
                if ( tog && this.id.includes(".tables") ) {
                    (async ()  => {
                        let count = 0;
                        parent.innerHTML = "";
                        this.style.cursor = "wait";
                        let loginDetails = await getServerDetails();
                        getTabbleData(0, parent, loginDetails.get("user"), loginDetails.get("password"), loginDetails.get("host"));
                        this.style.cursor = "default";
                    })();
                }
                else if ( tog && this.id.includes(".views") ) {
                    (async ()  => {
                        parent.innerHTML = "";
                        this.style.cursor = "wait";
                        let loginDetails = await getServerDetails();
                        getTabbleData(1, parent, loginDetails.get("user"), loginDetails.get("password"), loginDetails.get("host"));
                        this.style.cursor = "default";
                    })();
                } else {
                    getActiveSessions();
                }
            });
        }    
    }

    //all done
    removeNotification(notificationPosition);
}

/** This function will display teh table and view structure. Outputting the results
 * in to the left hand pane.
 */
async function getTabbleData(type, parentId, user, password, host) {
    parentId.style.cursor = "waiting";
    var notificationPosition = setNotification("Getting table schema for " + host + " With user " + user);
    var query;
    if ( type == 0 ) {
        query = "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'";
    } else if ( type == 1 ){
        query = "select table_name from INFORMATION_SCHEMA.views WHERE table_schema = ANY (current_schemas(false))";
    }else return;

    let response = null;
    response = await callServer(host, user, password, query);  
    let message = GetJsonValue(response, "Response");
    if ( message == "Fail" ) {
        message = GetJsonValue(response, "Message");
        if ( message === "" ) {
            message = "User cannot be logged in. Please retry";
        }
        alert ( message );
    } else {
        //How hum here comes teh fun!
        //Place this into an array holding just the table names
        let tableHaeder = response.split("\n");
        let isFirst = true;
        for ( let pos = 0; pos < tableHaeder.length; pos++ ) {
            if ( pos > 0 ) {
                if ( tableHaeder[pos] != "" ) {
                    query = "SELECT column_name, column_default, is_nullable, udt_name, character_maximum_length FROM information_schema.columns WHERE table_schema = 'public' AND TABLE_NAME = '" + tableHaeder[pos] + "'";
                    response = await callServer(host, user, password, query);  
                    let tableSchema = response.split("\n");
                    displayTableData(tableHaeder[pos],tableSchema, parentId, user, password, host );
                }                
            }
        }
    }
    parentId.style.cursor = "default";  
    removeNotification(notificationPosition);  
}

function displayTableData(tableName, tableSchema, parentId, user, password, host) {

    let html = "<li nickname='" + getNickName() +"'><span class='caret tablelevel' onclick='menuClick(this)' id='" + tableName + ".selectedTable' nickname='" + getNickName() +"'>" + tableName + "</span>";
    let isHeader = true;
    let fields = [];
    let position = 0;
    html += "<ul class='nested'>";
    tableSchema.forEach(rows => {
        if ( isHeader ) { 
            fields = rows.split(",");
            isHeader = false 
        }
        else {
            
            let items = rows.split(",");
            if ( items[0] == undefined ) { return; } 
            if ( items[0] == "" ) { return; }
            items.forEach(item => {
                switch ( position ) {
                    case 0: 
                    html += "<li><span class='caret tablelevel' nickname='" + getNickName() +"'>" + item + "</span><ul class='nested'>";
                    position++;
                    break;
                    case 1: html += "<li title='Default value' nickname='" + getNickName() +"'>" + item + "</li>";
                    position++;
                    break;
                    case 2: html += "<li title='Nullable' nickname='" + getNickName() +"'>" + item + "</li>"
                    position++;
                    break;  
                    case 3: html += "<li title='data type' nickname='" + getNickName() +"'>" + item + "</li>"
                    position++;
                    break;  
                    case 4: html += "<li title='Maximum length' nickname='" + getNickName() +"'>" + item + "</li>"
                    html += "</ul></li>"
                    position = 0;
                    break;               
                }//end swithc
            });//end foreach on items
        }
    });//end foreach on tableSchema
    parentId.innerHTML += html;

    var servers = document.getElementsByClassName("tablelevel");
    for (let iter = 0; iter < servers.length; iter++) {
        servers[iter].addEventListener("click", function() {
            hideMenus();
            updateNicknameText(this.getAttribute("nickname"));
            var parent;
            try {
                parent= document.getElementById(this.id).parentElement.childNodes[1];
            } catch ( error ){}
            this.parentElement.querySelector(".nested").classList.toggle("active");
            let tog = this.classList.toggle("caret-down");
            if ( tog && this.id.includes(".tables") ) {
                parent.innerHTML = "";
                getTabbleData(0, parent, serverObj.get("user"), serverObj.get("password"), serverObj.get("host"));
            }
            else if ( tog && this.id.includes(".views") ) {
                parent.innerHTML = "";
                getTabbleData(1, parent, serverObj.get("user"), serverObj.get("password"), serverObj.get("host"));
            } 
        });
    } 

    html += "";
}

async function getServer(serverObj) {
    var notificationPosition = setNotification("Checking " + serverObj.get("host") + " details.");
    let user = serverObj.get("username");
    let password = serverObj.get("password");
    let server = serverObj.get("host");
    let response = await callServer(server, user, password, "SELECT  COUNT(specific_classifications_meta.content_id) FROM specific_classifications_meta, full_index_meta where type NOT LIKE 'email' AND  specific_classifications_meta.content_id = full_index_meta.content_id");
    if ( response == undefined ) {//This is generally a DNS error
        alert ( "There was an error connecting to the server, please check the server address and try again." );
    } else {
        //See what we have. Is it a message or a number?
        let message = GetJsonValue(response, 'Response');
        if ( message == 'Fail' ) {
            message = GetJsonValue(response, 'Message');
            if ( message === '' ) {
                message = 'User cannot be logged in. Please retry';
            }
            alert ( message );
        } else {
            //We can move on
        }
    }
    removeNotification(notificationPosition);  
}

document.getElementById("cancelServerConnectionButton").addEventListener("click", function(event) {
    document.getElementById("newServerConnection").style.display = "none";
});

document.getElementById("createServerConnectionButton").addEventListener("click", function(event) {
    createNewServerConnection();
});

document.getElementById("quicklinkAddServer").addEventListener("click", function(event) {
    document.getElementById("newServerConnection").style.display = "flex";
});

/** This function will setup a new server. Testing teh creds first
 * logiig in and then activating it within teh UI
 */
async function createNewServerConnection() {
    var notificationPosition = setNotification("Setting up server " + document.getElementById("serverAddress"));
    //Test the connection first
    let response = await callServer(document.getElementById("serverAddress").value, document.getElementById("serverUsername").value,
    document.getElementById("serverPassword").value, "SELECT  COUNT(specific_classifications_meta.content_id) FROM specific_classifications_meta, full_index_meta where type NOT LIKE 'email' AND  specific_classifications_meta.content_id = full_index_meta.content_id");
    if ( response == undefined ) {//This is generally a DNS error
        alert ( "There was an error connecting to the server, please check the server address and try again." );
    } else {
        let newItem = [{ username: document.getElementById("serverUsername").value, password: document.getElementById("serverPassword").value, 
        host: document.getElementById("serverAddress").value, nickname: document.getElementById("serverNickname").value, 
        localusername: document.getElementById("userDetails").innerText, date: getCurrentDate() }];
        //We will add this to the UsersDatabase
        UserObjs.push(newItem[0]);
        let created = await update(UserObjs);
        if ( created ) {
            alert ( "Server has been saved.");
            document.getElementById("newServerConnection").style.display = "none";
            removeNotification(notificationPosition); 
            document.getElementById("serverAddress").value = "";
            document.getElementById("serverNickname").value = "";
            document.getElementById("serverPassword").value = "";
            document.getElementById("serverUsername").value = "";
            getServerList();
        } else {
            alert ( "There has been an error and the server was not saved. Please retry.");
            document.getElementById("newServerConnection").style.display = "none";
            document.getElementById("serverAddress").value = "";
            document.getElementById("serverNickname").value = "";
            document.getElementById("serverPassword").value = "";
            document.getElementById("serverUsername").value = "";
            removeNotification(notificationPosition); 
        }
    }     
}

/* @function callServer(string, string, string, string)
* This function will make an async call to the server 
* it requires server url, username, password and query 
* will return a promise;
*/
async function callServer(server, user, password, query) {
    let completed = false;
    var responseData;
    var promise = new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve (xhttp.responseText);
                responseData = xhttp.responseText;
                completed = true;
            }
        };
        xhttp.onerror= function(error) {
            console.log(error);
            resolve();
            completed = true;
        };
        var request = server + "/cgi-bin/select?username=" + user + "&password=" + password + "&query=" + query;
        xhttp.open("GET", request, true);
        try {
            xhttp.send();
        } catch ( error ) {
            console.log(error);
            resolve();
            completed = true; 
        }
    });
    var wait = 1000;
    while ( completed == false ) {
        if ( wait >= MAXSLEEP ) {
            break;
        } else {
            wait = wait + 1000;
            await sleep(1000);
        }
    }
    return responseData;
 }

 /** This method will search teh local db and get teh server login details */
 async function getServerDetails() {
     var completed = false;
     let serverMap = new Map();
     let found = false;
    try {
        UserObjs.every(async function(serverDetails) {
            if ( serverDetails.nickname === getNickName() ) {
                serverMap.set("user", serverDetails.username);
                serverMap.set("password", serverDetails.password);
                serverMap.set("host", serverDetails.host);
                completed= true;
                return false;
            }
            return true;
        })
    } catch ( err ) {
        alert ( err );
        completed = true;
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
    return serverMap;
}

function updateNicknameText(name) {
    let items = document.getElementsByClassName("serverNicknameDiv");
    for (let iter = 0; iter < items.length; iter++) {
        items[iter].innerText = name
    }
    if ( name != "Not currently connected" ){
        document.getElementById("manageUsersLink").innerText = "Manage Users for " + name;
    }
}

function getNickName() {
    let items = document.getElementsByClassName("serverNicknameDiv");
    for (let iter = 0; iter < items.length; iter++) {
        return items[iter].innerText;
    }    
}