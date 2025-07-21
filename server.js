// server.js - Versão Final Autocontida

const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 3004;
const MAPBOX_API_KEY = 'pk.eyJ1IjoiZ3VzdGE5cyIsImEiOiJjbWRjYnUxZDgwOXQ5MmxvaWdtYWg3MjlvIn0.7BKbWKCNgW-Gxt2gC9151g';

app.use(express.json());

// NOVO: Serve os arquivos do Leaflet diretamente da pasta node_modules
app.use('/leaflet', express.static(path.join(__dirname, 'node_modules/leaflet/dist')));


let htmlParaRenderizar = '';
app.get('/render-map', (req, res) => {
  res.send(htmlParaRenderizar);
});

function generateMapHtml(payload, routeGeometry) {
  const { origem_latitude, origem_longitude, destino_latitude, destino_longitude } = payload;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Map Snapshot</title>
      <meta charset="utf-8" />
      
      <link rel="stylesheet" href="/leaflet/leaflet.css" />
      <script src="/leaflet/leaflet.js"></script>
      
      <style> body { margin: 0; padding: 0; } #map { width: 800px; height: 600px; } </style>
    </head>
    <body> <div id="map"></div> </body>
    <script>
      const map = L.map('map');
      L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_API_KEY}').addTo(map);

      const blueIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
      const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

      const originMarker = L.marker([${origem_latitude}, ${origem_longitude}], { icon: blueIcon }).addTo(map);
      const destinationMarker = L.marker([${destino_latitude}, ${destino_longitude}], { icon: greenIcon }).addTo(map);

      const routeGeoJson = ${JSON.stringify(routeGeometry)};
      const routeLayer = L.geoJSON(routeGeoJson, { style: { color: 'blue', opacity: 0.8, weight: 6 } }).addTo(map);

      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    </script>
    </html>
  `;
}

// O endpoint POST continua o mesmo
app.post('/api/gerar-imagem-rota', async (req, res) => {
  // ... (O resto do código do endpoint continua exatamente o mesmo) ...
  if (!MAPBOX_API_KEY) {
    return res.status(500).json({ error: 'A chave de API da Mapbox não foi configurada.' });
  }

  const payload = req.body;
  
  let browser = null;
  try {
    const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${payload.origem_longitude},${payload.origem_latitude};${payload.destino_longitude},${payload.destino_latitude}?geometries=geojson&access_token=${MAPBOX_API_KEY}`;
    const response = await fetch(mapboxUrl);
    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error(`Mapbox API retornou um erro: ${data.message || data.code}`);
    }
    const routeGeometry = data.routes[0].geometry;

    htmlParaRenderizar = generateMapHtml(payload, routeGeometry);
    
    const outputPath = path.join(__dirname, 'rota.png');
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('CONSOLE DO NAVEGADOR:', msg.text()));
    
    await page.goto(`http://localhost:${PORT}/render-map`, { waitUntil: 'domcontentloaded' });
    
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mapElement = await page.$('#map');
    await mapElement.screenshot({ path: outputPath });

    console.log('Imagem da rota gerada com sucesso em:', outputPath);
    res.sendFile(outputPath);

  } catch (error) {
    console.error('Erro no processo de geração de imagem:', error);
    res.status(500).json({ error: 'Falha ao gerar a imagem.', details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});