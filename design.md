# Design de Interface e Arquitetura do FitTrack Mobile

## 1. Visão Geral e Filosofia
O **FitTrack** foi desenhado seguindo os princípios das diretrizes **Apple Human Interface Guidelines (HIG)** e padrões modernos de Material Design adaptados para toque móvel (Mobile First). O aplicativo prioriza a **eficiência e velocidade de registro**, garantindo que o usuário consiga interagir durante os exercícios com o mínimo de toques, botões grandes e feedback visual imediato.

---

## 2. Lista de Telas (Abas Principais e Subtelas)

1. **🏠 Hoje (Hoje / Execução do Treino)**
   - Exibe o status do treino do dia atual (data, resumo, progresso em porcentagem).
   - Card de Ação Principal: "Iniciar Treino" ou "Retomar Treino" ou "Marcar como Concluído".
   - Lista interativa de exercícios do dia com contadores de séries e repetições e botão rápido de conclusão de série.
   - Cronômetro de descanso integrado (opcional).

2. **📅 Semana (Planejamento Semanal)**
   - Visão em carrossel ou lista dos 7 dias da semana (com data exata, ex: Segunda-feira — 10/08).
   - Indicador visual rápido de quais dias possuem treinos cadastrados ou concluídos.
   - Opções para adicionar, editar, remover exercícios de um dia, alterar ordem (subir/descer), copiar treino de um dia para outro e duplicar a semana.

3. **🏋️ Exercícios (Biblioteca de Exercícios e Templates)**
   - Lista de exercícios pré-cadastrados (Pull Up, Muscle Up, Agachamento, Plank, etc.) e personalizados.
   - Detalhes do exercício: Nome, Descrição, Grupo Muscular, Séries, Repetições, Descanso e Observações.
   - Criação de **Modelos de Treino (Templates)** (ex: Treino A — Upper Body) para reutilização rápida.

4. **📊 Histórico (Estatísticas e Consistência)**
   - Resumo semanal e mensal: Treinos planejados vs. concluídos, taxa de conclusão, tempo total treinado e sequência de dias (streak).
   - Calendário visual com marcações de dias com treinos concluídos, parciais ou pulados.
   - Registro detalhado de execuções passadas (horário de início/término, duração, séries efetivas).

5. **⚙️ Configurações (Ajustes e Notificações)**
   - Ativação/desativação de notificações diárias no início do dia.
   - Configuração de horário (ex: 08:00).
   - Preferências de som/vibração para o descanso entre séries.
   - Gerenciamento de dados locais (limpar ou exportar backup).

---

## 3. Fluxos Principais de Usuário

- **Fluxo de Planejamento:** O usuário acessa a aba *Semana* ➔ seleciona o dia desejado ➔ adiciona exercícios da biblioteca ou cria um novo ➔ opcionalmente aplica um modelo pronto.
- **Fluxo de Execução:** O usuário abre a aba *Hoje* ➔ toca em "Iniciar Treino" ➔ conclui cada série tocando no botão tátil ➔ o cronômetro de descanso dispara opcionalmente ➔ ao finalizar todas as séries, marca o treino como "Concluído" ➔ o histórico é salvo automaticamente sem alterar os planejamentos futuros.

---

## 4. Escolhas de Cores e Identidade Visual (Brand Palette)
- **Primary:** Azul atlético moderno (`#0284c7` / `#38bdf8`) para foco e energia.
- **Background:** Branco limpo (`#ffffff`) no modo claro e cinza escuro profundo (`#0f172a`) no modo escuro.
- **Surface:** Cinza claro sutil (`#f1f5f9`) e cinza escuro de cartões (`#1e293b`).
- **Success:** Verde esmeralda (`#22c55e`) para treinos concluídos e séries finalizadas.
- **Warning / Muted:** Laranja suave (`#f59e0b`) para treinos parciais e cinza texto (`#64748b`).
