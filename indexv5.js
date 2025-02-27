const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Função para obter resposta do ChatGPT
async function getChatGPTResponse(message) {
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "system", content: "Você é um assistente de contabilidade especializado em dúvidas sobre impostos, MEI e gestão financeira." },
                       { role: "user", content: message }]
        }, {
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Erro na OpenAI: ", error);
        return "Desculpe, não consegui processar sua solicitação agora. Tente novamente mais tarde.";
    }
}

// Rota para receber mensagens do chatbot
app.post("/webhook", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Mensagem não fornecida" });
    
    const response = await getChatGPTResponse(message);
    res.json({ reply: response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
