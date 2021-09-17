/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file contextmenu.js
 * @version 1.0
 * This file holds the details for teh contextmenu controls.
 * It does not handle the clicking events, these are captured within the 
 * specific files that the event manages.
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


/** Capture teh right hand mouse button events */
document.oncontextmenu = mouseRightClickEvent;

document.getElementById("resultsContainer").addEventListener("mouseRightClickEvent", function(event) {
    mouseRightClickEvent();
});

/** Thsi is teh selected element from a right hand mouse click */
var Selected;

function hideMenus() {
    let items = document.getElementsByClassName("context-menu");
    for (let iter = 0; iter < items.length; iter++) {
        items[iter].style.display = "none";
    }
}

/** This function is called when an item has been 
 * clicked on with the right hand mouse button.
*/
function mouseRightClickEvent(event) {
    hideMenus();
    let selected = event.srcElement;
    selectedId = selected.id;
    if ( selectedId.includes(".selectedTable") ) {
        Selected = selected;
        event.preventDefault();
        //We will now go and get the correct menu
        var menu = document.getElementById("contextMenuTable")     
        menu.style.display = "block";
        menu.style.left = MouseEvent.pageX + "px";
        menu.style.top = MouseEvent.pageY + "px";
    } else if ( selectedId.includes(".server") ) {
        Selected = selected;
        updateNicknameText(selected.innerText);
        event.preventDefault();
        //We will now go and get the correct menu
        var menu = document.getElementById("contextMenuServer")     
        menu.style.display = "block";
        menu.style.left = MouseEvent.pageX + "px";
        menu.style.top = MouseEvent.pageY + "px";
    }
}

async function getTop100() {
    hideMenus();
    let tableName;
    try {
       tableName = Selected.id.substr(0, Selected.id.indexOf(".") );
       var notificationPosition = setNotification("extracting the top 100 records on table " + tableName);
       //we will go and get the data.
       let query = "";
       if ( tableName.includes("_v") ) {
           switch ( tableName ) {
               case "vna_v" : query = "SELECT created_date, scanner, manufacturer, scantype, patientside, scanof FROM vna_v WHERE manufacturer != '' LIMIT 100";
               break;
               case "emotions_v" : query = "SELECT created_date, happy, angry, sad, upset, disapointed, apprehensive, humiliated, worried,happy_2, angry_2, sad_2, upset_2, disapointed_2, apprehensive_2, humiliated_2, worried_2 FROM emotions_v LIMIT 100";
               break;
               case "email_v" : query = "SELECT created_date as \"Sent / Recieved\", authors, email_to_list, email_cc_list, email_bcc_list, email_attachment_list FROM email_v LIMIT 100";
               break; 
               case "databreach_v" : query = "SELECT created_date, name, email, telephone, ssn FROM databreach_v LIMIT 100";
               break;
               case "categorization_v" : query = "SELECT authors, created_date, name, business, investment, sales, technology, threat, vacation FROM categorization_v LIMIT 100";
               break;             
           }
       } else {
        query = 'SELECT * FROM ' + tableName + ' LIMIT 100';
       }
       document.getElementById("resultsTableDiv").style.cursor = "wait";
       //We need to get the server details so we can access it
       serverMap = await getServerDetails();
       let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
       document.getElementById("editor").innerText = query;
       createTableDisplay(response);
    } catch (err) {
        console.log("getTop100 " + err);
    }
    let iter = 0;
    removeNotification(notificationPosition);
}

