/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file notifications.js
 * @version 1.0
 * This file holds the details for teh notification popup
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

var NotificationCount = -1;

document.getElementById("notifyCaret").addEventListener("click", function() {
    let tog = this.classList.toggle("caret-down");
    if ( tog === true ) {
        document.getElementById("notificationItems").style.display = "flex";
        document.getElementById("notificationItems").style.opacity = "1";
        document.getElementById("notificationItems").style.height = "100";
    } else {
        document.getElementById("notificationItems").style.display = "none";
        document.getElementById("notificationItems").style.opacity = "0";       
    }
});

function setNotification(message) {
    //getteh current number of items in teh display
    NotificationCount++;
    let item = document.createElement("div");
    item.id = NotificationCount + ".notification";
    item.textContent = message;
    item.className = "notificationmessage";
    document.getElementById("notificationItems").appendChild(item);
    //Now for the history
    let history = "<div class='historyitem'><div>" + message + "</div><div>" + getCurrentDate() + "</div></div>"
    document.getElementById("historyItems").innerHTML += history;
    return NotificationCount;
}

function removeNotification(position) {
    let tag = document.getElementById(position + ".notification");
    if ( tag != null ) {
        tag.parentNode.removeChild(tag);
    }
}

/** History Tab */
document.getElementById("historyData").addEventListener("click", function(event) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("historyData").classList.add("selected");
    document.getElementById("historyTab").style.display = "Block";
    document.getElementById("historyTab").style.opacity = "1";
});