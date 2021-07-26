const bcrypt = require('bcrypt')

const passwordHasher = async (password) => {
    const letNewPassword = await bcrypt.hash(password, 10);
    
    console.log(letNewPassword)
}

const comparePassword = (password, otherPassword) => {
    bcrypt.compare(password, otherPassword)
    .then((data) => {
        console.log("Here", data)
    })
}

console.log(comparePassword("1234", "$2b$10$ZntEbhwd9ETwoKFZBTnGEOiS8bJmT3XqHtKKghriDyqadQsjF0W.y"))