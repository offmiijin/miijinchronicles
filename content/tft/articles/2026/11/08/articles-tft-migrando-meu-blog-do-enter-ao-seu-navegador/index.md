---
article: true
date: 2026-11-08T00:39:37-03:00
lastmod: 2026-11-08
showTableOfContents: true
title: "Migrando Meu Blog — Do \"Enter\" ao Seu Navegador (e o Servidor Que Não Existe)"
tags: ["cloudflare workers", "dns", "tls", "hugo", "infraestrutura", "migração"]
slug: "migrando-meu-blog-do-enter-ao-seu-navegador"
aliases: [
  "/tft/posts/2026/11/08/migrando-meu-blog-do-enter-ao-seu-navegador/",
  "/2026/11/08/migrando-meu-blog-do-enter-ao-seu-navegador/",
  "/migrando-meu-blog-do-enter-ao-seu-navegador/"
]
---

Você digita `miijinchronicles.com` na barra de endereços e aperta `Enter`. Entre o seu dedo e o texto aparecendo na tela existe uma sequência de decisões tomadas por baixo dos panos, em lugares que você não conhece, seguindo regras que a maioria dos desenvolvedores nunca leu. Este artigo percorre essa sequência inteira: do primeiro pacote que sai da sua máquina até o pixel aceso na sua tela.

Vamos utilizar este blog como alvo. Ele é um site estático gerado com Hugo e publicado no Cloudflare Workers, e tudo o que descrevo a seguir acontece com ele, desde o primeiro pacote até a página na sua tela.

O roteiro é o do próprio request:

1. o nome precisa virar um endereço (DNS);
2. o endereço precisa virar um canal cifrado (TLS);
3. o canal precisa virar uma resposta (HTTP);
4. a resposta precisa virar tela (o navegador).

Parece trivial e "mágico" porque é automático. Não é, e é justamente por ser automático que quase ninguém olha.

**Antes de começar, um aviso sobre a palavra "servidor".** Vou usá-la várias vezes, no sentido que você provavelmente tem em mente: uma máquina ligada em algum lugar, esperando a sua requisição. No fim do caminho que vou descrever, essa máquina não existe. Não é licença poética: no Cloudflare Workers não há *origin*, não há processo escutando porta nenhuma, não há um computador meu aguardando o seu request. O que existe é uma rede de borda que já tem o conteúdo e decide servi-lo. Quando o servidor desaparece, boa parte do vocabulário que a gente aprendeu sobre hospedagem desmancha junto, e com ele some uma classe inteira de bugs que a gente persegue sem entender a causa.

**O request é seu, os comandos são meus.** O caminho que descrevo começa no seu navegador e termina na sua tela, mas eu não tenho acesso a nenhuma das duas pontas. Então, quando eu rodar `dig`, `openssl` ou `curl`, estou na minha máquina, olhando de fora o mesmo caminho que o seu navegador percorre por dentro. Onde os dois puderem divergir, eu digo.

Comecemos pelo começo, antes mesmo do seu dedo tocar o teclado.

## Antes de Sair da Máquina

O seu `Enter` não dispara uma consulta à internet. Ele dispara até três consultas locais, em ordem, e só quando nenhuma delas tem a resposta é que o pacote sai.

**O cache do navegador.** O próprio browser mantém uma tabela de nomes já resolvidos. Ele respeita o TTL, mas aplica um piso próprio — na prática algo em torno de um minuto —, então um registro de 30 segundos não é consultado a cada 30 segundos. É o primeiro lugar onde "eu já mudei isso" e "continua aparecendo o antigo" coexistem sem que ninguém esteja mentindo.

**O cache do sistema operacional.** No Linux, `systemd-resolved`. No macOS, `mDNSResponder`. No Windows, o DNS Client. Todos guardam resultados com TTL maior e nenhum deles sabe que você mexeu no painel da Cloudflare cinco minutos atrás.

**O stub resolver.** É o componente que a aplicação chama (`getaddrinfo`), que lê o `/etc/resolv.conf` e decide para quem perguntar. No meu caso, ele aparece na primeira linha do `dig +trace`:

```
;; Received 239 bytes from 127.0.0.53#53(127.0.0.53) in 0 ms
```

O `+trace` é o comando que deveria caminhar a hierarquia do DNS de cima para baixo, começando por um root server. A primeira coisa que ele fez foi perguntar para `127.0.0.53` — o stub do `systemd-resolved` rodando na minha própria máquina, respondendo em `localhost`. Ele precisa disso porque não conhece a lista dos treze root servers de cor; pede emprestado ao resolver local.

### `dig` e o Navegador Não Veem o Mesmo Mundo

Isso explica um dos desencontros mais comuns de diagnóstico: você roda `dig` e vê o registro novo, abre o navegador e continua vendo o antigo. Os dois não estão errados.

`dig` fala DNS cru: lê o `/etc/resolv.conf`, escolhe um servidor e pergunta. Ele **não** passa pelo `getaddrinfo`, não consulta o `/etc/hosts` e não lê o cache do sistema operacional. O navegador faz o caminho completo: chama o `getaddrinfo`, que consulta as fontes **na ordem definida no `/etc/nsswitch.conf`**. Na máquina onde capturei esta saída, a linha de hostnames é:

```
hosts: mymachines resolve [!UNAVAIL=return] files myhostname dns
```

Lida da esquerda para a direita: `resolve` é o `systemd-resolved` (que por sua vez fala com o `127.0.0.53`), `files` é o `/etc/hosts`, e `dns` é o caminho clássico. Repare que o `/etc/hosts` vem **depois** do resolvedor, não antes — a ordem não é universal, é política local, e é por isso que a mesma consulta se comporta diferente em outra distribuição.

O `[!UNAVAIL=return]` é uma ação condicional: **se o `resolve` estiver indisponível, retorne o erro agora**, sem cair para os próximos. Isso explica um clássico de quem usa VPN: quando o serviço de resolução morre, o sistema inteiro para de resolver nomes, **inclusive os que estão no `/etc/hosts`**. Não foi o `/etc/hosts` que quebrou, foi a fila que parou na primeira estação.

Com isso, `dig` e navegador só discordam quando há divergência real de caminho: uma entrada antiga no `/etc/hosts`, uma VPN com split DNS, ou um cache local que ainda não expirou.

Os comandos de limpeza, em ordem de camada:

```
resolvectl flush-caches              # Linux (systemd-resolved)
sudo killall -HUP mDNSResponder      # macOS
ipconfig /flushdns                   # Windows
chrome://net-internals/#dns          # cache do próprio Chromium
```

Limpar o cache local resolve o seu problema. Não resolve o problema do vizinho, que ainda tem o registro antigo em cache — e é aí que a história fica interessante, porque existem caches que você não pode limpar. Antes de chegar neles, precisamos entender o que exatamente esse nome é.

## O Nome Não é Meu, a Delegação É

Antes de seguir para a rede, vale entender o que exatamente está escrito ali. `miijinchronicles.com` não é um endereço nem um arquivo: é um nome que alguém precisa ser capaz de responder. E "comprei o domínio" é uma frase que engana.

### O Que Eu Comprei

`miijinchronicles` sozinho não é nada. É um **label**, uma string. Ele vira domínio registrável quando aparece como filho de um TLD existente, e o `.com` é operado por um registry — a Verisign. Nesse registry existe uma linha:

```
miijinchronicles.com.   NS   austin.ns.cloudflare.com.
miijinchronicles.com.   NS   peaches.ns.cloudflare.com.
```

O que eu comprei foi o direito de decidir o conteúdo dessa linha, por um período renovável, e de ser o contato responsável por ela. Não comprei a string, não comprei a zona e não comprei autoridade nenhuma sobre o `.com`: comprei um assento na tabela de outra pessoa.

Tudo o que decorre disso vem de graça:

