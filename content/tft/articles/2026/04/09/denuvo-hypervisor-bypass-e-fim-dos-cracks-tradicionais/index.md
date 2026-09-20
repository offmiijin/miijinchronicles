---
article: true
date: 2026-04-09T21:18:36-03:00
lastmod: 2026-04-09
showTableOfContents: false
tags: ["windows", "pirataria", "segurança", "tecnologia", "denuvo", "crack"]
title: "DENUVO, HyperVisor Bypass e Fim dos Cracks Tradicionais"
slug: "denuvo-hypervisor-bypass-e-fim-dos-cracks-tradicionais"
aliases: [
  "/tft/posts/2026/04/09/denuvo-hypervisor-bypass-e-fim-dos-cracks-tradicionais/",
  "/2026/04/09/denuvo-hypervisor-bypass-e-fim-dos-cracks-tradicionais/",
  "/denuvo-hypervisor-bypass-e-fim-dos-cracks-tradicionais/"
]
---

No momento em que escrevo este artigo (03/04/2026) 18 jogos já foram contornados com o novo método de crack, o "HyperVisor Bypass". A Irdeto, por trás do DENUVO já deu uma resposta dizendo que está trabalhando em atualizações de segurança.

Este artigo tem o cunho informativo e opinativo, não leve como verdades absolutas o que está escrito aqui. Sempre pesquise por conta própria e tire suas próprias conclusões. Anexarei ao final do artigo todas as informações nas quais eu baseio minha escrita.

## A Proteção de Conteúdos Digitais
O DRM, ou _Digital Rights Management_, é um mecanismo de gestão com várias ferramentas para proteger conteúdos digitais. Ele permite que os proprietários de conteúdos imponham restrições específicas, como limitar a reprodução, o compartilhamento ou a modificação de arquivos.

O objetivo principal do DRM é equilibrar a acessibilidade ao conteúdo com a proteção contra pirataria. Há diversas tecnologias usadas na tentativa de bloquear acessos não autorizados ou distribuições ilegais, incluindo **chaves de ativação**, **criptografia de conteúdo**, **restrições em tempo de execução**, etc.

Apesar de o mecanismo ser eficiente, ele não é impenetrável, sendo quebrado por métodos como **engenharia reversa** para a criação de **cracks** ou **patches** de softwares e o mais novo **HyperVisor Bypass**, que em especial burla facilmente o **DENUVO**.

## O DENUVO
O DENUVO é uma tecnologia comercial de proteção de software desenvolvida pela DENUVO Software Solutions GmbH, adquirida pela Irdeto em 2018. Na última década, o DENUVO tem sido a principal solução para a prevenção de pirataria, principalmente no período pós-lançamento, quando ocorre a maior parte das vendas de um título.

Diferente de DRMs tradicionais, o **DENUVO NÃO É UM DRM**, mas sim um software Anti-Tamper que envolve outros DRMs, como o do Steam, Epic Games ou proteções proprietárias de empresas como a CAPCOM. O objetivo do DENUVO não é proteger o jogo, mas sim envolver o DRM propriamente dito e garantir que ele não seja alterado por meio da monitorização durante a execução.

Em caso de modificação do código do jogo, como a remoção da verificação de licença, o DENUVO detecta a alteração e encerra o jogo. Ele faz isso de diversas maneiras, como verificações de **CPUID**, **KUSER_SHARED_DATA**, **PEB**, etc.

### O Dilema
Seu dilema central reside na tensão entre a proteção de receitas e a experiência do usuário legítimo, gerando controvérsias desde seu lançamento em 2014. O DENUVO sempre foi alvo de críticas dos jogadores em relação ao desempenho e à performance dos jogos, sendo apontados quedas de FPS, lentidão em loadings e desgaste acelerado de hardware (como SSDs) devido às suas verificações constantes.

A Irdeto alega que o DENUVO não afeta o desempenho ou a durabilidade do hardware, prometendo aos jogadores benchmarks para refutar as acusações de impacto no desempenho. No entanto, até hoje, esses benchmarks não foram entregues.

