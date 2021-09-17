/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file resultsdisplay.js
 * @version 1.0
 * This file holds the javascript to display teh results as a table or chart
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

/** This is used for exports */
var CurrentResultSet;

document.getElementById("showDataSet").addEventListener("click", function(event) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("showDataSet").classList.add("selected");
    document.getElementById("resultsContainer").style.display = "Block";
    document.getElementById("resultsContainer").style.opacity = "1";
});

function createTableDisplay(dataSet) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("showDataSet").classList.add("selected");
    document.getElementById("resultsContainer").style.display = "Block";
    document.getElementById("resultsContainer").style.opacity = "1";
    if ( !dataSet.includes(",") ) {
        document.getElementById("resultsTableDiv").innerText = " --- No results to display ---";
        document.getElementById("resultsTableDiv").style.cursor = "default";
        return;
    }
    CurrentResultSet = dataSet;
    const RECORDS = dataSet.split('\n');
    var isFirst = true;//We use this to make sure we get the field headers and tehn the values
    var content_id;//This is used so we can have a drill down if required
    var contentIdPos = -1;//used to determine which value is teh ID
    var parentTag = document.getElementById("resultsTableDiv");//This is where we are placing our results
    parentTag.style.display = "block";
    parentTag.style.opacity = "1";
    var table = document.createElement("table");//create a table tag for our data to go into
    table.className = "resultsTable";
    var isOdd = true;//This is used to give different background colours to each ro so that it is easier to read
    RECORDS.forEach(async function(record) {
        let values = record.split(',');
        let row = document.createElement("tr");//set a row
        if (isFirst ){
            //Our table headings
            row.className = "resultsHeader";
            isFirst = false;
            let position = -1;
            values.forEach(async function (value) {
                position++;
                let header = document.createElement("td");//set a row
                header.className = "headerValue";
                header.innerText = value;
                row.appendChild(header);
                if ( value.toLowerCase() == "content_id" ) {
                    contentIdPos = position;
                }
            });//end record.forEach
        } else {//We have a data value
            if ( isOdd ) {
                if (contentIdPos > -1 ) {
                    row.classList = "resultsRow odd withId";
                } else {
                    row.classList = "resultsRow odd";
                }
                isOdd = false;
            } else {
                if (contentIdPos > -1 ) {
                    row.classList = "resultsRow withId";
                } else {
                    row.className = "resultsRow";
                }                
                isOdd = true;
            }
            let position = -1;
            values.forEach(async function (value) {
                position++;
                if ( contentIdPos == position ) {
                    content_id = value;
                }
                let dataValue = document.createElement("td");//set a row
                dataValue.className = "dataValue";
                dataValue.innerText = value;
                row.appendChild(dataValue);
            });//end record.forEach
        }
        if ( contentIdPos > -1 ) {
            row.id = content_id;//We set this so that we can have an id for the click event to hang a hat on to.
            row.addEventListener("click", function() {
                hideMenus();
                ContentId = row.getAttribute("id");
                var menu = document.getElementById("contextMenuRecord")     
                menu.style.display = "block";
                menu.style.left = MouseEvent.pageX + "px";
                menu.style.top = MouseEvent.pageY + "px";
                LeftClicked = true;
                return;
            });   

        }
        table.appendChild(row);
    });//end RECORDS.foreach
    parentTag.innerHTML = "";
    parentTag.appendChild(table);
    document.getElementById("resultsTableDiv").style.cursor = "default";
}