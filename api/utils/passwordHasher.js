const bcrypt = require('bcrypt')

const passwordHasher = async (password) => {
    const letNewPassword = await bcrypt.hash(password, 10);
    
    console.log(letNewPassword)
}

const comparePassword = (password, otherPassword) => {
    bcrypt.compare(password, otherPassword)
    .then((data) => {
        console.log(data)
    })
}

console.log(comparePassword( "$2b$10$ZntEbhwd9ETwoKFZBTnGEOiS8bJmT3XqHtKKghriDyqadQsjF0W.y", "1234"))
console.log(passwordHasher("1234"))