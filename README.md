# Transakauto Clermont-Fd — site d'acquisition de leads

Site vitrine + acquisition de leads pour l'agence d'intermédiation automobile Transakauto Clermont-Fd
(AP AUTOMOBILE, 8 Avenue Jean Curabet, 63170 Aubière).
Trois pages utiles : accueil, demande d'estimation, demande de reprise. Chaque demande part par email.

Stack : Next.js 15 (App Router) · React 19 · Tailwind 4 · nodemailer · zod.

## Démarrer

```bash
npm install
cp .env.local.example .env.local   # puis remplir les valeurs
npm run dev                        # http://localhost:3200
```

## Configurer la réception des demandes

Tout se passe dans `.env.local` :

| Variable | Rôle |
| --- | --- |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | serveur d'envoi (Gmail : `smtp.gmail.com`, port `465`, mot de passe **d'application**) |
| `LEADS_NOTIFY_TO` | adresse(s) qui reçoivent les demandes, séparées par des virgules |
| `LEADS_NOTIFY_FROM` | expéditeur affiché (doit être autorisé par le SMTP) |
| `LEADS_SEND_CONFIRMATION` | `false` pour couper l'accusé de réception envoyé au client |
| `NEXT_PUBLIC_SITE_URL` | URL publique (sitemap, liens des emails) |
| `NEXT_PUBLIC_NOINDEX` | `true` bloque l'indexation Google (robots.txt + meta) |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | compte Google Ads `AW-xxxxxxxxx` ; vide = aucune balise, aucun cookie |
| `NEXT_PUBLIC_ADS_CONVERSION_LABEL` | libellé de l'action de conversion « Demande envoyée » |

Sans SMTP configuré, le site fonctionne quand même : les demandes sont validées, archivées dans
`.leads.jsonl` et un message est écrit dans les logs. Rien n'est perdu.

Chaque demande envoie deux emails : le récapitulatif complet à l'agence (avec `Reply-To` sur le
client, donc « Répondre » écrit directement au vendeur) et un accusé de réception au client.

## Identité visuelle

Charte du réseau Transakauto : noir `#000000`, magenta `#EC008C`, fond clair `#F5F9FF`, gris
`#8E949D`, police Poppins — tokens dans [`src/app/globals.css`](src/app/globals.css).
Le logo officiel (`public/transakauto-logo.png`) a un lettrage blanc sur fond transparent : il
impose un fond sombre, d'où le header noir.

## Coordonnées de l'agence

Toutes les informations affichées (téléphone, email, adresse, SIRET, RCS…) sont centralisées dans
[`src/lib/site.ts`](src/lib/site.ts). Elles apparaissent sur le site, dans les emails, dans les
mentions légales et dans les données structurées de la page d'accueil.

Données société vérifiées au registre national des entreprises :

| | |
| --- | --- |
| Raison sociale | AP AUTOMOBILE (SAS) |
| Siège / agence | 8 Avenue Jean Curabet, 63170 Aubière |
| SIREN / SIRET | 930 899 000 / 930 899 000 00010 |
| RCS | Clermont-Fd 930 899 000 |
| TVA | FR82 930 899 000 |
| APE | 45.11Z — commerce de voitures et de véhicules automobiles légers |
| Immatriculation | 10 juillet 2024 |
| Direction | Audrey Quiclet (président) |
| Téléphone | 06 76 42 76 03 |
| Email | contact@transakautoclermontferrand.com |
| Horaires | lundi-samedi 10h-19h (dimanche fermé) |

## Questions des formulaires

Le schéma unique des deux formulaires est dans [`src/lib/lead.ts`](src/lib/lead.ts) (zod). Les deux
parcours posent exactement les mêmes questions, seul `intent` change (`estimation` / `reprise`) :

1. **Véhicule** — marque, modèle, version, année, kilométrage, énergie, boîte, immatriculation
2. **État et projet** — état général, contrôle technique, carnet d'entretien, première main,
   accidenté, situation (payé / crédit / LOA), prix espéré, échéance de vente
3. **Coordonnées** — prénom, nom, email, téléphone, code postal, ville, message, consentement RGPD

Pour ajouter un champ : l'ajouter au schéma zod, à `leadRows()` (récap email) et au formulaire
[`src/components/lead-form.tsx`](src/components/lead-form.tsx).

## Déploiement Vercel

Le projet Vercel appartient à l'équipe `transakauto-clermont-fd`, en plan Hobby. Sur ce plan,
Vercel **bloque** les commits d'un auteur qui n'est pas membre du projet (« Deployment was
blocked »)… mais seulement pour les dépôts **privés**. Le dépôt GitHub est donc **public** depuis
le 4 novembre 2026, comme celui de Montluçon : un `git push` sur `main` déploie en production
sans autre manipulation. Ne pas le repasser en privé sans transférer d'abord le projet Vercel sur
un compte de l'agence.

