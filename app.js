// Seleccionar todos los elementos necesarios
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const navBar = document.querySelector('.nav-bar');
const toggleButton = document.getElementById('toggle-nav');
const toggleIcon = toggleButton.querySelector('i');

// Estado inicial
let isNavHidden = false;

// Función para cambiar de sección
function changeSection(sectionId) {
  // Ocultar todas las secciones
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Mostrar la sección seleccionada
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // Actualizar el estado activo en la barra de navegación
  navItems.forEach(item => {
    item.classList.remove('active');
  });

  const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
}

// Función para alternar la visibilidad de la barra de navegación
function toggleNavBar() {
  if (isNavHidden) {
    // Mostrar la barra
    navBar.classList.remove('hidden');
    toggleIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
  } else {
    // Ocultar la barra
    navBar.classList.add('hidden');
    toggleIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
  }
  isNavHidden = !isNavHidden;
}

// Agregar evento a cada botón de navegación
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace
    const sectionId = item.getAttribute('data-section');
    changeSection(sectionId);
  });
});

// Añadir evento al botón de toggle
toggleButton.addEventListener('click', toggleNavBar);

// Cargar la sección de "Inicio" por defecto
window.addEventListener('DOMContentLoaded', () => {
  changeSection('inicio');
});

const API_KEY = "AIzaSyDXc7sOLTpd5KuUcR7lOB3lT-3yI3D_d6U"; // Reemplaza con tu API Key de YouTube
let player;
let currentVideoId;

// Inicializa el reproductor de YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player("video-player", {
    height: "150",
    width: "150",
    events: {
      onStateChange: onPlayerStateChange,
    },
  });
}

// Manejar los controles del reproductor
const playPauseButton = document.getElementById("playpause-button");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const progressBar = document.getElementById("progress-bar");
const currentTimeElement = document.getElementById("current-time");
const totalTimeElement = document.getElementById("total-time");
const searchResultsContainer = document.getElementById("search-results-container");

// Ocultar el contenedor de resultados por defecto
searchResultsContainer.style.display = "none";

// Actualizar el tiempo del video
function updateProgress() {
  if (player && player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    currentTimeElement.textContent = formatTime(currentTime);
    totalTimeElement.textContent = formatTime(duration);
    progressBar.value = (currentTime / duration) * 100;
  }
}

// Activar bucle cuando la canción termine
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'; // Pausar
  } else {
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>'; // Reproducir
  }

  // Reproducir en bucle cuando termine el video
  if (event.data === YT.PlayerState.ENDED) {
    player.playVideo();
  }
}

// Botones de control
playPauseButton.addEventListener("click", () => {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
});

prevButton.addEventListener("click", () => {
  player.seekTo(player.getCurrentTime() - 10); // Retroceder 10 segundos
});

nextButton.addEventListener("click", () => {
  player.seekTo(player.getCurrentTime() + 10); // Avanzar 10 segundos
});

// Asignar iconos a los botones usando Font Awesome
playPauseButton.innerHTML = '<i class="fas fa-play"></i>';  // Reproducir
prevButton.innerHTML = '<i class="fas fa-backward"></i>';      // Retroceder
nextButton.innerHTML = '<i class="fas fa-forward"></i>';      // Avanzar

progressBar.addEventListener("input", (e) => {
  const duration = player.getDuration();
  player.seekTo((e.target.value / 100) * duration);
});

// Buscar canciones
document.getElementById("search-button").addEventListener("click", () => {
  const query = document.getElementById("search-input").value.trim();
  if (!query) return;

  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      displayResults(data.items);
    });
});

// Mostrar resultados de búsqueda
function displayResults(videos) {
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.innerHTML = "";

  if (videos.length === 0) {
    searchResultsContainer.style.display = "none"; // Ocultar si no hay resultados
    return;
  }

  searchResultsContainer.style.display = "block"; // Mostrar si hay resultados

  videos.forEach((video) => {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    // Obtén el ID del video y usa la API de YouTube para obtener la duración
    const videoId = video.id.videoId;
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        const duration = data.items[0].contentDetails.duration;
        const formattedDuration = formatDuration(duration);

        resultItem.innerHTML = `
          <img src="${video.snippet.thumbnails.high.url}" alt="${video.snippet.title}">
          <div class="result-details">
            <h3 class="result-title">${video.snippet.title}</h3>
            <p class="result-artist">Artista: ${video.snippet.channelTitle}</p>
            <p class="result-duration">Duración: ${formattedDuration}</p>
          </div>
        `;

        resultItem.addEventListener("click", () => {
          currentVideoId = video.id.videoId;
          player.loadVideoById(currentVideoId);
          document.getElementById("song-title").textContent = video.snippet.title;
          document.getElementById("song-artist").textContent = video.snippet.channelTitle;
        });

        resultsContainer.appendChild(resultItem);
      });
  });
}

