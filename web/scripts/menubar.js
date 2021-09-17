/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file menubar.js
 * @version 1.0
 * This file holds the menubar commands
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
document.getElementById("menuBarFile").addEventListener("click", function(event) {
    hideMenus();
    event.preventDefault();
    //We will now go and get the correct menu
    var menu = document.getElementById("menuBarFileMenu")     
    menu.style.display = "block";
    let top = parseFloat(MouseEvent.pageY) + parseFloat(5);
    menu.style.left = MouseEvent.pageX + "px";
    menu.style.top = top + "px";
});

document.getElementById("menuBarEdit").addEventListener("click", function(event) {
    hideMenus();
    event.preventDefault();
    //We will now go and get the correct menu
    var menu = document.getElementById("menuBarEditMenu")     
    menu.style.display = "block";
    let top = parseFloat(MouseEvent.pageY) + parseFloat(5);
    menu.style.left = MouseEvent.pageX + "px";
    menu.style.top = top + "px";
});

document.getElementById("menuBarReports").addEventListener("click", function(event) {
    hideMenus();
    event.preventDefault();
    //We will now go and get the correct menu
    var menu = document.getElementById("menuBarReportsMenu")     
    menu.style.display = "block";
    let top = parseFloat(MouseEvent.pageY) + parseFloat(5);
    menu.style.left = MouseEvent.pageX + "px";
    menu.style.top = top + "px";
});

document.getElementById("menuBarHelp").addEventListener("click", function(event) {
    hideMenus();
    event.preventDefault();
    //We will now go and get the correct menu
    var menu = document.getElementById("menuBarHelpMenu")     
    menu.style.display = "block";
    let top = parseFloat(MouseEvent.pageY) + parseFloat(5);
    menu.style.left = MouseEvent.pageX + "px";
    menu.style.top = top + "px";
});


/** Commands  */
document.getElementById("menuOpenSqlEditor").addEventListener("click", function(event) {
    hideMenus();
    hideTabs();
    toggleTabBackground();
    document.getElementById("showSQLEditor").classList.add("selected");
    document.getElementById("sqlEditorContainer").style.display = "Block";
    document.getElementById("sqlEditorContainer").style.opacity = "1";
});

document.getElementById("menuManageUsers").addEventListener("click", function(event) {
    hideMenus();
    hideTabs();
    toggleTabBackground();
    document.getElementById("usersData").classList.add("selected");
    document.getElementById("userManagementTab").style.display = "flex";
    document.getElementById("userManagementTab").style.opacity = "1";
});

document.getElementById("menuOpenDashboard").addEventListener("click", function(event) {
    hideMenus();
    hideTabs();
    toggleTabBackground();
    document.getElementById("showDashboard").classList.add("selected");
    document.getElementById("dashboardTab").style.display = "flex";
    document.getElementById("dashboardTab").style.opacity = "1";
});

document.getElementById("menuBarLogout").addEventListener("click", function(event) {
    hideMenus();
    hideTabs();
    toggleTabBackground();
    clearUI();
    document.getElementById("localLogin").style.opacity = "1";
    document.getElementById("page").style.opacity = "0";
    document.getElementById("localLogin").style.display = "flex";
    document.getElementById("page").style.display = "none";
    document.getElementById("userDetails").innerText = User;
});

document.getElementById("menuEditorDark").addEventListener("click", function(event) {
    hideMenus();
    document.getElementById("editor").classList.toggle("darktheme");;
});

document.getElementById("menuReportsWDC").addEventListener("click", function(event) {
    hideMenus();
    window.open("https://github.com/OmniIndex/public/tree/main/Tableau%20WDC");
});


document.getElementById("menuReportsWDC").addEventListener("click", function(event) {
    hideMenus();
    window.open("https://github.com/OmniIndex/public/tree/main/GoogleDataStudio");
});

document.getElementById("menuHelpAbout").addEventListener("click", function(event) {
    hideMenus();
    document.getElementById("aboutOverlay").style.display = "flex";
});


document.getElementById("aboutClose").addEventListener("click", function(event) {
    document.getElementById("aboutOverlay").style.display = "none";
});

document.getElementById("aboutCloseButton").addEventListener("click", function(event) {
    document.getElementById("aboutOverlay").style.display = "none";
});