async function exportToCSV() {
    hideMenus();
    let tableName;
    try {
       tableName = Selected.id.substr(0, Selected.id.indexOf(".") );
       var notificationPosition = setNotification("exporting all records from " + tableName  + " to a CSV format.");
       //we will go and get the data.
       let query = "";
       if ( tableName.includes("_v") ) {
           switch ( tableName ) {
               case "vna_v" : query = "SELECT created_date, scanner, manufacturer, scantype, patientside, scanof FROM vna_v WHERE manufacturer != ''";
               break;
               case "emotions_v" : query = "SELECT created_date, happy, angry, sad, upset, disapointed, apprehensive, humiliated, worried,happy_2, angry_2, sad_2, upset_2, disapointed_2, apprehensive_2, humiliated_2, worried_2 FROM emotions_v";
               break;
               case "email_v" : query = "SELECT created_date as \"Sent / Recieved\", authors, email_to_list, email_cc_list, email_bcc_list, email_attachment_list FROM email_v";
               break; 
               case "databreach_v" : query = "SELECT created_date, name, email, telephone, ssn FROM databreach_v";
               break;
               case "categorization_v" : query = "SELECT authors, created_date, name, business, investment, sales, technology, threat, vacation FROM categorization_v";
               break;             
           }
       } else {
        query = 'SELECT * FROM ' + tableName;
       }
       document.getElementById("resultsTableDiv").style.cursor = "wait";
       //We need to get the server details so we can access it
       serverMap = await getServerDetails();
       let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
       document.getElementById("editor").innerText = query;
       if ( !response.includes (",") ) {
           alert (" No data to save to file" );
           return;
       }
       var blob = new Blob([response], {type: "text/csv"});
       const READER = new FileReader();
       let url;
       READER.readAsDataURL(blob);
       READER.onload =  function(e){
           window.open(e.target.result);
           URL.revokeObjectURL(blob);     
       };
    } catch (err) {
        console.log("ExportToCSV " + err);
    }
    let iter = 0;
    removeNotification(notificationPosition);
}

async function showEmotions() {
    let query = "SELECT emotion, emotion_2 FROM emotions WHERE content_id='" + ContentId + "'";
    hideMenus();
    document.getElementById('waitingHolder').style.display = 'flex';
    document.getElementById('page').style.cursor = 'progress';
    serverMap = await getServerDetails();
    let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
    let emotionalMessage;
    if ( response.includes("emotion") ) {
        const arrayData = response.split('\n');
        var records = [];
        for ( var data_check of arrayData ) {
          if ( data_check[0] != null ) {
              records.push(data_check);
          }
        }
        let isFirst = true;
        records.forEach(async function(record) {
            if ( isFirst ) {
                isFirst = false;
            } else {
                let emotions = record.split(',');
                isFirst = true;
                
                emotions.forEach(async function(emotion) {
                    if ( emotion != "" ) {
                        emotion = emotion.toLocaleLowerCase();
                        if ( isFirst ) {
                            isFirst = false;
                            emotionalMessage = "The main emotion for this item is: ";
                            emotionalMessage += emotion;
                        } else if ( emotion != "null" ) {
                            emotionalMessage += "\nWith a follow up emotion of: " + emotion;
                        }
                    }
                });
            }
        });
        if ( emotionalMessage != undefined ) {
          alert ( emotionalMessage );
      }
    } else {
        alert ("No emotions were found for this item.");
    }
    hideMenus();
    document.getElementById('waitingHolder').style.display = 'none';
    document.getElementById('page').style.cursor = 'default';
    response += "";
  }

  async function showContext() {
    hideMenus();
    document.getElementById('waitingHolder').style.display = 'flex';
    document.getElementById('page').style.cursor = 'progress';
    let query = "SELECT classification_type, classification_type_1,  classification_type_2, classification_type_3 FROM content_classifications WHERE content_id='" + ContentId + "'";
    serverMap = await getServerDetails();
    let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
    if ( response.includes("classification_type") ) {
      const arrayData = response.split('\n');
      var records = [];
      for ( var data_check of arrayData ) {
        if ( data_check[0] != null ) {
            records.push(data_check);
        }
      }
      let isFirst = true;
      let classificationMessage;
      records.forEach(async function(record) {
          if ( isFirst ) {
              isFirst = false;
          } else if ( isFirst != undefined ) {
              iFirst = undefined;
              let classifications = record.split(',');
              let current = 0;
              classifications.forEach(async function(classification) {
                  if ( classification != "null" ) {
                      //classification = emotion.toLocaleLowerCase();
                      switch (current) {
                          case 0: classificationMessage = "This items main classification is: " + classification;
                          break;
                          case 1: classificationMessage += "\nThe second most prominent classification is: " + classification;
                          break;
                          case 2: classificationMessage += "\nWith a follow on classification of: " + classification;
                          break;
                          case 3: classificationMessage += ", and: " + classification;
                          break;
                          default: break;
                      }
                      current++;
                  }
              });
          }
      });
      if ( classificationMessage != undefined ) {
        alert ( classificationMessage);
    }
  } else {
      alert ("No classifications were found for this item.");
  }
  hideMenus();
  document.getElementById('waitingHolder').style.display = 'none';
  document.getElementById('page').style.cursor = 'default';
  response += "";
}

