---
article: true
date: 2026-09-25T10:03:34-03:00
lastmod: 2026-09-25
showTableOfContents: true
tags: ["licenças", "software livre", "open source", "copyright", "tecnologia"]
title: "Entendendo Licenças"
slug: "entendendo-licencas"
aliases: [
  "/tft/articles/2026/09/25/entendendo-licencas/",
  "/2026/09/25/entendendo-licencas/",
  "/entendendo-licencas/"
]
---

Esse artigo tem o cunho informativo e opinativo, não leve como verdades absolutas o que está escrito aqui. Sempre pesquise por conta própria e tire suas próprias conclusões. Anexarei ao final do artigo todas as informações nas quais eu baseio minha escrita.

## O Que é uma Licença?

Antes de reutilizar um código, existe uma pergunta que muita gente ignora:

> **Eu tenho permissão para fazer isso?**

Uma licença é justamente a resposta formal para essa pergunta. Ela é um documento jurídico no qual o autor ou os detentores dos direitos definem o que outras pessoas podem fazer com uma obra — neste caso, um software.

Por padrão, um código é protegido por direitos autorais assim que é criado. Isso significa que o autor possui controle sobre sua cópia, distribuição, modificação e publicação. Não é necessário registrar o código em algum órgão para que essa proteção exista.

Quando um desenvolvedor publica um projeto sem indicar uma licença, ele não está automaticamente permitindo que outras pessoas façam qualquer coisa com aquele código. O repositório pode estar visível, ser clonado ou até permitir um *fork* na plataforma, mas isso não significa que o código possa ser incorporado livremente em outro projeto, modificado ou vendido.

A licença muda essa relação. Ela concede permissões específicas para que outras pessoas possam:

- usar o software;
- copiar e redistribuir o código;
- estudar seu funcionamento;
- modificar partes do projeto;
- incorporar o código em outro software;
- utilizar o projeto comercialmente, dependendo das condições.

Essas permissões quase nunca são ilimitadas. Algumas licenças exigem que o autor original seja mencionado. Outras obrigam a disponibilizar o código-fonte de versões modificadas. Também existem licenças que restringem determinadas formas de uso ou impedem a incorporação do código em produtos proprietários.

Por isso, uma licença não é apenas um aviso colocado no repositório. Ela funciona como um acordo: de um lado, o autor oferece determinadas liberdades; do outro, quem utiliza o software precisa respeitar as condições estabelecidas.

É importante não confundir **código aberto** com **código sem regras**. O código pode estar disponível para leitura e ainda assim possuir limitações sobre cópia, modificação ou distribuição. Da mesma forma, "gratuito" descreve o preço — ou a ausência dele —, não necessariamente as liberdades concedidas ao usuário.

No fim, a licença existe para deixar claro o que antes poderia ser interpretado de várias formas. Ela protege a autoria, orienta quem deseja reutilizar o código e estabelece as responsabilidades de todos que participam daquele projeto.

## Principais Tipos de Licença de Software

Nem toda licença oferece as mesmas liberdades. Algumas permitem que o código seja usado em praticamente qualquer lugar; outras exigem que as modificações continuem abertas. Existem também projetos cujo código pode ser visto, mas não reutilizado livremente.

Entender essa diferença é mais importante do que decorar uma lista de siglas. A licença escolhida define o caminho que o software poderá seguir depois de sair das mãos de quem o criou.

### Licenças Proprietárias

Em uma licença proprietária, o autor ou a empresa mantém um controle maior sobre o software. O usuário normalmente recebe autorização para executar o programa, mas não necessariamente pode estudar seu código, modificá-lo ou redistribuí-lo.

É o modelo mais comum em produtos comerciais fechados. Comprar ou baixar um programa não significa receber a propriedade do código-fonte; geralmente significa apenas receber uma permissão limitada de uso, dentro das condições estabelecidas pelo fornecedor.

Também é importante não confundir software proprietário com software gratuito. Um programa pode ser disponibilizado sem cobrança e ainda assim impedir cópia, alteração ou redistribuição. O preço não define a liberdade do software.

### Licenças Permissivas

As licenças permissivas oferecem bastante liberdade para quem recebe o código. Elas costumam permitir uso, modificação e distribuição, inclusive em produtos comerciais e proprietários.

