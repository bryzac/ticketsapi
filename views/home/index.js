const emailInput = document.querySelector('#email-input');
const passwordInput = document.querySelector('#password-input');
const form = document.querySelector('#form');
const div = document.querySelector('#div');
const prevButton = document.querySelector('#prev-button');
const nextButton = document.querySelector('#next-button');
const searchInput = document.querySelector('#search-input');
const groupInput = document.querySelector('#group-input');
const statusInput = document.querySelector('#status-input');
const agentInput = document.querySelector('#agent-input');
const dateFromInput = document.querySelector('#date-from');
const dateToInput = document.querySelector('#date-to');
const page = document.querySelector('#page');
let currentPage = 1;

//Creamos una función para cargar los tickets. Necesitamos la URL
const cargarTickets = async (url) => {
    try {
        const { data } = await axios.get(url);
        //Limpiamos el HTML
        div.innerHTML = '';
        //SI no existe una página siguiente o una previa, se deshabilitan los botones
        if (data.pages === currentPage) {
            nextButton.disabled = true;
        } else {
            nextButton.disabled = false;
        }
        if (currentPage === 1) {
            prevButton.disabled = true;
        } else {
            prevButton.disabled = false;
        }

        page.innerHTML = `
            <p>Página ${currentPage}/${data.pages}</p>
        `;

        //Por cada ticket, llamamos a la función de crearlos y lo agregamos al div
        data.tickets.forEach(ticket => {
            const ticketElement = crearTicketElement(ticket);
            div.append(ticketElement);
            if (agentInput.value) {
                div.innerHTML = 'De momento, no sirve buscar por agente Jaja'
            }
        });
        
    } catch (error) {
        console.log(error)
    }
};

//Creamos una función para crear los tickets a visualizar
const crearTicketElement = (ticket) => {
    //Obtenemos el ID del ticket y creamos una plantilla con las clases
    const id = ticket.id;
    const classForDiv = "w-[80%] self-center flex flex-col py-[16px] border border-gray-300 rounded p-4 mb-2 cursor-pointer hover:bg-gray-700 transition ease-in-out";
    //Creamos el ticket con las clases necesarias
    const divTicket = document.createElement('div');
    divTicket.id = id;
    divTicket.classList = classForDiv;

    //Se crea un dato adicional para reportar links faltantes
    let adicional = '';
    if (!ticket.assignee && ticket.source.url && ticket.status !== 'spam' ) {
        adicional = `<p>Sin asignar, reportar link ${ticket.source?.url}</p>`
    };

    //Diseñamos la previsualización de todos los tickets
    divTicket.innerHTML = `
        <p>Ticket: ${ticket.id}</p>
        ${ticket.source.type === "lc2" ? `<p>Chat ID: ${ticket.source.id}</p>` : ''}
        <p>Usuario: ${ticket.requester.name}</p>
        <p>Subject: ${ticket.subject}</p>
        <p>Grupo: ${ticket.currentGroup.name}</p>
        <p>Fecha: ${ticket.date.split('T')[0]}</p>
        <p>Último mensaje: ${ticket.modified.split('T')[0]}</p>
        ${adicional}
    `;

    //En caso de seleccionar el ticket, se abren sus detalles
    divTicket.addEventListener('click', () => mostrarDetalleTicket(ticket));
    return divTicket;
};

