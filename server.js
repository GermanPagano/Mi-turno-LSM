const express = require('express');
const hbs = require('hbs');
const axios = require('axios');
const path = require('path');
const moment = require('moment-timezone'); // Para ajustar la zona horaria
const turnosData = require('./datos.json'); // Importar el archivo JSON
const app = express();
const PORT = process.env.PORT || 3000; // Usar el puerto proporcionado por el entorno o 3000 por defecto

// Configuración de Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Función para traducir el día al español
function traducirDia(dia) {
    const diasEnIngles = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const diasEnEspanol = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const index = diasEnIngles.indexOf(dia.toLowerCase());
    return index !== -1 ? diasEnEspanol[index] : null;
}

// Función para calcular el turno basado en el día de franco
function calcularTurno(diaFranco, diaHoy) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const indiceFranco = diasSemana.indexOf(diaFranco.toLowerCase());
    if (indiceFranco === -1) return null; // Día de franco no válido
    const diasRotados = diasSemana.slice(indiceFranco + 1).concat(diasSemana.slice(0, indiceFranco + 1));
    const indiceHoy = diasSemana.indexOf(diaHoy.toLowerCase());
    return diasRotados.indexOf(diasSemana[indiceHoy]) + 1; // Turnos comienzan en 1
}

// Ruta principal con cálculo dinámico
app.get('/:diagramaId/:diaFranco', async (req, res) => {
    const { diagramaId, diaFranco } = req.params;

    console.log(`[DEBUG] Parámetros recibidos - Diagrama: ${diagramaId}, Día de franco: ${diaFranco}`);

    // Validar existencia del diagrama
    if (!turnosData[diagramaId]) {
        console.error(`[ERROR] El diagrama ${diagramaId} no existe en los datos.`);
        return res.render('error', { message: 'El diagrama proporcionado no es válido.' });
    }

    // Obtener el día actual ajustado a la zona horaria de Argentina
    const todayInEnglish = moment().tz('America/Argentina/Buenos_Aires').format('dddd').toLowerCase();
    const today = traducirDia(todayInEnglish); // Traducir el día al español
    console.log(`[DEBUG] Día actual ajustado a la zona horaria (en español): ${today}`);

    if (!today) {
        console.error(`[ERROR] No se pudo determinar el día actual.`);
        return res.render('error', { message: 'Error al determinar el día actual.' });
    }

    // Verificar si hoy es feriado usando una API externa
    let isFeriado = false;
    try {
        const response = await axios.get('https://api.argentinadatos.com/v1/feriados/2024');
        const feriados = response.data || [];
        const todayISO = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD');
        isFeriado = feriados.some(f => f.dia === todayISO);
    } catch (error) {
        console.error(`[ERROR] Error al verificar si es feriado: ${error.message}`);
    }
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
        return res.render('franco', { dia: today, franco: diaFranco });
    }

    // Obtener datos del turno correspondiente
    const datosTurno = turnosData[diagramaId][turno];
    if (!datosTurno) {
        console.error(`[ERROR] No se encontraron datos para el turno ${turno} en el diagrama ${diagramaId}.`);
        return res.render('error', { message: `No se encontraron datos para el turno ${turno}.` });
    }

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
            diagrama: diagramaId,
            franco: diaFranco,
            horarioTomas: datosTurno[diaClave].horarioTomas,
            horarioDejas: datosTurno[diaClave].horarioDejas,
            tabla: datosTurno[diaClave].tabla
        });
    } else {
        console.error(`[ERROR] No hay datos disponibles para el turno ${turno} y el día ${diaClave}.`);
        return res.render('error', { message: `No hay datos disponibles para el turno ${turno} y el día ${diaClave}.` });
    }
});

// Vista de error
app.get('/error', (req, res) => {
    res.render('error', { message: 'Ocurrió un error en el sistema.' });
});

// Servidor en escucha
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
