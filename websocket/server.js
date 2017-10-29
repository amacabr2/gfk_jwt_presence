/**
 * Created by amacabr2 on 28/10/17.
 */

// 27.55

let io = require('socket.io')(3000)
let jwt = require('jsonwebtoken')

let users = []

let findCurrentUser = function (currentUser) {
    return users.find(u => u.id === currentUser.id);
};

io.on('connection', socket => {

    let currentUser = null

    socket.on('identify', ({token}) => {
        try {
            let decoded = jwt.verify(token, processed.env.JWTSECRET, {
                algorithms: ['HS256']
            })

            currentUser = {
                id: decoded.user_id,
                name: decoded.user_name,
                count: 1
            }

            let user = findCurrentUser(currentUser)

            if (user) {
               user.count++
            } else {
                users.push(currentUser)
                socket.broadcast.emit('users.new', {user: currentUser})
            }

            socket.emit('users', {users})
        } catch (e) {
            console.log(e)
        }
    })

    socket.on('disconnect', _ => {
        if (currentUser) {
            let user = findCurrentUser(currentUser)
            if (user) {
                user.count--
                if (user.count === 0) {
                    users = users.filter(u => u.id !== currentUser.id)
                    socket.broadcast.emit('users.leave', {user: currentUser})
                }
            }
        }
    })
})