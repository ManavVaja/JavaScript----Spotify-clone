console.log("Write some javaScript!");
let currentSong = new Audio();
let currentMusic = new Audio();
let songs;
let searchsongs;
let currentIndex = 0;
let currentfolder;
let searchfolder;
let searchIndex = 0;
let music;
let isSearchPlaying = false; // To track which type of music is playing

async function getSongs(folder) {
  currentfolder = folder;
  let a = await fetch(`http://192.168.56.1:3000/${folder}/`);
  let respons = await a.text();
  let div = document.createElement("div");
  div.innerHTML = respons;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.replaceAll("%20", " ").split(`/${folder}/`)[1]);
    }
  }

  // show the all songs in library section
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = " ";
  for (const song of songs) {
    songUl.innerHTML += `
    <li>
      <img class="invert" src="svg/music.svg" alt="music">
      <div class="info">
        <div>${song.replace("/", "").split(".")[0]}</div>
        <div>Manav Vaja</div>
      </div>
      <div class="play-btn">
        <span>Play Now</span>
        <img class="invert liPlay" src="svg/play.svg" alt="Play">
      </div>
    </li>`;
  }

  Array.from(
    document.querySelectorAll(".songList li")
  ).forEach((e, index) => {
    // Update the play button in li tag
    e.querySelector(".liPlay").addEventListener("click", (event) => {
      event.stopPropagation();
      if (currentIndex === index) {
        if (currentSong.paused) {
          currentSong.play();
          updatePlayButton(index, true);
        } else {
          currentSong.pause();
          updatePlayButton(index, false);
        }
      } else {
        playMusic(index);
      }
    });

    e.addEventListener("click", () => {
      playMusic(index);
    });
  });

  return songs;
}

function formatSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Ensure the input is a number and convert to integer
  const totalSeconds = Math.floor(Number(seconds));

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Pad minutes and seconds with leading zeros if necessary
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  // Combine minutes and seconds in the desired format
  return `${paddedMinutes}:${paddedSeconds}`;
}

// Update the play/pause button for the current song

function updatePlayButton(index, isPlaying, context) {
  const contextClass = context === 'search' ? 'searchPlay' : 'liPlay';
  const songItems = context === 'search' ? document.querySelectorAll(".results li") : document.querySelectorAll(".songList li");
  songItems.forEach((li, i) => {
      let playButton = li.querySelector(`.${contextClass}`);
      if (i === index) {
          playButton.src = isPlaying ? "svg/paused.svg" : "svg/play.svg";
          li.classList.add("active-song");
      } else {
          playButton.src = "svg/play.svg";
          li.classList.remove("active-song");
      }
  });
  document.getElementById("play").src = isPlaying ? "svg/paused.svg" : "svg/play.svg";
}





// We create the function which plays the songs
// This function accepts the argument as the track of the song and fetches that song from the (folder) /songs/ then append the track of the song to play the current music.
// For album songs
const playMusic = (index, paused = false) => {
  if (!paused) {
      currentSong.pause(); // Stop the currently playing song
  }
  currentIndex = index;
  const track = songs[index];
  currentSong.src = `/${currentfolder}/` + track;
  if (!paused) {
      currentSong.play();
      isSearchPlaying = false;
      updatePlayButton(index, true, 'library');
  }
  document.querySelector(".songName").innerHTML = decodeURI(track)
      .replaceAll("/", "")
      .split(".")[0];
  document.querySelector(".songTime").innerHTML = "00:00/00:00";
};