async function showPIIData() {
    hideMenus();
    document.getElementById('waitingHolder').style.display = 'flex';
    document.getElementById('page').style.cursor = 'progress';
    serverMap = await getServerDetails();
    let query = "SELECT type from specific_classifications_meta WHERE type != 'email' and content_id = '"  + ContentId + "'";
    let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
  if ( response.includes("type") ) {
      const arrayData = response.split('\n');
      var records = [];
      for ( var data_check of arrayData ) {
        if ( data_check[0] != null ) {
            records.push(data_check);
        }
      }
      let isFirst = true;
      let piiMessage;
      records.forEach(async function(record) {
          if ( isFirst ) {
              isFirst = false;
          }  else {
              if ( isFirst === false ) {
                piiMessage = "I have found the following PII Data breaches for item: " + ContentId;
              }
              isFirst = undefined;
              let piibreaches = record.split(',');
              let current = 0;
              piibreaches.forEach(async function(breach) {
                  if ( breach != "null" ) {
                      if ( breach != 'type' ) {
                        piiMessage += "\n" + breach;
                      }
                  }
              });
          }
      });
      if ( piiMessage != undefined ) {
        alert ( piiMessage);
    }
  } else {
      alert ("No PII Data breaches were found for this item.");
  }
  hideMenus();
  document.getElementById('waitingHolder').style.display = 'none';
  document.getElementById('page').style.cursor = 'default';
  response += "";
}

async function showBCCData() {
    //Is this an email?
    hideMenus();
    document.getElementById('waitingHolder').style.display = 'flex';
    document.getElementById('page').style.cursor = 'progress';
    let query = "SELECT content_id, email_bcc_list from content_emails WHERE content_id = '"  + ContentId + "'";
    serverMap = await getServerDetails();
    let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
    if ( response.includes ("content_id") ) {
        const arrayData = response.split('\n');
        var records = [];
        for ( var data_check of arrayData ) {
          if ( data_check[0] != null ) {
              records.push(data_check);
          }
        }
        let isFirst = true;
        let piiMessage;
        records.forEach(async function(record) {
            if ( isFirst ) {
                isFirst = false;
            }  else {
                alert ("Item: " + ContentId + " . Has the following Blind Carbon Copy Recipients:\n" + record);
            }
        });
    } else {
        alert ("Item: " + ContentId + " . Is not an email.");
    }
    hideMenus();
    document.getElementById('waitingHolder').style.display = 'none';
    document.getElementById('page').style.cursor = 'default';
}

/** Remove Server */
document.getElementById("removeServerContext").addEventListener("click", function(event) {
    hideMenus();
    let position = -1;
    UserObjs.every(async function(serverDetails) {
        position++;
        if ( serverDetails.nickname === getNickName() ) {
            UserObjs.splice(position, 1);
            let completed = await update(UserObjs);
            getServerList();
            return false;
        }
        return true;
    })
});