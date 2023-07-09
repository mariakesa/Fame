let followers = 0;
let celebrityFollowers = [];

async function loadTweets() {
  const posKeys = Object.keys(posTweets);
  const negKeys = Object.keys(negTweets);

  const posRandom1 = posKeys[Math.floor(Math.random() * posKeys.length)];
  const posRandom2 = getUniqueRandom(posRandom1, posKeys);
  const negRandom1 = negKeys[Math.floor(Math.random() * negKeys.length)];
  const negRandom2 = getUniqueRandom(negRandom1, negKeys);

  posTweet1 = posTweets[posRandom1];
  posTweet2 = posTweets[posRandom2];
  negTweet1 = negTweets[negRandom1];
  negTweet2 = negTweets[negRandom2];

  document.querySelector("#tweet-pos-1").textContent = posTweet1.tweet_text;
  document.querySelector("#tweet-pos-2").textContent = posTweet2.tweet_text;
  document.querySelector("#tweet-neg-1").textContent = negTweet1.tweet_text;
  document.querySelector("#tweet-neg-2").textContent = negTweet2.tweet_text;

  // Add class to positive tweets
  document.getElementById("tweet-pos-1").classList.add("tweet-positive");
  document.getElementById("tweet-pos-2").classList.add("tweet-positive");

  // Add class to negative tweets
  document.getElementById("tweet-neg-1").classList.add("tweet-negative");
  document.getElementById("tweet-neg-2").classList.add("tweet-negative");
}

document.addEventListener("DOMContentLoaded", async (event) => {
  // Load the tweet data
  posTweets = await fetch("pos_tweets.json").then((response) =>
    response.json()
  );
  negTweets = await fetch("neg_tweets.json").then((response) =>
    response.json()
  );

  document.getElementById("tweet-pos-1").addEventListener("click", selectTweet);
  document.getElementById("tweet-pos-2").addEventListener("click", selectTweet);
  document.getElementById("tweet-neg-1").addEventListener("click", selectTweet);
  document.getElementById("tweet-neg-2").addEventListener("click", selectTweet);

  // Initially load the tweets
  await loadTweets();
});

function selectTweet(evt) {
  let tweet;
  const id = evt.target.id;

  if (id === "tweet-pos-1") tweet = posTweet1;
  else if (id === "tweet-pos-2") tweet = posTweet2;
  else if (id === "tweet-neg-1") tweet = negTweet1;
  else if (id === "tweet-neg-2") tweet = negTweet2;

  if (!tweet) return;

  updateScores(tweet);

  // After updating scores, load new tweets
  loadTweets();
}

function updateScores(tweet) {
  let followerSpan = document.querySelector(".followers");
  let celebritySpan = document.querySelector(".celebrities");

  // Get new followers and unfollowers
  let newFollowers = parseInt(tweet.new_followers);
  let newUnfollowers = parseInt(tweet.new_unfollowers);

  // Calculate net follower count
  followers += newFollowers - newUnfollowers;
  if (followers < 0) followers = 0; // Ensure followers do not go negative

  // Update follower count and display added and removed followers
  followerSpan.innerHTML = `${followers} 
    (<span class="added">+${newFollowers}</span> 
    <span class="removed">-${newUnfollowers}</span>)`;

  // Update celebrity followers list
  let newCelebFollowers = tweet.new_celeb_followers;
  let newCelebUnfollowers = tweet.new_celeb_unfollowers;

  let oldCelebFollowerCount = celebrityFollowers.length;

  newCelebFollowers.forEach((follower) => {
    if (!celebrityFollowers.includes(follower)) {
      celebrityFollowers.push(follower);
    }
  });

  // Remove any celebrity unfollowers
  celebrityFollowers = celebrityFollowers.filter(
    (follower) => !newCelebUnfollowers.includes(follower)
  );

  // Update the celebrity followers count and display added and removed celebrity followers
  celebritySpan.innerHTML = `${celebrityFollowers.length} 
    (<span class="added">+${newCelebFollowers.length}</span>
    <span class="removed">-${newCelebUnfollowers.length}</span>)`;

  celebritySpan.dataset.celebrities = celebrityFollowers
    .slice(0, 10)
    .join(", ");
}

let celebritySpan = document.querySelector(".celebrities");

celebritySpan.addEventListener("mouseenter", showCelebrityFollowersPopup);
celebritySpan.addEventListener("mouseleave", hideCelebrityFollowersPopup);

function showCelebrityFollowersPopup() {
  const followersList = celebrityFollowers.slice(0, 200).join(", ");

  const popup = document.createElement("div");
  popup.className = "popup";
  popup.textContent = followersList;

  const celebritySpanRect = celebritySpan.getBoundingClientRect();
  popup.style.cssText = `
    position: absolute;
    top: ${celebritySpanRect.bottom}px;
    left: ${celebritySpanRect.left}px;
    background-color: #fff;
    padding: 10px;
    border: 1px solid #ccc;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    z-index: 999;
  `;

  document.body.appendChild(popup);
}

function hideCelebrityFollowersPopup() {
  const popup = document.querySelector(".popup");
  if (popup) {
    document.body.removeChild(popup);
  }
}

function getUniqueRandom(exclude, keys) {
  let random;
  do {
    random = keys[Math.floor(Math.random() * keys.length)];
  } while (random === exclude);
  return random;
}
