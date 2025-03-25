SELECT *
FROM {{ ref('int__resultats_pfas_udi_dernier') }}
WHERE
    (
    -- test n°1
    -- ce referenceprel doit avoir le résultat 'Au moins 1 PFAS >= valeur
    -- sanitaire (0,1 µg/L)'
        referenceprel = '06800177398'
        AND resultat != 'Au moins 1 PFAS >= valeur sanitaire (0,1 µg/L)'
    )
    OR
    (
    -- test n°2
    -- placeholder
        referenceprel = 'neverhappen'
    )