### Como o DENUVO Opera?
O funcionamento do DENUVO é altamente sofisticado, sendo integrado de forma profunda no código-fonte do jogo e atuando em múltiplas camadas de segurança que combinam criptografia, ofuscação e verificações em tempo real.

#### Mecanismos Fundamentais de Operação
- **Virtualização de Código**: As funções críticas do jogo são convertidas de instruções nativas x86-64 para bytecode personalizado. Esse bytecode é executado dentro de uma máquina virtual (VM) privada incorporada no executável do jogo. O VMProtect adiciona uma camada adicional de ofuscação baseada em VM por cima da própria VM do DENUVO, resultando em uma lógica invisível para ferramentas de desmontagem tradicionais. Ao inspecionar o código, são visíveis apenas caracteres sem sentido, escondendo a lógica real nos interpretadores da VM.
- **Sistema de Tokens Vinculados ao Hardware**: O software gera uma identidade digital única para o computador do usuário. Essa identidade coleta dados específicos da máquina durante a gameplay. O DENUVO contata os servidores de ativação online e faz com que eles emitam um token criptografado com validade temporal limitada. Esses tokens são verificados em tempo de execução; sem tokens válidos, os blocos de código protegidos não são executados. Os dados coletados incluem:
	- **ID da CPU** (resultados da instrução **CPUID**).
	- **Número de série dos discos**.
	- **ID de instalação do Windows**.
	- **Identificadores da placa-mãe**.

#### Etapas de Funcionamento e Verificação
- **Fase de Ativação e Geração de Identidade**: Ao iniciar o jogo pela primeira vez (ou após atualizações de hardware), o software entra em contato com os servidores de ativação online. Nessa etapa, o sistema realiza o mapeamento do hardware e valida a titularidade da licença junto à plataforma de distribuição (ex.: Steam). Após a validação, o token de hardware é armazenado localmente para permitir execuções em modo offline, embora o sistema exija revalidações periódicas.
- **Execução de Pontos de Gatilho (Trigger Points)**: Diferente de proteções antigas que verificavam a licença apenas no início, o DENUVO insere centenas de "pontos de gatilho" espalhados por todo o código do jogo. Esses pontos de gatilho são verificados diversas vezes durante a execução do jogo, como em telas de carregamento, menus ou mesmo durante o processamento de física e renderização de quadros. Essa é a razão pela qual métodos tradicionais de crack se tornam inviáveis, pois é necessário corrigir essas verificações manualmente.
- **Verificações de Integridade do Ambiente (Anti-Analysis)**: Durante a execução, o DENUVO realiza uma série de testes técnicos para detectar tentativas de análise ou fraude:
	- **Detecção de Hipervisores e VMs**: O software consulta o bit 31 do registro ECX através da instrução **CPUID** para verificar se está rodando dentro de uma máquina virtual ou sob a vigilância de um hipervisor não autorizado.
	- **Monitoramento de Tempo (RDTSC)**: Utiliza a instrução **RDTSC** (Read Time-Stamp Counter) para medir o tempo exato de ciclos de CPU entre operações. Se houver uma discrepância significativa de tempo (indicando que o código está sendo analisado por um debugger), o jogo é encerrado.
	- **Verificação de Estruturas do SO**: O software monitora estruturas críticas do Windows, como o **KUSER_SHARED_DATA** (a partir do endereço 0x7FFE0000) e o **PEB** (Process Environment Block), para assegurar que o sistema operacional não sofreu modificações que possam camuflar ferramentas de crack.
	- **Busca por Debuggers**: Emprega APIs como **IsDebuggerPresent()** e monitora variáveis de kernel como **KdDebuggerNotPresent** para identificar se há depuradores ativos no sistema.