- **expira.** Sem renovação, o registro é liberado e volta para o pool. Não existe posse permanente, existe aluguel longo.
- **o registry fala com o registrador, não comigo.** Trocar de registrador envolve código de autorização e um protocolo de provisionamento (EPP) no meio do caminho.
- **quase tudo é público.** Titular, datas, nameservers e status ficam expostos no RDAP, o sucessor do WHOIS. Não existe domínio privado; existe privacidade de contato, que é outra coisa.
- **a delegação é a alavanca.** Quem controla o `NS` controla a zona inteira. É por isso que trocar de provedor de hospedagem é editar dois nomes num formulário, e não mover arquivos.

### Apex, www e Subdomínios

Lendo da direita para a esquerda: `com` é o TLD, `miijinchronicles` é o domínio registrável e `miijinchronicles.com` é o **apex** — a raiz da zona, também chamada de *naked domain*.

Subdomínio é qualquer label à esquerda do apex: `www`, `app`, `api`, `beta.app`. Não se compra subdomínio. Ele é gratuito, ilimitado e eu o crio no meu zone file, uma linha por vez.

Aqui mora a primeira armadilha: **apex e `www` são hosts diferentes.** Não são sinônimos e não apontam um para o outro por conta própria. Se eu criar o registro do apex e esquecer o `www`, o `www` simplesmente não existe — não é uma cópia, não é um alias, é um nome que ninguém sabe responder. Para que ele funcione, eu preciso criar um registro para ele; e para que não duplique o conteúdo, eu preciso criar um redirect. São duas decisões, tomadas em camadas diferentes, e a segunda é a que costuma ser esquecida.

Wildcard cobre **exatamente um** nível: `*.miijinchronicles.com` alcança `www.` e `api.`, mas não alcança `beta.app.`. Isso vai voltar na parte de certificado.

E uma restrição de protocolo que explica muita coisa: no apex não se pode ter um `CNAME` puro, porque ele colidiria com o `NS` e o `SOA` da própria zona. Os provedores contornam com *flattening* — a Cloudflare achata o `CNAME` do apex e devolve `A`/`AAAA` normalmente. É por isso que apontar o apex do meu domínio para um Worker foi indolor, enquanto em outras plataformas essa é a parte chata da configuração.

### Domínio Próprio vs. Domínio de Terceiro

`miijin.pages.dev` é um subdomínio **da Cloudflare** cedido a mim, e `miijin.workers.dev` funciona igual. Eu não controlo os nameservers dele, não tenho zone file, não emito certificado, não posso ter e-mail nele e não posso levá-lo embora. É aluguel dentro da casa dos outros: ótimo para preview e beta, ruim para produção.

Três motivos, do mais óbvio ao menos óbvio:

1. **Identidade.** `miijinchronicles.com` é meu. `miijin.pages.dev` é da Cloudflare, e eu apareço como inquilino.
2. **SEO.** Quem linka para um `*.pages.dev` está linkando para um domínio que não é meu, que eu não posso migrar e que carrega junto o histórico de outra pessoa se o nome for reaproveitado.
3. **"Mesmo site".** Aqui está o que morde de verdade. `app.miijinchronicles.com` e `api.miijinchronicles.com` são **same-site**: o domínio registrável é o mesmo, então um cookie `SameSite=Lax` apontando para `.miijinchronicles.com` atravessa os dois. Se o front estiver em `app.pages.dev` e a API em `api.miijinchronicles.com`, são **sites diferentes** — `pages.dev` está na lista pública de sufixos, então cada projeto é um site próprio. O cookie vira *cross-site*, o navegador bloqueia ou exige `SameSite=None; Secure`, e eu entro no inferno de CORS e preflight sem entender por quê.

A decisão de domínio é a mais barata de todas no dia 1 e a mais cara de corrigir depois. Eu configurei o domínio próprio antes de olhar para qualquer outra coisa do Cloudflare — e recomendo o mesmo.

### DNS Records vs. Nameservers (e os Dois TTLs)

No painel da Cloudflare são duas abas vizinhas. Confundi-las é a origem de quase toda ansiedade em migração de DNS, e a culpa é do nome parecido.

**DNS Records** é o **conteúdo** da minha zona: tipo, nome, valor, proxy. É o que eu edito, e é onde eu mando.

**Nameservers** é a **delegação**: quais servidores respondem por essa zona. Quem publica essa linha no registry é o **registrador**, não a Cloudflare. Eu só escolho o valor; a publicação é feita por outro.

Daí a diferença brutal de velocidade entre as duas operações:

| Operação | Onde acontece | Quanto demora |
|---|---|---|
| Adicionar ou alterar registro | meu zone file | TTL do registro — `300` no caso de registro proxiado |
| Trocar nameservers | registry do `.com` | até `172800` segundos |

E detalhe: o **mesmo conjunto de registros `NS`** tem dois TTLs diferentes, porque vive em duas zonas diferentes. Perguntando direto para a Cloudflare:

```
$ dig +noall +answer miijinchronicles.com NS
miijinchronicles.com.  86400   IN  NS  austin.ns.cloudflare.com.
miijinchronicles.com.  86400   IN  NS  peaches.ns.cloudflare.com.
```

E lendo a delegação publicada no TLD, a mesma dupla aparece com outro número:

```
miijinchronicles.com.  172800  IN  NS  austin.ns.cloudflare.com.
miijinchronicles.com.  172800  IN  NS  peaches.ns.cloudflare.com.
;; Received 370 bytes from 192.12.94.30#53(e.gtld-servers.net) in 128 ms
```

O `86400` é meu: eu controlo o TTL dentro da minha zona. O `172800` é da Verisign, e eu não controlo nada. **Baixar o TTL dos meus registros não acelera a troca de nameservers**, porque o gargalo não está na minha zona — está uma camada acima, e essa camada não me pertence.

É por isso que "aguarde a propagação do DNS" é uma expressão malfeita. O DNS não propaga nada: **ele expira.** Nenhuma informação é empurrada de um cache para o outro; cada cache simplesmente se recusa a perguntar de novo enquanto a contagem não acaba. E existem caches que eu não posso limpar.

Com o nome entendido e a delegação localizada, já dá para seguir o rastro de verdade.

## A Caminhada

Agora o pacote sai. E o primeiro fato que desmonta a intuição: **o seu navegador nunca fala com um root server.** Quem caminha a hierarquia é o recursor, e ele caminha por você.

### Os Quatro Saltos

Três personagens precisam ser separados antes de seguir, porque a maioria dos diagramas os empilha no mesmo desenho:

- **stub resolver** — a biblioteca na máquina do cliente. Sabe perguntar, não sabe responder.
- **recursor** — o servidor que faz o trabalho: pergunta salto por salto até achar quem sabe, e devolve a resposta final já montada. É o do seu provedor, ou o `1.1.1.1` / `8.8.8.8` que você configurou.
- **autoritativo** — quem responde por uma zona específica e assume a resposta (bit `AA` ligado). Não opina sobre o resto da internet.

O cliente manda **uma** pergunta. O recursor faz **três** consultas de rede até ter a resposta — e só faz isso quando não tem nada em cache.

**Salto 1: o recursor.** Se a resposta está no cache dele, acabou: 1 a 20 ms e você nem sabe que existiu hierarquia. Se não está, ele começa do topo, porque não existe atalho — ninguém sabe de cor o endereço de todos os domínios do mundo, e a graça do DNS é justamente ser distribuído.

**Salto 2: o root.** São **treze identidades** (`a.root-servers.net` até `m.root-servers.net`), mas centenas de instâncias físicas espalhadas pelo mundo, todas anunciando o mesmo IP por **anycast** — o BGP entrega você à mais próxima. "Treze servidores" nunca foram treze máquinas. E nenhum deles sabe onde está `miijinchronicles.com`, nem nunca vai saber: o que eles devolvem é uma **referral**, ou seja, "não é meu, mas o `.com` é respondido por estes treze aqui, e toma os IPs deles para você não precisar resolver os nomes deles também". Esses IPs colados à delegação chamam-se **glue records**.

**Salto 3: o `.com`.** O registry da Verisign, respondendo no mesmo esquema: outra referral, agora para a **minha** delegação — os dois nameservers da Cloudflare. É a linha que eu publiquei no registrador, e é a única peça de toda essa cadeia que me pertence.

