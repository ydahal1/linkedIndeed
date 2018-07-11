api_key: 77uwyu64kulxbc
authorize: true

//Both keys are same now
//Api key for local host : 77uwyu64kulxbc
//API Key for live live - 77uwyu64kulxbc


//Linked in configuration
var config = {
    apiKey: "AIzaSyAgVO8Mm76_hyDvnzl7Pt0MHzSf-NYa2-s",
    authDomain: "linkedindeed-daf51.firebaseapp.com",
    databaseURL: "https://linkedindeed-daf51.firebaseio.com",
    projectId: "linkedindeed-daf51",
    storageBucket: "linkedindeed-daf51.appspot.com",
    messagingSenderId: "1069346080221"
};
firebase.initializeApp(config);
database = firebase.database();

IN.Event.on(IN, "auth", getProfileData);

// Logout user
function logout() {
    IN.User.logout(onLogout);
}

function onLogout() {
    console.log('Logout successfully');
    location.reload();

}

$("#logout").click(function() {
    console.log("onclick");
    logout();
});