## HyperVisor Bypass e a Morte do DENUVO
### O Que é um Hipervisor?
Um hipervisor é um software, firmware ou hardware que cria, gerencia e executa máquinas virtuais (VMs), permitindo que vários sistemas operacionais sejam executados de forma isolada em um único servidor. Ele atua como uma camada de abstração entre o hardware físico (host) e as VMs (guests), alocando recursos como CPU, memória, armazenamento e rede de maneira eficiente e segura. Os hipervisores são classificados em dois tipos principais com base na sua arquitetura e implementação:
- **Hipervisor Tipo 1 (Bare-Metal ou Nativo)**: Executa diretamente no hardware físico, sem a intermediação de um sistema operacional host. Ele tem acesso irrestrito aos recursos do hardware, proporcionando maior desempenho e isolamento, o que o torna ideal para ambientes empresariais de alta demanda. Nessa configuração, o hipervisor atua como o "sistema operacional" primário, gerenciando as VMs como processos filhos.
- **Hipervisor Tipo 2 (Hospedado ou User-Level)**: Opera sobre o sistema operacional host existente (ex.: Windows ou Linux), funcionando como um software adicional. Ele apresenta um overhead maior devido à dependência do host, resultando em desempenho inferior para cargas intensivas.

#### Onde o Hipervisor Opera?
A arquitetura de processadores x86/x64 (Intel e AMD) define níveis de privilégios para controle de acesso e segurança. São implementados quatro níveis de privilégio, conhecidos como **rings** (anéis), organizados em uma hierarquia de acesso ao hardware:
- **Ring 3 (Nível de Usuário)**: Anel de menor privilégio, destinado a aplicações e processos do usuário. Aqui, o acesso direto ao hardware é proibido, e instruções privilegiadas (ex.: gerenciamento de memória física) causam exceções se executadas. O DENUVO roda nessa camada.
- **Ring 1 e 2**: Níveis intermediários, raramente utilizados em sistemas contemporâneos, mas historicamente reservados para drivers ou sub-sistemas com privilégios parciais.
- **Ring 0 (Nível de Kernel)**: Anel de alto privilégio para o núcleo do sistema operacional (kernel), drivers de dispositivos e sistemas anti-cheat (como Vanguard ou BattlEye). Permite execução de instruções sensíveis, como manipulação de interrupções e I/O de hardware.
- **Ring -1 (Nível do Hipervisor)**: É onde reside o hipervisor (SimpleSvm.sys para AMD ou hyperhv.dll para Intel). Ele introduz extensões de virtualização como Intel VT-x (anteriormente Vanderpool) ou AMD-V (Secure Virtual Machine), operando em um modo de "root" ou "non-root", abaixo do kernel do sistema operacional. Isso permite que o hipervisor monitore ou restrinja o kernel.

### O Que é o Método HyperVisor Bypass?
O HyperVisor Bypass refere-se a uma técnica avançada de virtualização que opera em um nível mais profundo do hardware do computador, especificamente no Ring -1 do processador, abaixo do nível do kernel do sistema operacional. Diferente dos métodos tradicionais de cracking, que envolvem a remoção cirúrgica do DRM por meio de engenharia reversa (o que pode demorar meses), esse bypass utiliza hipervisores personalizados ou modificados para isolar o código do DENUVO do sistema host. Ele intercepta instruções da CPU e fornece dados falsos à proteção DRM, enganando o sistema e fazendo com que o jogo acredite que a autenticação está ativa, sem alterar o código original do jogo.

#### Como funciona?
O funcionamento fundamental desse método explora as capacidades de virtualização de processadores modernos (principalmente x86/x64 de Intel e AMD), com tecnologias como Intel VT-x e AMD-V, para inserir uma camada de controle abaixo do nível do kernel. O método inclui um driver no modo do Windows que se insere como um hipervisor personalizado do tipo bare-metal, controlando todos os "anéis" acima, como o kernel, drivers, sistema operacional e o próprio hardware. Ele intercepta e manipula as verificações do DENUVO sem alterar o código original do jogo, criando uma ilusão de autenticação válida. O processo **NÃO REMOVE O DENUVO**, mas o "engana" em um ambiente virtualizado isolado, alimentando-o com dados falsos para que suas verificações de segurança sejam validadas positivamente.

