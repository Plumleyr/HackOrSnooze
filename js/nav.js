"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navLeft.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navSubmitClick(){
  if($submitStoryForm.is(":visible")){
    $submitStoryForm.slideUp("slow");
  }else{
    $submitStoryForm.slideDown("slow");
  }
}

$navSubmit.on('click', navSubmitClick)

function navFavoriteClick(){
  hidePageComponents();
  putFavoritesOnPage();
}

$navFavorites.on('click', navFavoriteClick)

function navMyStoryClick(){
  hidePageComponents();
  putOwnStoriesOnPage();
}

$navMyStories.on('click', navMyStoryClick)

function showUserProfile(){
  hidePageComponents();
  userProfileData();
}

$navUserProfile.on('click', showUserProfile)