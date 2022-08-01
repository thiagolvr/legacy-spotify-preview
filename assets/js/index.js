/*
This app is just a prototype for testing purposes.
Because it uses server-to-server authentication it has security holes.
*/

const CLIENT_ID = 'Your client ID';
const CLIENT_SECRET = 'Your cliente secret ID';
const URL_BASE = 'https://api.spotify.com/v1'
let token;

// HELPERS
const getElementOrClosest = (target, className) => {
  if (target.parentNode.classList.contains(className)) 
   return target.parentNode
    
  return target.closest(`.${className}`)
}

const createPlayer = () => {

  const audio = document.createElement('audio')
  audio.classList.add('player');
  audio.controls = true;
  audio.autoplay = true;

  const source = document.createElement('source');
  audio.appendChild(source);

  return audio
}

// API SPOTIFY 
const getHeaders = () => {
  const headers = new Headers({
    'Authorization': `Bearer ${token}`
  })
  return headers
};

const getToken = async () => {
  const headers = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers,
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  const acessToken = data.access_token

  return token = acessToken;
};

const getGenres = async () => {
  const headers = getHeaders()

  // const response = await fetch(`${URL_BASE}/browse/categories?country=BR&locale=pt-BR`)
  const response = await fetch(`${URL_BASE}/browse/categories`, {
    method: 'GET',
    headers,
  })
  const data = await response.json()
  const genres = data.categories.items

  return renderGenres(genres)
};

const getGenrePlaylist = async (id) => {
  const headers = getHeaders();
  const response = await fetch(`${URL_BASE}/browse/categories/${id}/playlists`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();
  const playlists = data.playlists.items;

  return renderGenrePlaylists(playlists)
};

const getTracks = async (id) => {
  const headers = getHeaders();

  const response = await fetch(`${URL_BASE}/playlists/${id}/tracks`, {
    method: 'GET',
    headers,
  })
  const data = await response.json();
  const tracks = data.items;
  return renderTracks(tracks)
}

// RENDERS 
const renderGenres = genres => {
  const GENRE_CARDS = document.querySelector('.genre-cards')

    genres.forEach((genre) => {
      const section = document.createElement('section');
      section.classList.add('genre')
      section.id = genre.id;

      const img = document.createElement('img');
      img.src = genre.icons[0].url;

      const p = document.createElement('p');
      p.innerText = genre.name;

      section.appendChild(img)
      section.appendChild(p)

      section.addEventListener('click', genreHandleClick)

      GENRE_CARDS.appendChild(section)
    });
};

const renderGenrePlaylists = playlists => {
  const PLAYLIST_CARDS = document.querySelector('.playlist-cards')

  PLAYLIST_CARDS.innerHTML = ''; // para limpar

  playlists.forEach((playlist) => {
    const section = document.createElement('section');
    section.classList.add('text-card');
    section.id = playlist.id;

    const p = document.createElement('p');
    p.innerText = playlist.name;

    section.addEventListener('click', playlisHandleClick)

    section.appendChild(p)
    PLAYLIST_CARDS.appendChild(section)
  })

}

const renderTracks = tracks => {
  const TRACK_CARDS = document.querySelector('.track-cards')

  TRACK_CARDS.innerHTML = ''; // para limpar

  tracks
  .filter(({track}) => track && track.preview_url)
  .forEach(({track}) => {
    const section = document.createElement('section');
    section.className = 'text-card track';
    section.dataset.preview_url = track.preview_url;

    const p = document.createElement('p');
    p.innerText = track.name;

    section.addEventListener('click', trackHandleClick)

    section.appendChild(p)
    TRACK_CARDS.appendChild(section)
  })

}

// EVENT HANDLERS 
const genreHandleClick = ({target}) => {
  const section = getElementOrClosest(target, 'genre');
  const { id } = section ;

  getGenrePlaylist(id)
};

const playlisHandleClick = ({target}) => {
  const section = getElementOrClosest(target, 'text-card');
  return getTracks(section.id)
}

const trackHandleClick = ({target}) => {
  const PLAYER_CONTEINER = document.querySelector('.player-conteiner')

  const section = getElementOrClosest(target, 'track');
  const preview = section.dataset.preview_url;

  const player = document.querySelector('.player')
    ? document.querySelector('.player')
    : createPlayer()

  player.src = preview;

  PLAYER_CONTEINER.appendChild(player);

  const playing = document.querySelector('.playing');
  playing.innerText = section.querySelector('p').innerText
}

window.onload = async () => {
  await getToken();
  getGenres()
};