Entre os exemplos mais conhecidos estão:

- **MIT**;
- **BSD**;
- **Apache 2.0**.

As obrigações normalmente são simples. A licença MIT, por exemplo, exige a preservação do aviso de copyright e do texto da licença. A Apache 2.0 também possui uma concessão expressa relacionada a patentes, além de exigir a preservação de avisos e informações relevantes.

O resultado é uma grande flexibilidade: uma empresa pode utilizar uma biblioteca permissiva em um produto fechado, desde que respeite suas condições. A versão modificada não precisa necessariamente continuar sob a mesma licença nem ter seu código-fonte publicado.

Essa liberdade facilita a adoção do software, mas também significa que alguém pode melhorar o projeto e distribuir essa versão sem devolver as melhorias à comunidade.

### Licenças Copyleft

As licenças copyleft seguem uma lógica diferente. Elas permitem usar, estudar e modificar o software, mas procuram garantir que determinadas versões derivadas preservem essas mesmas liberdades.

A **GNU GPL** é o exemplo mais conhecido. Quando um programa coberto pela GPL é distribuído em uma obra derivada, a licença impõe condições para que o código-fonte correspondente e os direitos concedidos pela GPL continuem disponíveis, conforme as regras da versão utilizada.

Isso não significa que um software GPL não possa ser vendido. Ele pode ser comercializado, mas quem o distribui precisa respeitar as obrigações da licença. Cobrar pelo software e esconder o código-fonte de uma versão derivada são questões diferentes.

Existem variações para situações específicas:

- **LGPL:** oferece um copyleft mais fraco, comum em bibliotecas. Em determinadas condições, permite que uma aplicação maior utilize a biblioteca sem que todo o aplicativo precise adotar a mesma licença;
- **AGPL:** foi criada para lidar melhor com software executado em servidores. Quando uma versão modificada é utilizada para oferecer um serviço pela rede, a licença pode exigir que o código-fonte correspondente seja oferecido aos usuários que interagem com o programa.

O copyleft não transforma automaticamente tudo que se comunica com um programa em GPL. A aplicação depende da forma como os componentes são combinados, distribuídos e da licença específica. Por isso, casos concretos exigem uma análise mais cuidadosa do que a simples ideia de “contaminação”.

### Dedicação ao Domínio Público e CC0

O domínio público não é propriamente uma licença. Ele descreve uma situação em que a obra não está mais sujeita — ou foi colocada fora do alcance — dos direitos patrimoniais exclusivos, conforme as regras da jurisdição aplicável. Assim, outras pessoas podem utilizá-la com poucas restrições autorais ou nenhuma.

A **CC0**, da Creative Commons, é um instrumento criado para que o autor renuncie, na medida permitida pela lei, aos direitos que possui sobre a obra. Quando essa renúncia não é possível, a CC0 oferece uma licença permissiva como alternativa.

Esse modelo também pode ser aplicado a software, mas não foi criado especificamente para código. Por isso, não trata necessariamente de questões como patentes, dependências ou particularidades do desenvolvimento de software. Licenças como MIT, BSD, Apache e GPL costumam ser mais específicas para esse contexto.

A dedicação ao domínio público pode ser conveniente para quem não quer exigir atribuição ou impor condições de compartilhamento. Ainda assim, ela não elimina necessariamente outros direitos, como marcas, patentes ou direitos relacionados à personalidade.

### Código Disponível Não é Necessariamente Open Source

Alguns projetos permitem que qualquer pessoa veja seu código, mas restringem sua cópia, modificação ou uso comercial. Esse modelo costuma ser chamado de **source available** — código disponível —, mas não atende necessariamente aos critérios oficiais de software livre ou open source.

A diferença parece pequena, mas muda completamente o que pode ser feito com o projeto. Acesso para leitura não é o mesmo que autorização para reutilização.

No fim, a pergunta mais importante não é se o projeto está no GitHub, se possui muitas estrelas ou se alguém o chamou de open source. A pergunta é: **qual licença acompanha esse código e quais condições ela estabelece?**

## Software Livre e Open Source

Até aqui, falamos sobre licenças e sobre as liberdades que elas podem conceder. Mas duas expressões aparecem o tempo todo quando o assunto é software com código disponível: **software livre** e **open source**.