// Formatear tiempo
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Función para formatear la duración de ISO 8601 a mm:ss
function formatDuration(duration) {
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  const minutes = match[1] ? parseInt(match[1], 10) : 0;
  const seconds = match[2] ? parseInt(match[2], 10) : 0;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Cargar la API de YouTube
const script = document.createElement("script");
script.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(script);

setInterval(updateProgress, 500);  // Aquí ya está bien cerrado
let currentIndex = 0;
const carouselItems = document.querySelectorAll('.carousel-item');
const actionButton = document.getElementById('action-button');
const carouselContainer = document.querySelector('.carousel');

// Botones para cada imagen
const actionTexts = ["Descargar ahora", "Ver en Amazon", "Ver sitio web"];
const actionLinks = [
  "https://www.amazon.com/gp/product/B0DPDJ5JTP", // Enlace para "Descargar ahora"
  "https://www.amazon.com/gp/product/B0DPDJ5JTP",       // Enlace para "Ver en Amazon"
  "https://spottrack-web.github.io" // Enlace para "Ver sitio web"
];

let timer = 10;
let autoChangeInterval;

// Crear el cursor visual
const timerCursor = document.createElement('div');
timerCursor.classList.add('timer-cursor');

// Texto dentro del cursor
const timerText = document.createElement('div');
timerText.classList.add('timer-text');
timerCursor.appendChild(timerText);

carouselContainer.appendChild(timerCursor);

function showImage(index) {
  carouselItems.forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
  actionButton.textContent = actionTexts[index];
  actionButton.dataset.link = actionLinks[index]; // Asignar el enlace al botón
  currentIndex = index;
  resetTimer();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % carouselItems.length;
  showImage(currentIndex);
}

function resetTimer() {
  timer = 10;
  updateCursorText(timer);
  if (autoChangeInterval) clearInterval(autoChangeInterval);
  autoChangeInterval = setInterval(() => {
    timer--;
    updateCursorText(timer);
    if (timer <= 0) {
      nextImage();
      resetTimer();
    }
  }, 1000);
}

// Redirigir al enlace al hacer clic en el botón
actionButton.addEventListener('click', () => {
  const link = actionButton.dataset.link;
  if (link) window.open(link, '_blank'); // Abre el enlace en una nueva pestaña
});

// Actualizar posición, mostrar el cursor y texto del temporizador
carouselContainer.addEventListener('mousemove', (e) => {
  const rect = carouselContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  timerCursor.style.left = `${x}px`;
  timerCursor.style.top = `${y}px`;
  timerCursor.style.display = 'flex';
  timerCursor.style.setProperty('--progress', `${(10 - timer) * 10}%`);
});

carouselContainer.addEventListener('mouseleave', () => {
  timerCursor.style.display = 'none';
});

carouselContainer.addEventListener('click', nextImage);

function updateCursorText(seconds) {
  timerText.textContent = seconds > 0 ? seconds : '';
}

// Iniciar el temporizador al cargar la página
showImage(currentIndex);


// funcion principal de playlist
const songList = document.getElementById('song-list');
const errorMessage = document.getElementById('error-message');
let playlist = [];
let currentMedia = null;
let currentSongIndex = null;

document.querySelector('.add-song').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*,video/*';
    input.style.display = 'none';

    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
            errorMessage.style.display = 'none';
            addSongToPlaylist(file);
        } else {
            showError('Archivo de audio no valido. Por favor selecciona un archivo valido como audio o video');
        }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
});

function showError(message) {
    errorMessage.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
    errorMessage.style.display = 'block';
}

function addSongToPlaylist(file) {
    const url = URL.createObjectURL(file);
    const song = {
        title: file.name,
        url: url,
        type: file.type
    };

    playlist.push(song);
    renderPlaylist();
}

function renderPlaylist() {
    songList.innerHTML = '';

    playlist.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';

        songItem.innerHTML = `
            <div class="song-info">
                <div class="song-title">${song.title}</div>
            </div>
            <div class="song-controls">
                <button class="play-pause-btn" data-index="${index}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="delete-btn" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        songList.appendChild(songItem);
    });

    addEventListeners();
}

function addEventListeners() {
    document.querySelectorAll('.play-pause-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            handlePlayPause(index, e.target.closest('button'));
        });
    });

    document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('button').dataset.index);
            deleteSong(index);
        });
    });
}

function handlePlayPause(index, button) {
    // Si ya hay una canción en reproducción
    if (currentMedia) {
        // Si es la misma canción, alternar entre play y pause
        if (currentSongIndex === index) {
            if (currentMedia.paused) {
                currentMedia.play();
                button.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                currentMedia.pause();
                button.innerHTML = '<i class="fas fa-play"></i>';
            }
            return;
        }

        // Si es otra canción, detener la actual
        stopCurrentSong();
    }

    // Reproducir la nueva canción
    playMedia(index, button);
}

function playMedia(index, button) {
    currentSongIndex = index;
    const song = playlist[index];

    // Crear el elemento de audio o video
    currentMedia = document.createElement(song.type.startsWith('audio') ? 'audio' : 'video');
    currentMedia.src = song.url;
    currentMedia.autoplay = true;
    currentMedia.onended = handleSongEnd;

    document.body.appendChild(currentMedia);
    button.innerHTML = '<i class="fas fa-pause"></i>';
}

function stopCurrentSong() {
    if (currentMedia) {
        currentMedia.pause();
        currentMedia.remove();
        currentMedia = null;

        // Reiniciar el botón de play/pause
        const buttons = document.querySelectorAll('.play-pause-btn');
        if (buttons[currentSongIndex]) {
            buttons[currentSongIndex].innerHTML = '<i class="fas fa-play"></i>';
        }
    }
}

function handleSongEnd() {
    if (playlist.length > 1) {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        const buttons = document.querySelectorAll('.play-pause-btn');
        playMedia(currentSongIndex, buttons[currentSongIndex]);
    } else {
        // Si solo hay una canción, repetirla
        currentMedia.play();
    }
}

function deleteSong(index) {
    // Si la canción eliminada está en reproducción, detenerla
    if (currentSongIndex === index) {
        stopCurrentSong();
    }

    // Eliminar la canción del arreglo
    playlist.splice(index, 1);
    renderPlaylist();

    // Ajustar el índice actual si es necesario
    if (index < currentSongIndex) {
        currentSongIndex--;
    }
}


// Cargar el nombre del usuario y foto de perfil desde localStorage si existe
window.onload = () => {
    const profilePicture = localStorage.getItem('profilePicture');
    const username = localStorage.getItem('username');

    if (profilePicture) {
        const profileImg = document.getElementById('profile-picture');
        const addPhotoSpan = document.getElementById('add-photo');

        if (profileImg) {
            profileImg.src = profilePicture;
            profileImg.style.display = 'block';
        }
        if (addPhotoSpan) {
            addPhotoSpan.style.display = 'none';
        }
    }

    if (username) {
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.innerText = username;
        }
    }

    // Mostrar el mensaje de bienvenida siempre que se recargue la página
    showWelcomeMessage();
};

// Función para mostrar el mensaje de bienvenida
function showWelcomeMessage() {
    const welcomeMessage = document.getElementById('welcome-message');
    const welcomeText = document.getElementById('welcome-text');
    const username = localStorage.getItem('username');

    if (welcomeMessage && welcomeText) {
        if (username) {
            welcomeText.innerText = `Bienvenido/a ${username} de nuevo a Spottrack`;
        } else {
            welcomeText.innerText = 'Bienvenido/a de nuevo a Spottrack';
        }

        welcomeMessage.style.display = 'block';

        const welcomeSound = document.getElementById('welcome-sound');
        if (welcomeSound) {
            welcomeSound.play();
        }

        setTimeout(() => {
            welcomeMessage.style.animation = 'fadeOut 1s forwards';
            setTimeout(() => {
                welcomeMessage.style.display = 'none';
            }, 1000); // Desaparece después de 5 segundos
        }, 5000);
    }
}

// Función para cambiar la foto de perfil
const changePhotoBtn = document.getElementById('change-photo');
if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    localStorage.setItem('profilePicture', reader.result);

                    const profileImg = document.getElementById('profile-picture');
                    const addPhotoSpan = document.getElementById('add-photo');
                    if (profileImg) {
                        profileImg.src = reader.result;
                        profileImg.style.display = 'block';
                    }
                    if (addPhotoSpan) {
                        addPhotoSpan.style.display = 'none';
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        input.click();
    });
}

// Función para cambiar el nombre de usuario sin `prompt`
const changeUsernameBtn = document.getElementById('change-username');
if (changeUsernameBtn) {
    changeUsernameBtn.addEventListener('click', () => {
        const usernameContainer = document.getElementById('username-change-container');
        if (usernameContainer) {
            usernameContainer.style.display = 'block';
        }
    });
}

const saveUsernameBtn = document.getElementById('save-username');
if (saveUsernameBtn) {
    saveUsernameBtn.addEventListener('click', () => {
        const newUsernameInput = document.getElementById('new-username');
        if (newUsernameInput) {
            const newUsername = newUsernameInput.value.trim();
            if (newUsername) {
                localStorage.setItem('username', newUsername);

                const usernameElement = document.getElementById('username');
                if (usernameElement) {
                    usernameElement.innerText = newUsername;
                }

                const usernameContainer = document.getElementById('username-change-container');
                if (usernameContainer) {
                    usernameContainer.style.display = 'none';
                }

                // No se hace nada para prevenir que el mensaje de bienvenida no se muestre
                // cuando se cambia el nombre de usuario
            }
        }
    });
}

// Función para activar el ahorro de datos
const dataSavingToggle = document.getElementById('data-saving-toggle');
if (dataSavingToggle) {
    dataSavingToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            console.log('Ahorro de datos activado');
        } else {
            console.log('Ahorro de datos desactivado');
        }
    });
}