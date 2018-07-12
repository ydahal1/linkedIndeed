//Global Variables
var database;
var jobId;
var preferedLocation;
var skill;
var preferedJobType;
var url_gitHub;
var url_govt;
var emailAddress;
var uniqueKey;

function start() {
    database = firebase.database();

      // Logout user
    function logout() {
        IN.User.logout(onLogout);
    }

    function onLogout() {
        console.log('Logout successfully');
        location.reload();
    }

    $("#logout").click(function(){
        console.log("onclick");
        logout();
    });

    IN.Event.on(IN, "auth", getProfileData);
}

//Function to pull Git hub jobs per user profile
function pullGitHubJobs() {
    // var one = "https://jobs.github.com/positions.json?search=887cd2b2-8245-11e8-9ecb-449d24e3b102";
    $.ajax({
        url: url_gitHub,
        method: 'GET',
        dataType: 'jsonp'
    }).then(function(response) {
        // console.log(response);

        for (var i = 0; i < response.length; i++) {
            datePosted = response[i].created_at;
            var location = response[i].location;
            var title = response[i].title;
            var description = response[i].description;
            // console.log(description);
            var type = response[i].type;
            var link = response[i].how_to_apply;
            // link = (link.split("URL:").pop());
            jobId = response[i].id;

            counter = i;
            //   console.log(response);

            displayInTable(datePosted, location, title, type, description, link);
        }
    });
}

//Function to pull Government jobs per user profile
function pullGovernmentJobs() {
    $.ajax({
        url: url_govt,
        method: 'GET',
        dataType: 'jsonp'
    }).then(function(response) {
        // console.log(response);

        for (var i = 0; i < response.length; i++) {
            datePosted = response[i].start_date;
            var location = response[i].locations;
            var title = response[i].position_title;
            var description = response[i].organization_name;
            // console.log(description);
            var type = "FT";
            var link = response[i].url;
            // link = (link.split("URL:").pop());
            jobId = response[i].id;
            counter = i;
            //   console.log(response);

            displayInTable(datePosted, location, title, type, description, link);
        }
    });
}


//Displays posting on table
function displayInTable(datePosted, location, title, type, description, link) {
    var tablebody = $('<tr><td>' +
        "<span class='glyphicon glyphicon-folder-open' id=" + jobId + "></span>" + '</td><td>' +
        datePosted + '</td><td>' +
        location + "</td><td class='CellWithComment'>" +
        title +
        "<span class='CellComment'>" + description + '</span></td><td>' +
        'description </td><td>' +
        type + '</td><td>' +
        link + '</td><tr>');
    $("#tableBody").append(tablebody);
}

// function to capture users prefered Locations
function addPreferedLocations() {
    $("#btnPreferedLocations").click(function() {
        event.preventDefault();
        if ($("#preferedLocations").val() !== "") {
            preferedLocation = ($("#preferedLocations").val()).trim();

            database.ref("Accounts/" + uniqueKey + "/preferedLocation/").set({
                preferedLocation: preferedLocation
            });

            database.ref("Accounts/" + uniqueKey + "/preferedLocation/").once("value", function(snapshot) {
                var preferedLocation = snapshot.val().preferedLocation;
                console.log("The updated post title is " + preferedLocation);
                $("#location").html("&nbsp;" + preferedLocation);
            });

            $("#preferedLocations").val("");
        } else {
            alert("Prefered Location not entered");
        }
    });
}

// Captures users addational skills
function addSkills() {
    $("#submitUserInput").click(function() {
        event.preventDefault();
        if ($("#inputSkills").val() !== "") {
            skill = ($("#inputSkills").val()).trim();
            console.log(skill);

            database.ref("Accounts/" + uniqueKey + "/keywords/").set({
                keywords: skill
            });

            database.ref("Accounts/" + uniqueKey + "/keywords/").once("value", function(snapshot) {
                var keywords = snapshot.val().keywords;
                console.log("The updated post title is " + keywords);
                $("#search-keywords").html("&nbsp;" + keywords);
            });
            $("#inputSkills").val("");
        } else {
            alert("Skills not entered");
        }
    });
}

// captures user input government or github Jobs
function preferedJobType() {
    $("#submitUserInput").click(function() {
        event.preventDefault();
        preferedJobType = $('#selectJobType').val();
        $('#selectJobType').val('');
        console.log(preferedJobType);
        if (preferedJobType == "Government Jobs") {
            $("#tableBody").empty();
            // alert("run govt pull data function");
            console.log("gov skils:" + skill);
            console.log("gov loc:" + preferedLocation);
            console.log(url_govt);
            createUrl();
            pullGovernmentJobs();
        } else if (preferedJobType == "Github Jobs") {
            $("#tableBody").empty();
            console.log("gh skils:" + skill);
            console.log("gh loc:" + preferedLocation);

            createUrl();
            console.log(url_gitHub);
            pullGitHubJobs();
        }
    });
}