Elas são a mesma coisa? A resposta mais honesta é: existe uma grande sobreposição, mas os movimentos não nasceram com exatamente a mesma preocupação.

### Richard Stallman e a Origem do Software Livre

Para entender o movimento do software livre, é preciso voltar ao trabalho de **Richard Stallman** no laboratório de Inteligência Artificial do MIT. Naquela época, compartilhar código e melhorar programas fazia parte da cultura de muitos laboratórios. Com o crescimento do software proprietário, essa prática começou a desaparecer: programas passaram a ser acompanhados por restrições, acordos de confidencialidade e código-fonte inacessível.

Em 1983, Stallman anunciou o **Projeto GNU**, com o objetivo de construir um sistema operacional completamente livre e compatível com o Unix. Dois anos depois, publicou o **Manifesto GNU**, no qual explicou as razões do projeto e defendeu a cooperação entre usuários e desenvolvedores.

Ainda em 1985, foi criada a **Free Software Foundation (FSF)**, organização que passou a apoiar o Projeto GNU e a defender a liberdade dos usuários. A FSF também passou a manter e promover licenças como a GNU GPL, criada para impedir que versões modificadas de um programa livre fossem transformadas em software proprietário sem preservar as liberdades originais.

A palavra “livre”, nesse contexto, não fala sobre preço. Um software livre pode ser vendido, usado por empresas e distribuído comercialmente. A questão é se as liberdades fundamentais continuam disponíveis para quem recebe o programa.

### A Origem do Open Source

O termo **open source** foi criado em 1998, durante uma reunião estratégica realizada em Palo Alto, na Califórnia, após a decisão da Netscape de liberar o código de seu navegador. A expressão foi sugerida por Christine Peterson e surgiu da tentativa de apresentar o desenvolvimento aberto como um modelo prático de colaboração, inovação e participação — uma linguagem que também fosse mais fácil de aceitar no ambiente empresarial.

Não foi apenas uma troca de nome. Foi também uma mudança de ênfase: o software livre falava principalmente sobre liberdade, enquanto o open source destacava os benefícios do processo de desenvolvimento aberto.

Ainda em fevereiro daquele ano, Eric Raymond e Bruce Perens fundaram a **Open Source Initiative (OSI)** para promover o termo e estabelecer critérios objetivos para seu uso. Uma das primeiras tarefas da organização foi criar a **Open Source Definition**, baseada nas Debian Free Software Guidelines, e iniciar uma lista de licenças aprovadas.

Essa definição ajudou a separar o open source de um simples código publicado na Internet. Para a OSI, não basta permitir que alguém veja o código: a licença precisa autorizar redistribuição, modificações e uso em diferentes áreas, inclusive comercialmente.

### A FSF e as Quatro Liberdades

A **Free Software Foundation (FSF)** avalia o software a partir das liberdades oferecidas aos usuários. Para que um programa seja considerado livre, é necessário garantir quatro liberdades essenciais:

1. **Executar o programa** para qualquer finalidade;
2. **Estudar como o programa funciona** e modificá-lo, o que exige acesso ao código-fonte;
3. **Redistribuir cópias** para ajudar outras pessoas;
4. **Distribuir versões modificadas**, permitindo que a comunidade se beneficie das melhorias.

Essas liberdades não são apenas uma questão de poder abrir o arquivo do código. Se o usuário pode ler o código, mas não pode modificá-lo ou compartilhar a versão modificada, existe acesso, mas não existe liberdade completa.

A FSF também considera que essas liberdades precisam ser efetivas. Um dispositivo que permite estudar e modificar o código, mas bloqueia a execução de versões alteradas, pode tornar a liberdade apenas teórica. É nesse contexto que aparece a tivoização, que veremos mais adiante.

### A OSI e a Open Source Definition

A **Open Source Initiative (OSI)** utiliza a **Open Source Definition** para avaliar se uma licença pode ser reconhecida como open source.

A definição exige, entre outras coisas, que a licença permita:

- redistribuição do software;
- acesso ao código-fonte;
- criação e distribuição de obras derivadas;
- uso em qualquer área de atividade, inclusive comercial;
- aplicação dos mesmos direitos a todos que receberem o software;
- distribuição sem discriminação contra pessoas, grupos ou tecnologias específicas.

