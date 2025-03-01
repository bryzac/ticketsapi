const livechatRouter = require('express').Router();
const tokenBase64 = process.env.BASE64_ENCODED_TOKEN;

//Creamos una función para obtener los tickets de la API
const obtenerTickets = async (url, response) => {
    try {
        //El fetch tiene los headers correspondientes
        const fetchResponse = await fetch(url, {
            headers: {
                "authorization": `Basic ${tokenBase64}`,
                "content-type": "application/json",
                "X-API-Version": "2",
                "x-region": "dal"
            }
        });
        
        //Si la respuesta no es satisfactoria, recibimos el error
        if (!fetchResponse.ok) {
            throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        };
        //Buscamos la data en formato JSON
        const data = await fetchResponse.json();

        //Si la data y los tickets son correctos, enviamos la información
        if (data && data.tickets) {
            response.status(200).json(data);
            
        } else {
            response.status(400).json({ message: "No se encontraron tickets o la respuesta no tiene el formato esperado." })
        }
    } catch (error) {
        console.error("Error al obtener los tickets:", error);
        response.status(500).json({ error: error.message });
    }
};

//Home
livechatRouter.get('/', async (request, response) => {
    //Desde el URL que hemos construido podemos obtener los datos de búsqueda
    const { date_from, date_to, group, status, agent, search, page } = request.query;
    //Creamos la URL que nos servirá de base
    let baseUrl = 'https://api.livechatinc.com/tickets?';

    //A partir de aquí vamos agregando datos de búsqueda
    if (agent) {
        baseUrl += `agent[]=${agent.split('@')[0]}%40${agent.split('@')[1]}&`;
    }
    if (date_from) {
        baseUrl += `date_from=${date_from}&`;
    }
    if (date_to) {
        baseUrl += `date_to=${date_to}&`;
    }
    if (group) {
        baseUrl += `group=${group}&`;
    }
    if (status) {
        baseUrl += `status=${status}&`;
    }
    if (search) {
        baseUrl += `query=${search}&`;
    }
    if (page) {
        baseUrl += `page=${page}&`;
    }
    //Eliminamos el último &
    baseUrl = baseUrl.slice(0, -1); 
    //Llamamos a la función con la URL creada
    obtenerTickets(baseUrl, response);    
})



module.exports = livechatRouter;