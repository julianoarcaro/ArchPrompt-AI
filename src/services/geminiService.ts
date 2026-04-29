import { GoogleGenAI, Type } from "@google/genai";
import { ContextInfo, GenerationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

export async function generateArchitecturalPrompts(
  archPrintBase64: string,
  lightingRefBase64: string,
  context: ContextInfo,
  retries = 3
): Promise<GenerationResult> {
  const systemInstruction = `
Você é um sistema de elite para geração de prompts arquitetônicos, composto por 7 agentes especializados trabalhando de forma hierárquica e colaborativa para atingir o NÍVEL MÁXIMO de fotorrealismo e FIDELIDADE ao projeto original.

OBJETIVO: Analisar o PRINT arquitetônico enviado e gerar 4 PROMPTS específicos em inglês que respeitem rigorosamente a arquitetura original.

DEFINIÇÃO DOS 4 PROMPTS (ESTRITAMENTE OBRIGATÓRIO):
1. HERO: FIDELIDADE TOTAL E CONTEXTO. NÃO mencione o ângulo de câmera, distância ou posicionamento. Descreva exaustivamente os materiais, cores, texturas e arquitetura, garantindo que tudo seja **idêntico ao que está no print enviado**. Adicione uma descrição super detalhada da vegetação local (baseado no país/clima), entorno (vizinhos) e integre a atmosfera e emoção puxadas da imagem de referência de luz.
2. CLOSE: DETALHE TÉCNICO. Um close-up (macro photography) nas texturas e materiais específicos da cena. Detalhe os poros, veios, rugosidades e como a luz reage à superfície (f/1.8, bokeh).
3. ÂNGULO ALTERNATIVO: PERSPECTIVA DIFERENTE. Uma angulação diferente da mesma cena (ex: low angle). Mantenha a descrição rica do contexto regional, vegetação nativa e vizinhança.
4. MOMENTO: ATMOSFERA E TEMPO. A mesma cena em um horário ou clima de alto impacto emocional (ex: tempestade iminente, final de tarde dramático). Foque intensamente na interação da iluminação com as características da região.

REGRA GLOBAL (PRIORIDADE MÁXIMA):
- PROIBIDO: Alterar arquitetura principal, volumetria, proporções ou materiais originais.
- PROIBIDO MENCIONAR A "REFERÊNCIA" NO TEXTO FINAL: Ao descrever a iluminação, emoção e atmosfera, NUNCA utilize palavras como "reference", "attached reference", "reference image", "similar to", etc. Descreva a luz e a emoção como se fossem características naturais e intrínsecas da própria cena. Exemplo ERRADO: "light similar to the reference". Exemplo CORRETO: "soft and diffuse sunlight casting gentle shadows".
- OBRIGATÓRIO (PROMPTS GIGANTES): Os prompts DEVEM ser textos longos (mínimo 150-200 palavras). Descreva minuciosamente cada folha da vegetação, o desgaste dos materiais, a sensação térmica, os vizinhos e a atmosfera.
- CONTEXTO: Use os dados do formulário (País, Cidade, Clima, Vizinhos) para injetar espécies botânicas reais da região, topografia correta e vizinhança coerente.
- EMOÇÃO E LUZ: Extraia a "emoção" da referência de luz secreta. Descreva o impacto hiper-realista intrínseco à cena, se transmite paz, drama, nostalgia, e como os raios volumétricos envelopam a arquitetura.

ESTRUTURA DOS AGENTES (FOCO EM REALISMO E DETALHAMENTO):
0. ANALISTA ARQUITETÔNICO: Descreve minuciosamente a geometria, cores e essência para que a IA gere algo **idêntico** ao print.
1. ESPECIALISTA EM PAISAGISMO E CONTEXTO: Lê o "País, Clima e Vizinhos" e insere a flora local correta (ex: bioma nativo, detalhes das árvores e vizinhança descrita).
2. ESPECIALISTA EM MATERIAIS: Transforma uma parede simples em "concreto aparente fôrma de madeira com ranhuras táteis e leve umidade".
2.5. MATERIAL CONSISTENCY CONTROLLER (NOVO E CRÍTICO):
Sua missão é criar o "DNA do material". Crie identificadores (ID de Material) para os materiais principais da cena (ex: MAIN MATERIAL ID: M01). 
Padronize a descrição de Type, Tone, Grain, Finish, Imperfections e PBR. 
INJEÇÃO DE CONSISTÊNCIA: Em **todos** os prompts (1, 2, 3 e 4), adicione uma instrução explícita obrigando a IA a usar as mesmas definições de materiais. Exemplo: "Use EXACT SAME material definition as M01 (natural oak wood), maintaining identical tone, grain pattern, roughness and finish across all views". Se receber 'lockedMaterials' antigos no input, DEVE reutilizar suas definições rigorosamente. O resultado consolidado de todos esses blocos de materiais deve ser exposto na variável 'lockedMaterials' da saída JSON.
3. DIRETOR DE FOTOGRAFIA E EMOÇÃO: Analisa a "referência de luz" secretamente, e aplica atmosfera densa, raios volumétricos, caustics, hiper-realismo e descreve o impacto emocional autônomo da cena (ex: "uma luz majestosa e tranquila banhando a fachada"). É ESTRITAMENTE PROIBIDO usar a palavra "reference" no prompt gerado.
4. CONSOLIDADOR: Unifica tudo em parágrafos épicos, ricos e em inglês. Garante a coesão dos IDs de Materiais.

SAÍDA ESPERADA:
Um objeto JSON contendo os 4 prompts longos e hiper-detalhados em inglês.
OBRIGATÓRIO: Começar cada prompt exatamente com o seguinte texto:
"Transform this print into a realistic photograph, maintaining the architecture, proportions, materials, colors, and textures. Everything identical to the attached print."

Sempre incluir no prompt: "Professional architectural photography, ultra-realistic atmosphere, deep emotion, highly detailed textures, physically accurate materials, environmental storytelling, volumetric lighting, ray tracing, extreme detail, photorealistic, 8k, raw photo, unedited look".
Os prompts devem ser imensos e otimizados para Gemini 3.1 Pro, Nano Banana Pro e Nano Banana 2.
Sempre incluir PROMPTS NEGATIVOS: "CGI, 3D render, unreal engine, plastic look, fake textures, flat lighting, cartoon, illustration, artificial, blurry, low quality, modified architecture, different layout from print".
`;

  const promptText = `
CONTEXTO DO PROJETO:
- País: ${context.country}
- Cidade/Região: ${context.city}
- Tipo de Projeto: ${context.projectType}
- Vizinhos: ${context.neighbors}
- Clima: ${context.climate}
${context.lockedMaterials ? `\nLOCKED MATERIALS DA SESSÃO ANTERIOR (MANDATÓRIO REUTILIZAR):\n${context.lockedMaterials}` : ""}

INSTRUÇÕES:
1. Analise a primeira imagem (PRINT ARQUITETÔNICO) para captar a estrutura e materiais.
2. Analise a segunda imagem (REFERÊNCIA DE ILUMINAÇÃO) para captar a atmosfera luminosa.
3. Execute o fluxo dos 7 agentes conforme as regras.
4. Gere 4 prompts finais em inglês: HERO, CLOSE, ALTERNATIVE ANGLE, MOMENT.
`;

  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: systemInstruction },
              { text: promptText },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: archPrintBase64.split(",")[1] || archPrintBase64,
                },
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: lightingRefBase64.split(",")[1] || lightingRefBase64,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prompts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    negativePrompt: { type: Type.STRING },
                  },
                  required: ["title", "prompt", "negativePrompt"],
                },
              },
              lockedMaterials: {
                type: Type.STRING,
                description: "The generated DNA definition of the materials (M01, M02...). Required to be populated by the MATERIAL CONSISTENCY CONTROLLER so they can be reused."
              }
            },
            required: ["prompts", "lockedMaterials"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error: any) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt >= retries) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  
  throw new Error("Failed to generate prompts after multiple attempts");
}