Le dépôt ne contient aucun secret : les variables vivent dans Vercel → Settings → Environment
Variables et dans `.env.local` (ignoré par Git). Garder cette règle.
Sur Vercel le système de fichiers est en lecture seule : l'archive `.leads.jsonl` n'y est pas
écrite, l'email est le seul canal — d'où l'importance de tester le SMTP après le premier déploiement.

## Prêt pour les ads

- Les paramètres `utm_*`, `gclid` et `fbclid` présents dans l'URL sont capturés et affichés dans
  l'email (ligne « Campagne ») : on sait d'où vient chaque lead.
- `/merci` est la page de conversion, en `noindex`. C'est l'URL à déclarer comme conversion dans
  Google Ads / Meta. Le tag de conversion se pose dans
  [`src/app/merci/page.tsx`](src/app/merci/page.tsx).
- `/estimation` et `/reprise` sont des landing pages autonomes : elles peuvent servir de
  destination directe aux annonces.
- Mentions légales et politique de confidentialité sont en place — Google Ads les exige.

## Anti-spam

Champ leurre caché (`website`) dans le formulaire : s'il est rempli, la route répond `ok` sans
envoyer d'email, pour ne pas indiquer au robot ce qui l'a démasqué.

## Plaquette PDF

Onglet **Plaquette PDF** du tableau (`leads.transakautoclermontferrand.com/plaquette`) : on colle le
lien d'une fiche mandat mytransak, la plaquette de présentation du véhicule (format magazine
Transakauto : couverture noire, touches de rose, Poppins) arrive dans la liste, prête à être
envoyée aux acheteurs. Même chose depuis le terminal :

```bash
npm run plaquette -- "https://mytransak.transakauto.com/shop-clermont-ferrand-sud-79/mandat/12345/details"
npm run plaquette -- <lien> plaquette.pdf --sans-agent   # sans appel à l'agent
```

### Agent sans frais : Claude Code sur le Mac de l'agence

L'agence ne veut pas payer d'API. L'agent rédacteur est donc Claude Code sur le Mac de l'agence,
couvert par l'abonnement, lancé en mode automatique (`claude -p`, binaire du CLI ou celui embarqué
par l'extension VS Code, voir `src/lib/plaquette/claude-code.ts`). Deux circuits :

- **Depuis le site** : l'onglet dépose une demande dans la table `plaquettes` (script
  `supabase/plaquettes.sql`, bucket de stockage `plaquettes`). Le service `scripts/plaquette-worker.mts`
  tourne sur le Mac, interroge `GET /api/board/plaquette/worker?action=claim` toutes les 15 s avec
  le jeton `PLAQUETTE_WORKER_TOKEN` (même valeur dans Vercel et dans `.env.local` du Mac), lit la
  fiche, prépare le dossier de travail, fait rédiger le contenu par Claude Code, met en page et
  dépose le PDF (`?action=done`). L'onglet affiche la file, l'état « agent connecté / hors ligne »
  et le bouton Télécharger (lien signé, une heure). Installation permanente sur le Mac :
  `bash scripts/install-worker.sh` (agent launchd `com.transakauto.plaquette-worker-clermont`,
  journal dans `plaquettes/worker.log`) ; retrait : `bash scripts/uninstall-worker.sh`. Test sans
  le site : `npm run plaquette:worker -- --une-fois <lien>`. Le même Mac fait tourner le service
  jumeau de Montluçon (`com.transakauto.plaquette-worker`) : les deux cohabitent.
- **À la main dans Claude Code** : `/plaquette <lien mytransak>` (skill
  `~/.claude/skills/plaquette/SKILL.md`) enchaîne `--preparer`, la rédaction de `contenu.json`
  après lecture des planches-contact, puis `--contenu`.

Le bouton « Version rapide » de l'onglet reste produit par le site lui-même, sans agent : photos
dans l'ordre, sans légendes. Le dossier `plaquettes/` est ignoré par Git. Si le Mac est éteint,
les demandes attendent ; rien n'est perdu.

Un montant de **frais d'intermédiation** peut être saisi à côté du lien (facultatif) : il remplace,
sur la couverture et dans les mentions, celui de la fiche mytransak. Colonne `road_fees_eur` de la
table `plaquettes` (`supabase/plaquettes_mise_a_la_route.sql`). En ligne de commande : `--frais 300`.

Ce que fait la route `POST /api/board/plaquette` (`src/lib/plaquette/`) :

1. **Connexion à mytransak** (`mytransak-auth.ts`) par le bouton « Se connecter avec Seenaps » :
   SAML en HTTP pur, session gardée en mémoire et rouverte quand elle expire. Identifiants dans
   `MYTRANSAK_EMAIL` / `MYTRANSAK_PASSWORD`.