async function dispalyAlbums() {
  let a = await fetch(`http://192.168.56.1:3000/songs/`);
  let respons = await a.text();
  let div = document.createElement("div");
  div.innerHTML = respons;
  let cardcontainer = document.querySelector('.cards-container');
  let anchors = div.getElementsByTagName("a");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.replaceAll('%20', " ").split('/').slice(-2)[0];

      // Get the metadata of the folder
      let a = await fetch(`http://192.168.56.1:3000/songs/${folder}/info.json`);
      let respons = await a.json();
      cardcontainer.innerHTML = cardcontainer.innerHTML + `
         <div data-folder="${folder}" class="cards">
                                <img src="/songs/${folder}/cover.jpg" alt="A.R Rahman">
                                <h3>${respons.title}</h3>
                                <p>${respons.description}</p>
                            </div>`
    }
  }

  Array.from(document.getElementsByClassName("cards")).forEach((e) => {
    e.addEventListener("click", async (items) => {
      songs = await getSongs(`songs/${items.currentTarget.dataset.folder}`);
      playMusic(0)
    });
  });

}

// new feheras 

async function getMusic(folder) {
  searchfolder = folder;
  let a = await fetch(`http://192.168.56.1:3000/${folder}/`);
  let respons = await a.text();
  let div = document.createElement("div");
  div.innerHTML = respons;
  let as = div.getElementsByTagName("a");
  searchsongs = [];
  for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
          searchsongs.push(element.href.replaceAll("%20", " ").split('/music/')[1]);
      }
  }

  // Show the search results
  // Function to handle search input and display results
  async function handleSearchInput(event) {
    const searchQuery = event.target.value.toLowerCase();
    const resultsContainer = document.getElementById('results').getElementsByTagName('ul')[0];

    // Clear previous search results
    resultsContainer.innerHTML = '';

    if (searchQuery === '') {
        return;
    }

    // Fetch and filter songs based on search query
    const searchResults = searchsongs.filter(searchsongs => searchsongs.toLowerCase().includes(searchQuery));

    if (searchResults.length === 0) {
        resultsContainer.innerHTML = '<li>No songs found</li>';
    } else {
        searchResults.forEach((music, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <li class="music-box">
                    <div class="music-img">
                        <img src="svg/tune.svg" alt="Music" class="invert" width="50px" height="30px">
                    </div>
                    <div class="music-name">
                        <h5>${music.replace("/", "").split(".")[0]}</h5>
                    </div>
                    <div class="music-play">
                        <img class="invert searchPlay" src="svg/play.svg" alt="">
                    </div>
                </li>`;
            resultsContainer.appendChild(listItem);

            listItem.querySelector(".searchPlay").addEventListener("click", (event) => {
                event.stopPropagation();
                if (searchIndex === index) {
                    if (currentSong.paused) {
                        currentSong.play();
                        updatePlayButton(index, true, 'search');
                    } else {
                        currentSong.pause();
                        updatePlayButton(index, false, 'search');
                    }
                } else {
                    playSong(index);
                }
            });

           
        });
    }
}  
  document.getElementById('search-input').addEventListener('input', handleSearchInput);

  return searchsongs;
}


// For searched songs
const playSong = (index, paused = false) => {
  if (!paused) {
      currentSong.pause(); // Stop the currently playing song
  }
  searchIndex = index;
  const track = searchsongs[index];
  currentSong.src = `/${searchfolder}/` + track;
  if (!paused) {
      currentSong.play();
      isSearchPlaying = true;
      updatePlayButton(index, true, 'search');
  }
  document.querySelector(".songName").innerHTML = decodeURI(track)
      .replaceAll("/", "")
      .split(".")[0];
  document.querySelector(".songTime").innerHTML = "00:00/00:00";
};






// new fechers section end's



// If we directly call the function then above function returns the promises which are pending
// To fulfill the promises we define the main function which is also an async function and call the getSongs() function into the main function and await the getSongs() function to wait until the promise is fulfilled.

async function main() {
  searchsongs = await getMusic("music")
  songs = await getSongs("songs/AtifiAslam");
  playMusic(0, true);

  // Display the albums
  await dispalyAlbums();

  let previous = document.getElementById("previous");
  let next = document.getElementById("next");
  let volume = document.getElementById("vol");

  let play = document.getElementById("play");
  play.addEventListener("click", () => {
      if (isSearchPlaying) {
          if (currentSong.paused) {
              currentSong.play();
              updatePlayButton(searchIndex, true, 'search');
          } else {
              currentSong.pause();
              updatePlayButton(searchIndex, false, 'search');
          }
      } else {
          if (currentSong.paused) {
              currentSong.play();
              updatePlayButton(currentIndex, true, 'library');
          } else {
              currentSong.pause();
              updatePlayButton(currentIndex, false, 'library');
          }
      }
      value.innerHTML = " "
      value.innerHTML = value.innerHTML + `<h5>50%</h5>`;
  });
  

  // Add an eventListener to the previous button
  next.addEventListener("click", () => {
    if (currentIndex < songs.length - 1) {
      playMusic(currentIndex + 1);
    } else {
      playMusic(0); // Loop back to the first song
    }
  });

  previous.addEventListener("click", () => {
    if (currentIndex > 0) {
      playMusic(currentIndex - 1);
    } else {
      playMusic(songs.length - 1); // Loop back to the last song
    }
  });

  let value = document.querySelector(".value");
  let volumeIcon = document.querySelector("#volume-icon");

  volume.addEventListener("change", (e) => {

    currentSong.volume = parseInt(e.target.value) / 100;
    let val = e.target.value;
    value.innerHTML = "";
    value.innerHTML = value.innerHTML + `<h5>${val}%</h5>`;

    if (val <= 0) {
      volumeIcon.src = `svg/mute.svg`;
    } else {
      volumeIcon.src = `svg/volume.svg`;
    }
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("svg/volume.svg")) {
      e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg");
      currentSong.volume = 0;
      volume.value = 0;
      value.innerHTML = " "
      value.innerHTML = value.innerHTML + `<h5>0%</h5>`;
    } else {
      e.target.src = e.target.src.replace("svg/mute.svg", "svg/volume.svg");
      currentSong.volume = .10;
      volume.value = 10;
      value.innerHTML = " "
      value.innerHTML = value.innerHTML + `<h5>10%</h5>`;
    }

  })


  // Calculate the currentTime, offsetX (the offsetX will give the horizontal x value when the circle moves)
  currentSong.addEventListener("timeupdate", () => {
    // we use the formatSecondsToMinutes() function to display the second into the minutes
    document.querySelector(".songTime").innerHTML = `${formatSecondsToMinutes(
      currentSong.currentTime)} : ${formatSecondsToMinutes(currentSong.duration)}`;
    // To seek the circle into the seekbar we write this formula
    // We assign dynamic value to the left position of the circle, That formula is dividing the currentTime / duration then multiply with 100 and return that value in % format.
    document.querySelector(".circul").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    if (currentSong.duration == currentSong.currentTime) {
      currentSong.pause();
      updatePlayButton(currentIndex, false);
    }
  });

    // Calculate the currentTime, offsetX (the offsetX will give the horizontal x value when the circle moves)
    currentMusic.addEventListener("timeupdate", () => {
      // we use the formatSecondsToMinutes() function to display the second into the minutes
      document.querySelector(".songTime").innerHTML = `${formatSecondsToMinutes(
        currentMusic.currentTime)} : ${formatSecondsToMinutes(currentMusic.duration)}`;
      // To seek the circle into the seekbar we write this formula
      // We assign dynamic value to the left position of the circle, That formula is dividing the currentTime / duration then multiply with 100 and return that value in % format.
      document.querySelector(".circul").style.left =
        (currentMusic.currentTime / currentMusic.duration) * 100 + "%";
      if (currentMusic.duration == currentMusic.currentTime) {
        currentMusic.pause();
        updatePlayButton(searchIndex, false);
      }
    });

  // We add the eventListener on seekbar to Whenever user clicks on seekbar they drag the circle on the seekbar and dynamically change the music time
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // This console logs the offsetX value, Total width of the seekbar and total duration of the song
    console.log(
      e.offsetX,
      e.target.getBoundingClientRect().width,
      currentSong.duration
    );
    // The percent variable stores the calculation of e.offsetX divided by the total width seekbar and then *(Multiply) the value with 100, because we want the decimal values
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circul").style.left = percent + "%";
    // To get the currentTime of the song when the seekbar is dragged the currentTime of the song will be updated
    // To get the currentTime we *(Multiply) the song Duration with percent variable(the percent logic/calculation explained above) then divide with 100 so we get the decimal numbers.
    currentSong.currentTime = (currentSong.duration * percent) / 100;

    // If the click is at the very end of the seekbar, reset position to start and play the next song
    if (e.offsetX >= e.target.getBoundingClientRect().width - 1) {
      console.log("Clicked at the end of the seekbar, playing next song...");
      playMusic(currentIndex + 1);
    }
  });


  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // This console logs the offsetX value, Total width of the seekbar and total duration of the song
    console.log(
      e.offsetX,
      e.target.getBoundingClientRect().width,
      currentMusic.duration
    );
    // The percent variable stores the calculation of e.offsetX divided by the total width seekbar and then *(Multiply) the value with 100, because we want the decimal values
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circul").style.left = percent + "%";
    // To get the currentTime of the song when the seekbar is dragged the currentTime of the song will be updated
    // To get the currentTime we *(Multiply) the song Duration with percent variable(the percent logic/calculation explained above) then divide with 100 so we get the decimal numbers.
    currentMusic.currentTime = (currentMusic.duration * percent) / 100;

    // If the click is at the very end of the seekbar, reset position to start and play the next song
    if (e.offsetX >= e.target.getBoundingClientRect().width - 1) {
      console.log("Clicked at the end of the seekbar, playing next song...");
      playSong(searchIndex + 1)
    }
  });



  // Event listener for the end of the song to play the next song automatically
  currentSong.addEventListener("ended", () => {
    console.log("Song ended, playing next song...");
    if (currentIndex < songs.length - 1) {
      playMusic(currentIndex + 1);
    } else {
      playMusic(0); // Loop back to the first song
    }
  });

   // Event listener for the end of the song to play the next song in search filed automatically
   currentMusic.addEventListener("ended", () => {
    console.log("Song ended, playing next song...");
    if (currentIndex < songs.length - 1) {
      playSong(searchIndex + 1)
    } else {
      playSong(0); // Loop back to the first song
    }
  });

  let left = document.querySelector(".left-container");
  let playbar = document.querySelector(".playbar");
  let sickbar = document.querySelector(".sickbar");
  let musicinfo = document.querySelector(".music-info");

  document.querySelector(".hambaurg").addEventListener("click", () => {
    left.style.left = 0;
    playbar.style.cssText = "width: 62vw; right: 35px;";
    sickbar.style.cssText = "width: 58vw";
    musicinfo.style.width = "60vw";
  });

  document.querySelector(".close").addEventListener("click", () => {
    left.style.left = "-100%";
    playbar.style.cssText = "width: 91vw; right: 25px;";
    sickbar.style.cssText = "width: 88vw; right: 8px";
    musicinfo.style.width = "88vw";
  });

  // new fectuers under prograss.

    const searchContainer = document.getElementById('search-container');
    const searchfiled = document.getElementById('search-field');
    const titlebar = document.querySelector('.title-bar');
    const librarycont = document.querySelector('.library')


  document.getElementById('search-icon').addEventListener('click', function() {
    if (searchContainer.style.display === 'none' || searchContainer.style.display === '') {
        searchContainer.style.display = 'block';
        searchfiled.style.display = 'flex';
        titlebar.style.display = "none"
        librarycont.style.display = "none";

    } else {
        searchContainer.style.display = 'none';
    }
});

document.querySelector(".beck").addEventListener("click", () => {
  searchContainer.style.display = 'none';
  searchfiled.style.display = 'none';
  titlebar.style.display = "flex"
  librarycont.style.display = "block";
});

  getMusic("music/");

}

main();
