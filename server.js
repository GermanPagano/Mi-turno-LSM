const express = require('express');
const hbs = require('hbs');
const axios = require('axios');
const path = require('path');
<<<<<<< HEAD
=======
const hbs = require('hbs');
const datos = require('./datos.json'); // Importar el archivo JSON

>>>>>>> 22c5a554d283db5fdfdc9a6eb3e6bbeabf84dd56
const app = express();
const PORT = 3000;

<<<<<<< HEAD
// Cargar JSON de turnos
const turnosData = require('./datos.json');

// Configuración de Handlebars
=======
>>>>>>> 22c5a554d283db5fdfdc9a6eb3e6bbeabf84dd56
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

<<<<<<< HEAD
// Función para calcular el turno basado en el día de franco
function calcularTurno(diaFranco, diaHoy) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const indiceFranco = diasSemana.indexOf(diaFranco.toLowerCase());
    if (indiceFranco === -1) return null; // Día de franco no válido
    const diasRotados = diasSemana.slice(indiceFranco + 1).concat(diasSemana.slice(0, indiceFranco + 1));
    const indiceHoy = diasSemana.indexOf(diaHoy.toLowerCase());
    const turnoCalculado = diasRotados.indexOf(diasSemana[indiceHoy]) + 1; // Turnos comienzan en 1
    console.log(`[DEBUG] Día de franco: ${diaFranco}, Día de hoy: ${diaHoy}, Turno calculado: ${turnoCalculado}`);
    return turnoCalculado;
}
=======
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
>>>>>>> 22c5a554d283db5fdfdc9a6eb3e6bbeabf84dd56

// Ruta principal con cálculo dinámico
app.get('/:diagramaId/:diaFranco', async (req, res) => {
    const { diagramaId, diaFranco } = req.params;

    console.log(`[DEBUG] Parámetros recibidos - Diagrama: ${diagramaId}, Día de franco: ${diaFranco}`);

    // Validar existencia del diagrama
    if (!turnosData[diagramaId]) {
        console.error(`[ERROR] El diagrama ${diagramaId} no existe en los datos.`);
        return res.render('error', { message: 'El diagrama proporcionado no es válido.' });
    }

    // Obtener el día actual
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const todayIndex = new Date().getDay();
    const today = diasSemana[todayIndex];

    console.log(`[DEBUG] Día actual: ${today}`);

    // Verificar si hoy es feriado usando una API externa
    let isFeriado = false;
    try {
<<<<<<< HEAD
        const response = await axios.get('https://api.argentinadatos.com/v1/feriados/2024');
        const feriados = response.data || [];
        isFeriado = feriados.some(f => f.dia === new Date().toISOString().split('T')[0]);
=======
        const response = await axios.get('https://api.argentinadatos.com/v1/feriados/2024/');
        const feriados = response.data;
        isFeriado = feriados.some(f => f.dia === dateString);
>>>>>>> 22c5a554d283db5fdfdc9a6eb3e6bbeabf84dd56
    } catch (error) {
        console.error(`[ERROR] Error al verificar si es feriado: ${error.message}`);
    }

<<<<<<< HEAD
    console.log(`[DEBUG] ¿Hoy es feriado?: ${isFeriado}`);

    // Calcular turno actual
    const turno = calcularTurno(diaFranco, today);
    if (!turno) {
        console.error(`[ERROR] El día de franco proporcionado (${diaFranco}) no es válido.`);
        return res.render('error', { message: 'El día de franco proporcionado no es válido.' });
    }

    console.log(`[DEBUG] Turno calculado: ${turno}`);

    // Validar si el turno es de franco
    if (turno === 6 || turno === 7) {
        console.log(`[DEBUG] Hoy es tu día de franco.`);
        return res.render('franco');
    }

    // Obtener datos del turno correspondiente
    const datosTurno = turnosData[diagramaId][turno];
    if (!datosTurno) {
        console.error(`[ERROR] No se encontraron datos para el turno ${turno} en el diagrama ${diagramaId}.`);
        return res.render('error', { message: `No se encontraron datos para el turno ${turno}.` });
    }

    console.log(`[DEBUG] Datos del turno obtenidos: ${JSON.stringify(datosTurno, null, 2)}`);

    // Determinar el día clave basado en feriado o día normal
    const diaClave = isFeriado 
        ? 'DO-FE' 
        : today === 'sabado'
        ? 'SA'
        : today === 'domingo'
        ? 'DO-FE'
        : 'LU-VIE';

    console.log(`[DEBUG] Día clave determinado: ${diaClave}`);

    if (datosTurno[diaClave]) {
        console.log(`[DEBUG] Datos encontrados para el día clave ${diaClave}: ${JSON.stringify(datosTurno[diaClave], null, 2)}`);
        res.render('tabla', {
            dia: today,
            diagrama: diagramaId, // Agrega el diagrama que pasaste por URL
            franco: diaFranco, // Agrega el día de franco que pasaste por URL
            horarioTomas: datosTurno[diaClave].horarioTomas,
            horarioDejas: datosTurno[diaClave].horarioDejas,
            tabla: datosTurno[diaClave].tabla
        });
    } else {
        console.error(`[ERROR] No hay datos disponibles para el turno ${turno} y el día ${diaClave}.`);
        console.log(`[DEBUG] Datos turno: ${JSON.stringify(datosTurno, null, 2)}`);
        res.render('error', { message: `No hay datos disponibles para el turno ${turno} y el día ${diaClave}.` });
    }
=======
    // Determinar el bloque según el día
    let bloque;
    if (day === 6) { // Sábado
        bloque = isFeriado ? 'última imagen' : 'SA';
    } else if (day === 0) { // Domingo
        bloque = 'DO-FE';
    } else {
        bloque = 'LU-VIE';
    }

    // Obtener los datos del JSON según el bloque
    const bloqueData = datos[bloque] || {
        horarioTomas: 'No definido',
        horarioDejas: 'No definido',
        tabla: []
    };

    // Renderizar la vista con Handlebars
    res.render('bloque', {
        dia: diasSemana[day],
        bloque: bloque,
        horarioTomas: bloqueData.horarioTomas,
        horarioDejas: bloqueData.horarioDejas,
        tabla: bloqueData.tabla
    });
>>>>>>> 22c5a554d283db5fdfdc9a6eb3e6bbeabf84dd56
});

// Vista de error
app.get('/error', (req, res) => {
    res.render('error', { message: 'Ocurrió un error en el sistema.' });
});

// Servidor en escucha
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

