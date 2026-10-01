export type RequirementPriority = 'indispensavel' | 'importante' | 'desejavel'

export interface Requirement {
  id: string
  title: string
  description: string
  priority: RequirementPriority
}

export const requirements: Requirement[] = [
  {
    id: 'REQ-01',
    title: 'Cadastro e ficha individual do paciente',
    priority: 'indispensavel',
    description: `Como funciona
Ao cadastrar um novo paciente, criar automaticamente uma ficha individual contendo dados pessoais, contato, data de nascimento, profissão, contato de emergência e informações administrativas relevantes. A partir dessa ficha devem ficar vinculados todos os registros daquele paciente: avaliações, evoluções, reavaliações, documentos, exercícios, pagamentos e agendamentos.

Importância
Centraliza todas as informações do paciente e evita registros espalhados em diferentes locais.

Observações
Evitar exigir muitos campos obrigatórios no cadastro inicial. O fisioterapeuta deve conseguir fazer um cadastro rápido e completar depois.`,
  },
  {
    id: 'REQ-02',
    title: 'Dashboard individual do paciente',
    priority: 'indispensavel',
    description: `Como funciona
Ao abrir um paciente, visualizar primeiro um resumo do caso, com informações como queixa/diagnóstico, início do acompanhamento, última sessão, próxima sessão, número de atendimentos, objetivos atuais e alertas importantes. Na mesma tela devem existir atalhos para avaliação, evoluções, reavaliações, exercícios, documentos e financeiro.

Importância
Permite entender rapidamente o momento atual do paciente antes de atendê-lo.

Observações
Essa página precisa ser extremamente limpa. Não quero simplesmente todas as informações do prontuário jogadas na tela.`,
  },
  {
    id: 'REQ-03',
    title: 'Histórico do paciente em linha do tempo',
    priority: 'importante',
    description: `Como funciona
Mostrar cronologicamente tudo que aconteceu durante o acompanhamento: avaliação inicial, sessões realizadas, evoluções, reavaliações, anexos, intercorrências e documentos emitidos. Deve ser possível clicar em um item para abrir seus detalhes.

Importância
Facilita entender a história do tratamento sem precisar procurar informações em várias telas.`,
  },
  {
    id: 'REQ-04',
    title: 'Informações clínicas fixadas em destaque — alertas importantes sobre o paciente',
    priority: 'indispensavel',
    description: `Como funciona
Permitir que o profissional marque determinadas informações como importantes para que permaneçam visíveis ao abrir o prontuário, como cirurgia recente, restrições, alergias informadas, lado acometido ou alguma observação que não pode ser esquecida.

Importância
Algumas informações precisam ser vistas imediatamente e podem se perder no meio das evoluções.

Observações
O alerta deve mostrar quem criou e permitir editar/remover.`,
  },
  {
    id: 'REQ-05',
    title: 'Registro da avaliação inicial',
    priority: 'indispensavel',
    description: `Como funciona
Dentro do paciente deve existir uma avaliação estruturada onde possam ser registrados anamnese, queixa principal, história do quadro, dor, limitações, objetivos, exame físico, testes, medidas, diagnóstico fisioterapêutico e planejamento. A avaliação deve permanecer vinculada à data em que foi realizada.

Importância
É a base clínica para acompanhar o tratamento e comparar posteriormente a evolução.`,
  },
  {
    id: 'REQ-06',
    title: 'Mapa corporal',
    priority: 'desejavel',
    description: `Como funciona
Clicar/desenhar sobre um corpo humano para marcar região da dor, irradiação, edema, cicatriz etc.

Observações
Manter o recurso ilustrativo e fácil de usar.`,
  },
  {
    id: 'REQ-07',
    title: 'Criar modelos próprios de avaliação',
    priority: 'desejavel',
    description: `Como funciona
O profissional deve conseguir montar suas próprias fichas adicionando, removendo e reorganizando campos. Poder criar, por exemplo, modelos diferentes para joelho, ombro, coluna, esportiva, pós-operatório etc. Depois de criados, os modelos ficam disponíveis para serem utilizados com outros pacientes.

Importância
Fisioterapeutas e especialidades diferentes não trabalham com exatamente a mesma avaliação.

Observações
Alterar um modelo no futuro não pode modificar avaliações antigas já preenchidas.`,
  },
  {
    id: 'REQ-08',
    title: 'Evolução individual de cada sessão',
    priority: 'indispensavel',
    description: `Como funciona
Cada atendimento realizado deve permitir registrar uma evolução vinculada automaticamente ao paciente, profissional, data e horário. Deve existir espaço para registrar estado do paciente, mudanças desde a última sessão, condutas realizadas, resposta ao tratamento, intercorrências e planejamento.

Importância
Mantém o histórico clínico organizado e documenta o acompanhamento.`,
  },
  {
    id: 'REQ-09',
    title: 'Templates personalizados de evolução',
    priority: 'desejavel',
    description: `Como funciona
Permitir criar modelos de evolução com campos ou estruturas utilizadas frequentemente. Na hora do atendimento, o profissional escolhe um modelo e apenas completa as informações específicas daquela sessão.

Importância
Diminui bastante o tempo gasto escrevendo registros repetitivos.`,
  },
  {
    id: 'REQ-10',
    title: 'Evolução por voz — ditado/transcrição para evolução',
    priority: 'importante',
    description: `Como funciona
Permitir que, ao terminar a sessão, o fisioterapeuta dite as informações pelo celular ou computador. O áudio é transformado em texto para posteriormente ser revisado pelo profissional antes de entrar definitivamente no prontuário.

Importância
Torna o registro clínico muito mais rápido, principalmente entre um atendimento e outro.

Observações
Nada deve ser salvo definitivamente sem possibilidade de revisão.`,
  },
  {
    id: 'REQ-11',
    title: 'Reavaliação vinculada à avaliação anterior',
    priority: 'indispensavel',
    description: `Como funciona
Permitir realizar uma nova avaliação utilizando os mesmos campos/testes da avaliação anterior, sem sobrescrever os resultados antigos. Cada resultado fica associado à sua data.

Importância
Permite acompanhar objetivamente se o tratamento está produzindo evolução.`,
  },
  {
    id: 'REQ-12',
    title: 'Comparar avaliação e reavaliações',
    priority: 'importante',
    description: `Como funciona
O profissional seleciona duas ou mais avaliações e o sistema apresenta os resultados lado a lado, destacando mudanças em dor, amplitude, força, testes, escalas e demais medidas comparáveis. Exemplo: Flexão do joelho: 92° → 118° → 132°.

Importância
Transforma os dados coletados em uma visão clara da evolução clínica.`,
  },
  {
    id: 'REQ-13',
    title: 'Evolução clínica visual',
    priority: 'importante',
    description: `Como funciona
Dados numéricos registrados ao longo do tratamento devem poder gerar gráficos automaticamente. Ex.: dor, ADM, força, questionários ou outros indicadores escolhidos pelo fisioterapeuta.

Importância
Facilita visualizar tendências e também mostrar objetivamente a evolução ao paciente.`,
  },
  {
    id: 'REQ-14',
    title: 'Metas do tratamento',
    priority: 'indispensavel',
    description: `Como funciona
Permitir criar objetivos específicos para cada paciente e acompanhar seu status, como não iniciado, em andamento e atingido. Deve ser possível registrar quando um objetivo foi criado e quando foi atingido.

Importância
Faz o prontuário acompanhar não apenas o que foi feito, mas para onde o tratamento está caminhando.`,
  },
  {
    id: 'REQ-15',
    title: 'Anexos dentro do prontuário',
    priority: 'indispensavel',
    description: `Como funciona
Permitir anexar imagens, vídeos, PDFs e outros documentos ao paciente, podendo relacioná-los a uma avaliação ou sessão específica e incluir uma descrição.

Importância
Exames, vídeos de movimento, fotos de evolução e outros registros fazem parte do acompanhamento fisioterapêutico.`,
  },
  {
    id: 'REQ-16',
    title: 'IA — resumo inteligente do caso',
    priority: 'indispensavel',
    description: `Como funciona
A IA deve analisar exclusivamente as informações existentes naquele prontuário e gerar uma síntese atualizada contendo quadro atual, evolução, principais limitações registradas, objetivos e acontecimentos recentes relevantes.

Importância
Em tratamentos longos pode haver dezenas de registros. O resumo permite recuperar rapidamente o contexto do caso.

Observações
A IA não pode inventar informações nem alterar o prontuário. O profissional deve conseguir verificar de onde vieram as informações importantes.`,
  },
  {
    id: 'REQ-17',
    title: 'Perguntar à IA sobre o histórico do paciente — busca inteligente do prontuário',
    priority: 'desejavel',
    description: `Como funciona
Dentro da ficha, permitir fazer perguntas sobre aquele prontuário, como “quando começou a relatar dor noturna?”, “qual foi a última ADM registrada?” ou “em quais sessões relatou piora?”. A IA deve localizar a informação e indicar o registro/data de origem.

Importância
Em prontuários extensos, encontrar uma informação específica manualmente pode levar bastante tempo.`,
  },
  {
    id: 'REQ-18',
    title: 'IA para auxiliar na evolução — organizar anotações em evolução clínica',
    priority: 'importante',
    description: `Como funciona
O fisioterapeuta pode escrever tópicos ou ditar informações da sessão e pedir que a IA organize o conteúdo em um texto clínico estruturado. Antes de entrar no prontuário, o resultado obrigatoriamente passa pela revisão e confirmação do profissional.

Importância
Economiza tempo administrativo sem retirar do fisioterapeuta a responsabilidade pelo registro.`,
  },
  {
    id: 'REQ-19',
    title: 'Registro protegido após finalização — integridade do prontuário',
    priority: 'importante',
    description: `Como funciona
Depois que uma avaliação ou evolução for finalizada, o registro original deve ser preservado. Caso seja necessário corrigir ou complementar alguma informação posteriormente, a alteração deve ficar identificada com data, horário e responsável, mantendo histórico do registro anterior quando aplicável.

Importância
O Kineo lidará com prontuários clínicos e precisa manter rastreabilidade das informações.`,
  },
  {
    id: 'REQ-20',
    title: 'Relatório de progresso para o paciente',
    priority: 'indispensavel',
    description: `Como funciona
Criar uma versão visual e simples mostrando evolução, metas atingidas e próximas metas.

Importância
Permite que o paciente visualize de forma clara e objetiva a própria evolução durante o tratamento, facilitando a compreensão dos resultados alcançados e do que ainda precisa ser trabalhado. Também ajuda a aumentar o engajamento e a percepção de valor do acompanhamento fisioterapêutico.

Observações
O relatório deve utilizar apenas dados já registrados pelo fisioterapeuta no prontuário, como avaliações, reavaliações, medidas e metas. Deve ser possível revisar e editar as informações antes de compartilhar com o paciente e gerar uma versão em PDF.`,
  },
  {
    id: 'REQ-21',
    title: 'Programa domiciliar',
    priority: 'desejavel',
    description: `Como funciona
Paciente recebe uma página/link com os exercícios que deve realizar em casa.

Observações
O fisioterapeuta pode anexar isso em PDF e mandar pelo WhatsApp.`,
  },
  {
    id: 'REQ-22',
    title: 'Geração automática de relatório',
    priority: 'indispensavel',
    description: `Como funciona
Selecionar o período e/ou quais registros deseja incluir, e o sistema gerar automaticamente um relatório utilizando informações da avaliação, evoluções, reavaliações, objetivos e resultados obtidos. O profissional deve conseguir editar, acrescentar ou remover informações antes de finalizar e gerar o documento em PDF.

Importância
Agiliza a criação de relatórios, reduz o trabalho manual e permite reunir de forma organizada as informações mais importantes sobre a evolução do paciente, mantendo o profissional responsável pela revisão e aprovação do documento final.

Observações
A IA não deve criar informações que não estejam no prontuário. O profissional deve poder escolher quais informações entram no relatório e, após a revisão, gerar o documento em PDF com seus dados profissionais e identidade visual.`,
  },
  {
    id: 'REQ-23',
    title: 'Agenda integrada ao paciente',
    priority: 'importante',
    description: `Como funciona
Clicar no atendimento da agenda e entrar diretamente na ficha/evolução daquela sessão.`,
  },
  {
    id: 'REQ-24',
    title: 'Pacotes de sessões',
    priority: 'importante',
    description: `Como funciona
Controle automático no formato “10 sessões contratadas / 7 realizadas / 3 restantes”, com manutenção do saldo conforme os atendimentos.`,
  },
  {
    id: 'REQ-25',
    title: 'Alerta de pacote terminando',
    priority: 'importante',
    description: `Como funciona
Avisar quando faltarem, por exemplo, 2 sessões para o fim do pacote.`,
  },
  {
    id: 'REQ-26',
    title: 'Paciente que sumiu — sem retorno e contato pelo WhatsApp',
    priority: 'indispensavel',
    description: `Como funciona
O sistema deve identificar pacientes que estão com tratamento ativo, mas estão há determinado número de dias sem atendimento realizado e/ou sem nenhum atendimento futuro agendado. Esses pacientes devem aparecer em uma área do dashboard, mostrando há quanto tempo não realizam uma sessão e a data do último atendimento.

Deve ser possível configurar após quantos dias o paciente entra nesse alerta e, a partir dessa lista, entrar em contato pelo WhatsApp. O sistema pode disponibilizar uma mensagem pronta de acompanhamento, que o profissional possa editar antes de enviar. Após o contato, registrar que aquele paciente já foi contatado e a data, para evitar mensagens repetidas.

Importância
Ajuda a acompanhar pacientes que interromperam ou se afastaram do tratamento sem necessariamente terem recebido alta, evitando que sejam esquecidos. Também facilita o contato e pode aumentar a continuidade e adesão ao tratamento.

Observações
O envio da mensagem não deve ser automático sem autorização do profissional. Deve ser possível definir o período para considerar um paciente “sem retorno”, ignorar pacientes específicos, marcar alta/encerramento e registrar o contato.

Status sugeridos: Em tratamento → Sem próximo agendamento → Contatado → Aguardando resposta → Retorno agendado → Alta/Tratamento encerrado.`,
  },
  {
    id: 'REQ-27',
    title: 'Agenda visual e integrada aos atendimentos',
    priority: 'indispensavel',
    description: `Como funciona
Ter uma agenda em que o profissional possa escolher a visualização por dia, semana ou mês. Os atendimentos devem aparecer com horário, nome do paciente e status. Ao clicar em um horário, deve ser possível acessar a ficha do paciente e as informações daquele atendimento. Também deve permitir criar, remarcar e cancelar consultas, além de visualizar horários livres.

Deve existir lembrete automático de agendamento, com antecedência configurável (por exemplo 24 horas antes), enviado pelo WhatsApp, de preferência permitindo que o paciente confirme ou peça remarcação.

Importância
Organiza melhor a rotina de atendimentos, diminui esquecimentos e faltas e facilita a confirmação das consultas, sem que o profissional precise enviar lembretes manualmente.

Observações
Permitir configurar individualmente se o paciente recebe lembretes e em qual antecedência. Status visuais: agendado, aguardando confirmação, confirmado, realizado, cancelado e falta. Também permitir horários recorrentes.

Uma automação posterior seria a confirmação automática pelo WhatsApp, mudando o status da agenda conforme a resposta do paciente.`,
  },
  {
    id: 'REQ-28',
    title: 'Agenda visual de atendimentos',
    priority: 'indispensavel',
    description: `Como funciona
Ter uma agenda onde o profissional possa escolher a forma de visualização: dia, semana ou mês. Os atendimentos devem aparecer de forma visual, com horário, nome do paciente e status. Ao clicar em um horário/paciente, deve ser possível acessar diretamente as informações daquele atendimento e a ficha do paciente. Também deve permitir criar, remarcar ou cancelar atendimentos e visualizar facilmente os horários disponíveis.

Importância
Facilita a organização da rotina e permite que o profissional visualize rapidamente seus pacientes, horários livres e atendimentos do dia, da semana ou do mês, sem precisar utilizar uma agenda externa.

Observações
Diferenciar visualmente os status: agendado, confirmado, realizado, cancelado e falta. Permitir atendimentos recorrentes (ex.: toda terça-feira às 19h) e selecionar uma cor por tipo de agendamento.`,
  },
  {
    id: 'REQ-29',
    title: 'Lista de espera',
    priority: 'desejavel',
    description: `Como funciona
Cancelou 19h? O sistema mostra pacientes que querem antecipar atendimento naquele horário.`,
  },
  {
    id: 'REQ-30',
    title: 'Confirmação de consulta',
    priority: 'importante',
    description: `Como funciona
Enviar lembrete/solicitação de confirmação antes da sessão.`,
  },
  {
    id: 'REQ-31',
    title: 'Assinatura e documentos',
    priority: 'importante',
    description: `Como funciona
Termos, relatórios, recibos e documentos vinculados ao paciente, com identidade visual do profissional/clínica (ex.: documento de autorização de uso de imagem).`,
  },
  {
    id: 'REQ-32',
    title: 'Acesso individual, equipe e clínica',
    priority: 'indispensavel',
    description: `Como funciona
O sistema deve permitir uso por profissional individual e também por clínicas com vários profissionais. Cada pessoa deve possuir seu próprio login, e o administrador da clínica poderá cadastrar integrantes da equipe e definir quais informações cada perfil pode visualizar ou alterar. Por exemplo, recepção pode acessar agenda e cadastro, mas não necessariamente informações clínicas; fisioterapeuta acessa seus pacientes e prontuários; gestor pode visualizar informações administrativas e indicadores da clínica.

Um mesmo profissional que trabalhe sozinho e também em uma clínica deve conseguir alternar entre seus ambientes sem precisar criar contas completamente diferentes.

Importância
Permite que o Kineo seja utilizado tanto pelo fisioterapeuta autônomo quanto por clínicas maiores, mantendo organização, privacidade e controle de acesso às informações dos pacientes.`,
  },
  {
    id: 'REQ-33',
    title: '“Meu dia” — uma home assistente de trabalho',
    priority: 'desejavel',
    description: `Como funciona
Em vez de um dashboard cheio de números, a home deve funcionar como assistente, por exemplo:

Bom dia, Nicole.
Hoje
7 atendimentos
Primeiro paciente às 08:00
1 paciente ainda não confirmou
1 reavaliação prevista
2 pacientes estão sem retorno
1 pacote está terminando

E abaixo já aparecem os atendimentos.

Importância
Faz o sistema funcionar como um assistente de trabalho, e não apenas como um lugar onde você guarda prontuários.`,
  },
  {
    id: 'REQ-34',
    title: 'Pendências clínicas inteligentes',
    priority: 'desejavel',
    description: `Como funciona
O sistema percebe situações como:
- Paciente está há 30 dias sem reavaliação.
- Você definiu 4 objetivos, mas nenhum foi atualizado recentemente.
- Última medida de força registrada há 6 semanas.
- Paciente está na 9ª sessão e não possui reavaliação.

Importância
Alertas e pendências do acompanhamento. Não é a IA dizendo o que você deve fazer clinicamente. É o sistema lembrando informações administrativas/clínicas que você mesmo configurou.`,
  },
  {
    id: 'REQ-35',
    title: 'Alta do paciente de verdade',
    priority: 'importante',
    description: `Como funciona
Muitos sistemas dão atenção enorme à entrada do paciente e praticamente nenhuma à saída. Criar um fluxo “Finalizar tratamento”: o Kineo reúne avaliação inicial + última reavaliação + objetivos + principais resultados e ajuda a gerar um resumo de alta.

Registrar o motivo: alta / abandono / encaminhamento / pausa / outro. Depois esse paciente deixa de aparecer como “sem retorno”.`,
  },
  {
    id: 'REQ-36',
    title: 'Área do paciente — sem virar outro aplicativo complicado',
    priority: 'importante',
    description: `Como funciona
Área simples onde o paciente encontra, por exemplo:
- Olá, Mariana
- Próxima sessão: terça, 19h
- Confirmar atendimento
- Meu tratamento: 3 de 5 objetivos atingidos
- Meus exercícios
- Minha evolução
- Orientações do fisioterapeuta
- Documentos

Importância
Cria uma relação mais pessoal com o tratamento, sem transformar isso em outro aplicativo complicado.`,
  },
]
