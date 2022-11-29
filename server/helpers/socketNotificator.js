let onlineUsers = []

exports.sendNotificationToClient = (payload, userID) => {
    const reciever = onlineUsers.find(user => user.id === userID)

    if (!reciever) return

    const { sock } = reciever

    sock.emit('notification', payload)
}

exports.addOnlineUser = (user) => {
    onlineUsers.push(user)
}

exports.removeOnlineUser = (id) => {
    onlineUsers = onlineUsers.filter(user => user.id !== id)
}