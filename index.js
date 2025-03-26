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
    }
  }
}

// Iniciar servidor
server.listen(PORT, () => {
  console.log(
    `🚀 Servidor WebSocket en http://onlineserver-production.up.railway.app`,
  )
})
