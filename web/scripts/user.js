/**********************************************************************************************************************
 * COPYRIGHT NOTICE
 * Copyright (c) OmniIndex Inc 2021
 * @author Simon i Bain
 * Email sibain@omniindex.io
 * Date: August 2021
 * Project: OmniIndex Management dashboard.
 * @file user.js
 * @version 1.0
 * This file holds the details about teh user and the services they access
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
var User;

document.getElementById("localLoginButton").addEventListener("click", function(event) {
    updateNicknameText("Not currently connected.");
    localLogin();
});


/** This function will attempt to log a user in to teh console.
 * If validated it will trigger other items within teh console to run.
 * If not then it will alert the user
 */
async function localLogin() {
    let completed = false;
    var notification;
    document.getElementById('waitingHolder').style.display = 'flex';
    document.getElementById('page').style.cursor = 'progress';
    var usr = document.getElementById('localusername').value;
    var password = document.getElementById('localpassword').value;
    if ( usr == "" ) {
        alert ( "Please provide a username" );
        document.getElementById('waitingHolder').style.display = 'none';
        document.getElementById('page').style.cursor = 'default';
        return;
    }
    if ( password == "" ) {
        alert ( "Please provide a password" );
        document.getElementById('waitingHolder').style.display = 'none';
        document.getElementById('page').style.cursor = 'default';
        return;
    }
    try {
        //We will take a look n our Userdatabase to see if we have our user
        let username;
        let userpassword;
        let authenticated = false;
        UserObjs.forEach(async function(userdetails) {
            username = userdetails.username; 
            if ( username === usr && userdetails.host === "localhost" ) {
                if ( userdetails.password === password ) {
                    authenticated = true;
                    User = username;
                }   
            }
        })
        if ( authenticated ) {
            document.getElementById("localLogin").style.opacity = "0";
            document.getElementById("page").style.opacity = "1";
            document.getElementById("localLogin").style.display = "none";
            document.getElementById("page").style.display = "flex";
            document.getElementById("userDetails").innerText = User;
            document.getElementById('localpassword').value = "";
            document.getElementById('localusername').value = "";
            document.getElementById("userDetails").innerText = usr;
            notification = setNotification("User " + User + " has loogged in.");
            getServerList();
            completed = true;
        } else {
            completed = true;
            alert ( "Username or password have not been recognized!" );
        }
    } catch ( err ) {
        completed = true;
        alert ( "Username or password have not been recognized!" );
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
    removeNotification(notification);
    document.getElementById('waitingHolder').style.display = 'none';
    document.getElementById('page').style.cursor = 'default';   
}

document.getElementById("localAccountButton").addEventListener("click", function(event) {
    hideMenus();
    document.getElementById("newLocalUser").style.display = "flex";
});

document.getElementById("cancelNewUserButton").addEventListener("click", function(event) {
    hideMenus();
    document.getElementById("newLocalUser").style.display = "none";
});

document.getElementById("createNewUserButton").addEventListener("click", function(event) {
    hideMenus();
    //Check the passwords match
    if ( document.getElementById("newPassword1").value === document.getElementById("newPassword2").value  ) {
        createLocalUser();
    } else {
        alert("Your passwords do not match. Please retype them!");
    }
});

/** This function will create a new user within the local system. */
async function createLocalUser() {
    let newUser = { username: document.getElementById('newUserName').value, password: document.getElementById('newuserPassword1').value, host: "localhost", nickname: "local", date: getCurrentDate() };
    if ( UserObjs == null ) {
        await openLocalUserDatabase();
    }
    UserObjs.push ( newUser );
    let completed = await update(UserObjs);
    if ( completed ) {
      alert ( "User has been created and you willl now be logged in.");
      document.getElementById("localusername").value = document.getElementById('newUserName').value;
      document.getElementById("localpassword").value = document.getElementById('newuserPassword1').value;
      document.getElementById("newUserName").value = "";
      document.getElementById("newPassword1").value = "";
      document.getElementById("newPassword2").value = "";
      document.getElementById("newLocalUser").style.display = "none";
      localLogin();
    } else  {
        alert ( "user was not saved. Please retry" );
    }
}

document.getElementById("localLogout").addEventListener("click", function(event) {
    hideMenus();
    clearUI();
    document.getElementById("localLogin").style.opacity = "1";
    document.getElementById("page").style.opacity = "0";
    document.getElementById("localLogin").style.display = "flex";
    document.getElementById("page").style.display = "none";
    document.getElementById("userDetails").innerText = User;
});

document.getElementById("userDetails").addEventListener("click", function(event) {
    hideMenus();
    var currentElement = MouseEvent.target;
    document.getElementById("contextMenuLocalUser").style.left = MouseEvent.pageX - 75  + "px";
    document.getElementById("contextMenuLocalUser").style.top = MouseEvent.pageY + 7 + "px";
    document.getElementById("contextMenuLocalUser").style.display = "block";  
});

document.getElementById("changePassword").addEventListener("click", function(event) {
    hideMenus();
    document.getElementById("localPasswordUpdate").style.display = "flex";
});

document.getElementById("updatePasswordButton").addEventListener("click", function(event) {
    //Check the passwords match
    if ( document.getElementById("newPassword1").value === document.getElementById("newPassword2").value  ) {
        if (confirm("you are about to change your password!")) {
            updatePassword();
          } else {
            alert( "Password change canceled!");
            document.getElementById("localPasswordUpdate").style.display = "none";
          }
    } else {
        alert ( "Passwords do not match. Please retype them!" )
    }
});

async function updatePassword() {
    let position = -1;
    UserObjs.every(async function(userdetails) {
        position++;
        if ( userdetails.username === User && userdetails.host === "localhost" ) {
            let host = userdetails.host;
            let username = userdetails.username;
            let password = document.getElementById("newPassword1").value;
            let nickname = userdetails.nickname;
            UserObjs.splice(position, 1);
            //Now add the new data
            let newUser = { username: username, password: password, host: host, nickname: nickname, date: getCurrentDate() };
            UserObjs.push ( newUser );
            let completed = await update(UserObjs);
            if ( completed ) {
                alert ("Username has been updated");
            } else {
                alert ("Username could not be updated!");
            }
            return false;
        }
        return true;
    })
    document.getElementById("localPasswordUpdate").style.display = "none";
}

document.getElementById("cancePasswordUpdateButton").addEventListener("click", function(event) {
    document.getElementById("localPasswordUpdate").style.display = "none";
});

/** This is the user tab area  */

document.getElementById("usersData").addEventListener("click", function(event) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("usersData").classList.add("selected");
    document.getElementById("userManagementTab").style.display = "flex";
    document.getElementById("userManagementTab").style.opacity = "1";
});

