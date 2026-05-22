SELECT
    'annuel' AS periode,
    inseecommune,
    categorie,
    '' AS resultat,
    nb_depassements,
    nb_prelevements,
    ratio_limite_sanitaire
FROM
    {{ ref('int__resultats_sub_indus_commune_annuel') }}
WHERE
    (
        inseecommune = '28269'
        AND categorie = 'sub_indus_perchlorate'
        AND annee = '2023'
        AND (
            nb_prelevements != 28
            OR nb_depassements != 10
        )
    )
