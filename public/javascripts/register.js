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

    //register event to send the input data for backend and save to database
    const register = document.getElementById("register-form");
    register.addEventListener("submit", function(event){
        event.preventDefault();
        let input_email = document.getElementsByName("email")[0];
        let input_name = document.getElementsByName("name")[0];
        let input_username = document.getElementsByName("username")[0];
        let input_password = document.getElementsByName("password")[0];
        let input_about = document.getElementsByName("about")[0];

        //object to save all input data
        let object = {};
        object.email = input_email.value;
        object.name = input_name.value;
        object.username = input_username.value;
        object.password = input_password.value;
        object.about = input_about.value;
        console.log(input_about);
        console.log(object);

        //send input data in body and response with directing to login page or error message
        fetch("/register", {
            method: "POST",
            headers: {"content-type": "application/json" },
            body: JSON.stringify(object)
        })
        .then(function(res){
            return res.text();
        })
        .then(function(message){
            if(message == "ok"){
                window.location.href="/login";
            } else{
                const error = document.getElementById("error");
                error.innerText = message;
                console.log(message);
            }
        })
    })
}
