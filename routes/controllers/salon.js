const pool  = require('../../db/mongo');
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//---------------Login---------------------

const getInfo = async (req, res) => {
    const datos = req.body;
    //console.log("LOGIN: ", datos);
    try{
      const salon =  await pool.db('Edificio').collection('saman').findOne({ Salón: datos.id });
      if (salon) {

        res.json({ status: "salon encontrado", salon: salon.Salón, edificio: salon.EDIFICIO, piso: salon.PISO, capacidad: salon.CAPACIDAD, puestoscontados: salon["PUESTOS CONTADOS"], caracteristica: salon["CARACTERÍSTICA EN PEOPLE"], tipoAula: salon["Tipo de Aula"], tipoMesa: salon["Tipo de mesa"], tipoSilla: salon["Tipo de silla"], tipoTablero: salon["Tipo de tablero"], equipamientoTecnologico: salon["Equipamiento Tecnológico "], tomacorriente: salon["Tomacorriente"], movilidad: salon["Movilidad"], estado: salon["Estado"], autoReservas: salon["Auto reservas / Reservas Multimedios"], estadoUso: salon["Estado de uso"], reservaDisponible: salon["Reserva disponible"], reservaAutomatica: salon["Reserva automática"], foto: salon.foto});
      } else {
        res.json({ status: "ErrorCredenciales" });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
  };

  const chatbot = async (req, res) => {
    const datos = req.body;
    //console.log("LOGIN: ", datos);
    try{
      const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente virtual especializado en proporcionar información sobre el salón que te pasarán. Responde preguntas sobre este salón de manera amable y concisa. Si te preguntan algo que no está relacionado con este salón o no tienes la información, indica que solo puedes proporcionar información sobre el salón. Si te Hablan solo con un 'hola', responde con un saludo y pregunta qué información necesitan sobre el salón, No des detalles si el usuario no te lo ha pedido." 
        },
        { role: "user", content: datos.pregunta + " " + JSON.stringify(datos.salon)  }
      ],
      max_tokens: 300, // Limitar tokens para respuestas más cortas
      temperature: 0.7, // Mantener algo de creatividad
    });

    const response = completion.choices[0].message.content;
    res.json({ status: "ok", respuesta: response });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ status: "Error", message: "Internal Server Error" });
    }
  };


  module.exports = { getInfo, chatbot };