#### Requisitos de Configuração
A implementação desse método exige a desativação de diversas camadas de segurança nativas do Windows 10/11, uma vez que outro hipervisor não pode coexistir facilmente com o hipervisor nativo da Microsoft (Hyper-V). Eles optaram por fazer com que esses recursos de segurança só funcionem em um hipervisor oficial. O usuário é instruído a realizar as seguintes ações (no método **Kirigiri**):
- **Desativar o Memory Integrity (HVCI)**: A **Memory Integrity**, também conhecida como **HVCI**, é um componente da _Virtualization-based Security (VBS)_ no Windows. Ela utiliza o hipervisor para isolar e proteger a integridade do código executado no kernel-mode, impedindo que drivers ou módulos não assinados (não oficiais) modifiquem a memória do sistema operacional em tempo de execução. Desabilitá-la permite que o hipervisor customizado carregue drivers ou módulos não assinados sem interrupções.
- **Desativar o Credential Guard**: O **Credential Guard** é uma funcionalidade de segurança integrada no Windows que utiliza o VBS para isolar credenciais sensíveis (como hashes de senhas NTLM, tickets Kerberos e chaves de autenticação) em um ambiente virtualizado seguro, inacessível ao kernel principal ou a processos maliciosos. Desabilitá-lo é necessário para que o bypass não interfira na partição isolada do Credential Guard, causando conflitos ou detecções de integridade.
- **Desativar o Windows Hello**: O Windows Hello é um sistema de autenticação biométrica e PIN integrado ao Windows, que substitui senhas tradicionais por reconhecimento facial, digital ou PIN multifator. Apesar de esse recurso não depender diretamente do hipervisor, ele interage com mecanismos de autenticação que utilizam o VBS e o TPM, que podem entrar em conflito com o hipervisor customizado.
- **Desativar o Hyper-V**: O **Hyper-V** é o hipervisor de Tipo 1 (Bare-Metal) nativo do Windows, permitindo a criação de máquinas virtuais e suportando features de virtualização como VBS. Desativá-lo é extremamente necessário, pois o hipervisor customizado deve ter controle total do Ring -1, sem interferência do Hyper-V nativo.
- **Desativar o Driver Signature Enforcement (DSE)**: O **Driver Signature Enforcement (DSE)** é uma política de segurança do Windows que exige que todos os drivers de kernel sejam assinados digitalmente pela Microsoft ou editores confiáveis antes de serem carregados. Desativá-lo é importante, já que o bypass utiliza drivers customizados não assinados para inicializar o hipervisor customizado; desativá-lo permite o carregamento de drivers não assinados.

#### Componentes Técnicos do Ataque
Vamos tomar em consideração o crack para o jogo "Resident Evil Requiem". Os desenvolvedores de grupos como o **MKDEV** e **Kirigiri** tiveram que contornar uma pilha com **5 camadas de DRM**:

**Steam + DENUVO Anti-Tamper + Capcom Anti-Tamper + VMProtect + SteamStub**

O bypass é composto por uma cadeia de componentes que afetam quatro níveis de privilégios da CPU:
- **EfiGuard (Ring -2)**: Na fase de firmware (UEFI), o **EfiGuard (EfiGuardDxe.efi)** é executado antes mesmo do Windows iniciar. Ele contorna a **verificação de assinatura de drivers (DSE)**, permitindo que drivers do kernel não assinados sejam carregados sem serem bloqueados. O **PathGuard** também é contornado, que detectaria modificações no kernel e causaria uma tela azul.
- **Drivers de Kernel (SimpleSvm.sys / hyperkd.sys)**: No Ring -1/0 (hipervisor + kernel), é carregado um dos seguintes, dependendo da CPU:
	- **AMD**: O arquivo **`SimpleSvm.sys`** é carregado. Trata-se de um hipervisor AMD SVM independente que lida com tudo: interceptação de CPUID, falsificação de RDTSC, interceptação de MSR, falsificação de KUSER_SHARED_DATA e a aplicação do patch KdDebuggerNotPresent.
	- Intel: O arquivo **`hyperkd.sys`** é carregado. Trata-se de um driver shim leve que importa o **`hyperhv.dll`** (uma versão modificada do projeto de código aberto HyperDbg). Juntos, eles oferecem os mesmos recursos por meio do Intel VMX: interceptação de CPUID, falsificação de RDTSC, falsificação de KUSER_SHARED_DATA e a aplicação do patch KdDebuggerNotPresent.