**Salto 4: a Cloudflare.** Finalmente uma resposta autoritativa, vinda do zone file: `A` e `AAAA` com TTL `300`. E aqui o DNS termina. O que ele devolveu não é o endereço do meu conteúdo, é o endereço da borda que decide o conteúdo — assunto da próxima seção.

Repare na economia do desenho: o cliente paga **uma** pergunta e recebe uma resposta pronta; o recursor paga três e guarda tudo em cache para não pagar de novo. É por isso que a primeira visita a um domínio é mais lenta que a segunda, e por isso que o cache de quem responde importa mais do que a distância física.

### Anatomia de um `dig +trace`

O `+trace` faz o trabalho do recursor na minha máquina, ao vivo. Eu rodei com `+nodnssec` para o texto não virar uma parede de assinaturas — sem esse flag, cada resposta vem acompanhada de `RRSIG`.

```
;; Received 239 bytes from 127.0.0.53#53(127.0.0.53) in 0 ms
.                       7185    IN  NS  m.root-servers.net.
.                       7185    IN  NS  h.root-servers.net.
…                       (as 13 identidades)
;; Received 845 bytes from 199.7.91.13#53(d.root-servers.net) in 129 ms
com.                    172800  IN  NS  a.gtld-servers.net.
…                       (as 13 do .com)
;; Received 370 bytes from 192.12.94.30#53(e.gtld-servers.net) in 128 ms
miijinchronicles.com.   172800  IN  NS  austin.ns.cloudflare.com.
miijinchronicles.com.   172800  IN  NS  peaches.ns.cloudflare.com.
;; communications error to 2803:f800:50::6ca2:c146#53: host unreachable
miijinchronicles.com.   300     IN  A   104.21.33.53
miijinchronicles.com.   300     IN  A   172.67.189.11
;; Received 81 bytes from 172.64.34.239#53(peaches.ns.cloudflare.com) in 14 ms
```

Lendo de cima para baixo:

- **`Received 239 bytes from 127.0.0.53#53`** — a etapa zero, já explicada: ele pediu a lista de roots ao meu próprio stub resolver, porque não a conhece de cor. Zero milissegundos, nada saiu da máquina.
- **`.  7185  IN  NS  …`** — o TTL de `7185` segundos é o meu cache local do RRset do root, parcialmente consumido. Veio de graça, junto com a resposta anterior.
- **`from 199.7.91.13#53(d.root-servers.net) in 129 ms`** — a primeira consulta de rede de verdade. O `#53` é a porta; o nome entre parênteses é o PTR do endereço; o número é o tempo.
- **`com.  172800  IN  NS  …`** — a resposta do root: referral para os treze servidores do `.com`, com TTL de 48 horas porque é a Verisign que publica essa linha, não eu.
- **`from 192.12.94.30#53(e.gtld-servers.net) in 128 ms`** — a segunda consulta, agora ao registry.
- **`miijinchronicles.com.  172800  IN  NS  …`** — a minha delegação, publicada no `.com`. Os mesmos 48 horas, e o mesmo dado que o `dig NS` devolve com TTL `86400` quando perguntado direto à Cloudflare — a diferença é a zona onde a resposta mora, como já vimos.
- **`miijinchronicles.com.  300  IN  A  …`** — a resposta autoritativa final, vinda do `peaches`, com o TTL curto de registro proxiado.
- **`Received 81 bytes from 172.64.34.239#53(peaches.ns.cloudflare.com) in 14 ms`** — a única das três consultas que foi rápida. Não é coincidência: os nameservers da Cloudflare também são anycast e estavam muito mais perto de mim do que a instância específica do root e do TLD que o `+trace` resolveu. Num recursor com cache quente, esse custo inteiro colapsa em um round-trip.

A assimetria entre os `129 ms` e os `14 ms` é um bom lembrete de que, num site estático, o que domina o tempo de carregamento é handshake e distância, não transferência. O conteúdo em si chega de graça.

### Quando o IPv6 Morre e Cai para IPv4

Três linhas no meio da saída merecem parágrafo próprio:

```
;; communications error to 2803:f800:50::6ca2:c146#53: host unreachable
;; communications error to 2803:f800:50::6ca2:c146#53: host unreachable
;; communications error to 2803:f800:50::6ca2:c146#53: host unreachable
```

O `peaches.ns.cloudflare.com` tem `A` e `AAAA`. O `dig` tentou o IPv6 **primeiro** — e `2803:f800:50::6ca2:c146` é IPv6 legítimo, não lixo: repare nos dois últimos grupos, `6ca2:c146`, que em decimal dão `108.162.193.70`, o IPv4 do mesmo servidor. Os nameservers da Cloudflare são dual-stack pelo mesmo motivo que o site é.

O que aconteceu: o caminho IPv6 da minha máquina não tinha rota, a tentativa falhou três vezes, e o `dig` **caiu para IPv4** sem reclamar alto — a resposta veio de `172.64.34.239` em 14 ms e o comando terminou com sucesso.

Esse é o tipo de falha que mais engana, porque é silenciosa por projeto: o *happy eyeballs* dos navegadores faz a mesma coisa, então tudo "funciona" na sua máquina enquanto usuários em rede IPv6-only (móvel, principalmente) veem outra coisa. Para não ser enganado:

```
dig +short AAAA miijinchronicles.com   # o que existe do outro lado
dig -6 miijinchronicles.com            # force o caminho IPv6
curl -6 -sS -o /dev/null -w '%{http_code}\n' https://miijinchronicles.com/
```

Se o `-6` falha e o comando padrão passa, você não tem um site funcionando em IPv6. Você tem um site funcionando **apesar** de não ter IPv6.

E é exatamente a mesma categoria de erro que vai aparecer duas vezes ainda neste texto: o `404` que devolve página em vez de erro, e o `ETag` que um dia existiu e sumiu. Nenhum dos três quebra nada, todos os três passam pelo teste de olhar a tela — e os três só aparecem quando você olha o cabeçalho.

## Onde o DNS Para

O recursor guarda a resposta e entrega ao seu navegador. Para o DNS, o trabalho terminou. É aqui que a maioria dos tutoriais escreve "pronto, seu site está apontado" e vira a página — mas o que ele devolveu não é o meu site, e entender por que isso é assim é metade do artigo.

### A Resposta é a Borda, Não o Worker

A pergunta era `miijinchronicles.com IN A`. A resposta foi esta:

```
miijinchronicles.com.  300  IN  A     172.67.189.11
miijinchronicles.com.  300  IN  A     104.21.33.53
miijinchronicles.com.  300  IN  AAAA  2606:4700:3030::ac43:bd0b
miijinchronicles.com.  300  IN  AAAA  2606:4700:3031::6815:2135
```

Dois `A` e dois `AAAA`. Nenhum deles é meu. `172.67.0.0/16`, `104.21.0.0/16` e `2606:4700::/32` são faixas **anycast da Cloudflare**, compartilhadas com milhões de outros domínios. Eu não tenho um endereço; eu tenho um assento numa faixa que é de outra pessoa — exatamente como no registry, um nível acima.

E repare no TTL: `300`, porque o registro está proxiado. Não é uma escolha minha. Com a nuvem laranja ligada, a Cloudflare fixa o TTL em 300 segundos para poder reorganizar o roteamento de borda sem esperar cache alheio — o que, para o bem ou para o mal, transfere o controle do meu TTL para ela.

Agora o ponto que desmonta o modelo mental de hospedagem: **o DNS não respondeu "o Worker do Kennedy". Ele respondeu "a borda da Cloudflare".** A decisão de qual conteúdo servir acontece depois, e não está no DNS. Está em L7, olhando para três coisas que só existem na requisição:

- o **SNI** do handshake TLS (`miijinchronicles.com`);
- o header **`Host`** do HTTP;
- a **rota** configurada na zona, que mapeia hostname → Worker.

Consequências que mudam como eu opero o site:

