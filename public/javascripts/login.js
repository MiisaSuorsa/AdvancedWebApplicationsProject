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

    //login event to send the input data for backend to validate
    const login = document.getElementById("login-form");
    login.addEventListener("submit", function(event){
        event.preventDefault();
        const login_username = document.getElementById("login_username");
        const login_password = document.getElementById("login_password");

        //object to save all input data
        let object = {};
        object.username = login_username.value;
        object.password = login_password.value;
        console.log(JSON.stringify(object))

        //send input data in body and response with storing the token into local storage
        fetch("/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(object)
        })
        .then(function(res) {
            return res.json();
        })
        .then(function(dataj){
            if(dataj.token){
                localStorage.setItem("auth_token", dataj.token);
                window.location.href="/user";
            } else {
                let error = document.getElementById("error");
                error.innerText = dataj.message;
                console.log(dataj.message);
            }
        })
    })
}
