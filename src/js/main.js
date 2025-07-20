import '../scss/main.scss';

import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import L from 'leaflet';
import 'leaflet-routing-machine';

/**
 * Cria um ícone de marcador colorido do Leaflet.
 * @param {string} color - A cor do ícone (ex: 'blue', 'green', 'red').
 * @returns {L.Icon} Instância do ícone do Leaflet.
 */
function createIconBlue() {
  const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
  return blueIcon;
}

function createIconGreen(){
  const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
  return greenIcon;
}

/**
 * Cria o controle da legenda do mapa.
 * @param {L.Icon} originIcon - O ícone de origem.
 * @param {L.Icon} destinationIcon - O ícone de destino.
 * @returns {L.Control} Instância do controle da legenda.
 */

function createLegendControl(originIcon, destinationIcon) {
  const legend = L.control({ position: 'topright' });
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = `
      <h4>Legenda</h4>
      <div><img src="${originIcon.options.iconUrl}"> <span>Origem</span></div>
      <div><img src="${destinationIcon.options.iconUrl}"> <span>Destino</span></div>
    `;
    return div;
  };
  return legend;
}

/**
 * Cria o controle de roteamento principal.
 * @param {Array<L.LatLng>} waypoints - Array com os pontos de origem e destino.
 * @param {L.Icon} originIcon - O ícone de origem.
 * @param {L.Icon} destinationIcon - O ícone de destino.
 * @returns {L.Routing.Control} Instância do controle de roteamento.
 */

function createRoutingControl(waypoints, originIcon, destinationIcon) {
  return L.Routing.control({
    waypoints: waypoints,
    show: false,
    routeWhileDragging: false,
    createMarker: function(i, waypoint, n) {
    let marker_icon = null;
    if (i === 0) { // Primeiro waypoint (origem)
      marker_icon = originIcon;
    } else if (i === n - 1) { // Último waypoint (destino)
      marker_icon = destinationIcon;
    }
    const marker = L.marker(waypoint.latLng, {
      icon: marker_icon,
      draggable: false // Marcadores não podem ser arrastados
    });
    return marker;
  },
    lineOptions: {
      styles: [{ color: 'blue', opacity: 0.6, weight: 6 }]
    },
    router: L.Routing.osrmv1({
      serviceUrl: `https://router.project-osrm.org/route/v1`
    })
  });
}

/**
 * Processa um payload de rota e a desenha no mapa.
 * @param {object} payload - O objeto contendo os dados da rota.
 * @param {object} payload.origem - Coordenadas de origem { lat, lng }.
 * @param {object} payload.destino - Coordenadas de destino { lat, lng }.
 */
function gerarRotaNoMapa(L, payload) {
  // 1. Cria o mapa se ainda não existir
  const map = L.map('map')

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // 2. Usa o utilitário para criar os ícones
  const blueIcon = createIconBlue();
  const greenIcon = createIconGreen();

  // 3. Monta os waypoints a partir do payload dinâmico
  const waypoints = [
    L.latLng(payload.origem.lat, payload.origem.lng),
    L.latLng(payload.destino.lat, payload.destino.lng)
  ];

  // 4. Usa o utilitário para criar o controle de roteamento
  const routingControl = createRoutingControl(waypoints, blueIcon, greenIcon);
  routingControl.addTo(map);

  // 5. Usa o utilitário para criar e adicionar a legenda
  const legend = createLegendControl(blueIcon, greenIcon);
  legend.addTo(map);
}

function main() {
  // 1. Define os waypoints de origem e destino
  const waypoints = {
    origem: {
      lat: -23.4875,
      lng: -46.6891
    },
    destino: {
      lat: -23.4768,
      lng: -46.7088
    }
  };

  // 2. Inicializa o mapa com os waypoints
  gerarRotaNoMapa(L, waypoints);
}

main();