//constructing search url
function createUrl() {
    if (preferedJobType == "Government Jobs") {
        url_govt = "https://jobs.search.gov/jobs/search.json?query=" + skill + "+jobs+in+" + preferedLocation;

    } else if (preferedJobType == "Github Jobs") {
        url_gitHub = "https://jobs.github.com/positions.json?description=" + skill + "&location=" + preferedLocation + "&full_time=true"
    } else {
        url_gitHub = "https://jobs.github.com/positions.json?&page=1";
        url_govt = "https://jobs.search.gov/jobs/search.json?query=&size=100";
    }
}



//Saving the listing users are interested
function saveThisListing() {
    $('#tableBody').on('click', 'span', function(e) {
        var savedJobId = e.target.id;

        //This will change format the string the way fire base likes. firebase does not take ., #, etc.
        uniqueKey = emailAddress.split('.').join('@');
       
        database.ref("Accounts/" + uniqueKey + "/savedJobs/").push({
            jobId: savedJobId
        });  
        retrivingSavedItems();
    });
}



function retrivingSavedItems() {
    var ref = database.ref("Accounts/");
    ref.child(uniqueKey).on("child_added", function(snap) {
        var data = snap.val();
        var saved = Object.keys(data).length;
        $("#notification").html("&nbsp;" + saved);
    });
}

//Display user profile on the page
function dispayUserInfo(name, imageUrl, emailAddress, industry, summary) {
    $("#loggedin-user").html(name);
    $("#user-image").attr({
        'src': imageUrl,
        'height': '160px',
        'width': '180 px',
    });
    $("#name").text(" " + name);
    $("#email").html(" " + emailAddress);
    $("#industry").html(" " + industry);
    $("#summary").html(" " + summary);
}

// Use the API call wrapper to request the member's basic profile data
function getProfileData() {
    IN.API.Profile("me").fields("first-name", "last-name", "email-address", "picture-url",
        "summary", "specialties", "industry", "positions").result(function(data) {
        var userdata = data.values[0];
        var name = userdata.firstName + " " + userdata.lastName;
        var imageUrl = userdata.pictureUrl;
        emailAddress = userdata.emailAddress;
        var industry = userdata.industry;
        var summary = userdata.summary;
        uniqueKey = emailAddress.split('.').join('@');

        dispayUserInfo(name, imageUrl, emailAddress, industry, summary);
        uniqueKey = emailAddress.split('.').join('@');

        // Get a database reference
        database.ref("Accounts/" + uniqueKey + "/savedJobs/").on("value", function(snapshot) {
            var data = snapshot.val();
            var saved = Object.keys(data).length;
            $("#notification").html("&nbsp;" + saved);
        });
        pullGovernmentJobs();
        pullGitHubJobs();
    }).error(function(data) {
        console.log(data);
    });
}

function notification() {
    // console.log(userdata);
    uniqueKey = emailAddress.split('.').join('@');
    // console.log(uniqueKey);

    // Get a database reference
    database.ref("Accounts/" + uniqueKey + "/savedJobs/").on("value", function(snapshot) {
        snapshot.forEach(function(childNodes) {

            var savedJobId = childNodes.val().jobId;
            // var length = savedJobId.length;
            console.log(savedJobId);

            if (savedJobId.slice(0, 7) == "usajobs") {
                url_govt = "https://jobs.search.gov/jobs/search.json?query=&size=100";
                console.log("this is govt job and the id is : " + savedJobId);

                $.ajax({
                    url: url_govt,
                    method: 'GET',
                    dataType: 'jsonp'
                }).then(function(response) {
                    for (var i = 0; i < response.length; i++) {
                        var matchingId = response[i].id
                        console.log(matchingId);
                        if (savedJobId === matchingId) {
                            console.log("id matchded : " + savedJobId + " : " + matchingId);
                            datePosted = response[i].start_date;
                            var location = response[i].locations;
                            var title = response[i].position_title;
                            var description = response[i].organization_name;
                            // console.log(description);
                            var type = "FT";
                            var link = response[i].url;
                            console.log("location : " + location + " title : " + title + "description : " + description + "type : " + type + "link : " + link);
                            displayInTable(datePosted, location, title, type, description, link);
                        }
                    }

                    for (var i = 0; i < response.length; i++) {
                        datePosted = response[i].start_date;
                        var location = response[i].locations;
                        var title = response[i].position_title;
                        var description = response[i].organization_name;
                        // console.log(description);
                        var type = "FT";
                        var link = response[i].url;
                        // link = (link.split("URL:").pop());
                        jobId = response[i].id;
                        counter = i;
                        //   console.log(response);
                    }
                });
            } else {
                url_gitHub = "https://jobs.github.com/positions.json?search=" + savedJobId;
                $("#tableBody").empty();
                pullGitHubJobs();
            }
        });
    });

}


createUrl();

$(document).ready(function() {
    // Event listiners listining to user input like skills, location and job type
    addPreferedLocations();
    addSkills()
    preferedJobType();
    // when document is ready, call the start method
    start();
    //Save the listing when users click save
    saveThisListing();

});
