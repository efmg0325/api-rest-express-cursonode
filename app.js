const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
const app = express();
const Joi = require('joi');
// Configuracion de entornos
console.log('Aplicacion '+ config.get('nombre'));
console.log('BD server' + config.get('configDB.host'));

const morgan = require('morgan');
// const logger = require('./logger');


/*app.get(); //peticion
app.post(); //envio de datos
app.put(); //actualizacion
app.delete(); //eliminacion*/
app.use(express.json());
app.use(express.urlencoded({urlencoded:true}));
app.use(express.static('public'));

//Uso de un middleware de terceros - Morgan
if (app.get('env') === 'development'){
    app.use(morgan('tiny'));
    // console.log('Morgan habilitado')
    debug('Morgan está habilitado');
}

//Trabajos con la base de datos
debug('Conectando con la base de datos...');

// app.use(logger);

/*app.use(function (req, res, next){
    console.log('Autenticando...');
    next(); 
})
*/
// Los tres metodos anteriores (middleware) se invocan antes de llamar a las funciones del tipo ruta de express
const usuarios = [
    {id:1, nombre:'Grover'},
    {id:2, nombre:'Pablo'},
    {id:3, nombre:'Ana'}
]

app.get('/', (req, res)=>{
    res.send('Hola mundo desde Express.');
});

app.get('/api/usuarios', (req, res)=>{
    //res.send(['Grover', 'Luis', 'Ana']);
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res)=>{
    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
});

app.post('/api/usuarios', (req, res) => {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    const {error, value} = schema.validate({ nombre: req.body.nombre });
    if (!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    } 
});
app.put('/api/usuarios/:id', (req, res) => {
    // Encontrar si existe el objeto usuario
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
    res.status(404).send('El usuario no fue encontrado');
    return;
    }

    const {error, value} = validarUsuario(req.body.nombre)
    if (error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    } 
    usuario.nombre = value.nombre;
    res.send(usuario);
});

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
    res.status(404).send('El usuario no fue encontrado');
    return;
    }
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index,1);
    res.send(usuario);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`)
})

function existeUsuario(id){
return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
    nombre: Joi.string().min(3).required()
});
return (schema.validate({ nombre: nom }));
}
    /*if (!req.body.nombre || req.body.nombre.length<=2){
        res.status(400).send('Debe ingresar un nombre, que tenga minimo 3 letras'); // Bad request
        return;
    }
    const usuario = {
        id: usuarios.length + 1,
        nombre: req.body.nombre
    };
    usuarios.push(usuario);
    res.send(usuario);
});
*/
