/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file console.js
 * @version 1.0
 * This file holds the main global variables and globalfunctions for the dashboard.
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

/** Debug variable MUST be set to false for production or on a live server */
const DEBUG = false;
/** Used for waiting timers  */
const MAXSLEEP = 10000;


/** Is the user logged in */
var IsLoggedIn = false;
/** login variables  */
var User = undefined;
var Password = undefined;
var Server = undefined;

/**! This captures the mousemove event so we can position menus correctly */
var MouseEvent;
document.getElementById("page").addEventListener("mousemove", function(event) {
    MouseEvent = event;
});


function hideTabs() {
    let items = document.getElementsByClassName("tabbedArea");
    for (let iter = 0; iter < items.length; iter++) {
        items[iter].style.display = "none";
        items[iter].style.opacity = "0";
    }
    hideMenus();
}

function toggleTabBackground() {
    let items = document.getElementsByClassName("tab");
    for (let iter = 0; iter < items.length; iter++) {
        items[iter].classList.remove("selected");
    }    
}

document.getElementById("showHome").addEventListener("click", function(event) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("showHome").classList.add("selected");
    document.getElementById("quickLinksBar").style.display = "flex";
    document.getElementById("quickLinksBar").style.opacity = "1";
});

document.getElementById("quickLinkGuide").addEventListener("click", function(event) {
    window.open("https://docs.omniindex.io");
});

document.getElementById("quickLinksOidxWeb").addEventListener("click", function(event) {
    window.open("https://www.omniindex.io");
});

document.getElementById("quickLinksVimeo").addEventListener("click", function(event) {
    window.open("https://vimeo.com/user138351364");
});

document.getElementById("quickLinksGit").addEventListener("click", function(event) {
    window.open("https://github.com/OmniIndex/public");
});


/** This is the page load handler. Place all items that must be loaded at the very start in here */
window.onload = function() {
    //var req =  window.indexedDB.deleteDatabase("oidx_ussr");
    //req.onsuccess = function() {
    //    console.log("Database opened successfully");
    //};
    //req.onerror = (event) => {
    //    console.log(event.target.errorCode);
    //}

    //Load the other javascript files required. This means that 
    //we only have to include this one within the html
    const DISPLAY = document.createElement("script");
    DISPLAY.type = "text/javascript";
    DISPLAY.src = "scripts/resultsdisplay.js";
    document.head.appendChild(DISPLAY);
    eval(DISPLAY);
    const DATABASE = document.createElement("script");
    DATABASE.type = "text/javascript";
    DATABASE.src = "scripts/data.js";
    document.head.appendChild(DATABASE);
    eval(DATABASE);
    const CONTEXTMENUS = document.createElement("script");
    CONTEXTMENUS.type = "text/javascript";
    CONTEXTMENUS.src = "scripts/contextmenu.js";
    document.head.appendChild(CONTEXTMENUS);
    eval(CONTEXTMENUS);
    const USERSCRIPT = document.createElement("script");
    USERSCRIPT.type = "text/javascript";
    USERSCRIPT.src = "scripts/user.js";
    document.head.appendChild(USERSCRIPT);
    eval(USERSCRIPT);
    const SERVERS = document.createElement("script");
    SERVERS.type = "text/javascript";
    SERVERS.src = "scripts/servers.js";
    document.head.appendChild(SERVERS);
    eval(SERVERS);
    const EDITOR = document.createElement("script");
    EDITOR.type = "text/javascript";
    EDITOR.src = "scripts/editor.js";
    document.head.appendChild(EDITOR);
    eval(EDITOR);
    const NOTIFICATION = document.createElement("script");
    NOTIFICATION.type = "text/javascript";
    NOTIFICATION.src = "scripts/notifications.js";
    document.head.appendChild(NOTIFICATION);
    eval(NOTIFICATION);
    const DASHBOARD = document.createElement("script");
    DASHBOARD.type = "text/javascript";
    DASHBOARD.src = "scripts/dashboard.js";
    document.head.appendChild(DASHBOARD);
    eval(DASHBOARD);
    const MENUBAR = document.createElement("script");
    MENUBAR.type = "text/javascript";
    MENUBAR.src = "scripts/menubar.js";
    document.head.appendChild(MENUBAR);
    eval(MENUBAR);
}

/**! 
 * @function getCurrentDate()
 * @returns string month/day/fullyear - hour:minutes
 */
 function getCurrentDate() {
    const d = new Date();
    let current = d.getMonth() + '/' + d.getDate() + '/' + d.getFullYear() + ' - ' + d.getHours() + ':';
    let mins = d.getMinutes();
    if ( mins <= 9 ) {
        mins = '0' + mins.toString();
    }
    current += mins;
    return current;
}

/**
 * A simple method which waits for teh alloted milli seconds before it proceeds
 */
 function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** This is for a quick and dirty value getter*/
function GetJsonValue( json,  key) {
    var value = null;
    var lwr_json = json.toLowerCase();
    var lwr_key = key.toLowerCase();
    var found = lwr_json.indexOf("\"" + lwr_key + "\"");
    if (found > 0) {
        json = json.substr(found + key.length + 2);
        lwr_json = lwr_json.substr(found + key.length + 2);
        found = lwr_json.indexOf("\"");
        if (found >= 0) {
            json = json.substr(found + 1);
            lwr_json = lwr_json.substr(found + 1);
            found = lwr_json.indexOf("\"");
            if (found > 0) {
                value = json.substr(0, found);
            } else {
                return value;
            }
        } else {
            return value;
        }
    } else {
        return value;
    }
    return value;
}

function clearUI() {
    hideTabs();
    toggleTabBackground();
    document.getElementById("newEmail").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("pauseEmail").value = "";
    document.getElementById("reinstateEmail").value = "";
    document.getElementById("deleteEmail").value = "";
    document.getElementById("localusername").value = "";
    document.getElementById("localpassword").value = "";
    document.getElementById("newPassword1").value = "";
    document.getElementById("newPassword2").value = "";
    document.getElementById("newuserPassword1").value = "";
    document.getElementById("newUserPassword2").value = "";
    document.getElementById("newUserName").value = "";
    document.getElementById("serverUsername").value = "";
    document.getElementById("serverPassword").value = "";
    document.getElementById("serverAddress").value = "";
    document.getElementById("serverNickname").value = "";
}