A OSI não considera suficiente dizer que o código está disponível. A licença precisa conceder direitos concretos de uso, modificação e compartilhamento. Por isso, um projeto pode publicar seu código na Internet e ainda assim não ser open source.

A organização mantém uma lista de licenças aprovadas. Essa aprovação funciona como uma referência para desenvolvedores, empresas e comunidades que precisam identificar licenças compatíveis com a definição oficial de open source.

### Então São a Mesma Coisa?

Na prática, muitas licenças são reconhecidas pelos dois movimentos. GPL, MIT, BSD e Apache 2.0 são exemplos conhecidos de licenças que normalmente podem ser descritas tanto como software livre quanto como open source.

A diferença costuma aparecer na pergunta que cada movimento coloca em primeiro lugar:

- **Software livre:** os usuários possuem as liberdades necessárias para controlar, estudar, modificar e compartilhar o programa?
- **Open source:** a licença permite um modelo aberto de colaboração, modificação e distribuição conforme os critérios da OSI?

Um movimento fala mais sobre ética, autonomia e direitos dos usuários. O outro costuma falar mais sobre desenvolvimento, colaboração, qualidade e adoção tecnológica.

Isso não torna um conceito “verdadeiro” e o outro “falso”. São formas diferentes de explicar um conjunto de licenças que, em grande parte, se sobrepõem. Ainda assim, os termos não devem ser tratados como sinônimos perfeitos em qualquer discussão.

No fim, chamar um projeto de livre ou open source não substitui a leitura da licença. O rótulo ajuda a iniciar a conversa; o texto da licença é que define os direitos concedidos.

## Quem as Licenças Protegem?

Uma licença define como um software pode ser usado, modificado e compartilhado. Ela transforma a intenção de publicar um projeto em permissões e responsabilidades claras para quem entra em contato com aquele código.

Essa clareza é importante porque o software raramente permanece nas mãos de quem o criou. Ele pode ser reutilizado por outros desenvolvedores, incorporado a produtos comerciais, distribuído para usuários ou mantido por uma comunidade. Cada uma dessas situações precisa de regras compreensíveis.

A proteção começa pelo **autor**. A licença registra a autoria, deixa claras as permissões concedidas e estabelece as condições para uso, cópia, modificação e distribuição. Ela não impede que alguém viole os direitos autorais, mas oferece uma base clara para autorizar usos legítimos e questionar usos que desrespeitem as condições estabelecidas.

A licença também protege quem **recebe e reutiliza o software**. Em vez de depender de suposições, essa pessoa pode consultar o documento e descobrir se está autorizada a incorporar o código em outro projeto, vender uma solução, modificar uma biblioteca ou redistribuir cópias. Sem uma licença, o código pode estar público e ainda assim não oferecer autorização suficiente para essas atividades.

Essa clareza é especialmente importante quando um software depende de outros projetos. Bibliotecas, frameworks, sistemas operacionais e ferramentas podem possuir licenças diferentes. Uma licença permissiva pode exigir a preservação de avisos; uma licença copyleft pode exigir a disponibilização do código-fonte de determinadas versões modificadas; um projeto sem licença pode não autorizar o uso pretendido.

Por isso, projetos maiores precisam controlar suas dependências, registrar versões e verificar as obrigações de cada componente. Esse cuidado reduz riscos jurídicos, evita conflitos entre licenças e ajuda a empresa a saber exatamente o que está distribuindo. Inventários de componentes e SBOMs são ferramentas usadas para tornar essa relação mais visível.

As licenças também protegem os **usuários finais**. Em licenças livres e open source, elas podem garantir o direito de estudar, modificar, compartilhar e continuar utilizando o software mesmo quando o mantenedor original deixa de trabalhar no projeto. O usuário não fica necessariamente preso a uma única empresa para corrigir um problema ou manter uma ferramenta funcionando.

Por fim, elas protegem a própria **comunidade**. Um projeto colaborativo precisa de regras para que o trabalho de diferentes pessoas possa continuar sendo compartilhado. A licença define quais direitos serão recebidos por quem chegar depois e impede que uma contribuição comunitária seja tratada como propriedade exclusiva sem respeitar as condições originais.

