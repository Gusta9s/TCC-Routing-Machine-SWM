import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import L from 'leaflet';
import 'leaflet-routing-machine';

// Cria o mapa
const map = L.map('map').setView([51.505, -0.09], 13);

// Adiciona a camada de tiles (o mapa base)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Adiciona o controle de roteamento
L.Routing.control({
  waypoints: [
    L.latLng(57.74, 11.94),
    L.latLng(57.6792, 11.949)
  ],
  routeWhileDragging: true,
  // Configuração para usar o serviço de roteamento do OpenStreetMap
  router: L.Routing.osrmv1({
    serviceUrl: `https://router.project-osrm.org/route/v1`
  })
}).addTo(map);