2. **Lecture des onglets** Informations, Photos et Équipements du mandat (`mytransak-scrape.ts`) :
   prix de vente, frais d'intermédiation, commercial, fiche véhicule, carte grise, photos dans
   l'ordre du reportage, options enregistrées et dotation Autorigin. Rien d'interne (prix net
   vendeur, marge, vendeur, VIN) ne sort du scraper vers le PDF.
3. **Photos** redimensionnées avec sharp (`photos.ts`) pour un PDF de 2 à 4 Mo.
4. **Agent** : regarde toutes les photos et les données, choisit les 4 photos « points forts »,
   6 extérieures et 6 intérieures, écrit les légendes, les 8 points forts et l'accroche, estime la
   valeur neuve. Sortie structurée (zod), revalidée dans `content.ts`. Sans agent ou en cas
   d'erreur, la plaquette sort quand même avec un contenu générique.
5. **Mise en page** (`pdf.ts`, @react-pdf/renderer, Poppins embarquée dans `src/assets/fonts`) :
   7 pages A4 — couverture noire avec la **première photo du reportage** (toujours elle), points
   forts, extérieur, intérieur, fiche technique et équipements, galerie complète, garantie et
   contact (coordonnées de `src/lib/site.ts`).

Règles de contenu voulues par l'agence : jamais le mot « obligatoires » à côté des frais
d'intermédiation ; mention « des erreurs peuvent se glisser dans ce document » en couverture et
dans les mentions légales ; aucune donnée calculée (pas de capacité de remorquage ni de charge
utile) ; grille de garantie **Standard** (690 / 890 / 1 290 €) ou **Haut de gamme** (990 / 1 290 /
1 890 €, pour les 4x4, plus de 14 CV fiscaux ou plus de 50 000 € neuf), le choix étant fait par
le code d'après la carte grise et l'estimation de l'agent (`decideWarranty`). Les tarifs et le
détail des frais vivent dans `src/lib/plaquette/content.ts`.

Mise en service : exécuter `supabase/plaquettes.sql` dans Supabase → SQL Editor ; reporter dans
Vercel `MYTRANSAK_EMAIL`, `MYTRANSAK_PASSWORD` et `PLAQUETTE_WORKER_TOKEN` (variables sensibles) ;
sur le Mac, `.env.local` avec les mêmes valeurs puis `bash scripts/install-worker.sh`. La route
déclare `maxDuration = 300` ; si Vercel refuse cette valeur au déploiement, la ramener à 60 dans
`src/app/api/board/plaquette/route.ts`.

## Google Ads — configuration de référence

**Toute modification se fait ici d'abord, puis dans l'interface.** Ne pas improviser :
ces valeurs sont la source de vérité, alignées sur le compte de Metz.

| | Clermont-Fd | (Metz, pour mémoire) |
| --- | --- | --- |
| Campagne | `Recherche — Vendeurs — Clermont-Fd` | `Recherche — Vendeurs — Metz Nancy` |
| Budget | 10 €/jour | 10 €/jour |
| Enchères | Maximiser les clics, CPC max 1 € | idem |
| URL finale | `https://transakautoclermontferrand.com/estimation` | — |
| Chemin à afficher | `estimation` / `gratuite` | `estimation` / `gratuite` |
| Extension d'appel | aucune (choix de l'agence) | — |
| Conversion | « Demande envoyée » sur `/merci` | idem |

### Titres (30 caractères max)

```
Vendre sa voiture à Clermont-Fd
Estimation gratuite sous 24h
Nous vendons votre voiture
Estimez votre voiture en 2 min
Combien vaut votre voiture ?
Aucun frais avant la vente
Transakauto Clermont-Fd
Vente sécurisée et sans risque
Le prix du particulier
On gère visites et essais
Paiement vérifié avant remise
Crédit ou LOA en cours ? OK
Toutes marques, tout km
Papiers pris en charge
Vous gardez votre voiture
```

### Descriptions (90 caractères max)

```
Estimation gratuite sous 24h. Nous vendons votre voiture à votre place, en sécurité.
Photos, annonce, visites, essais, paiement : on gère tout. Vous encaissez le prix.
Commission due uniquement le jour de la vente. Véhicule non vendu, vous ne payez rien.
Agence à Clermont-Fd. Toutes marques, tout kilométrage, crédit ou LOA en cours accepté.
```

### Liens annexes (texte 25 car., descriptions 35 car.)

Règle : **tous les liens annexes mènent à un formulaire.** Pas de FAQ ni de page
d'explication — un clic payé qui n'aboutit pas à une demande est un clic perdu.