- **O mesmo `A` pode servir dois Workers diferentes.** Basta o `Host` e o SNI mudarem. O DNS é idêntico; o conteúdo não.
- **Eu posso mover o site entre Workers, ou até entre Workers e outra coisa, sem tocar em DNS nenhum.** Já que o registro aponta para a borda, a borda decide. Isso é exatamente o que tornou a migração barata.
- **`ping` não prova nada.** Pingar o domínio é pingar a borda, não o meu conteúdo; e ICMP pode estar bloqueado sem que o site esteja fora.
- **Bloqueio por IP não funciona.** Compartilho o endereço com meio mundo, então qualquer regra do tipo "bloqueie o IP X" afeta mais gente do que a pretendida.

Em hospedagem clássica, o raciocínio é o oposto: o registro `A` traz o IP de **uma máquina**, esse IP é seu, ele é estável, e a ele estão amarrados o certificado, o processo e a culpa quando cai. Aqui o registro `A` traz uma promessa: *"fale com a borda, ela sabe"*. Tem quem chame isso de arquitetura sem servidor. Eu acho mais honesto chamar de **servidor que não é seu** — e a diferença importa na hora de debugar.

### Decodificando o IPv6

Olhe os quatro endereços de novo. Duas `A` e duas `AAAA`, sempre aos pares, e sempre com a mesma cara. Isso não é coincidência: é o mesmo host anunciado em dual-stack, com o IPv4 embutido nos últimos 32 bits do IPv6. Em IPv6 cada grupo de quatro dígitos hexadecimais vale dois octetos, então dá para ler de olho:

| IPv6 | grupos finais | IPv4 equivalente |
|---|---|---|
| `2606:4700:3030::ac43:bd0b` | `ac` `43` `bd` `0b` | **172.67.189.11** |
| `2606:4700:3031::6815:2135` | `68` `15` `21` `35` | **104.21.33.53** |

`0xac` = 172, `0x43` = 67, `0xbd` = 189, `0x0b` = 11. E `0x68` = 104, `0x15` = 21, `0x21` = 33, `0x35` = 53. Os pares batem exatamente, na ordem.

Por que isso importa na prática:

1. **Prova em vez de fé.** Se você quer afirmar que um serviço entrega o mesmo conteúdo em IPv4 e IPv6, o jeito honesto é mostrar que o endereço é o mesmo nó. Comparar prefixos ou confiar na documentação é o jeito de errar.
2. **Diagnóstico de "IPv6 quebrado".** Quando alguém relata lentidão em rede móvel, você já sabe a primeira pergunta: o `AAAA` responde no mesmo ritmo do `A`? Se o `AAAA` existe mas o caminho até ele morre, o cliente cai para IPv4 — e o "lento" era o timeout do IPv6 antes do fallback.
3. **Você entende o que o `+trace` mostrou antes.** As três falhas de `host unreachable` na seção anterior não eram endereço inexistente: era o mesmo servidor, alcançável em IPv4 e inalcançável em IPv6 a partir da minha máquina.

Vale a ressalva: essa embutidão do IPv4 no IPv6 é uma convenção operacional da Cloudflare, não uma regra do protocolo. O IPv6 do seu site em outro provedor pode não codificar nada — e aí a verificação tem que ser feita olhando os dois endpoints, não lendo hex.

E o DNS já fez tudo o que podia: entregou um IP da borda e saiu de cena. O que acontece entre esse IP e o primeiro byte de HTML é TLS — e é o próximo capítulo.

## TLS: o Certificado Que Eu Nunca Emiti

O DNS entregou um endereço. Endereço não é canal: qualquer coisa entre você e a borda poderia ler e alterar o que passa. O TLS existe para transformar esse fio em três garantias ao mesmo tempo — **confidencialidade** (ninguém lê), **integridade** (ninguém altera sem quebrar) e **autenticação** (você está falando com quem diz ser).

HTTP puro não tem nenhuma das três. HTTPS é HTTP com essas três penduradas no handshake.

### O Handshake em Quatro Passos

**1. ClientHello.** O navegador diz o que sabe fazer — versão de TLS, lista de cifras — e manda uma informação que parece detalhe e é o eixo de tudo: `SNI = miijinchronicles.com`. Sem ela, o servidor não tem como saber qual dos milhões de certificados apresentar, porque o IP é compartilhado.

**2. ServerHello e certificado.** A borda escolhe o certificado cujo SAN casa com aquele SNI e envia a cadeia inteira.

**3. Validação.** O navegador confere três coisas: o nome bate com o que pediu? está dentro da validade? a cadeia termina numa raiz que ele já confia? Se qualquer uma falhar, a conexão não começa — e é por isso que certificado vencido não é "aviso": é indisponibilidade.

**4. Troca de chaves.** A criptografia **assimétrica** (caríssima) é usada só para negociar. A partir daí tudo corre em **simétrica** (AES-GCM ou ChaCha20), que é rápida. E a chave negociada é efêmera, descartada ao fim da conexão: é isso que se chama *forward secrecy* — quem gravar o tráfego hoje e roubar a chave privada amanhã não consegue decifrar nada.

No TLS 1.3 esse ciclo fecha em **um round-trip** (eram dois no 1.2), e em conexões repetidas pode ser **0-RTT** via *session ticket*. Se a resposta trouxer o cabeçalho `alt-svc: h3`, ela está avisando que aquele host aceita HTTP/3 — e a próxima visita pode nem passar por TCP.

E aqui está a conexão com a seção anterior: **o DNS decidiu para onde ir; o SNI decidiu o que você vai ver.** O mesmo IP anycast, com SNIs diferentes, devolve certificados diferentes e, atrás deles, Workers diferentes.

### O Certificado Que Eu Nunca Emiti

Eu nunca pedi certificado nenhum. Não gerei chave, não subi CSR, não colei nada em painel. O que existe hoje na borda é isto:

```
subject    = CN=miijinchronicles.com
issuer     = C=US, O=Google Trust Services, CN=WE1
notBefore  = Nov  7 19:02:03 2026 GMT
notAfter   = Feb  5 20:02:00 2027 GMT
X509v3 Subject Alternative Name:
    DNS:miijinchronicles.com, DNS:*.miijinchronicles.com
```

Quatro leituras:

