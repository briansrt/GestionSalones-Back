const getClient = require("../../db/mongo");
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//---------------Login---------------------

const getInfo = async (req, res) => {
  const client = await getClient();
  const datos = req.body;
  try {
    const result = await client
      .db("javeriana")
      .collection("salones")
      .aggregate([
        {
          $match: { salon: datos.id }
        },
        {
          $lookup: {
            from: "edificios",
            localField: "edificio_id",
            foreignField: "_id",
            as: "edificio_info"
          }
        },
        {
          $unwind: {
            path: "$edificio_info",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            salon: 1,
            piso: 1,
            capacidad: 1,
            puestoscontados: 1,
            caracteristica: 1,
            tipoAula: "$tipoaula",
            tipoMesa: "$tipomesa",
            tipoSilla: "$Tipo de silla",
            tipoTablero: "$tipotablero",
            equipamientoTecnologico: "$equipamientotecnologico",
            tomacorriente: 1,
            movilidad: 1,
            estado: 1,
            foto: 1,
            edificio: { $ifNull: ["$edificio_info.edificio", "Desconocido"] }
          }
        }
      ])
      .toArray();

    if (result.length > 0) {
      res.json({
        status: "salon encontrado",
        ...result[0]
      });
    } else {
      res.json({ status: "ErrorCredenciales" });
    }
  } catch (error) {
    console.error("Error fetching salon info:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

const GetAllSalones = async (req, res) => {
  const client = await getClient();
  try {
    const salones = await client
      .db("javeriana")
      .collection("salones")
      .aggregate([
        {
          $lookup: {
            from: "edificios", // colección edificios
            localField: "edificio_id", // campo en salones
            foreignField: "_id", // campo en edificios
            as: "edificio_info", // nombre del campo que tendrá el array con el edificio
          },
        },
      ])
      .toArray();

    if (salones.length > 0) {
      res.json({ salones });
    } else {
      res.json({ status: "no hay salones" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Error al obtener salones" });
  }
};

const chatbot = async (req, res) => {
  const datos = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Eres un asistente virtual especializado en proporcionar información sobre los salones que te pasarán.  
Tu objetivo es responder de manera clara, amable y concisa.  
Sigue estas reglas estrictamente:

1. Solo proporciona información sobre salones. Si te preguntan algo fuera de ese tema, responde amablemente que solo puedes brindar información sobre salones.
2. Si el usuario solo dice "hola" o saludos breves, responde con un saludo cordial y pregunta qué información necesita sobre los salones, sin dar detalles adicionales.
3. Cuando te pregunten por salones con cierta capacidad, muestra solo los que cumplen con esa capacidad o más. Nunca muestres salones que no cumplen con la capacidad solicitada.
4. Presenta la información en un formato ordenado, claro y limpio. **No uses viñetas ni listados comprimidos. Separa cada salón como un bloque con título y campos claros, dejando un espacio entre cada uno.**
5. Agrega al final de cada salón un enlace con el texto "Ver detalles" que dirija a la página **https://gestion-salones.vercel.app/salon/{ID}**, donde **{ID} es el nombre exacto del salón, respetando mayúsculas**.
6. Finaliza las respuestas con una pregunta amable, invitando al usuario a solicitar más información si lo desea.

Ejemplo de formato correcto:

---
**AUD_ALM**  
- Capacidad: 202  
- Edificio: Almendros  
- Tipo de Aula: Auditorio  
- [Ver detalles](https://gestion-salones.vercel.app/salon/AUD_ALM)

**CR-AU.1**  
- Capacidad: 90  
- Edificio: Cedro Rosado  
- Tipo de Aula: Auditorio  
- [Ver detalles](https://gestion-salones.vercel.app/salon/CR-AU.1)

¿Deseas que te muestre más detalles de alguno de estos salones?
---
      `,
        },
        {
          role: "user",
          content:
            datos.pregunta +
            "\n\nSalones disponibles:\n" +
            JSON.stringify(datos.salon, null, 2),
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    res.json({ status: "ok", respuesta: response });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

module.exports = { getInfo, GetAllSalones, chatbot };
