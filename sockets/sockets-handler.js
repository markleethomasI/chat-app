const Filter = require("bad-words");
const filter = new Filter();

const {
    generateMessage,
    generateLocationMessage,
} = require("../src/utils/messages");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("../src/utils/users");

module.exports = (io) => {
    const nsp = io.of("/chat-app");

    nsp.on("connection", (socket) => {
        console.log("New WebSocket connection");

        socket.on("join", (options, callback) => {
            const { error, user } = addUser({ id: socket.id, ...options });

            if (error) {
                return callback(error);
            }

            socket.join(user.room);

            // Sends initial welcome message
            socket.emit("message", generateMessage(user.username, "Welcome!"));

            // Send message to others in chat
            socket.broadcast
                .to(user.room)
                .emit("message", generateMessage(user.username, ` has joined`));

            nsp.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });

            callback();

            // Receive message from client
            socket.on("sendMessage", (message, callback) => {
                const user = getUser(socket.id);

                if (filter.isProfane(message)) {
                    return callback("Profanity is not allowed!");
                }

                nsp.to(user.room).emit(
                    "message",
                    generateMessage(user.username, message)
                );
                callback();
            });

            socket.on("sendLocation", (location, callback) => {
                const user = getUser(socket.id);

                nsp.to(user.room).emit(
                    "locationMessage",
                    generateLocationMessage(
                        user.username,
                        `https://google.com/maps?${location.longitude},${location.latitude}`
                    )
                );
                callback("Location has been shared");
            });

            socket.on("disconnect", () => {
                const user = removeUser(socket.id);

                if (user) {
                    nsp.to(user.room).emit(
                        "message",
                        generateMessage(
                            user.username,
                            `${user.username} has left ${user.room}`
                        )
                    );
                    nsp.to(user.room).emit("roomData", {
                        room: user.room,
                        users: getUsersInRoom(user.room),
                    });
                }
            });
        });
    });
};
