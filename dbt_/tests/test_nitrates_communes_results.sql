SELECT
    'annuel_commune' AS periode,
    inseecommune AS cdreseau,
    '' AS resultat,
    nb_depassements,
    nb_prelevements,
    ratio
FROM
    {{ ref('int__resultats_nitrate_commune_annuel') }}
WHERE
    -- 60060 et 60218 : uniquement alimentées par UDI 060000060 → mêmes chiffres
    (
        inseecommune = '60060'
        AND annee = '2025'
        AND (
            nb_prelevements != 52
            OR nb_depassements != 11
        )
    )
    OR
    -- 60088 appartient à 2 UDIs (060000060: 52 prels + 060000815: 10 prels),
    -- sans prélèvements communs entre eux → total = 62, pas de double-comptage
    (
        inseecommune = '60088'
        AND annee = '2025'
        AND (
            nb_prelevements != 62
            OR nb_depassements != 11
        )
    )
    OR
    (
        inseecommune = '60218'
        AND annee = '2025'
        AND (
            nb_prelevements != 52
            OR nb_depassements != 11
        )
    )
    OR
    -- 60395 : uniquement via UDI 060000805
    (
        inseecommune = '60395'
        AND annee = '2025'
        AND (
            nb_prelevements != 37
            OR nb_depassements != 14
        )
    )
