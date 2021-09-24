/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file dashboard.js
 * @version 1.0
 * This file holds the scripts dashboard reports
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
//Load the Google Charts
google.charts.load('current', {'packages':['table']});
google.charts.load('current', {'packages':['VegaChart']});
google.charts.load('current', {'packages':['gauge']});
google.charts.load('current', {'packages':['timeline']});
google.charts.load('current', {'packages':['bar']});
google.charts.load('current', {'packages':['corechart']});
google.charts.load('current', {'packages':['map'], 'mapsApiKey': ''});

function addStyle(styleString) {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

const COLORS = ['red', 'orange', 'blue', 'purple', 'yellow'];
var RunActiveSessions = false;

document.getElementById("pauseDashboard").addEventListener("click", function(event) {
  if ( CurrentServer != null ) {
    if ( RunActiveSessions ) {
      document.getElementById("pauseDashboardImage").src = "images/run.png"
      RunActiveSessions = false;
      setNotification("Pausing dashboard reports. " + getCurrentDate());
    } else {
      document.getElementById("pauseDashboardImage").src = "images/pause.png"
      RunActiveSessions = true;
      setNotification("Starting dashboard reports. " + getCurrentDate());
      getActiveSessions();
    }
  }
});

document.getElementById("reloadDashboard").addEventListener("click", function(event) { 
  if ( CurrentServer != null ) {
    RunActiveSessions = false;
    (async() => {
      await sleep (3000);//3 second wait to let current clear out
    })();
    setNotification("Reloading dashboard reports. " + getCurrentDate());
    document.getElementById("pauseDashboardImage").src = "images/pause.png"
    RunActiveSessions = true;
    getActiveSessions();
  }
});

async function checkPauseButton() {
  while ( true ) {//we will just go on forever
    if ( RunActiveSessions ) {
      document.getElementById("pauseDashboardImage").src == "images/pause.png";
    } else {
      document.getElementById("pauseDashboardImage").src == "images/run.png";
    }
    await sleep (5000);//5 second wait
  }
}
checkPauseButton();


document.getElementById("showDashboard").addEventListener("click", function(event) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("showDashboard").classList.add("selected");
    document.getElementById("dashboardTab").style.display = "flex";
    document.getElementById("dashboardTab").style.opacity = "1";
});

async function getActiveSessions() {
    RunActiveSessions = true;
    getBusyHours();
    currentActiveSessions();
    mostActiveUsers();
    getGeoData();
    let query = "SELECT COUNT(to_char(session_date, 'MI')) AS active, to_char(session_date, 'HH24:MI') AS session_date FROM sessiont WHERE session_date BETWEEN NOW() - INTERVAL '5 MINS' AND NOW() GROUP BY session_date ORDER BY session_date ASC";
    while ( RunActiveSessions ) {
    let serverMap = await getServerDetails();
    let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
    if ( !response.includes (",") ) {
      document.getElementById('currentLoad').innerText = "Currently no data to display!";
      return;
    }
    let graph_array = [];//The initial item in a pie must be string so here we sort to make sure that it is
    graph_array.push(['Date:Time', 'Sessions']);
    const arrayData = response.split('\n');
    var records = [];
    let isFirst = true;
    for ( var data_check of arrayData ) {
      if ( data_check[0] != null ) {
          if ( isFirst ) {
              isFirst = false;
          } else {
            records.push(data_check);
          }
      }
    }
    var sessionMap =new Map();
    records.forEach(async function(record) {
        rowData = record.split(",");
        let cleanRow = [];
        for ( var iter of rowData ) {
            if ( iter[0] != null ) {
                    cleanRow.push(iter);
            }
          }
          //Now add these to the map
          graph_array.push([cleanRow[1], parseInt(cleanRow[0])]);
    });
    var options = {
        title: "Active Sessions",
        curveType: 'function',
        height: "200",
        legend: { 
            position: 'bottom',
            textStyle: {color: '#f6f6f6', fontSize: 11}
        },
        series: {
            0: { color: '#ff6e2e' }
        },        
        backgroundColor: {
            fill: '#003d52',
            fillOpacity: 0.8
        }, 
        hAxis: {
            textStyle: {
              fontName: 'Source Sans Pro',
              fontSize: 10,
              bold: false,
              italic: false,
              // The color of the text.
              color: '#f6f6f6',
              // The transparency of the text.
              opacity: 0.8
            }
          },
          vAxis: {
            textStyle: {
              fontName: 'Source Sans Pro',
              fontSize: 10,
              bold: false,
              italic: false,
              // The color of the text.
              color: '#f6f6f6',
              // The transparency of the text.
              opacity: 0.8
            }
          }               
      };
      var data = google.visualization.arrayToDataTable(graph_array);
      var chart = new google.visualization.LineChart(document.getElementById('currentLoad'));

      chart.draw(data, options); 
      await sleep ( 1000 );
      RunActiveSessions = false;
    }
}