Nenhuma licença protege todos os envolvidos da mesma maneira. Licenças permissivas favorecem a flexibilidade de quem reutiliza o código; licenças copyleft priorizam a preservação das liberdades nas versões distribuídas; licenças proprietárias concentram maior controle no titular. A escolha revela o equilíbrio que o autor deseja estabelecer.

No fim, licenças protegem relações. Elas organizam os limites entre quem cria, quem mantém, quem reutiliza e quem usa o software. Quando essas regras são claras, a colaboração se torna mais previsível — e previsibilidade é uma das bases de qualquer projeto que pretende durar.

## Implicações Jurídicas

Uma licença de software não é apenas uma sugestão de boa convivência entre desenvolvedores. Ela está ligada aos direitos autorais e define as condições sob as quais o titular autoriza outras pessoas a usar, copiar, modificar ou distribuir o código.

Isso não significa que todas as licenças produzam exatamente os mesmos efeitos jurídicos em todos os países. As regras de copyright, contratos e responsabilidade variam conforme a jurisdição. Ainda assim, ignorar a licença não é uma atitude neutra: quem usa o código sem respeitar suas condições pode perder a autorização que permitia aquele uso.

### Direitos Autorais e Permissão de Uso

O autor possui direitos sobre o código que criou. A licença funciona como uma autorização antecipada para determinadas ações que, sem essa permissão, poderiam ser proibidas pelo direito autoral.

Por isso, encontrar um código na Internet não é o mesmo que receber autorização para copiá-lo. A publicação em um repositório facilita o acesso, mas a licença é que informa se o código pode ser reutilizado, modificado ou distribuído.

Quando um projeto não possui licença, a situação geralmente é mais restritiva. O código pode ser visualizado na plataforma em que foi publicado, mas não existe necessariamente uma autorização para incorporá-lo em outro produto ou redistribuí-lo. A alternativa é pedir permissão ao titular ou procurar um projeto com licença adequada.

### Permissões e Obrigações

Toda licença deve ser lida pelos dois lados. Ela concede permissões, mas também pode impor obrigações.

Uma licença permissiva pode exigir a preservação do aviso de copyright e do texto da própria licença. A GPL pode exigir que versões derivadas distribuídas mantenham a licença e disponibilizem o código-fonte correspondente. A AGPL acrescenta obrigações específicas para determinadas versões modificadas oferecidas por meio de uma rede.

Essas condições não significam que o software não possa ser vendido. É possível cobrar pelo programa, pelo suporte ou pela distribuição. O que não pode ser feito é exercer uma permissão e ignorar as condições que a acompanham.

### Distribuição, Uso Privado e Serviços de Rede

Muitas obrigações aparecem quando o software é distribuído para outras pessoas. Desenvolver e modificar um programa apenas para uso interno pode produzir consequências diferentes de vender um aplicativo, instalar um produto em clientes ou publicar um binário para download.

Também é importante diferenciar a GPL da AGPL. A GPL tradicional concentra suas principais obrigações na distribuição do software e de obras derivadas. A AGPL foi criada para lidar com um problema específico: uma empresa poderia modificar um programa GPL, executá-lo em seus servidores e oferecer o resultado como serviço sem distribuir uma cópia do programa modificado. Em determinadas condições, a AGPL exige que os usuários que interagem com essa versão pela rede tenham acesso ao código-fonte correspondente.

O detalhe de que o programa está “na nuvem” não resolve automaticamente a análise. É preciso observar a licença e a forma como o software é usado.

### Obras Derivadas e Compatibilidade

Outro ponto jurídico importante é saber se componentes diferentes formam uma única obra ou se são programas independentes apenas distribuídos juntos. A resposta pode depender da forma de integração, do tipo de comunicação entre os componentes e da interpretação aplicável ao caso.

Quando há uma obra derivada, as condições da licença original podem alcançar a combinação. É por isso que uma empresa não deve presumir que basta colocar uma biblioteca GPL em um diretório separado ou criar uma camada intermediária para evitar suas obrigações.

Também é necessário verificar a **compatibilidade entre licenças**. Duas licenças podem ser livres individualmente e, ainda assim, não permitir que seus códigos sejam combinados sob as condições desejadas. Misturar componentes sem analisar essa compatibilidade pode produzir um software impossível de distribuir legalmente na forma planejada.

