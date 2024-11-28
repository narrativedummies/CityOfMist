const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Создаем приложение Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Указываем, что статические файлы будут обслуживаться из папки "public"
app.use(express.static(path.join(__dirname, 'public')));

// Обработка соединения через Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected');

    // Обработка события roll
    socket.on('roll', (data) => {
        console.log('Результаты от пользователя:', data);
        // Рассылаем всем пользователям данные о броске
        io.emit('roll', data);
    });

    // Обработка отключения
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Запуск сервера на порту 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});