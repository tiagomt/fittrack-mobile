# Project TODO

- [x] Analisar especificações do aplicativo e criar documentação de design
- [x] Configurar estrutura base do projeto móvel e tipos de dados
- [x] Implementar sistema de armazenamento local (AsyncStorage) com dados iniciais de exemplo
- [x] Implementar a aba 🏠 Hoje (Visualização do treino do dia, progresso e execução de séries)
- [x] Implementar a aba 📅 Semana (Planejamento dos 7 dias, adição/edição de exercícios, cópia de treinos)
- [x] Implementar a aba 🏋️ Exercícios (Biblioteca de exercícios e modelos/templates de treino)
- [x] Implementar a aba 📊 Histórico (Estatísticas, resumo semanal, taxa de conclusão e calendário)
- [x] Implementar a aba ⚙️ Configurações (Notificações diárias, horário configurável e preferências)
- [x] Integrar cronômetro de descanso entre séries com opção de som/vibração
- [x] Mapear ícones em icon-symbol.tsx e validar navegação por abas
- [x] Realizar testes finais e verificação de usabilidade e responsividade

- [x] Investigar por que o APK Android instalado carrega o template inicial em vez da aplicação FitTrack customizada
- [x] Corrigir a entrada de navegação e/ou configuração de bundle para o build Android (checkpoint atualizado com o código customizado)
- [x] Validar o bundle de produção Android com `expo export` após a correção

- [x] Corrigir o fluxo de inclusão de um novo exercício no menu Exercícios sem alterar os demais fluxos
- [x] Validar que o novo exercício é salvo e aparece na biblioteca após fechar e reabrir a tela (store persistente e teste de regressão aprovados)

- [x] Corrigir o contraste do botão “Novo exercício” no tema claro
- [x] Garantir que o botão “Adicionar exercício” permaneça visível no modal Android
- [x] Validar o cadastro no tema claro e a regressão das demais telas

- [x] Investigar por que o APK instalado não contém as mudanças do checkpoint atual
- [x] Rastrear e corrigir a origem do bundle usado na compilação Android (versão Expo 1.0.1 e versionCode Android 2)
- [x] Validar um bundle Android limpo e documentar a instalação correta (export Android concluído)
- [ ] Confirmar no dispositivo físico que o APK gerado a partir do novo checkpoint mostra a versão 1.0.1

- [x] Comparar o bundle do checkpoint atual com o artefato usado no APK 1.0.4
- [x] Forçar a publicação do bundle atualizado, evitando cache ou checkpoint anterior (comando `build` agora exporta Android antes do servidor)
- [x] Validar o bundle Android limpo e os dois elementos do cadastro de exercícios no artefato exportado
- [ ] Confirmar no dispositivo físico que o APK publicado contém o bundle atualizado

- [x] Refatorar o botão “Novo exercício” com contraste explícito e independente do tema
- [x] Refatorar o botão “Adicionar exercício” como ação nativa visível fora da área rolável
- [x] Validar o fluxo refatorado no bundle Android exportado e preservar as demais telas (testes, TypeScript, lint e expo export aprovados)
