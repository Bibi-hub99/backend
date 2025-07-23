//generates key pairs of encryption and decryption
const fs = require("fs")
const path = require("path")

const generateKeyPair = () => {

    const keyPairs = crypto.generateKeyPairSync("rsa",{

        modulusLength:4096,
        publicKeyEncoding:{
            type:"pkcs1",
            format:"pem"
        },
        privateKeyEncoding:{
            type:"pkcs1",
            format:"pem"
        }
    })

    const publicKey = fs.writeFileSync("public-key.pem",keyPairs.publicKey)
    const privateKey = fs.writeFileSync("private-key.pem",keyPairs.privateKey)

}

const privateKey = fs.readFileSync(path.join(__dirname, "/private-key.pem"),"utf8")
const publicKey = fs.readFileSync(path.join(__dirname, "/public-key.pem"),"utf8")