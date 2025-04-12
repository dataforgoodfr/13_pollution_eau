SELECT
    cdreseau,
    periode,
    -- On garde la date du prélèvement la plus récente entre toutes les
    -- substances
    MIN(dernier_prel_datetime) AS dernier_prel_datetime,
    CASE
        WHEN
            -- 1 : check si une des substances dépasse la limite sanitaire
            MAX(CASE
                WHEN categorie = 'cvm' AND resultat = 'sup_0_5' THEN 1
                WHEN
                    categorie = 'pfas'
                    AND resultat = 'un_pfas_sup_valeur_sanitaire'
                    THEN 1
                ELSE 0
            END) = 1
            THEN 'min_1_parametre_sup_limite_sanitaire'

        WHEN
            -- 2 : check si une des substances dépasse la limite règlementaire
            MAX(CASE
                WHEN
                    categorie = 'pfas'
                    AND resultat IN (
                        'somme_20pfas_sup_0_1',
                        'somme_20pfas_inf_0_1_et_4pfas_sup_0_02'
                    )
                    THEN 1
                ELSE 0
            END) = 1
            THEN 'min_1_parametre_sup_limite_reg'

        WHEN
            -- 3 : check si toutes les substances sont en dessous des limites
            MAX(CASE
                WHEN
                    categorie = 'cvm'
                    AND resultat NOT IN ('non_quantifie', 'inf_0_5')
                    THEN 1
                WHEN
                    categorie = 'pfas'
                    AND resultat NOT IN (
                        'aucun_parametre_quantifie',
                        'somme_20pfas_inf_0_1_et_4pfas_inf_0_02'
                    )
                    THEN 1
                ELSE 0
            END) = 0
            THEN 'inf_limites'

        ELSE 'erreur'
    END AS resultat_all
FROM ref{{ ('int__union_resultats_udi') }}
WHERE periode = 'dernier_prel'
GROUP BY cdreseau, periode