### O Que Pode Acontecer em Caso de Violação?

O descumprimento pode levar a uma notificação, à exigência de correção da distribuição, à retirada do produto, a um acordo ou a um processo judicial. Dependendo da licença e da legislação aplicável, o infrator também pode perder as permissões concedidas pela licença e responder por violação de direitos autorais ou por quebra de obrigações contratuais.

Um caso frequentemente citado é **Jacobsen v. Katzer**, nos Estados Unidos. O processo envolveu a Artistic License, e a decisão do Tribunal de Apelações do Circuito Federal reconheceu que certas condições de uma licença open source podem funcionar como limitações baseadas em direito autoral. Na prática, não se trata apenas de uma promessa informal entre programadores: as condições da licença podem ser juridicamente relevantes.

Isso não significa que todo conflito terminará em uma condenação ou que todas as licenças serão interpretadas da mesma maneira. Muitos casos são resolvidos por acordos, e a análise depende dos fatos, da licença e da jurisdição. O ponto principal é mais simples: uma licença open source continua sendo uma licença, e suas condições precisam ser respeitadas.

## Casos e Questões Controversas

As licenças parecem objetivas até encontrarem situações em que o código, o hardware e os serviços proprietários se misturam. Alguns casos ajudam a mostrar que ter acesso ao código não significa necessariamente ter liberdade prática para usá-lo.

### Tivoização: Código Livre, Aparelho Bloqueado

A **tivoização** acontece quando um fabricante distribui um dispositivo com software livre, mas utiliza assinaturas digitais ou outras barreiras para impedir que o usuário execute uma versão modificada.

O nome surgiu a partir do TiVo, um gravador digital que utilizava componentes baseados em Linux. O código-fonte correspondente podia estar disponível, mas o aparelho verificava assinaturas e recusava versões alteradas. O usuário conseguia estudar o programa, mas não conseguia executar sua própria versão no dispositivo.

Esse caso revela uma diferença importante entre liberdade jurídica e liberdade efetiva. A licença pode permitir a modificação, mas o hardware ainda pode impedir que a modificação seja utilizada.

A GPLv3 tentou responder a esse problema. Em determinados produtos de consumo, quem distribui o software precisa fornecer as informações necessárias para que o usuário instale e execute versões modificadas. A GPLv2, utilizada pelo kernel Linux, não possui essa mesma exigência geral contra a tivoização.

### Linux e Android: Um Sistema Pode Ser Parcialmente Aberto?

O Android é um exemplo de como um produto pode reunir componentes com licenças diferentes. O kernel utilizado pelo sistema é baseado no Linux, enquanto o AOSP — Android Open Source Project — disponibiliza grande parte da plataforma sob licenças open source.

Isso não significa que todo componente encontrado em um celular Android precise ser aberto. Serviços do Google, aplicativos, drivers, firmwares e componentes fornecidos por fabricantes podem seguir licenças próprias. A obrigação da GPL se concentra no código coberto por ela e nas modificações ou combinações que se enquadrem em seu escopo; ela não transforma automaticamente todo o produto em GPL.

Por isso, o Google e os fabricantes podem manter partes do Android proprietárias sem necessariamente violar a licença do Linux. Ao mesmo tempo, precisam respeitar as obrigações relacionadas ao kernel e a outros componentes open source utilizados no produto.

O caso também mostra que “Android” pode significar coisas diferentes. O AOSP é um projeto aberto; um celular comercial é uma combinação de AOSP, kernel, componentes do fabricante e serviços proprietários. Para saber o que pode ser modificado ou redistribuído, é preciso analisar cada camada.

### Código Gerado por LLM

Um LLM tornou mais fácil reutilizar código sem que o desenvolvedor saiba exatamente de onde ele veio. O modelo pode produzir uma solução original, recombinar padrões comuns ou reproduzir um trecho semelhante ao existente em um repositório público.

O fato de a resposta ter sido gerada por um LLM não elimina a necessidade de verificar sua origem. Se o resultado reproduzir um trecho protegido, a licença do código original pode continuar relevante. Se o repositório não possuir licença, a disponibilidade pública também não representa uma autorização automática para copiar e redistribuir.

