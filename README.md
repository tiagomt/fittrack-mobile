# FitTrack — Planejador de Treinos e Consistência (MVP 1.0)

O **FitTrack** é um aplicativo móvel de alta performance desenvolvido em **React Native**, **Expo SDK 54**, **TypeScript** e **NativeWind (Tailwind CSS)** [1]. Concebido com base nas diretrizes de design humanizado da Apple (HIG) e otimizado para o padrão de uso com uma única mão em orientação retrato (9:16), o FitTrack oferece uma experiência fluida, sem distrações e com foco total na consistência de treinos e evolução física.

## Arquitetura e Tecnologias Principais

O aplicativo foi estruturado com uma arquitetura modular baseada em domínio de estado local (`AsyncStorage`), separando claramente a persistência de dados, o gerenciamento de rotas e as telas de interface [2].

| Camada | Tecnologia / Padrão | Propósito no FitTrack |
| :--- | :--- | :--- |
| **Interface** | React Native + Expo Router | Navegação em abas inferior com suporte nativo e web |
| **Estilização** | NativeWind v4 (Tailwind CSS) | Design system coeso com suporte a tema claro e escuro |
| **Armazenamento** | AsyncStorage / React Context | Persistência local robusta e instantânea dos treinos e configurações |
| **Notificações** | Expo Notifications (Local) | Lembretes diários personalizados e avisos de treinos pendentes |
| **Qualidade** | Vitest + TypeScript | Testes unitários determinísticos e checagem estática de tipos |

---

## Funcionalidades e Telas do Aplicativo

O FitTrack está organizado em cinco abas principais acessíveis por uma barra de navegação inferior com feedback tátil e visual:

1. **Aba 🏠 Hoje**: Apresenta o treino agendado para o dia corrente, o progresso percentual em tempo real com barra de conclusão, o status atual (pendente, parcial ou concluído) e a lista interativa de exercícios com marcação de séries. Inclui um cronômetro opcional de descanso entre as séries.
2. **Aba 📅 Semana**: Exibe o calendário semanal interativo com navegação entre semanas, permitindo alternar rapidamente entre os 7 dias, planejar novos exercícios, clonar treinos entre dias ou duplicar toda a estrutura da semana anterior.
3. **Aba 🏋️ Exercícios**: Biblioteca centralizada de exercícios com busca por nome ou grupo muscular, fichas detalhadas (séries, repetições, tempo sob tensão, descanso e observações) e modelos pré-configurados de treino (como *Upper Body* e *Pernas e Potência*) que podem ser aplicados instantaneamente.
4. **Aba 📊 Histórico**: Monitor de consistência que exibe a taxa de conclusão semanal, o total de dias de sequência (*streak*), o tempo acumulado de treino, o calendário semanal com indicadores visuais de conclusão e a lista de treinos realizados com metadados detalhados.
5. **Aba ⚙️ Ajustes**: Central de preferências onde o usuário ativa lembretes diários, configura o horário exato do aviso, gerencia o resumo completo com exercícios e controla o cronômetro de descanso.

---

## Guia de Execução e Desenvolvimento

Para executar o projeto localmente no ambiente de desenvolvimento, utilize os comandos padrão do Expo e do gerenciador de pacotes `pnpm`:

```bash
# Entrar no diretório do projeto
cd /home/ubuntu/fittrack-mobile

# Instalar dependências (caso necessário)
pnpm install

# Executar os testes unitários
pnpm test

# Verificar erros de tipos com TypeScript
pnpm check

# Iniciar o servidor de desenvolvimento (Metro + Web/Mobile)
pnpm dev
```

## Referências

[1] Expo Documentation. **Expo SDK 54 Overview**. Disponível em: <https://docs.expo.dev/>.  
[2] React Native Team. **Architecture and State Management in React Native**. Disponível em: <https://reactnative.dev/>.