- **Manipulação de Estruturas de Memória**: O mecanismo também altera estruturas críticas como o **KUSER_SHARED_DATA** e o **Bloco de Ambiente de Processo (PEB)** para esconder a presença de depuradores ou do próprio hipervisor, além de ajustar controladores de tempo para que o DRM não detecte a latência causada pelo processo de interceptação.
- **Emulação de Plataforma (Ring 3)**: No Ring 3 (Modo de Usuário), o **ColdClientLoader** inicia o executável do jogo (re9.exe) com as DLLs do Goldberg Steam Emulator no lugar do cliente Steam original. Isso contorna a autenticação do Steam e o SteamStub, indicando que o jogo é de propriedade legítima e está sendo executado no modo offline. O **`KIRIGIRI.dll`** também corrige endereços estáticos no executável do jogo para contornar o DRM da Capcom e o SteamStub.

#### Fluxo de Interceptação e Spoofing (VM Exits)
O coração do mecanismo de bypass é a interceptação dinâmica de instruções de CPU. O DENUVO realiza consultas constantes ao hardware para verificar a legitimidade da licença, utilizando instruções específicas como **CPUID** e **RDTSC**.
- **VM Exit**: Quando o jogo executa uma instrução de consulta de hardware, o processador gera um evento chamado "VM Exit", que pausa temporariamente o sistema operacional e transfere o controle para o hipervisor.
- **Fornecimento de Dados Falsos (Spoofing)**: O hipervisor customizado intercepta a solicitação. Em vez de permitir que a CPU real responda, o hipervisor insere um ID de hardware falsificado pré-autorizado. Esses dados simulam um ambiente licenciado, geralmente replicando a identidade de hardware para a qual uma chave de ativação legítima foi gerada.
- **Retorno ao Guest**: Após fornecer a resposta falsa, o hipervisor devolve o controle ao sistema operacional. O DRM recebe os dados, acredita que o ambiente é autêntico e permite que o jogo continue a execução sem interrupções.

### É um Método Seguro?
Não.

O uso de hipervisores customizados introduz riscos de segurança maiores do que as técnicas convencionais de pirataria. Ao desativar as proteções do Windows, como a **Memory Integrity (HVCI)**, o **Credential Guard** e o **Driver Signature Enforcement (DSE)**, você está ignorando décadas de pesquisa em segurança e descartando o que especialistas consideram essencial nos dias de hoje.

Isso abre margem para a instauração de classes comuns de vulnerabilidades de software. Se um malware mais avançado atingir sua máquina, como **rootkits** e **bootkits**, você estaria entregando o controle do seu PC a pessoas que lançaram esses arquivos, com a possibilidade de elas fazerem **QUALQUER COISA**, incluindo a instalação de malwares que sobrevivem mesmo após a formatação do disco.

O uso generalizado do método vai encorajar pessoas com más intenções a lançarem arquivos de jogos e hipervisores maliciosos, já que se espera que as pessoas baixem esses arquivos e desativem todas as proteções sem ao menos uma verificação. Possivelmente, isso se tornará um vetor de infecção muito popular, pois permitirá que pessoas mal-intencionadas sequestrem completamente o computador das vítimas nas sombras.

No fim das contas, decidir se algumas horas de divertimento valem todos esses riscos é algo que você terá que escolher por si mesmo.

### A Morte do DENUVO
Embora existam declarações da comunidade pirata de que o "DENUVO está morto", não é correto afirmar que isso seja verdade. Afinal, a briga entre grupos de pirataria e o DENUVO vem se estendendo desde seu lançamento. Parece uma derrota para a Irdeto, pois com o novo método de bypass, jogos podem ser "quebrados" no **Dia Zero** (mesmo dia do lançamento oficial), como foram os títulos _Resident Evil Requiem_ e _Crimson Desert_. No entanto, é importante lembrar que não há uma remoção de fato, apenas um contorno, e esse contorno pode custar caro para usuários inexperientes, considerando a complexidade e as brechas que deixam o computador do usuário vulnerável.

