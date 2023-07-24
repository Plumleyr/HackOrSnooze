"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let storyToEdit = '';

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
*
* Returns the markup for the story.
*/

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  
  let starClass;
  let isLoggedIn = false;
  let isOwnStory = false;

  if(currentUser !== undefined){
    isLoggedIn = true;
    starClass = currentUser.isFavorited(story) ? 'fa-solid' : 'fa-regular';
    if(currentUser.isOwnStory(story)){
      isOwnStory = true;
    }
  }


  const hostName = story.getHostName();
  const starIcon = isLoggedIn ? `<i class="${starClass} fa-star"></i>` : '';
  const trashCan = isOwnStory ? '<i class="fa-regular fa-trash-can"></i>' : '';
  const editIcon = isOwnStory ? '<i class="fa-regular fa-pen-to-square"></i>' : '';

  return $(`
      <li id="${story.storyId}">
        ${starIcon}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        ${editIcon}
        ${trashCan}
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <hr>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoritesOnPage(){

  $favStoriesList.empty()

  if(currentUser.favorites.length === 0){
    $favStoriesList.append('<h3>No Favorites Yet!</h3>')
  }else{
    for(let favorite of currentUser.favorites){
      const story = generateStoryMarkup(favorite)
      $favStoriesList.append(story);
    }
  }

  $favStoriesList.show();
}

function putOwnStoriesOnPage(){

  $ownStoriesList.empty()

  if(currentUser.ownStories.length === 0){
    $ownStoriesList.append('<h3>No Current Stories!</h3>')
  }else{
    for(let story of currentUser.ownStories){
      const ownStory = generateStoryMarkup(story)
      $ownStoriesList.prepend(ownStory)
    }
  }

  $ownStoriesList.show();
}

async function submitNewStory(e){
  e.preventDefault();

  let author = $("#submit-author").val();
  let title = $("#submit-title").val();
  let url = $("#submit-url").val();

  const newStory = await storyList.addStory(currentUser, {title, author, url});

  const story = generateStoryMarkup(newStory);
  $allStoriesList.prepend(story)
  $submitStoryForm.trigger("reset");
  $submitStoryForm.hide();
}

$submitStoryForm.on('submit', submitNewStory);

function toggleFavorites(e){
  const $target = $(e.target);
  const storyId = $target.closest('li').attr('id');
  const story = storyList.stories.find(function(s){
    return s.storyId === storyId;
  })
  if($target.hasClass('fa-regular')){
    currentUser.addFavorite(story)
    $target.toggleClass('fa-regular fa-solid')
    currentUser.favorites.push(story)
  }else{
    currentUser.removeFavorite(story)
    $target.toggleClass('fa-regular fa-solid');
    currentUser.favorites = currentUser.favorites.filter(s => s.storyId !== story.storyId);
  }
}

$storyLists.on('click', '.fa-star', toggleFavorites);

// Deleting Story Functions 

function deleteStories(e){
  const $target = $(e.target);
  const storyId = $target.closest('li').attr('id');
  const story = storyList.stories.find(function(s){
    return s.storyId === storyId;
  })
  currentUser.deleteStory(story);
  currentUser.ownStories = currentUser.ownStories.filter(s => s.storyId !== story.storyId);
  storyList.stories = storyList.stories.filter(s => s.storyId !== story.storyId);
  putStoriesOnPage();
}

function confirmDeletion(e){
  let confirmation = confirm('Are you sure you want to delete?')
  if(confirmation){
    deleteStories(e);
  }
}

$storyLists.on('click', '.fa-trash-can', confirmDeletion)

$storyLists.on('mouseenter mouseleave', '.fa-trash-can', function() {
  $(this).toggleClass('fa-regular fa-solid');
});

// infinite scrolling for allstoriespage

$(window).scroll(async function () {
  if ($(document).height() - $(this).height() <= $(this).scrollTop() + 1 && $allStoriesList.is(':visible')) {
      await loadMoreStories();
  }
}); 

async function loadMoreStories(){
  const newStoryList = await storyList.getInfiniteStories(storyList.stories.length)
  if(newStoryList.stories.length > 0){
    storyList.stories.push(...newStoryList.stories);
    putStoriesOnPage();
  }
}

// Editing Story Functions

async function editFormInitialValues(e){
  const $target = $(e.target);
  const storyId = $target.closest('li').attr('id');
  const story = await storyList.getStory(storyId);

  storyToEdit = story.storyId;

  $("#edit-author").val(story.author);
  $("#edit-title").val(story.title);
  $("#edit-url").val(story.url);
  $editStoryForm.slideDown("slow");
}

$storyLists.on('click', '.fa-pen-to-square', editFormInitialValues);

async function editAStory(e){
  e.preventDefault();
  let author = $("#edit-author").val();
  let title = $("#edit-title").val();
  let url = $("#edit-url").val();
  let domUrlText = new URL(url).host;

  storyList.editStory(currentUser, storyToEdit,{author,title,url} );

  const $editedStory = $(`#${storyToEdit}`);

  $editedStory.find(".story-author").text(`by ${author}`);
  $editedStory.find(".story-link").text(title).attr('href', url);
  $editedStory.find(".story-hostname").text(`(${domUrlText})`);

  $editStoryForm.trigger("reset");
  $editStoryForm.slideUp("slow");
}

$editStoryForm.on("submit", editAStory);

$storyLists.on('mouseenter mouseleave', '.fa-pen-to-square', function() {
  $(this).toggleClass('fa-regular fa-solid');
});