**O emissor não é a Cloudflare.** `WE1` é um intermediário da **Google Trust Services**. A Cloudflare roda CA própria, mas só para o trecho interno; para o certificado que o seu navegador vê, ela atua como cliente de CAs públicas parceiras (GTS, Let's Encrypt, SSL.com), escolhidas por conta e rotacionadas sem aviso. Eu não escolho qual.

**A validade é de 90 dias** (7 de novembro a 5 de fevereiro). Não é escolha minha e não é obrigação legal — o teto do CA/B Forum é 398 dias —, é política do emissor. Consequência prática: **renovação automática deixou de ser conveniência e virou infraestrutura**. Se o processo falhar, meu site cai sem nenhum deploy ter acontecido, e o sintoma vai parecer rede.

**O SAN tem o apex e o curinga:** `miijinchronicles.com` **e** `*.miijinchronicles.com`. É por isso que `www`, `app` e `api` funcionam sem eu emitir mais nada — e é por isso que `beta.app.miijinchronicles.com` não funcionaria, porque curinga cobre **exatamente um nível**, como já vimos na seção 3.

**Tudo é público.** Cada certificado emitido para um domínio fica registrado em logs de transparência (Certificate Transparency), consultáveis por qualquer um. Isso é bom: eu consigo auditar se alguém emitiu certificado para o meu domínio sem eu pedir. Mas é irreversível — não existe certificado privado.

### A Cadeia e o Cross-Sign

O navegador não recebe um certificado, recebe uma **cadeia**:

```
0  CN=miijinchronicles.com              ← folha (a minha)
   i: CN=WE1                            ← intermediário
1  CN=WE1
   i: GTS Root R4
2  CN=GTS Root R4
   i: GlobalSign Root CA                ← cross-sign
```

A validação percorre a cadeia de baixo para cima até chegar a uma **raiz que já esteja no trust store** do sistema. O passo 2 é interessante: a `GTS Root R4` já é raiz confiável em sistemas modernos, então o navegador do seu computador nunca precisa dele. Mas a Cloudflare o envia de qualquer forma, porque essa cópia específica é **cross-assinada pela GlobalSign**.

Traduzindo: aparelhos antigos (Android abaixo de 7.1, que não recebem atualização de trust store) não conhecem a raiz da Google, mas conhecem a da GlobalSign. O cross-sign é uma ponte para eles. Se o site fosse servido com a cadeia "correta" e minimalista, funcionaria em todo lugar — menos nesses aparelhos, que veriam erro de certificado.

Duas lições:

- **cadeia não é certificado.** Enviar um pouco a mais é higiene de compatibilidade; raízes sobrando são ignoradas pelo cliente, que só valida até a primeira que conhece.
- **"funciona no meu navegador" não valida cadeia.** Chrome e Firefox têm stores próprios; curl, Java e Android usam outras. `openssl s_client` valida contra o store do sistema e mostra `Verify return code: 0 (ok)` — foi assim que eu confirmei, em vez de confiar.

### Um Certificado, Não Dois

Este é o ponto em que o TLS de Workers deixa de ser detalhe e passa a ser argumento de arquitetura.

No modelo clássico existem **dois** certificados:

```
visitante ──TLS──▶ CDN/edge ──TLS──▶ meu servidor
              (edge cert)      (origin cert)
```

O primeiro é o que o visitante vê. O segundo é o que a CDN usa para falar com o servidor de origem — e é a fonte de uma família inteira de erros que todo mundo que operou CDN conhece: certificado de origem vencido, hostname fora do SAN, `526 Invalid SSL Certificate`, e a sopa de modos `Flexible` / `Full` / `Full (Strict)` que decide se aquele segundo trecho é cifrado e se é validado.

No Workers **não existe o segundo trecho.** O Worker roda dentro do PoP, atrás do mesmo processo que terminou o TLS do visitante. Não há origin para apresentar certificado, não há handshake interno, não há `526`, e as opções `Full` / `Flexible` simplesmente não existem no painel — não há o que configurar.

Eu troquei uma pilha de configuração de TLS por uma frase: **existe o certificado da borda, e é só ele.** Menos superfície, menos modo de falhar.

E isso me leva à pergunta que o texto vinha fugindo desde a seção 5. Se não existe origin, se não existe servidor apresentando certificado, onde exatamente o Worker roda?

## E o Servidor?

A resposta curta desaponta: **roda ali mesmo.** No mesmo PoP que terminou o seu TLS. Não existe salto seguinte, não existe chamada para outro datacenter, não existe uma máquina minha do outro lado do fio esperando a requisição chegar.

A prova está num cabeçalho de vinte e poucos caracteres, que a resposta traz sem alarde:

```
cf-ray: a5709676ef0f4ae8-GRU
server: cloudflare
```

O sufixo é o código IATA do aeroporto mais próximo do PoP que me atendeu: **GRU**, São Paulo. Se eu estivesse em Lisboa, veria `LIS`. Não é uma etiqueta decorativa — é o registro de qual instância física respondeu, e ele só existe porque a resposta foi produzida **localmente**, naquele PoP, e não em algum lugar remoto atrás dele.

O caminho, então, encolhe de forma constrangedora para quem vem de hospedagem tradicional:

```
DNS → IP anycast → TLS terminado no PoP → roteamento por SNI + Host
    → Worker executa naquele PoP → assets do cache daquele PoP → resposta
```

Compare com o modelo clássico, que tem uma seta inteira a mais:

```
visitante → CDN → [internet] → origin → resposta → CDN → visitante
```

A seta da internet é onde moram latência, certificado de origem, `502`, `504`, timeouts, disco cheio, processo morto. No meu caminho não há essa seta. Não há para onde a requisição vazar.

### O que deixa de existir

Com o origin fora, some junto uma lista inteira de objetos e verbos que compõem o modelo clássico há anos:

- não há **IP meu** para pingar, e pingar o domínio mede a borda, não o site;
- não há **SSH**, não há `systemctl`, não há "reinicia o serviço";
- não há **disco persistente**: o Worker não escreve arquivo e espera encontrá-lo na próxima requisição;
- não há **capacidade para dimensionar** — nenhuma instância, nenhum vCPU, nenhuma RAM escolhida por mim;
- não há **"o servidor caiu"**. Quando algo falha, não é uma máquina minha que apagou: é a versão publicada, a configuração de rota ou a própria rede;
- não há **"subir o servidor"**. Existe `deploy` e existe `rollback` — e rollback é trocar o ponteiro para uma versão anterior, que já está inteira lá, assets inclusos.

Vale a precisão, porque é fácil escorregar para o exagero: **existe computação.** O Worker executa num isolate dentro de uma máquina da Cloudflare, naquele PoP. O que não existe é **servidor meu**: um processo que espera, um endereço que me pertence, um estado que sobrevive entre requisições, uma máquina que eu reinicio às três da manhã.

Quando o "servidor" desaparece do vocabulário, a pergunta "o site está no ar?" muda de natureza: deixa de ser sobre uma máquina e passa a ser sobre uma **versão publicada** e uma **rota**. É uma pergunta melhor, mas é uma pergunta diferente — e quem nunca operou infraestrutura de verdade não percebe a troca.

E tem o preço, que eu não vou esconder: **não existe para onde fugir.** Sem origin, não há failover — se a Cloudflare tiver problema, o site tem problema, e não há um plano B esperando num IP reserva. Num site estático isso é uma troca que eu aceito de olhos abertos; em sistema com estado, seria uma decisão bem mais séria. Volto nisso no fim.

O que ainda não respondi é o mais concreto: se o Worker não lê disco, de onde vem o HTML? A resposta é a camada que faz o trabalho silencioso — os **Static Assets**.

## Static Assets: o HTML Já Estava Lá

A pergunta é boa porque ela ataca a intuição. Em qualquer hospedagem tradicional, o servidor tem um diretório com arquivos e o processo lê do disco na hora. Se não há servidor e não há disco, o arquivo precisa estar em outro lugar — e está: **ele subiu junto com o deploy.**

### O Asset Viaja com a Versão

Quando eu rodo o deploy, o Wrangler empacota duas coisas num artefato só: o código do Worker (no meu caso, vazio de lógica) e **todos os arquivos do diretório `public/`** que o Hugo gerou. Isso tudo vira uma **versão**, e a versão é imutável.

A mudança de modelo é mais profunda do que parece:

| | Hospedagem clássica | Workers Static Assets |
|---|---|---|
| Onde o arquivo mora | disco do servidor / storage do provedor | dentro da **versão** do Worker |
| Unidade de deploy | o site | Worker + assets, um artefato só |
| Rollback | volta o site | volta Worker **e** assets, coerentes entre si |
| Origin | existe, e pode cair | **não existe** |
| Invalidação de cache | purgar arquivo/URL | publicar nova versão |
| Requisição de asset | passa pelo origin | não invoca código nenhum |

**Não existe "purgar cache" arquivo por arquivo** — a invalidação é por versão. E **requisição de asset não executa código**: ela nem chega no Worker, como vou mostrar a seguir.

O rollback não restaura arquivos, ele **aponta de volta** para uma versão anterior que está inteira lá, com os assets dela. Não existe o cenário de voltar o código e ficar com o CSS novo — os dois viajam juntos.

### Três Camadas de Roteamento

Toda requisição que chega ao PoP passa por três perguntas, nesta ordem:

**1. Existe um arquivo com esse caminho?** Se sim, serve. O Worker não é invocado, não consome CPU, não entra na conta.

**2. Não existe? Chama o Worker** — se houver script. Ele pode responder ou devolver a requisição para os assets (`env.ASSETS.fetch()`). No meu caso não há script, então esse passo é vazio.

**3. Ninguém respondeu.** Aí entra o `not_found_handling`, que decide o que fazer com o que não casou.

É nessa terceira camada que aparece uma das configurações que mais mudam o resultado na prática:

```toml
[assets]
directory = "./public"
not_found_handling = "404-page"
```

Sem essa linha, o Worker devolve um `404` seco, sem corpo, sem navegação, sem identidade visual. Com ela, ele serve o `404.html` mais próximo — no caso, o que o Hugo gerou com o layout do site. A diferença se mede:

```
$ curl -sS -o /dev/null -w 'status=%{http_code} size=%{size_download}\n' \
    https://miijinchronicles.com/nao-existe-xyz/
status=404 size=10232
```

**Dez mil e duzentos bytes num 404.** É a prova de que a página de erro está sendo servida pelo site e não pela plataforma — e é o tipo de coisa que ninguém verifica porque "o 404 funciona". Um `404` seco também "funciona"; ele só faz o visitante ir embora.

E tem um comportamento adjacente que também só aparece olhando o cabeçalho:

```
$ curl -sS -o /dev/null -w '%{http_code}\n' https://miijinchronicles.com/index.html
307
```

O `/index.html` existe como asset, mas a plataforma o normaliza para `/` com um `307` — é o `html_handling`, cujo padrão garante que cada página tenha **uma** URL canônica em vez de duas servindo o mesmo conteúdo. Bom para SEO, e uma decisão da plataforma que eu não escrevi em lugar nenhum do meu repositório.

### Cache de Borda e o `HIT` Probabilístico

Aqui estão os cabeçalhos que a borda devolve para a home:

```
$ curl -sSI https://miijinchronicles.com/
HTTP/2 200
cf-cache-status: HIT
cache-control: public, max-age=0, must-revalidate
content-encoding: br
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), microphone=(), camera=()
server: cloudflare
cf-ray: a5709676ef0f4ae8-GRU
alt-svc: h3=":443"; ma=86400
```

Três coisas aconteceram aqui ao mesmo tempo, e é bom separá-las:

- **`cf-cache-status: HIT`** — o HTML veio do cache de borda. Não houve execução de nada meu; o arquivo já estava naquele PoP. O primeiro visitante de um PoP gera `MISS`, os seguintes veem `HIT`.
- **`content-encoding: br`** — Brotli aplicado na entrega, sem nada no meu build. Repare que não existe `content-length` correspondente: a resposta é comprimida em fluxo.
- **`alt-svc: h3`** — é o cabeçalho prometido lá na seção 6: aquele host aceita HTTP/3, então a próxima visita pode trocar TCP+TLS por QUIC e economizar um round-trip inteiro.

E os quatro headers de segurança (`x-frame-options`, `x-content-type-options`, `referrer-policy`, `permissions-policy`) não vêm da plataforma: são meus, e vêm de um arquivo de texto no repositório. Falo deles na próxima seção.

Sobre o `HIT`, existe uma ressalva que quase ninguém lê na documentação e que vale citar literalmente, porque ela desmonta o print de dashboard:

> Due to a technical limitation that we hope to address in the future, the `CF-Cache-Status` header is not always entirely accurate. It is possible for false-positives and false-negatives to occur. This should be rare. In the meantime, this header should be considered as returning a "probabilistic" result.

Ou seja: o `HIT` que eu acabei de te mostrar é **indício**, não prova. Se o número de cache hit virar métrica de relatório, ele precisa vir do analytics, não do `curl`.

### Limites, Billing e o Que Não Existe

A parte chata, mas que decide se a arquitetura serve para o seu caso:

| Limite | Plano free | Plano pago |
|---|---|---|
| Arquivos por versão | 20.000 | 100.000 |
| Tamanho por arquivo | 25 MiB | 25 MiB |

Vinte mil arquivos é folgado para um blog, e é um teto **contável**: uns 2.000 posts com paginação, taxonomias, aliases e imagens já encostam nele. É o tipo de limite que a hospedagem clássica não impunha dessa forma, e que eu passei a considerar ao decidir se cada imagem entra no repositório ou vai para storage separado.

O billing é o ponto que fecha a conta da migração, e está na documentação sem meias palavras:

> Requests to static assets are **free** and unlimited. Requests to the Worker script are billed according to Workers pricing.

Como o Hugo serve HTML direto dos assets, **nenhuma requisição minha invoca script**. O blog é gratuito e ilimitado em requisições — o que, num site estático, é a diferença entre "cabe no plano" e "não cabe".

E as ausências, que ninguém descobre lendo feature list:

- **sem redimensionamento de imagem.** Assets são servidos como estão; AVIF/WebP/resize é produto separado, e não vem de brinde.
- **sem ISR ou SSG sob demanda.** Assets-only significa build inteiro a cada deploy — não existe "renderiza essa página no primeiro acesso".
- **sem suporte a `Range`.** Um pedido com `Range` devolve `200` com o arquivo **inteiro**, sem `Content-Range` nem `Accept-Ranges`. A documentação cita o caso: Safari tentando tocar vídeo quebra. Se um dia eu servir vídeo, preciso de `run_worker_first` e de um Worker que devolva `206` na mão.
- **sem purge granular.** Já dito, mas vale repetir porque é a pergunta que todo mundo faz.

Nada disso invalida a escolha para um blog. Mas um post que só lista vantagem não serve para decidir nada — e é por isso que essas quatro linhas estão aqui, e não no rodapé.

## Headers como Código

Os quatro headers de segurança que apareceram no `curl` da seção anterior não vêm da Cloudflare. Vêm de um arquivo de texto chamado `_headers`, versionado no meu repositório:

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

Esse arquivo **não é servido** — o Workers o lê no deploy e aplica as regras às respostas. O Hugo copia o `static/` para o `public/`, então o arquivo viaja junto com os assets sem eu precisar mudar nada no tema. E já que ele está no Git, mudar um header virou um commit revisável, em vez de um clique em painel que ninguém vê.

### Regras que se Acumulam

O formato é bloco: uma linha de padrão de URL, seguida por linhas indentadas de `nome: valor`. E a primeira coisa que surpreende quem vem de configuração de servidor é que **as regras não se substituem — elas se acumulam**. Uma requisição que case com três padrões recebe os headers dos três.

O arquivo que eu tenho hoje tem duas regras, e a segunda é a que interessa:

```
https://miijinchronicles.miyake-developer.workers.dev/*
  X-Robots-Tag: noindex

/*
  X-Content-Type-Options: nosniff
  ...
```

A primeira existe para uma razão só: enquanto o domínio próprio não estava pronto, o site também respondia no endereço `*.workers.dev` da Cloudflare, e eu não queria que o Google indexasse os dois. Página duplicada em dois domínios é conteúdo duplicado — e conteúdo duplicado é penalidade de SEO que se resolve com uma linha de header.

Agora o detalhe que me custou uma verificação errada, e que vale como aviso. A documentação diz:

> Redirects are applied before headers, so when a request matches both a redirect and a header, the redirect takes priority.

Li isso e concluí — errado — que uma resposta de redirect sairia sem os headers de `_headers`, já que o redirect "tem prioridade". Fui conferir, e a resposta real é esta:

```
$ curl -sS -o /dev/null -D- https://miijinchronicles.com/posts/
HTTP/2 301
content-length: 0
location: /mii/posts/
permissions-policy: geolocation=(), microphone=(), camera=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
```

Os quatro headers do `/*` estão lá. O que a documentação quer dizer é que o **redirect vence na disputa pelo status e pelo destino** — ele não anula os headers das regras que casaram. "Prioridade" aqui não significa "exclusividade", e essa diferença só se resolve lendo a resposta.

Esse `301` também substitui uma coisa que o Hugo gera por padrão. Para aliases, o Hugo emite um HTML com `<meta http-equiv="refresh">`, que funciona no navegador mas é péssimo para buscador e para quem usa leitor de tela. Com `_redirects` eu troquei o stub por um redirect de verdade:

```
/posts        /mii/posts/            301
/posts/*      /mii/posts/:splat      301
/chronicles   /mii/chronicles/       301
/chronicles/* /mii/chronicles/:splat 301
```

Três limites do formato que eu precisei aprender na prática:

- **um splat por padrão de URL.** `*` casa tudo, e só pode existir um por linha. Foi por isso que a receita pronta do Cloudflare Pages (`:project.pages.dev`) não funcionou em Workers — aquele placeholder não existe lá, e o padrão precisa do host real mais `/*`.
- **`!` remove header.** `! Content-Security-Policy` desfaz uma regra mais genérica, o que permite montar o básico em `/*` e abrir exceções por caminho.
- **limites duros:** 100 regras no arquivo, 2.000 caracteres por linha. Header repetido é concatenado com vírgula, não sobrescrito.

### O Caso `immutable`

Não existe `Cache-Control` customizado no meu `_headers`, e isso é decisão, não esquecimento. A justificativa está escrita no próprio arquivo:

> Sem Cache-Control customizado de propósito: os assets já saem com `Cache-Control: public, max-age=0, must-revalidate` + ETag (304 no browser). Cache longo só valeria para arquivos fingerprinted — hoje só o JS é; nenhum CSS é (`main.min.css`, `dark.min.css`, `normalize.min.css`, `tft.css`, `custom.css` têm nome fixo e serviriam versão velha).

A documentação sugere exatamente o contrário, para quem tem arquivos com hash no nome:

```
/static/*
  Cache-Control: public, max-age=31556952, immutable
```

Esse `31556952` é um ano em segundos. E `immutable` diz ao navegador algo mais forte do que "cacheie": diz **"não pergunte de novo"**. Nem com `F5`. O browser simplesmente não revalida.

O que acontece se eu aplicar isso a `normalize.min.css`?

1. eu troco o conteúdo do arquivo e faço deploy;
2. a versão nova está na borda, correta e disponível;
3. o navegador do visitante continua usando o CSS antigo, porque `immutable` o proibiu de perguntar — e vai continuar por um ano;
4. e não existe purge granular para eu forçar: a invalidação é por versão, mas o cache do **navegador** não sabe que a versão mudou, porque o nome do arquivo não mudou.

O erro não é usar `immutable`. O erro é `immutable` sem **fingerprint**. Se o arquivo se chamasse `normalize.2d8ecf40.min.css`, o conteúdo novo teria nome novo, seria buscado de novo, e o antigo poderia ficar cacheado um ano sem causar problema. É o Hugo que faz isso com `resources.Fingerprint`, e é o passo que falta no meu tema — hoje só o JS passa por esse pipeline.

Enquanto isso, o `max-age=0, must-revalidate` é a escolha **lenta e correta**: todo visitante revalida todo asset em toda navegação. Para um blog com menos de 100 KB de CSS, pagar isso em requisições é melhor do que servir layout quebrado.

### O `ETag` Que Falta em HTML

A documentação de Static Assets afirma, sem ressalva:

> **`ETag`** — This header complements the default `Cache-Control` header. Its value is a hash of the static asset file, and browsers can use this in subsequent requests with an `If-None-Match` header to check for freshness, without needing to re-download the entire file in the case of a match.

Fui conferir no meu deploy, arquivo por arquivo:

```
/css/normalize.min.css   etag: "2d8ecf406aaa989f5600f4c5bf644467"
/sitemap.xml             etag: "f65fc65a9a5e37c5a57ddbc3225a22f9"
/  (HTML)                etag: (ausente)
/robots.txt              etag: (ausente)
```

Assets não-HTML têm `ETag`. Página HTML não tem. E `robots.txt` também não — o que já mostra que a regra não é "HTML versus resto"; é mais estranha do que isso, e eu não vou especular sobre o mecanismo interno porque não tenho como provar.

O que eu **posso** provar é o efeito, com requisições condicionais:

```
### CSS com If-None-Match correto
HTTP/2 304
etag: "2d8ecf406aaa989f5600f4c5bf644467"

### HTML com If-None-Match
HTTP/2 200

### HTML com If-Modified-Since
HTTP/2 200
```

O CSS responde `304` — o ciclo saudável: o navegador pergunta, recebe "não mudou", e o corpo não trafega. O HTML responde `200` **sempre**, porque não há validador para enviar: sem `ETag` e sem `Last-Modified`, a pergunta "mudou?" não pode nem ser feita.

Junte isso ao `Cache-Control: public, max-age=0, must-revalidate` que todo asset recebe por padrão e a conta fecha:

| | Validador | Revalida? | Resultado |
|---|---|---|---|
| CSS / XML | `ETag` | sim | `304`, zero bytes de corpo |
| HTML | nenhum | sim | `200`, corpo inteiro novamente |

Em documento comprimido com Brotli são alguns kilobytes por navegação — barato no desktop, perceptível em rede móvel, e sobretudo **invisível**: nada quebra, nada aparece no console, nenhum usuário reclama. É a mesma categoria do `404` que devolve página e do IPv6 que cai para IPv4 sem avisar.

A lição de método vale mais do que o achado: **documentação descreve intenção, `curl` descreve comportamento.** Quando as duas divergem, a segunda é a que o seu visitante experimenta — e a divergência só aparece se você pedir o cabeçalho, em vez de olhar a tela.

## Onde Quebra

Cada camada deste texto falhou pelo menos uma vez comigo, e a lição que vale para todas é a mesma: **o sintoma nunca diz em qual camada está o problema.** "O site não abre" é a descrição de seis causas diferentes, e a única forma de não chutar é descer a escada na ordem em que a requisição sobe.

**Camada DNS.** O começo é sempre a fonte sem cache — o autoritativo do TLD.

| Sintoma | Onde olhar | Causa |
|---|---|---|
| `NXDOMAIN` em um hostname e o apex funciona | zona | apex ≠ `www`: o label não tem registro próprio |
| Mudei e continua antigo | três caches (§2) | browser, SO e recursor. `resolvectl flush-caches` resolve o seu, não o do vizinho |
| O registrador aceitou e nada responde | delegação no registry | `dig @a.gtld-servers.net <domínio> NS +norecurse` — se ainda mostra o NS velho, falta publicar |
| `dig` mostra o novo, navegador o antigo | `nsswitch.conf` / `/etc/hosts` | caminhos diferentes; `dig` não passa pelo `getaddrinfo` |
| `SERVFAIL` em vez de `NXDOMAIN` | autoritativo | o servidor não tem a zona, ou o provedor não a provisionou |

**Camada TLS.** Aqui os sintomas parecem rede, mas são certificado.

| Sintoma | Causa |
|---|---|
| Erro de certificado em subdomínio profundo | `beta.app.` não cabe em `*.domínio.com` — curinga cobre um nível |
| Certificado vencido sem eu ter feito deploy | renovação automática falhou; a validade é do emissor, não do meu build |
| `www` dá erro de certificado em vez de redirect | `www` fora do SAN; o TLS acontece antes do redirect |
| `526 Invalid SSL Certificate` | não existe aqui — é erro de modelo com origin, e Workers não tem origin |

**Camada de borda e assets.** A mais silenciosa, porque nada dela aparece na tela.

| Sintoma | Onde olhar | Causa |
|---|---|---|
| `404` sem layout | `wrangler.toml` | falta `not_found_handling = "404-page"` |
| Página servida em duas URLs | `html_handling` | falta normalização; o padrão já devolve `307` para `/index.html` |
| CSS novo que não aparece | `_headers` | `immutable` em arquivo sem fingerprint — o browser não revalida por um ano |
| Headers ausentes em um path só | `_headers` | a regra não casou, ou um `!` removeu; lembrando que só cabe um splat por padrão |
| Regra escrita e sem efeito nenhum | padrão de URL | placeholder inexistente em Workers (`:project.pages.dev`) |
| HTML sempre baixando de novo | cabeçalho | sem `ETag`, não existe caminho para `304` |
| `cf-cache-status` contraditório | analytics | o próprio header é "probabilístico" |
| IPv6 lento ou quebrado | `dig -6` / `curl -6` | fallback silencioso: o cliente cai para IPv4 sem reclamar |

E a ordem de investigação, resumida em uma linha, porque ela resolve mais casos do que todas as tabelas acima:

```
registro no TLD → autoritativo da zona → TLS → borda → resposta HTTP → navegador
```

Sempre da esquerda para a direita. A primeira etapa que destoar é onde está o problema — e você para ali, em vez de continuar procurando.

## Por Que Eu Saí do Netlify

Eu não saí porque algo estava quebrado. Isso precisa ficar claro antes de qualquer coisa, porque a versão fácil deste artigo é "o Netlify era ruim" — e não é verdade. O site funcionava, o deploy funcionava, o TLS funcionava.

O que me fez mudar foi arquitetura e custo, nessa ordem.

### O Que Era Igual

A razão de a migração ter custado uma tarde, e não um mês, é que os dois produtos compartilham a **mesma interface** — e ela é feita de arquivos que já estavam no meu repositório:

| Contrato | Netlify | Workers Static Assets |
|---|---|---|
| Headers por arquivo | `_headers` | `_headers` |
| Redirects por arquivo | `_redirects` | `_redirects` |
| Unidade de deploy | site inteiro, atômico | versão (Worker + assets) |
| Rollback | volta a versão anterior | aponta para versão anterior |
| Build a partir do Git | sim | sim |

Nada de `netlify.toml` reescrito, nada de redirect migrado à mão. O `static/_headers` e o `static/_redirects` do meu tema atravessaram a mudança **sem uma linha alterada**, porque o formato é o mesmo e as semânticas coincidem. Quem inventou esse par de arquivos acertou o nível de abstração: são dados, não configuração de fornecedor.

Essa é a lição de arquitetura que eu levo da migração: **quanto mais do seu comportamento mora em arquivo versionado, mais barato é trocar de provedor.** O que estava em painel, eu perdi ou reescrevi; o que estava em `_headers`, veio de graça.

### O Que Mudou

Abaixo da interface igual, o substrato é outro — e é aqui que a mudança deixa de ser estética.

**Saiu o origin.** Esta é a mudança que reorganiza todo o resto. No Netlify eu tinha CDN na frente de storage/origin; no Workers, o Worker roda no PoP que atendeu o visitante. Some o segundo hop de TLS, some o certificado de origem, some a família de erros que vem com ele. Num site estático isso não muda o resultado visível — mas muda tudo o que pode dar errado.

**Mudou a conta.** No Netlify, tráfego consome cota do plano. No Workers Static Assets, requisição de asset é gratuita e ilimitada; só invocação de script é cobrada. Como o Hugo serve HTML direto dos assets, o meu consumo de compute é **zero** — eu paguei por uma arquitetura onde o trabalho do servidor simplesmente não acontece.

**Mudou o modelo de certificado.** Um certificado, emitido automaticamente, sem escolha de modo `Full`/`Flexible` porque não existe segundo trecho. Menos botão, menos estado inconsistente possível.

**Juntou tudo num lugar só.** Zona DNS, certificado, rotas, deploy e cache de borda passaram a viver na mesma conta, no mesmo painel, com a mesma API. Antes, o DNS estava num lugar, a hospedagem em outro e o certificado em um terceiro — e cada investigação começava com a pergunta "de quem é esse erro?".

**Não mudou nada do conteúdo.** Zero post editado, zero URL alterada, zero HTML reescrito. O Hugo continua gerando exatamente o mesmo `public/`. Se a migração tivesse exigido mexer no conteúdo, o custo teria sido outro.

### O Cutover

A ordem das operações importa mais do que a pressa, e a minha foi esta:

1. **Zona na Cloudflare.** Troca dos nameservers no registrador. É a única etapa com relógio de 48 horas, e por isso é a que eu faço com o site ainda no ar no provedor antigo.
2. **Deploy do Worker.** Feito e verificado antes de qualquer DNS apontar para ele.
3. **Custom Domain no apex.** E aqui veio o primeiro atrito real: a Cloudflare recusou o hostname porque já existiam registros `A`/`CNAME` para ele na zona. A mensagem fala em **"externally managed DNS records"** — ela não vai sobrescrever em silêncio algo que alguém criou à mão. A solução é apagar os registros antigos primeiro e só então anexar o domínio.
4. **Redirect de `www` para o apex.** Feito na **zona**, não no Worker: regra de redirect mais "Always Use HTTPS". Isso importa porque o redirect vive numa camada que não depende do meu deploy — se eu fizer rollback do Worker, o `www` continua se comportando direito.
5. **`_headers`, `_redirects` e `not_found_handling`.** Ajustados e verificados com `curl`, um por um: os quatro headers de segurança, o `301` do `/posts/`, o `404` com corpo.
6. **Limpeza do Netlify.** Só depois de tudo acima estável.

Duas coisas que eu faria diferente, e que valem mais do que a lista:

**Testar o destino antes de trocar o DNS.** Dá para falar com um hostname como se o DNS já apontasse para outro lugar:

```
curl --resolve miijinchronicles.com:443:<IP-do-edge> -sSI https://miijinchronicles.com/
```

Isso permite validar certificado, headers, 404 e redirect no destino **sem tocar em DNS nenhum**. Se eu tivesse feito isso desde o começo, teria descoberto o problema do Custom Domain sem nenhum visitante afetado.

**Baixar o TTL do que existe antes, não do que vai existir.** Eu não posso mexer no TTL da delegação (é da Verisign), mas posso mexer no TTL dos registros que o provedor antigo serve. Se o site está publicado como `A`/`CNAME` no provedor antigo, reduzir aquele TTL para 300 uns dois dias antes faz os caches alheios expirarem rápido na hora H. É a única alavanca real de "propagação rápida", e ela se aciona **antes** da migração.

### O Que Eu Perdi

Não existe migração sem perda, e esta é a parte que eu não vou maquiar:

**Não tenho para onde fugir.** Sem origin, não existe failover. Se a Cloudflare tiver um incidente, o meu site tem um incidente, e não há um plano B esperando num IP reserva. Num blog estático eu aceito essa troca — em qualquer sistema com estado, eu pensaria duas vezes antes de assinar embaixo.

**Não tenho purge granular.** Não existe "limpar essa URL agora". A invalidação é por versão, e isso me obrigou a pensar em cache de um jeito diferente — inclusive no cache do navegador, que eu não controlo de forma alguma.

**Ganhei um teto contável.** Vinte mil arquivos por versão é folgado hoje e virará conversa algum dia. No Netlify, esse não era um número que eu acompanhava.

**Perdi o `ETag` no HTML.** Não sei se o Netlify o enviava — nunca olhei, o que já é uma lição —, mas hoje ele não existe no meu deploy, e eu sei exatamente o que isso custa: navegação revalidando sem `304`.

**Perdi a familiaridade.** Eu sabia onde olhar no Netlify quando algo parecia errado. Agora eu sei onde olhar no Cloudflare porque segui o caminho inteiro e escrevi este texto — e é bem provável que esse seja o motivo real de eu ter escrito este texto.

## O Servidor Que Não Apareceu

A promessa do título era seguir o caminho do `Enter` até o seu navegador. Seguimos: caches locais, recursor, root, `.com`, autoritativo, IP anycast, SNI, handshake, borda, cache, assets, cabeçalhos, tela.

Em nenhum ponto desse trajeto apareceu um servidor. Não porque eu escondi: porque não tem. O que existe é uma rede que já tem o conteúdo, um certificado emitido por terceiros, uma versão imutável publicada e regras de roteamento que não moram no DNS.

Isso não é uma curiosidade sobre precificação de CDN. É a razão de o modelo ser mais resistente a erro: **cada peça que eu não preciso operar é uma peça que não pode cair às três da manhã.** O que eu tenho em troca é menos controle e um fornecedor só — um trade-off que eu faria de novo para um blog, e que eu não faria no escuro.

O que sobra é a parte que interessa: eu apertei `Enter`, e a página apareceu. Exatamente como antes da migração. A diferença é que agora eu sei o que aconteceu no meio — e você também.
