if(document.readyState !== "loading"){
    console.log("Document is ready");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function(){
        console.log("Document ready after waiting!");
        initializeCode();
    })
}


let userList = [];

function initializeCode(){

    const authToken = localStorage.getItem("auth_token");
    console.log(authToken);



    if(!authToken){
        window.location.href="/login";
    } else{

        //fetch matches to chat with
        fetch("/secret/matches", {
            method: "GET",
            headers: {
                "authorization": "Bearer " + authToken
            }
        })
        .then(function(res){
            return res.json();
        })
        .then(function(matches){
            if(matches == "No matches"){
                document.getElementById("text-field").innerText = "No matches to chat with.";
            } else {
                //get list of the matched users
                console.log("got the users list: " + matches);
                userList = matches;
                //show matches and chat buttons (?)
                showMatches();
            }
        })
        .catch((e) => {
            console.log("error" + e);
        })
    }
}

//show match name and chat button
function showMatches(){
    const matchCard = document.getElementById("match-card");

    console.log("There is " + userList.length + " matches.");

    for(let i=0 ; i < userList.length ; i++){

        let row = document.createElement("tr");
        let userCell = document.createElement("td");

        //create element for match name
        let user = document.createElement("p");
        user.innerText = userList[i];
        userCell.appendChild(user);

        //create chat button to chat with user
        let buttonCell = document.createElement("td");
        let button = document.createElement("button");
        button.setAttribute("id","user");
        button.innerText = "chat"
        button.setAttribute("onClick", "buttonHandle('" + userList[i] + "')");
        buttonCell.appendChild(button);

        row.appendChild(userCell);
        row.appendChild(buttonCell);
        matchCard.appendChild(row);
    }
    console.log("Done");
}

//button function to start chat with chosen match, match name given as parameter
function buttonHandle(chatUser){
    console.log("Chatting with " + chatUser);
    const authToken = localStorage.getItem("auth_token");

    if(!authToken){
        window.location.href="/login";
    } else{
        //fetch to chat database
        fetch("/secret/matches", {
            method: "POST",
            headers: {
                "authorization": "Bearer " + authToken,
                "Content-type": "application/json"
            },
            body: '{ "username": "' + chatUser + '"}'
        })
        .then(function(res){
            return res.json();
        })
        .then(function(messages){
            chatView(authToken, chatUser, messages);
        })
    }

}

function chatView(authToken, chatUser, messages){
    const match_container = document.getElementById("match-container");
    const chat_container = document.getElementById("chat-container");

    //match container to not visible and chat visible
    match_container.style.display = 'none';
    chat_container.style.display = 'block'

    const chatArea = document.getElementById("chat-area");

    document.getElementById("chat").innerText = "Chat with " + chatUser;

    //show previously sent messages
    if(messages.msg_data){

        let msg_amount = messages.msg_data.length;

        for(let i=0; i<msg_amount; i++){
            console.log(messages.msg_data[i])
            const chat = document.createElement("p");
            chat.innerText = messages.msg_data[i].user + ": " + messages.msg_data[i].msg + "   (" + messages.msg_data[i].time +")";
            chatArea.appendChild(chat);
        }
    }

    //event for clicking send button
    const sendButton = document.getElementById("send-msg");
    sendButton.addEventListener("click", function(){
        let input = document.getElementById("new-msg");

        //save new message into chat database
        fetch("/secret/chat", {
            method: "POST",
            headers: {
                "authorization": "Bearer " + authToken,
                "Content-type": "application/json"
            },
            body: '{ "input": "' + input.value + '", "match": "' + chatUser + '" }'
        })
        .then(function(res){
            return res.json();
        })
        .then(function(data){
            //show sent message
            let message = document.createElement("p");
            message.innerText = data.user + ": " + input.value + "   (" + data.time + ")";
            chatArea.appendChild(message);
        })
        .catch((e) => {
            console.log("error" + e);
        })
    })
}