É difícil considerar que a tecnologia está "morta". Com o cenário atual, é fácil afirmar que isso será um novo capítulo em um jogo permanente entre "gato e rato", com os grupos warez buscando e melhorando métodos para contornar e quebrar DRMs, enquanto empresas especializadas reforçam suas tecnologias anti-pirataria.

#### A Resposta da Irdeto/DENUVO
O chefe de comunicações da Irdeto, Daniel Butschek, afirma:

> _"Já estamos trabalhando em versões de segurança atualizadas para os jogos afetados por falhas de contorno do hipervisor. Para os jogadores, o desempenho não será prejudicado por essas medidas de segurança reforçadas."_

Essas contramedidas serão divulgadas oportunamente. Usuários especulam que, para combater as violações do hipervisor, o DENUVO terá que operar no mesmo nível de privilégio que o hipervisor, no caso o Ring -1. Mas Butschek diz:

> _"Para resolver as soluções alternativas baseadas em hipervisor, não será necessário que o DENUVO passe para o Ring -1 ou para um nível mais profundo ainda do kernel, e essa não é a direção que estamos seguindo."_

Os possíveis métodos que o DENUVO pode adotar para tentar impedir o bypass incluem o uso da instrução **_Read Time-Stamp Counter_ (RDTSC)** para medir a latência entre instruções da CPU. Assim, se a diferença entre os ciclos for maior do que as velocidades normais do hardware, eles podem perceber que um hipervisor está interceptando a instrução e encerrar o jogo.

Pode ser empregada análise que monitora padrões de uso de energia ou eviction de cache exclusivos de ambientes virtualizados, embora tais métodos apresentem riscos de falsos positivos em hipervisores legítimos.

A FitGirl sugeriu que a Irdeto também poderia passar a realizar verificações diárias dos tickets de licença, embora isso fosse um incômodo para usuários legítimos e ainda pudesse ser contornado.

Outro método pode ser ajustes do lado do servidor nos protocolos de desafio-resposta da DENUVO, potencialmente incorporando heurísticas anti-VM, como detecção de hardware sintético, assinaturas de tempo anômalas ou verificação de virtualizações aninhadas.

## Fim dos Cracks Tradicionais
Apesar da velocidade em que os jogos são burlados com o novo método e seus avanços significativos no cenário de pirataria, não há isenção de preocupações, pois ainda requer a desativação de camadas de proteções cruciais para seu funcionamento. Os cracks tradicionais continuarão sendo desenvolvidos e aprimorados por diversas razões estratégicas e técnicas. Uma delas é que, enquanto a comunidade não encontrar uma maneira de automatizar e proteger o processo do novo método, a "quebra" tradicional continuará sendo o padrão de excelência para a preservação e segurança do sistema.

### O "Padrão Ouro" da Pirataria
Antes da divulgação do "HyperVisor Bypass", os jogos eram "quebrados" de maneira bruta, através de **engenharia reversa**, modificando o executável do jogo e neutralizando as verificações de DRM. Cracks tradicionais operam majoritariamente no Ring 3 (modo de usuário), funcionando de maneira isolada do hardware e do kernel, o que limita o impacto de possíveis códigos maliciosos ao próprio arquivo executável.

A cena de cracking contra o DENUVO envolveu grupos históricos e indivíduos que competiam por releases rápidos e de alta qualidade. Grupos como **CPY (Conspir4cy)**, **CODEX**, **SKIDROW**, **3DM** e **STEAMPUNKS** eram famosos por "quebrar" jogos com DENUVO, mas desistiram por conta de riscos legais, esgotamento pessoal, falta de monetização e, principalmente, a evolução técnica do DENUVO (de v3 para v16+).