async function getBusyHours() {
  let query = "SELECT COUNT(to_char(session_date, 'HH24')) AS busy, to_char(session_date, 'HH24:MI') AS session_date FROM sessiont WHERE session_date  BETWEEN NOW() - INTERVAL '7 DAYS' AND NOW() GROUP BY session_date ORDER BY busy DESC";
  if ( CurrentServer == null ) {
    alert ("please connect to a server instance first. Try choosing one in your server list.");
  } else {  
    while ( true ) { //we will run this every 5 mins
      let serverMap = await getServerDetails();
      let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
      if ( !response.includes (",") ) {
        document.getElementById('currentLoad').innerText = "Currently no data to display!";
        return;
      }
      let graph_array = [];//The initial item in a pie must be string so here we sort to make sure that it is
      graph_array.push(['Date:Time', 'Sessions']);
      const arrayData = response.split('\n');
      var records = [];
      let isFirst = true;
      for ( var data_check of arrayData ) {
        if ( data_check[0] != null ) {
            if ( isFirst ) {
                isFirst = false;
            } else {
              records.push(data_check);
            }
        }
      }
      var sessionMap =new Map();
      records.forEach(async function(record) {
          rowData = record.split(",");
          let cleanRow = [];
          for ( var iter of rowData ) {
              if ( iter[0] != null ) {
                      cleanRow.push(iter);
              }
            }
            //Now add these to the map
            graph_array.push([cleanRow[1], parseInt(cleanRow[0])]);
      });
      var options = {
        title: "Most Active Time Slots",
        curveType: 'function',
        height: "200",
        legend: { 
            position: 'bottom',
            textStyle: {color: '#f6f6f6', fontSize: 11}
        },
        series: {
            0: { color: '#ff6e2e' }
        },        
        backgroundColor: {
            fill: '#003d52',
            fillOpacity: 0.8
        }, 
        hAxis: {
            textStyle: {
              fontName: 'Source Sans Pro',
              fontSize: 10,
              bold: false,
              italic: false,
              // The color of the text.
              color: '#f6f6f6',
              // The transparency of the text.
              opacity: 0.8
            }
          },
          vAxis: {
            textStyle: {
              fontName: 'Source Sans Pro',
              fontSize: 10,
              bold: false,
              italic: false,
              // The color of the text.
              color: '#f6f6f6',
              // The transparency of the text.
              opacity: 0.8
            }
          }               
      };
      var data = google.visualization.arrayToDataTable(graph_array);
      var chart = new google.visualization.LineChart(document.getElementById('topTenIP'));
      chart.draw(data, options); 
      await sleep ( 300000 );
    }
  }
}

async function currentActiveSessions() {
  let query = "SELECT SUM(current) FROM (SELECT COUNT(to_char(session_date, 'HH24')) AS current FROM sessiont WHERE session_date  BETWEEN NOW() - INTERVAL '5 MINS' AND NOW() GROUP BY session_date) cnt";
  if ( CurrentServer == null ) {
    alert ("please connect to a server instance first. Try choosing one in your server list.");
  } else {  
    while ( RunActiveSessions ) { //we will run this every 5 mins
      let serverMap = await getServerDetails();
      let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
      if ( !response.includes ("\n") ) {
        document.getElementById('currentLoad').innerText = "Currently no data to display!";
        return;
      }
      //All we want from the response is teh current number.
      let results = response.split("\n");
      //If we have a second [1] row that is our number
      let current;
      if ( results.length >= 1 ) {
        current = parseInt(results[1]);//This will force a NaN if not correct
      } 
      if ( current == NaN || current == null ) {
        current = 0;
      }
      document.getElementById('currentAccess').innerText = current;
      await sleep ( 300000 );
    }//end while
  }
}

async function currentActiveUsers() {
  let query = "SELECT COUNT(DISTINCT(user_id)) AS current FROM sessiont WHERE session_date  BETWEEN NOW() - INTERVAL '5 MINS' AND NOW()";
  if ( CurrentServer == null ) {
    alert ("please connect to a server instance first. Try choosing one in your server list.");
  } else {  
    while ( RunActiveSessions ) { //we will run this every 5 mins
      let serverMap = await getServerDetails();
      let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
      if ( !response.includes ("\n") ) {
        document.getElementById('currentLoad').innerText = "Currently no data to display!";
        return;
      }
      //All we want from the response is teh current number.
      let results = response.split("\n");
      //If we have a second [1] row that is our number
      let current;
      if ( results.length >= 1 ) {
        current = parseInt(results[1]);//This will force a NaN if not correct
      } 
      if ( current == NaN || current == null ) {
        current = 0;
      }
      document.getElementById('totalUsers').innerText = current;
      await sleep ( 300000 );
    }//end while
  }
}

