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

    const update = document.getElementById("profile-form");

    const authToken = localStorage.getItem("auth_token");
    console.log(authToken);

    //const profileCard = document.getElementById("profile-card");

    if(!authToken){
        window.location.href="/login";
    } else{

        //fetch current profile information
        fetch("/secret/profile", {
            method: "GET",
            headers: {
                "authorization": "Bearer " + authToken
            }
        })
        .then(function(res){
            return res.json();
        })
        .then(function(user){

            document.getElementById("email").innerText = user.email;
            document.getElementById("name").innerText = user.name;
            document.getElementById("username").innerText = user.username;
            document.getElementById("about").innerText = user.about;

        })
        .catch((e) => {
            console.log("error" + e);
        })


        const profileForm = document.getElementById("profile-form");
        profileForm.addEventListener("submit", function(event){
            event.preventDefault();
            let input_email = document.getElementsByName("email")[0];
            let input_name = document.getElementsByName("name")[0];
            let input_password = document.getElementsByName("password")[0];
            let input_about = document.getElementsByName("about")[0];

            //object to save all input data
            let object = {};
            object.email = input_email.value;
            object.name = input_name.value;
            object.password = input_password.value;
            object.about = input_about.value;
            console.log(input_about.value);
            console.log(object);

            //send input data in body and response with ok
            fetch("/secret/profile", {
                method: "POST",
                headers: {
                    "authorization": "Bearer " + authToken,
                    "content-type": "application/json"
                },
                body: JSON.stringify(object)
            })
            .then(function(res){
                return res.json();
            })
            .then(function(message){
                let response = document.getElementById("msg");
                if(message.msg == "ok"){
                    response.innerText = "Your profile have been updated";
                    console.log(message);
                } else{
                    response.innerText = message.errors[0].msg;
                    console.log(message.errors[0].msg);
                }
            })
        })
    }

}