document.getElementById("quickLinkUsers").addEventListener("click", function(event) {
    hideTabs();
    toggleTabBackground();
    document.getElementById("usersData").classList.add("selected");
    document.getElementById("userManagementTab").style.display = "flex";
    document.getElementById("userManagementTab").style.opacity = "1";
});


document.getElementById("createUserButton").addEventListener("click", function(event) {
    if ( CurrentServer != null ) {
    let notification =setNotification("Reloading dashboard reports. " + getCurrentDate());
    document.getElementById('waitingHolder').style.display = 'flex'; 
    let emailAddress = document.getElementById('newEmail').value;
    let password = document.getElementById('newPassword').value;
    //Do we have a blank anywhere?
    if ( !DEBUG && (emailAddress == undefined || password == undefined) ) {
        document.getElementById('waitingHolder').style.display = 'none';
        alert ('Please provide all of the details!');
        return;
    }    
    let response;
    (async() => {
        response = await createNewUser(emailAddress, password);
        if ( response === false ) {
            document.getElementById('waitingHolder').style.display = 'none';
            return;
        }
        let message = GetJsonValue(response, 'Response');
        if ( message == 'Fail' ) {
            message = GetJsonValue(response, 'Message');
            if ( message === '' ) {
                message = 'User cannot be created in. Please retry';
            }
            document.getElementById('waitingHolder').style.display = 'none';
            alert ( message );
            return;
        } else {
            alert('User has been added to the system!');
        }
        document.getElementById('waitingHolder').style.display = 'none';
        setNotification("A new user with username " + emailAddress + ". Has been added to the system. " + getCurrentDate()); 
        removeNotification(notification);  
    })();
    } 
});

