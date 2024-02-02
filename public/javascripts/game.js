if(document.readyState !== "loading"){
    console.log("Document is ready");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function(){
        console.log("Document ready after waiting!");
        initializeCode();
    })
}

let currentIndex = 0;
let userList = [];


function initializeCode(){

    //get token from local storage
    const authToken = localStorage.getItem("auth_token");
    console.log(authToken);


    if(!authToken){
        //direct user to login if it's not logged in
        window.location.href="/login";
    } else{
        //fetch to get list of users and their about information
        fetch("/secret/game", {
            method: "GET",
            headers: {
                "authorization": "Bearer " + authToken
            }
        })
        .then(function(res){
            return res.json();
        })
        .then(function(data){
            if(data.error){
                console.log(data.error)
                document.getElementById("name").innerText = data.error
            } else{
                console.log("got the users list: " + data.users);
                userList = data.users;
                showUserCards();
            }
        })
        .catch((e) => {
            console.log("error" + e);
        })
    }


}

function showUserCards(){
    //show user and it's about information one at a time
    if(currentIndex < userList.length){
        let obj = JSON.parse(userList[currentIndex]);
        document.getElementById("name").innerText = obj.name;
        document.getElementById("username").innerText = "username: " + obj.username;
        document.getElementById("about").innerText = obj.about;
        currentIndex++;
    } else{
        document.getElementById("name").innerText = "No more users to match :(";
        document.getElementById("username").innerText = "";
        document.getElementById("about").innerText = "";
    }
}


function buttonHandle(response){
    //after clicking yes or no button, response is the action
    console.log(`User clicked "${response}" for item: ${userList[currentIndex - 1]}`);

    //save data only by response 'yes'
    if(response == 'yes'){
        console.log("response was yes");
        //get token from local storage
        const authToken = localStorage.getItem("auth_token");

        //send liked user in body
        fetch("/matchData", {
            method: "POST",
            headers: {
                "authorization": "Bearer " + authToken,
                "Content-type": "application/json"
            },
            body: userList[currentIndex - 1]
        })
        .then(function(res){
            return res.text();
        })
        .then(function(data){
            console.log(data);
        })
    }

    //show next user card
    showUserCards()
}
