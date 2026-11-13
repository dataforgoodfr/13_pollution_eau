/**
 * Analyses d'une UDI, communes à /api/udi-analyses (liste paginée) et
 * /api/udi-analyses/dates (dates disponibles). Le cdreseau est lié en $1.
 */
export const BASE_CTE = `
  WITH base AS (
    SELECT
      r.referenceprel,
      r.referenceanl,
      r.datetimeprel,
      r.cdparametresiseeaux,
      v.web_label,
      r.categorie,
      r.categorie_3,
      r.valtraduite,
      -- Seuils en vigueur à la date du prélèvement (cf. int__resultats_udi),
      -- utilisés pour colorer la valeur.
      r.limite_qualite,
      r.limite_indicative,
      r.valeur_sanitaire_1
    FROM int__resultats_udi AS r
    LEFT JOIN int__valeurs_de_reference AS v
      ON r.cdparametresiseeaux = v.cdparametresiseeaux
    WHERE
      r.cdreseau = $1
      -- PESTOT est un total de pesticides recalculé par le labo, pas un
      -- paramètre individuellement recherché : exclu partout ailleurs dans
      -- les modèles pesticide (cf. int__resultats_pesticide_udi_dernier.sql),
      -- on l'exclut ici aussi pour ne pas le lister parmi les analyses.
      AND r.cdparametresiseeaux != 'PESTOT'
  )
`;
