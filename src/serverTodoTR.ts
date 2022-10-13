import express from "express"
import * as http from "http"
import { Server } from "socket.io"
import * as lib_ip from "ip"
import path from "path"

const port_ecoute: number = 8088
const todoList: string[] = []

const app = express()
const server = http.createServer(app)

const pathToView: string = path.join("__dirname", "..", "views")

app.set("views", pathToView)
app.get("/", (req, res) => {
  const ip_port: string = lib_ip.address() + ":" + port_ecoute.toString()
  res.render("todo.ejs", { mon_ip_port: ip_port })
  res.end()
})

const io = new Server(server)
io.sockets.on("connection", (la_socket) => {
  la_socket.emit("connected", todoList)

  la_socket.on("add", (mess: string) => {
    const clean_message: string = mess.trim()

    la_socket.broadcast.emit("add", clean_message)
    la_socket.emit("add", clean_message)
    todoList.push(clean_message)
  })

  la_socket.on("remove", (mess: string) => {
    const clean_message: string = mess.trim()

    if (todoList.indexOf(clean_message) > -1) {
      la_socket.broadcast.emit("remove", clean_message)
      la_socket.emit("remove", clean_message)
      todoList.splice(todoList.indexOf(clean_message), 1)
    }
  })
})

server.listen(port_ecoute, () => {
  console.log("adresse serveur : " + lib_ip.address())
  console.log("ecoute sur le port : " + port_ecoute)
  console.log("lien url " + lib_ip.address() + ":" + port_ecoute)
})
