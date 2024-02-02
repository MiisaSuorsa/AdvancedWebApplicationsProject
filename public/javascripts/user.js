if(document.readyState !== "loading"){
    console.log("Document is ready");
    initializeCode();
} else {
    document.addEventListener("DOMContentLoaded", function(){
        console.log("Document ready after waiting!");
        initializeCode();
    })
}

function initializeCode(){

    //get token from local storage
    const authToken = localStorage.getItem("auth_token");
    console.log(authToken);

    if(!authToken){
        //direct user to login if it's not logged in
        window.location.href="/login";
    } else{
        //fetch function to get username of the authenticated user
        fetch("/secret", {
            method: "GET",
            headers: {
                "authorization": "Bearer " + authToken
            }
        })
        .then(function(res){
            return res.json();
        })
        .then(function(data){
            console.log("success " + data.username);
            document.getElementById("name").innerText = "Hi " + data.username;
        })
        .catch((e) => {
            console.log("error" + e);
        })


        //log out button and event to remove the token from local storage
        const logout = document.getElementById("logout");

        logout.addEventListener("click", function(){
            localStorage.removeItem("auth_token");
            window.location.href = "/";
        })
    }
}
