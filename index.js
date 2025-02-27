const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

// === Tratamento de Erros Globais ===
function logError(error) {
    const errorMessage = `${new Date().toISOString()} - ${error.stack || error}\n`;
    console.error("Erro não tratado:", error);
    
    // Escreve no arquivo de log
    fs.appendFileSync("error.log", errorMessage);
}

process.on("uncaughtException", logError);
process.on("unhandledRejection", logError);

// === Configuração do cliente WhatsApp ===
const client = new Client({
    authStrategy: new LocalAuth(), // Salva sessão para evitar escanear QR toda vez
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// Função para criar delay entre mensagens
const delay = ms => new Promise(res => setTimeout(res, ms));

// Armazenamento do estado do usuário
const userStates = new Map();

// Função para limpar estados antigos periodicamente
setInterval(() => {
    const oneHourAgo = Date.now() - 3600000;
    for (const [key, value] of userStates.entries()) {
        if (value.lastUpdate < oneHourAgo) {
            userStates.delete(key);
        }
    }
}, 1800000);

// Sistema de menus aninhados
const menus = {
    main: {
        text: `✨ Olá! Bem-vindo à *Actua Engenharia* ✨\n\n` +
              `Escolha uma opção para continuar:\n\n` +
              `1️⃣ Serviços 🏗️\n` +
              `2️⃣ Informações ℹ️\n` +
              `3️⃣ Contato 📞\n` +
              `0️⃣ Sair`,
        options: {
            '1': 'servicos',
            '2': 'informacoes',
            '3': 'contato',
            '0': 'sair'
        }
    },
    servicos: {
        text: `*Serviços Disponíveis* 🏗️\n\n` +
              `1️⃣ Regularização de Imóvel 🏡\n` +
              `2️⃣ Projeto Elétrico ⚡\n` +
              `3️⃣ Projeto Hidráulico 💧\n` +
              `4️⃣ Projeto de Incêndio 🔥\n` +
              `5️⃣ Laudos Periciais 📑\n` +
              `0️⃣ Voltar ao Menu Principal`,
        options: {
            '1': 'regularizacao',
            '2': 'eletrico',
            '3': 'hidraulico',
            '4': 'incendio',
            '5': 'laudos',
            '0': 'main'
        }
    },
    regularizacao: {
        text: `*Regularização de Imóveis* 🏠\n\n` +
              `1⃣ O que é regularização de imóvel?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '1': 'regularizacao_info',
            '2': 'regularizacao_docs',
            '3': 'regularizacao_processo',
            '4': 'regularizacao_valores',
            '5': 'regularizacao_visita',
            '0': 'servicos_disponiveis'
        }
    },
    
    regularizacao_info: {
        text: `*O que é Regularização de Imóvel?* 🏠\n\n` +
              `A regularização de imóvel é o processo legal que visa adequar uma construção ou imóvel às normas urbanísticas e ambientais, garantindo que ele esteja em conformidade com a legislação local.\n\n` +
              `🔹 Necessária para obter o habite-se e outros documentos legais.\n` +
              `🔹 Regulariza obras realizadas sem alvará ou com alterações não autorizadas.\n` +
              `🔹 Garante a segurança jurídica para o proprietário e facilita a venda ou financiamento.\n\n` +
              `Deseja saber mais?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '2': 'regularizacao_docs',
            '3': 'regularizacao_processo',
            '0': 'regularizacao'
        }
    },
    
    regularizacao_docs: {
        text: `*Documentos Necessários para Regularização de Imóvel* 📄\n\n` +
              `Para dar início ao processo de regularização, são necessários os seguintes documentos:\n\n` +
              `📌 *Planta baixa atualizada* (com medidas e alterações realizadas).\n` +
              `📌 *Cadastro do cliente* (dados do proprietário e localização do imóvel).\n` +
              `📌 *Documentos de propriedade do imóvel* (registro, escritura ou contrato).\n` +
              `📌 *Certidão de Ônus Reais* (para comprovar a situação jurídica do imóvel).\n` +
              `📌 *Licença ou alvará de construção* (se aplicável).\n\n` +
              `Deseja prosseguir com o processo?\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '3': 'regularizacao_processo',
            '0': 'regularizacao'
        }
    },
    
    regularizacao_processo: {
        text: `*Processo e Prazos da Regularização de Imóvel* ⏳\n\n` +
              `O processo de regularização de imóvel envolve as seguintes etapas:\n\n` +
              `1️⃣ *Análise da documentação* - verificação dos documentos apresentados e adequação às exigências legais.\n` +
              `2️⃣ *Elaboração do projeto de regularização* - adequação da planta baixa ao que foi realizado no imóvel.\n` +
              `3️⃣ *Aprovação junto aos órgãos competentes* - apresentação do projeto às autoridades locais (prefeitura, corpo de bombeiros, etc.).\n` +
              `4️⃣ *Emissão de documentos legais* - após aprovação, é emitido o habite-se e outros documentos necessários.\n\n` +
              `📆 O prazo médio para conclusão do processo varia de 30 a 90 dias, dependendo da complexidade e da agilidade dos órgãos envolvidos.\n\n` +
              `Deseja saber sobre valores e condições?\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '4': 'regularizacao_valores',
            '5': 'regularizacao_visita',
            '0': 'regularizacao'
        }
    },
    
    regularizacao_valores: {
        text: `*Valores e Condições da Regularização de Imóvel* 💰\n\n` +
              `Os valores para regularização de imóvel podem variar conforme a complexidade do processo e a localidade.\n\n` +
              `📍 *Regularização de imóvel residencial*: a partir de R$ 1.500,00.\n` +
              `📍 *Regularização de imóvel comercial*: entre R$ 3.000,00 e R$ 5.000,00.\n` +
              `📍 *Outros tipos de regularização*: sob consulta.\n\n` +
              `💳 Parcelamento disponível em até 6x no cartão.\n` +
              `📆 Condições especiais para pagamento à vista.\n\n` +
              `Deseja agendar uma visita técnica?\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '5': 'regularizacao_visita',
            '0': 'regularizacao'
        }
    },
    
    regularizacao_visita: {
        text: `*Agendar Visita Técnica* 📅\n\n` +
              `Para iniciar o processo de regularização, recomendamos uma visita técnica.\n\n` +
              `📍 *Como funciona?*\n` +
              `- Um engenheiro irá até o local para levantamento das informações e análise do imóvel.\n` +
              `- A visita pode ser agendada de segunda a sexta, das 8h às 18h.\n` +
              `- Custo da visita: R$ 150,00 (abatido no fechamento do projeto).\n\n` +
              `📲 Para agendar, entre em contato:\n` +
              `📞 WhatsApp: (86) 99435-2938\n` +
              `📧 Email: actuasolucoes@gmail.com\n\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '0': 'regularizacao'
        }
    },    
    eletrico: {
        text: `*Projeto Elétrico* ⚡\n\n` +
              `1⃣ O que é um projeto elétrico?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '1': 'eletrico_info',
            '2': 'eletrico_docs',
            '3': 'eletrico_processo',
            '4': 'eletrico_valores',
            '5': 'eletrico_visita',
            '0': 'servicos_disponiveis'
        }
    },
    
    eletrico_info: {
        text: `*O que é um Projeto Elétrico?* ⚡\n\n` +
              `Um projeto elétrico é o planejamento e dimensionamento da instalação elétrica de um imóvel, considerando a distribuição de circuitos, cargas, sistemas de proteção e segurança.\n\n` +
              `🔹 Garante a segurança no fornecimento de energia elétrica.\n` +
              `🔹 Evita sobrecargas e curtos-circuitos.\n` +
              `🔹 Necessário para a regularização junto a órgãos competentes.\n\n` +
              `Deseja saber mais?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '2': 'eletrico_docs',
            '3': 'eletrico_processo',
            '0': 'eletrico'
        }
    },
    
    eletrico_docs: {
        text: `*Documentos Necessários para o Projeto Elétrico* 📄\n\n` +
              `Para elaborar um projeto elétrico, são necessários os seguintes documentos:\n\n` +
              `📌 *Planta arquitetônica do imóvel* (com detalhes da planta baixa e medidas de segurança).\n` +
              `📌 *Cadastro do cliente* (informações do proprietário e localização da obra).\n` +
              `📌 *Normas de segurança e diretrizes da concessionária de energia*.\n` +
              `📌 *Dados sobre carga elétrica, equipamentos e instalações desejadas*.\n\n` +
              `Deseja prosseguir com o processo?\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '3': 'eletrico_processo',
            '0': 'eletrico'
        }
    },
    
    eletrico_processo: {
        text: `*Processo e Prazos do Projeto Elétrico* ⏳\n\n` +
              `O desenvolvimento de um projeto elétrico segue os seguintes passos:\n\n` +
              `1️⃣ *Levantamento técnico* - análise do imóvel e das necessidades do cliente.\n` +
              `2️⃣ *Dimensionamento de circuitos e cargas* - cálculo da distribuição da energia e proteção dos circuitos.\n` +
              `3️⃣ *Elaboração dos desenhos técnicos* - plantas detalhadas com posicionamento de quadros e circuitos.\n` +
              `4️⃣ *Aprovação junto aos órgãos competentes* - caso seja exigido pela legislação local.\n\n` +
              `📆 O prazo médio para conclusão varia de 7 a 15 dias úteis, dependendo da complexidade.\n\n` +
              `Deseja saber sobre valores e condições?\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '4': 'eletrico_valores',
            '5': 'eletrico_visita',
            '0': 'eletrico'
        }
    },
    
    eletrico_valores: {
        text: `*Valores e Condições do Projeto Elétrico* 💰\n\n` +
              `Os valores variam conforme o tamanho do imóvel e a complexidade do projeto.\n\n` +
              `📍 *Residências pequenas:* a partir de R$ 800,00.\n` +
              `📍 *Apartamentos e casas maiores:* entre R$ 1.500,00 e R$ 3.000,00.\n` +
              `📍 *Projetos comerciais ou industriais:* sob consulta.\n\n` +
              `💳 Parcelamento disponível em até 6x no cartão.\n` +
              `📆 Condições especiais para pagamento à vista.\n\n` +
              `Deseja agendar uma visita técnica?\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '5': 'eletrico_visita',
            '0': 'eletrico'
        }
    },
    
    eletrico_visita: {
        text: `*Agendar Visita Técnica* 📅\n\n` +
              `Para uma avaliação mais precisa, recomendamos uma visita técnica.\n\n` +
              `📍 *Como funciona?*\n` +
              `- Um engenheiro irá até o local para levantamento de informações.\n` +
              `- A visita pode ser agendada de segunda a sexta, das 8h às 18h.\n` +
              `- Custo da visita: R$ 150,00 (abatido no fechamento do projeto).\n\n` +
              `📲 Para agendar, entre em contato:\n` +
              `📞 WhatsApp: (86) 99435-2938\n` +
              `📧 Email: actuasolucoes@gmail.com\n\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '0': 'eletrico'
        }
    },
    hidraulico: {
        text: `*Projeto Hidráulico* 💧\n\n` +
              `1⃣ O que é um projeto hidráulico?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '1': 'hidraulico_info',
            '2': 'hidraulico_docs',
            '3': 'hidraulico_processo',
            '4': 'hidraulico_valores',
            '5': 'hidraulico_visita',
            '0': 'servicos_disponiveis'
        }
    },
    
    hidraulico_info: {
        text: `*O que é um Projeto Hidráulico?* 💧\n\n` +
              `Um projeto hidráulico é um conjunto de cálculos e desenhos técnicos que definem toda a infraestrutura de abastecimento de água potável, esgoto sanitário e águas pluviais de um imóvel.\n\n` +
              `🔹 Garante a segurança, eficiência e economia no uso da água.\n` +
              `🔹 Evita desperdícios e problemas como vazamentos e baixa pressão.\n` +
              `🔹 Necessário para aprovações em prefeituras e órgãos reguladores.\n\n` +
              `Deseja saber mais?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '2': 'hidraulico_docs',
            '3': 'hidraulico_processo',
            '0': 'hidraulico'
        }
    },
    
    hidraulico_docs: {
        text: `*Documentos Necessários para o Projeto Hidráulico* 📄\n\n` +
              `Para elaborar um projeto hidráulico, são necessários os seguintes documentos:\n\n` +
              `📌 *Planta arquitetônica do imóvel* (com medidas e detalhamentos estruturais).\n` +
              `📌 *Cadastro do cliente* (dados do proprietário e localização da obra).\n` +
              `📌 *Normas municipais e diretrizes da concessionária de água*.\n` +
              `📌 *Dados sobre consumo de água e tipos de instalações desejadas*.\n\n` +
              `Deseja prosseguir com o processo?\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '3': 'hidraulico_processo',
            '0': 'hidraulico'
        }
    },
    
    hidraulico_processo: {
        text: `*Processo e Prazos do Projeto Hidráulico* ⏳\n\n` +
              `O desenvolvimento de um projeto hidráulico segue os seguintes passos:\n\n` +
              `1️⃣ *Levantamento técnico* - análise do imóvel e das necessidades do cliente.\n` +
              `2️⃣ *Dimensionamento das tubulações* - cálculo de pressão e vazão para cada ponto.\n` +
              `3️⃣ *Elaboração dos desenhos técnicos* - plantas detalhadas com posicionamento das redes.\n` +
              `4️⃣ *Aprovação junto aos órgãos competentes* - caso seja exigido pela legislação local.\n\n` +
              `📆 O prazo médio para conclusão varia de 7 a 15 dias úteis, dependendo da complexidade.\n\n` +
              `Deseja saber sobre valores e condições?\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '4': 'hidraulico_valores',
            '5': 'hidraulico_visita',
            '0': 'hidraulico'
        }
    },
    
    hidraulico_valores: {
        text: `*Valores e Condições do Projeto Hidráulico* 💰\n\n` +
              `Os valores variam conforme o tamanho do imóvel e a complexidade do projeto.\n\n` +
              `📍 *Residências pequenas:* a partir de R$ 800,00.\n` +
              `📍 *Apartamentos e casas maiores:* entre R$ 1.500,00 e R$ 3.000,00.\n` +
              `📍 *Projetos comerciais ou industriais:* sob consulta.\n\n` +
              `💳 Parcelamento disponível em até 6x no cartão.\n` +
              `📆 Condições especiais para pagamento à vista.\n\n` +
              `Deseja agendar uma visita técnica?\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '5': 'hidraulico_visita',
            '0': 'hidraulico'
        }
    },
    hidraulico_visita: {
        text: `*Agendar Visita Técnica* 📅\n\n` +
              `Para uma avaliação mais precisa, recomendamos uma visita técnica.\n\n` +
              `📍 *Como funciona?*\n` +
              `- Um engenheiro irá até o local para levantamento de informações.\n` +
              `- A visita pode ser agendada de segunda a sexta, das 8h às 18h.\n` +
              `- Custo da visita: R$ 150,00 (abatido no fechamento do projeto).\n\n` +
              `📲 Para agendar, entre em contato:\n` +
              `📞 WhatsApp: (86) 99435-2938\n` +
              `📧 Email: actuasolucoes@gmail.com\n\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '0': 'hidraulico'
        }
    },
    incendio: {
        text: `*Projeto de Incêndio* 🔥\n\n` +
              `1⃣ O que é um projeto de incêndio?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '1': 'incendio_info',
            '2': 'incendio_docs',
            '3': 'incendio_processo',
            '4': 'incendio_valores',
            '5': 'incendio_visita',
            '0': 'servicos_disponiveis'
        }
    },
    
    incendio_info: {
        text: `*O que é um Projeto de Incêndio?* 🔥\n\n` +
              `Um projeto de incêndio é um planejamento técnico que visa garantir a segurança de um imóvel em caso de incêndio, com a instalação de sistemas de combate e prevenção, como sprinklers, extintores, saídas de emergência, sinalização e outros.\n\n` +
              `🔹 Fundamental para a segurança dos ocupantes do imóvel.\n` +
              `🔹 Necessário para aprovação em órgãos competentes, como o Corpo de Bombeiros.\n` +
              `🔹 Define as medidas de segurança contra incêndios, atendendo às normas e regulamentações locais.\n\n` +
              `Deseja saber mais?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '2': 'incendio_docs',
            '3': 'incendio_processo',
            '0': 'incendio'
        }
    },
    
    incendio_docs: {
        text: `*Documentos Necessários para o Projeto de Incêndio* 📄\n\n` +
              `Para elaborar um projeto de incêndio, são necessários os seguintes documentos:\n\n` +
              `📌 *Planta arquitetônica do imóvel* (com localização das áreas de risco e acessos).\n` +
              `📌 *Cadastro do cliente* (dados do proprietário e localização da obra).\n` +
              `📌 *Memorial descritivo das condições do imóvel* (informações sobre os materiais e sistemas de segurança).\n` +
              `📌 *Normas de segurança e diretrizes do Corpo de Bombeiros*.\n\n` +
              `Deseja prosseguir com o processo?\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '3': 'incendio_processo',
            '0': 'incendio'
        }
    },
    
    incendio_processo: {
        text: `*Processo e Prazos do Projeto de Incêndio* ⏳\n\n` +
              `O desenvolvimento de um projeto de incêndio segue os seguintes passos:\n\n` +
              `1️⃣ *Levantamento técnico* - análise do imóvel, áreas de risco e necessidades do cliente.\n` +
              `2️⃣ *Dimensionamento do sistema de prevenção e combate a incêndio* - cálculo da necessidade de sprinklers, extintores e sinalização.\n` +
              `3️⃣ *Elaboração dos desenhos técnicos* - plantas detalhadas com posicionamento dos sistemas de segurança.\n` +
              `4️⃣ *Aprovação junto aos órgãos competentes* - envio ao Corpo de Bombeiros para vistoria e aprovação.\n\n` +
              `📆 O prazo médio para conclusão varia de 7 a 20 dias úteis, dependendo da complexidade e da necessidade de aprovação do Corpo de Bombeiros.\n\n` +
              `Deseja saber sobre valores e condições?\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '4': 'incendio_valores',
            '5': 'incendio_visita',
            '0': 'incendio'
        }
    },
    
    incendio_valores: {
        text: `*Valores e Condições do Projeto de Incêndio* 💰\n\n` +
              `Os valores variam conforme o tamanho do imóvel e a complexidade do projeto.\n\n` +
              `📍 *Residências pequenas:* a partir de R$ 1.500,00.\n` +
              `📍 *Apartamentos e casas maiores:* entre R$ 3.000,00 e R$ 6.000,00.\n` +
              `📍 *Projetos comerciais ou industriais:* sob consulta.\n\n` +
              `💳 Parcelamento disponível em até 6x no cartão.\n` +
              `📆 Condições especiais para pagamento à vista.\n\n` +
              `Deseja agendar uma visita técnica?\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '5': 'incendio_visita',
            '0': 'incendio'
        }
    },
    
    incendio_visita: {
        text: `*Agendar Visita Técnica* 📅\n\n` +
              `Para uma avaliação mais precisa, recomendamos uma visita técnica.\n\n` +
              `📍 *Como funciona?*\n` +
              `- Um engenheiro irá até o local para levantamento de informações.\n` +
              `- A visita pode ser agendada de segunda a sexta, das 8h às 18h.\n` +
              `- Custo da visita: R$ 150,00 (abatido no fechamento do projeto).\n\n` +
              `📲 Para agendar, entre em contato:\n` +
              `📞 WhatsApp: (86) 99435-2938\n` +
              `📧 Email: actuasolucoes@gmail.com\n\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '0': 'incendio'
        }
    },
    laudos: {
        text: `*Laudos Técnicos* 📋\n\n` +
              `1⃣ O que é um laudo técnico?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '1': 'laudos_info',
            '2': 'laudos_docs',
            '3': 'laudos_processo',
            '4': 'laudos_valores',
            '5': 'laudos_visita',
            '0': 'servicos_disponiveis'
        }
    },
    
    laudos_info: {
        text: `*O que é um Laudo Técnico?* 📋\n\n` +
              `Um laudo técnico é um documento elaborado por um profissional especializado, que atesta a conformidade ou não de um imóvel ou equipamento com as normas técnicas e de segurança exigidas.\n\n` +
              `🔹 Essencial para comprovar a viabilidade ou segurança de construções, reformas ou instalações.\n` +
              `🔹 Pode ser exigido por órgãos públicos, como prefeituras e concessionárias de serviços.\n` +
              `🔹 Necessário para o processo de regularização de imóveis e obtenção de licenças e alvarás.\n\n` +
              `Deseja saber mais?\n` +
              `2⃣ Documentos necessários\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '2': 'laudos_docs',
            '3': 'laudos_processo',
            '0': 'laudos'
        }
    },
    
    laudos_docs: {
        text: `*Documentos Necessários para o Laudo Técnico* 📄\n\n` +
              `Para elaborar um laudo técnico, são necessários os seguintes documentos:\n\n` +
              `📌 *Planta arquitetônica do imóvel* (para análise do local).\n` +
              `📌 *Cadastro do cliente* (dados do proprietário e localização da obra).\n` +
              `📌 *Documentos de propriedade do imóvel* (registro, escritura ou contrato).\n` +
              `📌 *Dados sobre a área ou equipamento a ser analisado* (condições de uso e conservação).\n\n` +
              `Deseja prosseguir com o processo?\n` +
              `3⃣ Processo e prazos\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '3': 'laudos_processo',
            '0': 'laudos'
        }
    },
    
    laudos_processo: {
        text: `*Processo e Prazos do Laudo Técnico* ⏳\n\n` +
              `O desenvolvimento de um laudo técnico segue os seguintes passos:\n\n` +
              `1️⃣ *Levantamento técnico* - análise do imóvel ou equipamento e coleta de dados.\n` +
              `2️⃣ *Inspeção e testes* - verificação das condições de segurança, funcionamento e conformidade.\n` +
              `3️⃣ *Elaboração do laudo* - redação e formalização do relatório técnico com base nas inspeções.\n` +
              `4️⃣ *Entrega do laudo* - o documento final é fornecido ao cliente com as observações e recomendações.\n\n` +
              `📆 O prazo médio para elaboração do laudo técnico varia de 5 a 10 dias úteis, dependendo da complexidade.\n\n` +
              `Deseja saber sobre valores e condições?\n` +
              `4⃣ Valores e condições\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '4': 'laudos_valores',
            '5': 'laudos_visita',
            '0': 'laudos'
        }
    },
    
    laudos_valores: {
        text: `*Valores e Condições do Laudo Técnico* 💰\n\n` +
              `Os valores variam conforme o tipo de laudo e a complexidade da análise.\n\n` +
              `📍 *Laudo de Vistoria* (residencial): a partir de R$ 500,00.\n` +
              `📍 *Laudo de Vistoria* (comercial ou industrial): entre R$ 1.000,00 e R$ 2.500,00.\n` +
              `📍 *Laudo de Regularização de Imóvel* (residencial): a partir de R$ 1.200,00.\n` +
              `📍 *Laudo Técnico de Equipamento* (sob consulta).\n\n` +
              `💳 Parcelamento disponível em até 6x no cartão.\n` +
              `📆 Condições especiais para pagamento à vista.\n\n` +
              `Deseja agendar uma visita técnica?\n` +
              `5⃣ Agendar visita técnica\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '5': 'laudos_visita',
            '0': 'laudos'
        }
    },
    
    laudos_visita: {
        text: `*Agendar Visita Técnica* 📅\n\n` +
              `Para uma avaliação mais precisa, recomendamos uma visita técnica.\n\n` +
              `📍 *Como funciona?*\n` +
              `- Um engenheiro irá até o local para levantamento de informações.\n` +
              `- A visita pode ser agendada de segunda a sexta, das 8h às 18h.\n` +
              `- Custo da visita: R$ 150,00 (abatido no fechamento do projeto).\n\n` +
              `📲 Para agendar, entre em contato:\n` +
              `📞 WhatsApp: (86) 99435-2938\n` +
              `📧 Email: actuasolucoes@gmail.com\n\n` +
              `0⃣ Voltar ao menu anterior`,
        options: {
            '0': 'laudos'
        }
    },
    informacoes: {
        text: `ℹ️ *Informações sobre a Actua Engenharia* ℹ️\n\n` +
              `Somos especializados em:\n` +
              `🏗️ Projetos completos\n` +
              `📑 Regularizações\n` +
              `🏢 Laudos técnicos\n` +
              `⚡ Instalações\n\n` +
              `1️⃣ Nossa Localização\n` +
              `2️⃣ Horário de Atendimento\n` +
              `3️⃣ Falar com um Engenheiro\n` +
              `0️⃣ Voltar ao Menu Principal`,
        options: {
            '1': 'contato',
            '2': 'horario',
            '3': 'engenheiro',
            '0': 'main'
        }
    },
    
    contato: {
        text: `📍 *Nossa Localização* 🗺️\n\n` +
              `Estamos localizados em Teresina, PI, mas atendemos clientes em várias regiões.\n\n` +
              `Nosso endereço é:\n` +
              `Rua Exemplo, 123 - Centro, Teresina, PI\n\n` +
              `Deseja falar com um engenheiro? Eles irão atender sua solicitação o mais rápido possível.\n` +
              `3️⃣ Falar com um Engenheiro\n` +
              `0️⃣ Voltar ao Menu Principal`,
        options: {
            '3': 'engenheiro',
            '0': 'informacoes'
        }
    },
    
    horario: {
        text: `⏰ *Horário de Atendimento* 🕓\n\n` +
              `Atendemos de segunda a sexta-feira, das 8h às 18h.\n\n` +
              `Deseja falar com um engenheiro? Eles irão atender sua solicitação o mais rápido possível.\n` +
              `3️⃣ Falar com um Engenheiro\n` +
              `0️⃣ Voltar ao Menu Principal`,
        options: {
            '3': 'engenheiro',
            '0': 'informacoes'
        }
    },
    
    engenheiro: {
        text: `👷‍♂️ *Falar com um Engenheiro* 🛠️\n\n` +
              `Vamos transferir você para um engenheiro especializado na área que você precisa.\n` +
              `Ele atenderá sua solicitação o mais rápido possível e dará todo o suporte necessário.\n\n` +
              `Aguarde um momento... 👨‍🔧👩‍🔧\n\n` +
              `0️⃣ Voltar ao Menu Principal`,
        options: {
            '0': 'informacoes'
        }
    },                
    contato: {
        text: `📞 *Contato da Actua Engenharia* 📞\n\n` +
              `📍 Endereço: Rua Coelho de Resende, Aeroporto, Teresina - PI, Sala 01\n` +
              `📧 Email: actuasolucoes@gmail.com\n` +
              `📸 Instagram: @actuathe\n\n` +
              `0️⃣ Voltar ao Menu Principal`,
        options: {
            '0': 'main'
        }
    },
    erro: {
        text: `⚠️ Opção inválida. Por favor, escolha uma opção válida:\n\n` +
              `Digite o número correspondente ou "menu" para retornar ao menu principal.`,
        options: {}
    }
};

// === Configuração do QR Code e inicialização ===
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code gerado! Escaneie-o com seu WhatsApp.');
});

client.on('ready', () => {
    console.log('Bot da Actua Engenharia conectado com sucesso!');
});

client.initialize();

// Função de delay para controlar o tempo de resposta
function customDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Gerenciamento de mensagens
client.on('message', async msg => {
    try {
        if (!msg.from.endsWith('@c.us')) return;

        const chat = await msg.getChat();
        const userId = msg.from;

        // Inicializa ou recupera o estado do usuário
        if (!userStates.has(userId)) {
            userStates.set(userId, {
                currentMenu: 'main',
                lastUpdate: Date.now()
            });
        }

        const userState = userStates.get(userId);
        userState.lastUpdate = Date.now();

        const userInput = msg.body.toLowerCase().trim();

        // Lógica para o menu principal
        if (['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite'].includes(userInput)) {
            userState.currentMenu = 'main';
        } else if (['regularizacao', 'regularização'].includes(userInput)) {
            userState.currentMenu = 'regularizacao';
        } else if (['projeto eletrico', 'projeto elétrico', 'eletrico', 'elétrico'].includes(userInput)) {
            userState.currentMenu = 'eletrico';
        } else if (userInput === 'sair') {
            await chat.sendStateTyping();
            await customDelay(1000);
            await client.sendMessage(msg.from, '👋 Você escolheu sair. Até logo!');
            userState.currentMenu = 'sair';  
        } else if (!menus[userState.currentMenu] || !menus[userState.currentMenu].options[userInput]) {
            await chat.sendStateTyping();
            await customDelay(1000);
            await client.sendMessage(msg.from, '⚠️ Opção inválida! Por favor, escolha uma opção válida.');
            await customDelay(1000);
            await client.sendMessage(msg.from, menus[userState.currentMenu].text); 
            return;
        } else {
            userState.currentMenu = menus[userState.currentMenu].options[userInput];
        }

        if (userState.currentMenu === 'sair') return;

        await chat.sendStateTyping();
        await customDelay(1000);
        await client.sendMessage(msg.from, menus[userState.currentMenu].text);

    } catch (error) {
        logError(error);
    }
});
