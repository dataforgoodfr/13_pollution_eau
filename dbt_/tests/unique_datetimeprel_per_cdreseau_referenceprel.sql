-- Nous vérifiions que pour chaque couple cdreseau, referenceprel,
-- il n'y a qu'une seule date datetimeprel.
-- En effet, pour trouver tous les paramètres analysés lors du
-- prélèvement le plus récent, on se base sur la date datetimeprel.
-- Si on a plusieurs dates pour un même prélèvement, on ne peut pas
-- savoir quel est le bon.
-- 
-- cf _int__resultats_metabolite_divers_udi_dernier.sql

SELECT
    cdreseau,
    referenceprel,
    count(DISTINCT datetimeprel) AS count_datetimeprel
FROM
    {{ ref('int__resultats_udi_communes') }}
GROUP BY 1, 2
HAVING count(DISTINCT datetimeprel) > 1