#### EMPRESS e "O Fim de Uma Era"
EMPRESS é uma figura que se identificava individualmente como uma jovem russa e tinha a grande especialidade em quebrar jogos DENUVO sozinha — uma das poucas crackers capazes de superar sua proteção. Sua motivação ideológica era combater o "controle corporativo" sobre jogos digitais, promovendo a visão de software como um bem público sem licenças restritivas.

Ela se destacava por cracks "limpos" e rápidos (dias ou semanas após o lançamento), superando grupos inteiros. Liberou cracks para mais de 20 títulos AAA, incluindo **DOOM Eternal**, **Red Dead Redemption** e **Hogwarts Legacy**. Mas tudo isso cessou no final do ano de 2025, quando ela publicou em seu canal no Telegram um PDF intitulado "End Of An Era - Empress", anunciando sua aposentadoria citando fadiga e a complexidade crescente do DENUVO.

#### O Sucessor Espiritual, Voices38
Voices38 é um cracker independente emergente na cena warez, ativo desde meados de 2025, considerado por muitos como o "sucessor espiritual" de EMPRESS devido à sua especialização em DENUVO e VMProtect.

Diferente de grupos coletivos, Voices38 trabalha sozinho, focando em técnicas "tradicionais" de engenharia reversa avançada para bypass de proteções de hardware e servidor. Suas liberações são anunciadas diretamente no Reddit (u/voices38), sem colaboração com repackers.

Seu impacto vem sendo notável desde a aposentadoria da EMPRESS e o surgimento do novo método "HyperVisor Bypass". Sua identidade permanece anônima, e ele enfatiza não querer discutir planos futuros para evitar detecção. Voices38 representa a transição na cena para crackers individuais em uma era de DRMs mais integrados.

