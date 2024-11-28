const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    // Обработка события roll
    socket.on('roll', (data) => {
        // Рассылаем всем пользователям данные о броске
        io.emit('roll', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
