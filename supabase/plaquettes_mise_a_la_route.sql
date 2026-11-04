-- Frais d'intermédiation saisis avec la demande de plaquette : ils remplacent ceux de la
-- fiche mytransak (à exécuter une fois, après plaquettes.sql). Montant en euros, facultatif
-- (null = montant de la fiche). Nom de colonne historique.
alter table public.plaquettes add column if not exists road_fees_eur integer;
