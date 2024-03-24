import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const CLIENT_ID = "97a885b39b4340d987f14aecd73019c3";
const CLIENT_SECRET = "7bdad945a7084d5688179fe179ac4a7a";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumTracks, setSelectedAlbumTracks] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    var authParameters = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
    }

    fetch('https://accounts.spotify.com/api/token', authParameters)
      .then(result => result.json())
      .then(data => setAccessToken(data.access_token))
      .catch(error => console.error('Error fetching access token:', error));
  }, [])

  async function search() {
    if (searchInput.trim() === "") {
      setErrorMessage("Por favor, ingrese datos en el campo de búsqueda.");
      return;
    }

    setErrorMessage(""); // Limpiar mensaje de error si se ha ingresado texto en el campo de búsqueda

    var searchParameters = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    }
    var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
      .then(response => response.json())
      .then(data => { return data.artists.items[0].id })
      .catch(error => console.error('Error searching artist:', error));

    console.log("Artist ID es " + artistID);
    var ReturnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=CL&limit=50', searchParameters)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAlbums(data.items);
      })
      .catch(error => console.error('Error fetching albums:', error));

    setSelectedFunction("search");
  }

  async function fetchTop50CL() {
    try {
      var searchParameters = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      }

      var response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXbL0GavIqMTeb/tracks?limit=50', searchParameters);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      var data = await response.json();
      console.log(data); // Verificar los datos obtenidos
      setSelectedAlbumTracks(data.items);
    } catch (error) {
      console.error('Error fetching top 50 CL:', error);
    }

    setSelectedFunction("top50CL");
  }
    async function fetchTop50GL() {
    try {
      var searchParameters = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      }

      var response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=50', searchParameters);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      var data = await response.json();
      console.log(data); // Verificar los datos obtenidos
      setSelectedAlbumTracks(data.items);
      setSelectedFunction("top50GL");
    } catch (error) {
      console.error('Error fetching top 50 GL:', error);
    }
  }

  async function fetchAlbumTracks(albumId) {
    try {
      var searchParameters = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      }

      var response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, searchParameters);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      var data = await response.json();
      console.log(data); // Verificar los datos obtenidos
      setSelectedAlbumTracks(data.items);
      
      // Fetch album details
      var albumDetailsResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, searchParameters);
      var albumDetails = await albumDetailsResponse.json();
      setSelectedAlbum(albumDetails);
    } catch (error) {
      console.error('Error fetching album tracks:', error);
    }

    setSelectedFunction("albumTracks");
  }

  return (
    <div className="App">
      <Container>
        <Row className="my-3 align-items-center">
          <h1 className="m-0">Spotilite</h1>
        </Row>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="Buscar Artista"
            type="input"
            onKeyPress={event => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={event => setSearchInput(event.target.value)}
          />
          <Button variant="primary" onClick={search}>Buscar</Button>
          <Button variant="info" onClick={fetchTop50CL}>Top 50 Chile</Button>
        </InputGroup>
        {selectedFunction === "top50GL" &&
      <Container>
        <Row className="mx-2 row row-cols-4">
          {selectedAlbumTracks.map((track, i) => (
            <Card key={i} style={{ minHeight: '400px' }}>
              <a href={track.track.album.external_urls.spotify} target="_blank" rel="noopener noreferrer"> {/* Enlace al álbum en Spotify */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Card.Img variant="top" src={track.track.album.images[0].url} style={{ flex: '1' }} />
                  <Card.Body style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: '10px', fontSize: '16px', color: 'grey' }}>
                      {track.track.preview_url ?
                        <audio controls style={{ width: '100%', backgroundColor: 'transparent' }}>
                          <source src={track.track.preview_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        :
                        <span style={{fontSize:'20px', height: '58px', display: 'inline-block', verticalAlign: 'middle',alignSelf:'' }}>Preview no disponible</span>
                      }
                    </div>
                    <Card.Title style={{ margin: '0', paddingLeft: '5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {track.track_number} {track.track.explicit && <span style={{ color: 'red' }}>Explicito</span>} {track.track.name} - {formatDuration(track.track.duration_ms)}
                    </Card.Title>
                  </Card.Body>
                </div>
              </a>
            </Card>
          ))}
        </Row>

      </Container>
      }
      </Container>
      
      {selectedFunction === "search" &&
        <Container>
          <Row className="mx-2 row row-cols-4">
            {albums.map((album, i) => (
              <Card key={i} style={{ minHeight: '400px' }}>
                <a href={album.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                  <Card.Img variant="top" src={album.images[0].url} />
                </a>
                <Card.Body>
                  <Card.Title onClick={() => fetchAlbumTracks(album.id)}>{album.name}</Card.Title>
                </Card.Body>
              </Card>
            ))}
          </Row>
        </Container>
      }
      {selectedFunction === "top50CL" &&
        <Container>
          <Row className="mx-2 row row-cols-4">
            {selectedAlbumTracks.map((track, i) => (
              <Card key={i} style={{ minHeight: '400px' }}>
                <a href={track.track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card.Img variant="top" src={track.track.album.images[0].url} style={{ flex: '1' }} />
                    <Card.Body style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ marginBottom: '10px', fontSize: '16px', color: 'grey' }}>
                        {track.track.preview_url ?
                          <audio controls style={{ width: '100%', backgroundColor: 'transparent' }}>
                            <source src={track.track.preview_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          :
                          <span style={{fontSize:'20px', height: '58px', display: 'inline-block', verticalAlign: 'middle',alignSelf:'' }}>Preview no disponible</span>
                        }
                      </div>
                      <Card.Title style={{ margin: '0', paddingLeft: '5px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {track.track_number} {track.track.explicit && <span style={{ color: 'red' }}>Explicito</span>} {track.track.name} - {formatDuration(track.track.duration_ms)}
                      </Card.Title>
                    </Card.Body>
                  </div>
                </a>
              </Card>
            ))}
          </Row>
        </Container>
      }
      {selectedFunction === "albumTracks" &&
        <Container>
          <Row className="mx-2">
            {selectedAlbum && (
              <div>
                <h2>{selectedAlbum.name}</h2>
                <p>Fecha de salida: {selectedAlbum.release_date}</p>
                <p>{selectedAlbum.artists.map(artist => artist.name).join(", ")}</p>
                {selectedAlbum.images.length > 0 && (
                  <a href={selectedAlbum.external_urls && selectedAlbum.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                    <img src={selectedAlbum.images[0].url} alt={selectedAlbum.name} />
                  </a>
                )}
              </div>
            )}
          </Row>
          <Row className="mx-2 row row-cols-4">
          {selectedAlbumTracks.map((track, i) => (
            <Card key={i} style={{ minHeight: '100px', maxHeight: '150px' }}> {/* Reducir la altura máxima */}
              <Card.Body>
                <Card.Title style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <a href={track.external_urls && track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                    {track.track_number} {track.explicit && <span style={{ color: 'red' }}>Explicito</span>} {track.name} - {formatDuration(track.duration_ms)}
                  </a>
                </Card.Title>
                {track.preview_url &&
                  <audio controls style={{ width: '100%' }}>
                    <source src={track.preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                }
                {!track.preview_url &&
                  <div>Preview no disponible</div>
                }
                {track.album && track.album.images && track.album.images.length > 0 && track.album.external_urls && // Verificar si 'album' y 'images' están definidos y no están vacíos
                  <a href={track.album.external_urls.spotify} target="_blank" rel="noopener noreferrer"> {/* Enlace al álbum en Spotify */}
                    <Card.Img variant="top" src={track.album.images[0].url} />
                  </a>
                }
              </Card.Body>
            </Card>
          ))}
        </Row>


        </Container>
      }
    </div>
  );
}

function formatDuration(duration_ms) {
  const totalSeconds = duration_ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default App;