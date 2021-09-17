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
    getPIIBreaches();
    getSentiment();
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

async function getPIIBreaches() {
  let query = "SELECT COUNT(to_char(modified_date, 'HH24:MI')) AS counted_date, content_id, authors, to_char(modified_date, 'HH24:MI') AS modified_date, name from databreach_v WHERE telephone > 0 OR ssn > 0 AND  modified_date  BETWEEN NOW() - INTERVAL '7 DAYS' AND NOW() GROUP BY content_id, authors, modified_date, name ORDER BY modified_date DESC";
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
      let graph_array = [];//The initial item in a pie must be string so here we sort to make sure that it is
      graph_array.push(["Number", "Modified Date", "Author/s",  "ContentID", 'Name']);
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
            graph_array.push([cleanRow[0], cleanRow[3], cleanRow[2], cleanRow[1], cleanRow[4]]);
      });
      var options = {
        title: "PII Breaches by time, Author and Content ID",
        curveType: 'function',
        height: "450",
        isStacked: true,
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
      var chart = new google.charts.Bar(document.getElementById('PiiData'));
      chart.draw(data, google.charts.Bar.convertOptions(options));
      await sleep ( 300000 );
    }
  }
}

async function getSentiment() {
  let query = "SELECT SUM(angry) as angry, SUM(apprehensive) as apprehensive, SUM(disapointed) as disappointed, SUM(happy) as happy, SUM(humiliated) as humiliated,SUM(upset) as upset, SUM(worried) as worried, SUM (not_classified) as not_classified FROM emotions_v, full_index_meta where emotions_v.content_id = full_index_meta.content_id  AND created_date BETWEEN NOW() - INTERVAL '1 MONTH' AND NOW()";
  if ( CurrentServer != null ) {
    while ( RunActiveSessions ) { //we will run this every 5 mins
      let serverMap = await getServerDetails();
      let response = await callServer(serverMap.get("host"), serverMap.get("user"), serverMap.get("password"), query);
      if ( !response.includes (",") ) {
        document.getElementById('currentLoad').innerText = "Currently no data to display!";
        return;
      }
      const arrayData = response.split('\n');
      var clean_array = [];//no nulls
      //Make sure that we have no null rows here
      for ( var data_check of arrayData ) {
          if ( data_check[0] != null ) {
              clean_array.push(data_check);
          }
      }
      //Now we will place this into a pairngs map
      var records = new Map();
      var totalCount = 0;
      var recordCount = clean_array.length -1;
      var fieldNames = clean_array[0].split(",");
      var fieldValues = clean_array[1].split(",");
      for ( let iter = 0; iter < fieldNames.length; iter++ ) {
        if ( fieldValues[iter] != null ) {
          records.set(fieldNames[iter], fieldValues[iter]);
        }
      }
      var gauge_options = {
        height: 200,
        yellowFrom:35, yellowTo: 55,
        minorTicks: 5,
        max: 100
    };
    var gauge_array = [];
    gauge_array.push(['Emotion', 'Percentage']);
    records.forEach((value,key) => {
      totalCount = totalCount + parseInt(value);
    });
    records.forEach((value,key) => {
      if ( parseInt(value) > 0 ) {
        if ( key != undefined ){
          let percentage = (parseInt(value)/totalCount) * 100;
          gauge_array.push([key, parseInt(percentage)]);
        }
      }
      totalCount + parseInt(value);
    });
      let created_data = new google.visualization.arrayToDataTable(gauge_array);
      var gauge_chart = new google.visualization.Gauge(document.getElementById('sentimentData'));
      gauge_chart.draw(created_data, gauge_options);
      await sleep ( 300000 );
    } 
  }
}