| Texte | Description 1 | Description 2 | URL |
| --- | --- | --- | --- |
| Estimation gratuite | Réponse sous 24h, sans engagement | Deux minutes pour la demande | `/estimation` |
| Combien vaut ma voiture | Prix réel du marché local | Estimation offerte, sans suite | `/estimation#formulaire` |
| Reprise immédiate | Rachat ferme sous 24h | Paiement rapide et sécurisé | `/reprise` |
| Crédit ou LOA en cours | On solde le financement | Vous encaissez la différence | `/reprise#formulaire` |

### Info-bulles / accroches (25 caractères max)

```
Estimation gratuite
Réponse sous 24h
Sans engagement
Zéro frais d'avance
Paiement sécurisé
Toutes marques, tout km
Crédit et LOA acceptés
Papiers pris en charge
Vous gardez votre voiture
Agence à Clermont-Fd
```

Autres composants (images, promotions, prix) : non utilisés. « Options d'URL des
annonces » : laisser vide, le suivi passe par la balise de conversion sur `/merci`.

### Extraits structurés — en-tête « Services » (25 caractères max)

```
Estimation de véhicule
Vente accompagnée
Reprise et rachat
Dépôt-vente
Démarches administratives
Paiement sécurisé
Conseil à la vente
```

### Composants volontairement écartés

| Composant | Pourquoi |
| --- | --- |
| Formulaire de lead | capterait la demande dans Google : ni email, ni passage par `/merci`, donc aucune conversion enregistrée et aucun lead reçu |
| Appels | l'agence ne veut pas de numéro dans les annonces (le site l'affiche toujours) |
| Promotions, Prix | rémunération à la commission, pas de tarif fixe à afficher |
| Messages, Applications | sans objet |
| Modèle de suivi, suffixe d'URL | inutiles : l'étiquetage automatique fournit déjà le `gclid`, capté par le site |

### Mots clés

```
[vendre sa voiture clermont-fd]
[vendre ma voiture clermont-fd]
[estimation voiture clermont-fd]
"vendre sa voiture clermont-fd"
"vendre sa voiture allier"
"vendre voiture clermont-fd"
"vendre ma voiture rapidement"
"estimation voiture gratuite"
"estimer ma voiture gratuitement"
"combien vaut ma voiture"
"faire estimer sa voiture"
"reprise voiture clermont-fd"
"rachat voiture clermont-fd"
"racheter ma voiture"
"faire reprendre sa voiture"
"vendre voiture credit en cours"
"vendre voiture loa"
"depot vente voiture clermont-fd"
"mandataire auto clermont-fd"
"vendre sa voiture sans se deplacer"
```

### Mots clés à exclure

```
-acheter  -achat  -pas cher  -neuve  -neuf  -location  -louer  -epave  -casse
-piece detachee  -leboncoin  -la centrale  -argus  -credit auto  -financement
-controle technique  -carte grise  -emploi  -moto  -scooter  -camping car  -sans permis
```

Ne pas exclure `occasion` : beaucoup de vendeurs écrivent « vendre ma voiture d'occasion ».

## Mise en ligne — reste à faire

Le site est complet et fonctionnel en local. Avant la mise en production :

- [ ] **Domaine** — réserver `transakautoclermontferrand.com` (valeur par défaut dans
      `next.config.ts`, `.env.local` et l'image de partage). Si un autre domaine est retenu, le
      corriger à ces trois endroits.
- [ ] **SMTP** — créer une boîte propre à l'agence et renseigner `SMTP_*`, `LEADS_NOTIFY_TO` et
      `LEADS_NOTIFY_FROM`. Les identifiants de Metz ne sont volontairement pas repris ici.
      Vérifier avec `npm run test:mail`.
- [ ] **Déploiement** — `npx vercel` puis `npx vercel --yes --prod`, et reporter les variables
      d'environnement dans Vercel → Settings → Environment Variables.
- [ ] **Indexation** — passer `NEXT_PUBLIC_NOINDEX` à `false` une fois le domaine en ligne, puis
      soumettre le sitemap dans Google Search Console.
- [ ] **Google Ads** — créer un compte propre à l'agence, renseigner `NEXT_PUBLIC_GOOGLE_ADS_ID`
      et `NEXT_PUBLIC_ADS_CONVERSION_LABEL` (conversion « Demande envoyée » sur `/merci`).
      Ne pas réutiliser le compte de Metz : les conversions des deux sites se mélangeraient.
- [ ] **Fiche Google Business Profile** — la cohérence nom / adresse / téléphone avec
      `src/lib/site.ts` pèse lourd sur le référencement local.

## Note de dev

`npm run dev` et `next build` ne partagent pas le même dossier de sortie : un build de
vérification se lance avec `NEXT_DIST_DIR=.next-build npx next build`, sinon il écrase le `.next`
du serveur de dev qui répond alors en 500.
