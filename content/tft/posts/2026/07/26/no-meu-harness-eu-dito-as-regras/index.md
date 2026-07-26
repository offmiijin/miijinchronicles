---
date: 2026-07-26
title: "No Meu Harness Eu Dito As Regras"
tags: ["harness", "pi", "agentes", "LLM", "ferramentas", "desenvolvimento"]
slug: "no-meu-harness-eu-dito-as-regras"
aliases: [
  "/tft/posts/2026/07/26/no-meu-harness-eu-dito-as-regras/"
]
---

Pode parecer chato eu vir aqui e falar sobre agentes, LLM e "AI" para todo lado, mas fazer o que, isso envolve diretamente meu trabalho, seja o profissional ou o pessoal. Então vamos lá.

No dia 06/06/2026 eu fiz um post falando um pouco do [meu setup de desenvolvimento](https://miijinchronicles.com/tft/posts/2026/06/06/meu-setup-de-desenvolvimento/). Nesse post eu falo sobre o harness no qual eu estava utilizando, o [Crush](https://github.com/charmbracelet/crush).

E bem, eu não o uso mais porque me identifiquei com um outro harness que se encaixa bem mais no meu fluxo de trabalho e na maneira na qual eu gosto de trabalhar.

## Por que Trocar de Harness?
Assim como LLMs que eu já testei vários, eu também me dispus a testar outros harness. Eu comecei inicialmente pelo [OpenCode](https://github.com/anomalyco/opencode/), porém — como eu era leigo — eu parei de utilizar muito rápido pois comecei a perceber que ele gastava muitos tokens, principalmente no primeiro prompt.

Nisso eu quase desisti de utilizar qualquer tipo de agente pelo consumo excessivo de tokens — e bem, não há motivos para eu pagar tanto por tokens.

Então tempos depois eu comecei a utilizar agentes integrados no VSCode (Continue.dev, Kilo Code, Roo Code) porque parecia ser mais simples, gastava menos tokens e fazia o que eu já queria, que era vasculhar os arquivos e me explicar coisas que eu não sabia.

Comecei a perceber inconsistências, configurações excessivas para fazê-los funcionar, `AGENTS.md` gigantescos com instruções, etc., e decidi voltar para um agente CLI, e aí que entra o Crush.

Ele é um harness simples, rápido e tem tudo o que eu precisava no momento e mais um pouco. Foi daí que eu passei a apenas instruir o agente a fazer as coisas por mim. Ele lia, escrevia, bloqueava comandos prejudiciais, parecia perfeito até eu começar a sentir falta do `cURL`. Sim, meu harness bloqueava o `cURL`. Eu poderia simplesmente ter tido um pouco mais de paciência e configurado para permitir, mas para ser sincero, a configuração do Crush é tão mínima que eu não achei.

Então decidi utilizar o OpenCode novamente. Ele tinha mais configurações, era mais personalizável e eu fui **adaptando o meu fluxo de trabalho para ele** — guarde bem na memória essa frase.

Tempos depois o OpenCode já tinha as configurações que eu queria que ele tivesse, e parecia ser perfeito, mas ainda sentia falta de modificá-lo um pouco mais. Escrever hooks e configurá-los não era exatamente o que eu queria, até que eu ouvi falar sobre o [pi](https://github.com/earendil-works/pi).

## π?
Exatamente, pi.

> Pi is a minimal agent harness. Adapt Pi to your workflows, not the other way around. Customize Pi with [extensions](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#extensions), [skills](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#skills), [prompt templates](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#prompt-templates), and [themes](https://github.com/earendil-works/pi/tree/main/packages/coding-agent#themes). Bundle them as [Pi packages](https://pi.dev/packages) and share via npm or git.

**"Adapt Pi to your workflows, not the other way around"**. Isso aqui me encantou e brilhou meus olhos e comecei a pesquisar um pouco mais. Vi uns pacotes comunitários, workflows de trabalho, configurações, etc., e então eu decidi testá-lo.

Ele é bem simples, bem simples mesmo, não há firula alguma, apenas inicie, coloque sua chave de API e comece a codificar. Porém ele parecia muito cru, vazio, sem nada, e eu não sabia muito bem como escrever extensões ou melhorá-lo. Então fui às minhas pesquisas novamente.

Comecei a ver extensões de terceiros: extensões de Web Search, MCP, Multi-Agente, etc. Cheguei até a encontrar um fork do pi, o [Oh-My-Pi](https://github.com/can1357/oh-my-pi).

Eu tive muita vontade de instalar o fork porque ele era muito mais do que completo, tive vontade de instalar somente alguns pacotes no meu pi, mas se tivesse feito tudo isso teria perdido o sentido do porque eu troquei de harness.

## Minha Configuração
15 de Junho foi quando eu iniciei meu repositório de configuração com apenas uma extensão, o `security-guard.ts`.

A partir daí eu comecei a moldar o meu próprio harness para se encaixar com meu fluxo de trabalho. No início foi bem complicado porque existem muitas extensões que eu poderia implementar, porque o pi realmente é cru, ele não tem nada. O famoso "do it yourself".

Atualmente eu possuo 9 extensões próprias e 2 de terceiros (que pretendo adaptar e escrever as minhas próprias também). Possuo 3 SKILLS e 1 tema personalizado.

A extensão mais trabalhosa que eu tenho até agora é o [dev-sandbox](https://github.com/offmiijin/pi-config/tree/main/extensions/dev-sandbox). Ele coloca o agente dentro de um sandbox com 3 camadas de proteções (Linux Namespaces, Linux Capabilities e Seccomp) — sem contar com o `security-guard.ts`.

Nesse exato momento eu venho trabalhando em uma extensão de memória — possivelmente minha maior extensão, passando o `dev-sandbox`.

## Conclusão
Demorou até que eu encontrasse a ferramenta "perfeita" que encaixasse no meu fluxo de trabalho. O pi é excelente se você gosta de fazer as coisas por conta própria e quer ter uma personalização única. Se você não tem paciência de criar extensões e só quer utilizar algo já pronto, vá em frente, continue com o Codex, Claude Code (e seus demais forks), Crush, OpenCode ou o que seja.

Caso tenha interesse em utilizar minhas configurações — e talvez contribuir — aqui está o link para o repositório: https://github.com/offmiijin/pi-config
