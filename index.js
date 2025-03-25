const WebSocket = require('ws')
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3333

// Middleware CORS
app.use(cors())

// Servidor WebSocket
const server = require('http').createServer(app)
const wss = new WebSocket.Server({ server })

let clients = {} // Para almacenar los jugadores conectados

// Evento cuando un cliente se conecta
wss.on('connection', (ws) => {
  console.log('🔌 Nuevo cliente conectado')

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)
      console.log(`📩 Mensaje recibido:`, data)

      if (data.action === 'LUCHAR' || data.action === 'PLANTA') {
        // Reenviar el ataque al oponente
        sendToOpponent(ws, data)
      }
    } catch (error) {
      console.error('❌ Error al procesar el mensaje:', error)
    }
  })

  ws.on('close', () => {
    console.log('🔴 Cliente desconectado')
    removeClient(ws)
  })
})

// Función para enviar mensaje al oponente
function sendToOpponent(ws, data) {
  for (const client of wss.clients) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          action: data.action,
          option: data.option,
          player: data.player,
        }),
      )
    }
  }
}

// Eliminar cliente desconectado
function removeClient(ws) {
  for (const [key, client] of Object.entries(clients)) {
    if (client === ws) {
      delete clients[key]
      console.log(`👋 Jugador ${key} eliminado`)
    }
  }
}

// Iniciar servidor
server.listen(PORT, () => {
  console.log(
    `🚀 Servidor WebSocket en http://onlineserver-production.up.railway.app`,
  )
})

/* En el código anterior, hemos creado un servidor WebSocket utilizando la biblioteca  ws  y un servidor HTTP utilizando Express. También hemos definido un middleware CORS para permitir solicitudes de cualquier origen. 
    En el evento  connection , cuando un cliente se conecta, registramos el cliente en un objeto  clients  para mantener un seguimiento de los jugadores conectados. 
    En el evento  message , recibimos el mensaje del cliente y lo reenviamos al oponente. */
