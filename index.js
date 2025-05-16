const WebSocket = require('ws')
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3333

app.use(cors())

const server = require('http').createServer(app)
const wss = new WebSocket.Server({ server })

let clients = {} // Almacenar jugadores conectados

// Evento cuando un cliente se conecta
wss.on('connection', (ws) => {
  console.log('🔌 Nuevo cliente conectado')

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      console.log(`📩 Mensaje recibido:`, data)

      if (data.player) {
        // Guardar el jugador en la lista de clientes
        clients[data.player] = ws
        console.log(`✅ ${data.player} se ha conectado.`)
      }

      if (data.action === 'LUCHAR' || data.action === 'PLANTA') {
        // Reenviar el ataque al oponente
        sendToOpponent(ws, data)
      }
    } catch (error) {
      console.error('❌ Error al procesar el mensaje:', error)
    }
  })

  ws.on('close', () => {
    removeClient(ws)
  })
})

// Función para enviar mensaje al oponente
function sendToOpponent(ws, data) {
  for (const [player, client] of Object.entries(clients)) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          action: data.action,
          option: data.option,
          player: data.player,
          damage: data.damage,
        }),
      )
    }
  }
}

// Eliminar cliente desconectado
function removeClient(ws) {
  for (const [player, client] of Object.entries(clients)) {
    if (client === ws) {
      delete clients[player]
      console.log(`👋 Jugador ${player} se ha desconectado.`)

      // Notificar al oponente que este jugador se desconectó
      for (const [otherPlayer, otherClient] of Object.entries(clients)) {
        if (otherClient !== ws && otherClient.readyState === WebSocket.OPEN) {
          otherClient.send(
            JSON.stringify({
              tipus: 'desconnexio',
              usuariId: player, // Puede ser string
            }),
          )
        }
      }
    }
  }
}

// Iniciar servidor
server.listen(PORT, () => {
  console.log(
    `🚀 Servidor WebSocket en http://onlineserver-production.up.railway.app`,
  )
})

/*En el código anterior, hemos creado un servidor WebSocket utilizando la biblioteca  ws  y un servidor HTTP utilizando Express. El servidor WebSocket se encargará de manejar la comunicación en tiempo real entre los jugadores. 
  Cuando un cliente se conecta, se guarda en un objeto  clients  con su nombre de jugador como clave y el objeto WebSocket como valor. Cada vez que un jugador envié un mensaje, se enviará al oponente utilizando la función  sendToOpponent(ws, data) . 
  Por último, cuando un cliente se desconecta, se eliminará del objeto  clients  utilizando la función  removeClient(ws) . 
  Paso 4: Crear el cliente 
  Ahora, crearemos un cliente en React para que los jugadores puedan conectarse al servidor y jugar. 
  Primero, cree un nuevo proyecto de React utilizando Create React App. 
  npx create-react-app client*/