//Creamos una función para mostrar los detalles de lso tickets
const mostrarDetalleTicket = (ticket) => {
    //Notar detalle del if que se creó en si el ticket está asignado o no
    div.innerHTML = '';
    const classForDetalleDiv = "w-[80%] bg-gray-600 rounded-lg mb-8"
    const detalleDiv = document.createElement('div');
    detalleDiv.id = 'detalle-div';
    detalleDiv.classList = classForDetalleDiv;
    detalleDiv.innerHTML = `
        <div class="w-[90%] my-4 justify-self-center">
            <p>Ticket: ${ticket.id}</p>
            ${ticket.source.type === "lc2" ? `<p>Chat ID: ${ticket.source.id}</p>` : ''}
            <p>Usuario: ${ticket.requester.name}</p>
            <p>Correo: ${ticket.requester.mail}</p>
            <p>Grupo actual: ${ticket.currentGroup.name}</p>
            ${ticket.source?.url ? `<p>Link: ${ticket.source.url.split('/')[2]}</p>` : ''}
            <p>Status: ${ticket.status}</p>
            <p>Subject: ${ticket.subject}</p>
            <p>Fecha: ${ticket.date}</p>
            <p>Último mensaje: ${ticket.modified}</p>
            ${ticket.events.map(event => {
                if (event.type === "message" && event.author.type === 'agent' && event.is_private === false) {
                    return `
                        <div class="max-w-[80%] p-2 bg-[#6b71ab] rounded-lg justify-self-end my-2">
                            <p><b>${event.author.name}:</b></p>
                            <p>${event.message}</p><br>
                            <p class="text-xs">${event.date.split('T')[0]+' '+ event.date.split('T')[1].split('Z')[0]}</p>
                        </div>
                    `;
                } else if (event.type === "message" && event.author.type === 'agent' && event.is_private === true) {
                    return `
                        <div class="max-w-[80%] p-2 bg-gray-700 rounded-lg justify-self-end my-2">
                            <p><b>${event.author.name} (mensaje privado):</b></p>
                            <p>${event.message}</p><br>
                            <p class="text-xs">${event.date.split('T')[0]+' '+ event.date.split('T')[1].split('Z')[0]}</p>
                        </div>
                    `;
                } else if (event.type === "message" && event.author.type === 'client') {
                    let mensaje = event.message
                    if (event.message.includes('Chat transcript:')) {
                        mensaje = event.message.split('Chat transcript:')[0] + 'Transcripción del chat oculta';
                    }
                    if (event.message.includes('Obtener Outlook')) {
                        mensaje = event.message.split('Obtener Outlook')[0];
                    }
                    if (event.message.includes('Enviado desde Outlook')) {
                        mensaje = event.message.split('Enviado desde Outlook')[0];
                    }
                    return `
                        <div class="max-w-[80%] p-2 bg-[#00ffd052] rounded-lg justify-self-start my-2">
                            <p><b>${event.author.name}:</b></p>
                            <p>${mensaje}</p><br>
                            <p class="text-xs">${event.date.split('T')[0]+' '+ event.date.split('T')[1].split('Z')[0]}</p>
                        </div>
                    `;
                } else if (event.type === "assigne_changed") {
                    return `<p class="text-xs">Tomado por: <b>${event.to.name}</b></p>`;
                } else if (event.type === "status_changed") {
                    return `<p class="text-xs">Status cambiado de <b>${event.previous}</b> a <b>${event.current}</b></p>`;
                } else if (event.type === "subject_changed") {
                    return `<p>Subject cambiado de <b>${event.previous}</b> a <b>${event.current}</b></p>`
                }
                return '';
            }).join('')}
            <button id="volver-button" class="bg-[#003eb0] px-4 mt-4 rounded-lg text-gray-100 hover:bg-[#85b0ffc4] justify-self-start">Volver</button>
        </div>
    `;
    //Agregamos los detalles del ticket al div
    div.append(detalleDiv);
    
    //Como hemos creado un botón para volver, creamos el evento de regresar a la misma página
    const volverBtn = document.querySelector('#volver-button');
    volverBtn.addEventListener('click', () => {
        cargarTickets(`/api/livechat?page=${currentPage}`);
    });
};

//Construimos la URL que enviaremos al controller con una función
const construirUrl = () => {
    //La URL base
    let url = `/api/livechat?page=${currentPage}`;

    //A partir de aquí vamos agregando datos de búsqueda
    if (dateFromInput.value) {
        url += `&date_from=${dateFromInput.value}`;
    }
    if (dateToInput.value) {
        url += `&date_to=${dateToInput.value}`;
    }
    if (groupInput.value) {
        url += `&group=${groupInput.value}`;
    }
    if (statusInput.value) {
        url += `&status=${statusInput.value}`;
    }
    if (agentInput.value) {
        url += `&agent=${agentInput.value}`;
    }
    if (searchInput.value) {
        url += `&search=${searchInput.value}`;
    }
    return url;
};


//Submit de la búsqueda
form.addEventListener('submit', async e => {
    e.preventDefault();
    //Luego de agregar los datos a buscar, iniciamos la búsqueda en Page 1 y llamamos la función con un URL construido con los datos
    currentPage = 1;
    cargarTickets(construirUrl())
});

nextButton.addEventListener('click', (e) => {
    e.preventDefault();
    currentPage++;
    cargarTickets(construirUrl());
});

prevButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) {
        currentPage--;
        cargarTickets(construirUrl());
    }
});