# Referências
- [Digital rights management | wikipedia](https://en.wikipedia.org/wiki/Digital_rights_management#Technologies)
- [Denuvo | wikipedia](https://en.wikipedia.org/wiki/Denuvo)
- [Deep Dive — What is Hypervisor? How does it work? Should I Revert All Settings and Restart My PC via the VBS Script After Each Play Session Using Hypervisor? If I use it, can I get hacked visiting a website? etc | reddit](https://www.reddit.com/r/PiratedGames/comments/1s1vnkc/deep_dive_what_is_hypervisor_how_does_it_work/)
- [Denuvo pretende oferecer benchmarks para provar que não prejudica games | adrenaline](https://www.adrenaline.com.br/games/denuvo-pretende-oferecer-benchmarks-para-provar-que-nao-prejudica-games/)
- [Denuvo não trouxe testes provando que não afeta o desempenho pois jogadores alegariam fraude | gamevicio](https://www.gamevicio.com/noticias/2024/10/denuvo-explica-por-que-ainda-nao-apresentou-provas-do-desempenho/)
- [Why Denuvo won't move to Kernel Level Even After The Hypervisor Crack | reddit](https://www.reddit.com/r/PiratedGames/comments/1s180eg/why_denuvo_wont_move_to_kernel_level_even_after/)
- [Denuvo Hypervisor Bypass Situation Explained | youtube](https://youtu.be/P1ZcUXknL8Y?si=vKIO6yDimHS1ecpA)
- [Hipervisor | wikipedia](https://pt.wikipedia.org/wiki/Hipervisor)
- [CPU Ring Architecture: Security Implications from Ring 3 to Ring -1 | intelligencex](https://blog.intelligencex.org/cpu-privilege-levels-user-kernel-hypervisor-security)
- [Qual é a diferença entre hipervisores tipo 1 e tipo 2? | aws](https://aws.amazon.com/pt/compare/the-difference-between-type-1-and-type-2-hypervisors/)
- [O que é um hypervisor? | ibm](https://www.ibm.com/br-pt/think/topics/hypervisors)
- [Hypervisor-based bypasses defeat Denuvo with day-zero cracks, but a countermeasure is already in the works | tweaktown](https://www.tweaktown.com/news/110787/hypervisor-based-bypasses-defeat-denuvo-with-day-zero-cracks-but-a-countermeasure-is-already-in-the-works/index.html)
- [Enable virtualization-based protection of code integrity | microsoft](https://learn.microsoft.com/en-us/windows/security/hardware-security/enable-virtualization-based-protection-of-code-integrity?tabs=security)
- [Configure Credential Guard | microsoft](https://learn.microsoft.com/en-us/windows/security/identity-protection/credential-guard/configure?tabs=intune)
- [Defeating Windows Credential Guard | incendium](https://www.incendium.rocks/posts/Defeating-Windows-Credential-Guard/)
- [Common questions about Windows Hello for Business | microsoft](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/faq)
- [Virtualization applications don't work together with Hyper-V and Hyper-V-based features | microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/application-management/virtualization-apps-not-work-with-hyper-v?tabs=controlpanel)
- [Hypervisor Bypass And YOU! - A short PSA | reddit](https://www.reddit.com/r/PiratedGames/comments/1rzh3fz/hypervisor_bypass_and_you_a_short_psa/)
- [What's the new Hypervisor bypass method? And is the DSE bypass dead? | reddit](https://www.reddit.com/r/PiratedGames/comments/1ry16o1/whats_the_new_hypervisor_bypass_method_and_is_the/)
- [How to disable kernel driver digital signature enforcement (DSE) without test mode? | hexderef](https://hexderef.com/bypass-driver-digital-signature-enforcement-dse)
- [I am going to explain in simple, understandable terms what this new Hypervisor method is, how it works, why it can be risky, and why it can also be safe. This post is for people struggling to understand because of all the fancy tech lingo, I will try to make it simple and easy to understand | reddit](https://www.reddit.com/r/PiratedGames/comments/1rt5s0w/i_am_going_to_explain_in_simple_understandable/)
- [Awareness about Hypervisor vs Traditional Cracks (Please be Safe) | reddit](https://www.reddit.com/r/PiratedGames/comments/1rg03v3/awareness_about_hypervisor_vs_traditional_cracks/)
- [Hypervisor Bypasses vs. Normal Patching in Modern Denuvo DRM | 2026 | tweaktrove](https://tweaktrove.com/hypervisor-bypasses-vs-normal-patching-denuvo-drm-2026/)
- [Hypervisor Bypass: Denuvo Will Upgrade | gnoppix](https://forum.gnoppix.org/t/hypervisor-bypass-denuvo-will-upgrade/5389)
- [Why Denuvo won't move to Kernel Level Even After The Hypervisor Crack | reddit](https://www.reddit.com/r/PiratedGames/comments/1s180eg/why_denuvo_wont_move_to_kernel_level_even_after/)
- [Denuvo Targets Hypervisor Exploits With New Countermeasures, Promises Zero Performance Impact | tech4gamers](https://tech4gamers.com/denuvo-targets-hypervisor-exploits/)
- [Game Pirates Beat Denuvo with Hypervisor Bypasses — Irdeto Promises Countermeasure | torrentfreak](https://torrentfreak.com/game-pirates-beat-denuvo-with-hypervisor-bypasses-irdeto-promises-countermeasure/)
- [Nova técnica para quebrar Denuvo acelera pirataria, mas expõe PCs a riscos graves | adrenaline](https://www.adrenaline.com.br/games/denuvo-crack-hypervisor-seguranca-windows-risco/)
- [List of warez groups | wikipedia](https://en.wikipedia.org/wiki/List_of_warez_groups)
- [Empress (cracker) | wikipedia](https://en.wikipedia.org/wiki/Empress_(cracker))
- [About voices38 cracks | reddit](https://www.reddit.com/r/PiratedGames/comments/1ruby2u/about_voices38_cracks/)
- [Is voices38 the new Denuvo cracker to watch after Empress? | crackrelease](https://crackrelease.com/is-voices38-the-new-denuvo-cracker-to-watch-after-empress/)
- [voices38 just cracked a 2025-era Denuvo game with a proper crack](https://crackrelease.com/voices38-cracked-2025-era-denuvo-game/)