Algumas ferramentas tentam identificar correspondências entre sugestões e código público. O GitHub Copilot, por exemplo, pode apresentar referências quando uma sugestão coincide com código de repositórios públicos e, quando encontrada, indicar a licença associada. Essa verificação não é garantia de que toda origem será descoberta: código alterado, repositórios ausentes do índice e sugestões modificadas podem não ser identificados.

A responsabilidade final não desaparece porque um LLM produziu o código. A origem de um trecho, a licença aplicável e a forma como ele foi incorporado continuam sendo questões relevantes para quem distribui o software.

Esses casos têm algo em comum: o rótulo “open source” não responde sozinho a todas as perguntas. É preciso observar a licença, a forma de distribuição, o hardware envolvido, os componentes combinados e a origem efetiva do código.

## Conclusão

Licenças não são detalhes burocráticos colocados no final de um projeto. Elas estabelecem os limites entre autoria, uso e colaboração, permitindo que um software continue circulando com regras claras.

Entender essas regras é uma forma de respeitar tanto quem criou o código quanto quem pretende utilizá-lo. Antes de copiar, modificar ou compartilhar um projeto, vale lembrar da pergunta que iniciou este artigo:

> **Eu tenho permissão para fazer isso?**

A licença existe para que essa resposta não dependa de suposições.

# Referências

- [Choose a License — No License](https://choosealicense.com/no-permission/)
- [GitHub Docs — Reusing other people's code in your projects](https://docs.github.com/en/get-started/learning-to-code/reusing-other-peoples-code-in-your-projects)
- [Open Source Initiative — The Open Source Definition](https://opensource.org/osd)
- [Choose a License — MIT License](https://choosealicense.com/licenses/mit/)
- [Choose a License — Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/)
- [Choose a License — GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
- [Choose a License — GNU LGPLv3](https://choosealicense.com/licenses/lgpl-3.0/)
- [Choose a License — GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
- [GNU Project — What is Free Software?](https://www.gnu.org/philosophy/free-sw.html)
- [GNU Project — Why Open Source Misses the Point of Free Software](https://www.gnu.org/philosophy/open-source-misses-the-point.html)
- [Free Software Foundation — History](https://www.fsf.org/history)
- [GNU Project — The GNU Manifesto](https://www.gnu.org/gnu/manifesto.html)
- [Free Software Foundation — About](https://www.fsf.org/about/)
- [Open Source Initiative — History of the Open Source Initiative](https://opensource.org/about/history-of-the-open-source-initiative)
- [GNU Project — Various Licenses and Comments about Them](https://www.gnu.org/licenses/license-list.html)
- [GNU Project — Frequently Asked Questions about the GNU Licenses](https://www.gnu.org/licenses/gpl-faq.html)
- [Creative Commons — CC0](https://creativecommons.org/public-domain/cc0/)
- [OpenChain Project — License Compliance](https://openchainproject.org/license-compliance)
- [OpenChain Project — SBOM Resources](https://openchainproject.org/sbom-resources)
- [SPDX — SPDX Tools](https://spdx.dev/use/spdx-tools/)
- [CISA — Recommended Practices for Managing Open Source Software and Software Bill of Materials](https://www.cisa.gov/sites/default/files/2023-12/ESF_SECURING_THE_SOFTWARE_SUPPLY_CHAIN%20RECOMMENDED%20PRACTICES%20FOR%20MANAGING%20OPEN%20SOURCE%20SOFTWARE%20AND%20SOFTWARE%20BILL%20OF%20MATERIALS.pdf)
- [Open Source Initiative — Resources for Open Source Compliance](https://opensource.org/blog/resources-for-open-source-compliance)
- [Jacobsen v. Katzer — CourtListener](https://www.courtlistener.com/opinion/209693/jacobsen-v-katzer)
- [GNU Project — Frequently Asked Questions: Tivoization](https://www.gnu.org/licenses/gpl-faq.html#Tivoization)
- [Android Open Source Project — Android Common Kernels](https://source.android.com/docs/core/architecture/kernel/android-common)
- [GitHub Docs — Copilot Code Referencing](https://docs.github.com/en/copilot/concepts/completions/code-referencing)
- [GitHub Docs — Finding Public Code that Matches Copilot Suggestions](https://docs.github.com/copilot/using-github-copilot/finding-public-code-that-matches-github-copilot-suggestions)
