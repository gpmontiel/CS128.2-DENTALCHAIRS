import users from './users'
import rooms from './rooms'
import sections from './sections'

const management = {
    users: Object.assign(users, users),
    rooms: Object.assign(rooms, rooms),
    sections: Object.assign(sections, sections),
}

export default management