async function createNewUser(user, password) {
    //Is this in the same domain?
    let serverMap = await getServerDetails();
    let checkUser = serverMap.get("user") ;
    checkUser = checkUser.substring(checkUser.indexOf('@')+1);
    checkUser = checkUser.toLowerCase();
    let newUser = user.toLowerCase();
    if ( !newUser.includes (checkUser )) {
        alert('Users must be in the same domain!');
        return false;
    }
    let completed = false;
    var out_data = "";
    try {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                out_data = xhttp.responseText;
                completed = true;
            }
        };
        var request = serverMap.get("host") + '/cgi-bin/createinstance?emailaddress=' + user + '&password=' + password + "&iscorporate=true";
        xhttp.open("GET", request, true);
        xhttp.send();
    } catch ( error ) {
        completed = true;
        out_data = false;
        return;
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
      return out_data;    
}

document.getElementById("dropUserButton").addEventListener("click", function(event) {
    (async() => {
        let serverMap = await getServerDetails();
        let dropUser = document.getElementById("deleteEmail").value;
        if ( dropUser == null || dropUser == "" ) {
            alert("Please provide a username to drop from the system!");
            return;
        }
        let completed = false;
        var out_data = "";
        try {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    out_data = xhttp.responseText;
                    alert ("User " + dropUser + ", has been dropped from the system");
                    completed = true;
                }
            };
            var request = serverMap.get("host") + '/cgi-bin/dropuser?emailaddress=' + user + '&password=' + password + "&drop=" + dropUser;
            xhttp.open("GET", request, true);
            xhttp.send();
        } catch ( error ) {
            completed = true;
            out_data = false;
            alert ( error );
        } 
    })();
});

document.getElementById("suspendUserButton").addEventListener("click", function(event) {
    (async() => {
        let serverMap = await getServerDetails();
        let suspendEmail = document.getElementById("pauseEmail").value;
        if ( suspendEmail == null || suspendEmail == "" ) {
            alert("Please provide a username to reinstate to the system!");
            return;
        }
        try {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    out_data = xhttp.responseText;
                    completed = true;
                    alert ("User " + suspendEmail + ", has been suspended");
                }
            };
            var request = serverMap.get("host") + '/cgi-bin/suspenduser?emailaddress=' + user + '&password=' + password + "&suspend=" + suspendEmail;
            xhttp.open("GET", request, true);
            xhttp.send();
        } catch ( error ) {
            completed = true;
            out_data = false;
            alert (error);
        }
    })();
});

document.getElementById("reinstateUserButon").addEventListener("click", function(event) {
    (async() => {
        let serverMap = await getServerDetails();
        let reinstateEmail = document.getElementById("reinstateEmail").value;
        if ( reinstateEmail == null || reinstateEmail == "" ) {
            alert("Please provide a username to reinstate to the system!");
            return;
        }
        try {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    out_data = xhttp.responseText;
                    completed = true;
                    alert ("User " + reinstateEmail + ", has been suspended");
                }
            };
            var request = serverMap.get("host") + '/cgi-bin/reinstateuser?emailaddress=' + user + '&password=' + password + "&reinstate=" + reinstateEmail;
            xhttp.open("GET", request, true);
            xhttp.send();
        } catch ( error ) {
            completed = true;
            out_data = false;
            alert (error);
        }
    })();
});