async function mostActiveUsers() {
  let query = "SELECT user_id, COUNT(DISTINCT(session_id)) as session FROM sessiont WHERE session_date  BETWEEN NOW() - INTERVAL '5 MINS' AND NOW() GROUP BY user_id";
  if ( CurrentServer == null ) {
    alert ("please connect to a server instance first. Try choosing one in your server list.");
  } else {  
    while ( RunActiveSessions ) { //we will run this every 5 mins
      let serverMap = await getServerDetails();
      let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
      if ( !response.includes (",") ) {
        document.getElementById('currentLoad').innerText = "Currently no data to display!";
        return;
      }
      let styleData = ".chart1{background: conic-gradient(";
      let keyData = "<div><ul id='keys' class='key'>";
      let records = response.split("\n");
      let fieldNames = [];
      let colors = [];
      if (records.length > 0 ) {
          fieldNames = records[0].split(",");
          records.shift();//remove the field names;
      }
      let fieldValues = [];
      let totalValues = 0;
      records.forEach(async function(row) {
          if ( row.includes(",") ){
              fieldValues.push([row.split(",")]);
          }
      });
      fieldValues.forEach(async function(value) {
          totalValues = totalValues + parseInt(value[0][1]);
          colors.push(genRanHex(6));
      });    
      
      
      let isFirst = true;
      for ( let iter = 0; iter < colors.length; iter++ ) {
          if ( iter == 0 ) {
              let percentage = Math.round((parseInt(fieldValues[iter][0][1]) / totalValues) * 100)
              styleData += "#" + colors[iter] + " " + percentage + "%";
              keyData += "<li><strong class='percent' style='background: #" + colors[iter] + "; padding: 6px; color: #" + genRanHex(6) + ";'>" + percentage + "%</strong>";
              keyData += "<span class='item'>" + fieldValues[iter][0][0] + "</span></li>"
          } else {
              let percentage = Math.round((parseInt(fieldValues[iter][0][1]) / totalValues) * 100)
              styleData += ", #" + colors[iter] + " " + percentage + "%";
              keyData += "<li><strong class='percent' style='background: #" + colors[iter] + "; padding: 6px; color: #" + genRanHex(6) + ";'>" + percentage + "%</strong>";
              keyData += "<span class='item'>" + fieldValues[iter][0][0]  + "</span></li>";
          } 
      }
      styleData += ", #" + genRanHex(6) + " 0%";
      styleData += ");\n";
      styleData += "border-radius: 50%;\n";
      styleData += "width: 80%;\n";
      styleData += "height: 80%;\n";
      styleData += "padding-top: 20%;\n";
      styleData += "float: left;\n";
      styleData += "padding-right: 20px;\n}"; 
      addStyle(styleData);
      document.getElementById("mostActiveUsers").innerHTML = "<div class='chart1'></div>" ;
      document.getElementById("keys").innerHTML = keyData + "</ul></div>";
      await sleep ( 300000 );
    }//end while
  }
}

async function getGeoData() {
  let query = "SELECT SUM(count), city, region, country FROM (SELECT COUNT(DISTINCT(session_id)) as count, city, region, country FROM sessiont WHERE session_date  BETWEEN NOW() - INTERVAL '5 MINS' AND NOW()  GROUP BY city, region, country)db GROUP BY city, region, country";
  if ( CurrentServer == null ) {
    alert ("please connect to a server instance first. Try choosing one in your server list.");
  } else {  
    while ( RunActiveSessions ) { //we will run this every 5 mins
      let serverMap = await getServerDetails();
      let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
      if ( !response.includes (",") ) {
        document.getElementById('currentLoad').innerText = "Currently no data to display!";
        return;
      }
      var data  = new google.visualization.DataTable();
      data.addColumn('string', 'Address');
      data.addColumn('string', 'Location');
      data.addColumn('string', 'Marker');
      const arrayData = response.split('\n');
      var records = [];
      let isFirst = true;
      for ( var data_check of arrayData ) {
        if ( data_check[0] != null ) {
            if ( isFirst ) {
                isFirst = false;
            } else {
              records.push(data_check);
            }
        }
      }
      var sessionMap =new Map();
      records.forEach(async function(record) {
          rowData = record.split(",");
          let cleanRow = [];
          for ( var iter of rowData ) {
              if ( iter[0] != null ) {
                      cleanRow.push(iter);
              }
            }
            //Now add these to the data
            data.addRow([cleanRow[1] + " " + cleanRow[2] + ", " + cleanRow[3], cleanRow[0] + ' Sessions', '#' + genRanHex(6)]);
      });
      var url = 'https://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/';
      var options = {
        zoomLevel: 6,
        showTooltip: true,
        showInfoWindow: true,
        useMapTypeControl: true,
        icons: {
          blue: {
            normal:   url + 'Map-Marker-Ball-Azure-icon.png',
            selected: url + 'Map-Marker-Ball-Right-Azure-icon.png'
          },
          green: {
            normal:   url + 'Map-Marker-Push-Pin-1-Chartreuse-icon.png',
            selected: url + 'Map-Marker-Push-Pin-1-Right-Chartreuse-icon.png'
          },
          pink: {
            normal:   url + 'Map-Marker-Ball-Pink-icon.png',
            selected: url + 'Map-Marker-Ball-Right-Pink-icon.png'
          }
        }
      };
      var map = new google.visualization.Map(document.getElementById('geoData'));
      map.draw(data, options);
      await sleep ( 300000 );
    }//end while Loop
  }  
}
