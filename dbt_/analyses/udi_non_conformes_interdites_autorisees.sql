-- Analyse : classer les UDI non conformes (limite de qualité pesticides)
-- selon qu'elles le sont à cause de molécules interdites, autorisées, ou un mélange.
-- Seuils : 0.1 µg/L par molécule, 0.5 µg/L pour le total pesticide recalculé.
-- Statut d'autorisation : 'Interdit' / 'Autorisé' / NULL (non renseigné, gardé pour les totaux).

WITH
last_pvl AS (
    SELECT
        cdreseau,
        categorie,
        cdparametresiseeaux,
        categorie_2,
        categorie_3,
        valtraduite,
        limite_qualite,
        valeur_sanitaire_1,
        datetimeprel,
        DENSE_RANK()
            OVER (
                PARTITION BY cdreseau
                ORDER BY datetimeprel DESC
            )
            AS row_number

    FROM
        {{ ref('int__resultats_udi') }}
    WHERE
        categorie = 'pesticide'
        AND
        -- On garde les prélèvements de moins d'un an à partir du dernier prélèvement
        datetimeprel >= DATE_TRUNC('day', (
            SELECT MAX(sub.datetimeprel)
            FROM {{ ref('int__resultats_udi') }} AS sub
        ) - INTERVAL 1 YEAR) + INTERVAL 1 DAY
        AND
        -- On exclut le paramètre PESTOT qui est un total de pesticides.
        -- On recalcule un total pesticide plus adapté plus bas.
        -- Par contre, dans le bilan annuel (int__resultats_pesticide_udi_annuel.sql), on le garde
        -- (au lieu de le recalculer) car il a changé dans le temps et on veut pas gérer
        -- l'historique des règles de calcul.
        cdparametresiseeaux != 'PESTOT'
        AND valtraduite IS NOT NULL
        -- si on veut se concentrer seulement sur les substances actives et métabolites pertinents
        -- décommenter les lignes suivantes 
        AND (
            categorie_2 = 'sub_active'
            OR (
                categorie_2 = 'metabolite'
                AND categorie_3 IN ('pertinent', 'pertinent_par_defaut')
            )
        )
),


autorisations AS (
    SELECT
        cdparametresiseeaux,
        "Statut d'autorisation" AS statut
    FROM
        READ_CSV(
            '/Users/jgreze/Downloads/Fichier ref temporaire.csv'
        )
    WHERE "Statut d'autorisation" IS NOT NULL
),

last_pvl_with_aut AS (
    SELECT
        last_pvl.*,
        autorisations.statut
    FROM last_pvl
    LEFT JOIN autorisations ON last_pvl.cdparametresiseeaux = autorisations.cdparametresiseeaux
),

aggregated AS (
    SELECT
        cdreseau,
        cdparametresiseeaux,
        categorie_2,
        categorie_3,
        MAX(statut) AS statut,
        MAX(valtraduite) AS valtraduite,
        MAX(limite_qualite) AS limite_qualite,
        MAX(valeur_sanitaire_1) AS valeur_sanitaire_1,
        MAX(datetimeprel) AS datetimeprel
    FROM last_pvl_with_aut
    WHERE row_number = 1
    GROUP BY cdreseau, cdparametresiseeaux, categorie_2, categorie_3
),

-- flags par molécule
flagged AS (
    SELECT
        *,
        -- molécule qui dépasse son seuil individuel
        (valtraduite > 0.1) AS above_individuel,
        -- molécule qui entre dans le calcul du total pesticide (et y contribue)
        (
            (
                categorie_2 = 'sub_active'
                OR (
                    categorie_2 = 'metabolite'
                    AND categorie_3 IN ('pertinent', 'pertinent_par_defaut')
                )
            )
            AND valtraduite > 0
        ) AS in_total
    FROM aggregated
),

par_udi AS (
    SELECT
        cdreseau,
        MAX(datetimeprel) AS date_dernier_prel,
        COUNT(DISTINCT cdparametresiseeaux) AS nb_parametres,

        -- total pesticide recalculé (sub_active + métabolites pertinents)
        SUM(CASE WHEN in_total THEN valtraduite ELSE 0 END) AS total_pesticide,
        (SUM(CASE WHEN in_total THEN valtraduite ELSE 0 END) > 0.5) AS total_depasse,

        -- dépassements individuels
        BOOL_OR(statut = 'Interdit' AND above_individuel) AS interdit_above,
        BOOL_OR(statut = 'Autorisé' AND above_individuel) AS autorise_above,

        -- contributions au total (uniquement pertinent si total_depasse)
        BOOL_OR(statut = 'Interdit' AND in_total) AS interdit_in_total,
        BOOL_OR(statut = 'Autorisé' AND in_total) AS autorise_in_total,

        -- JSON parametre -> valeur, pour toutes les molécules détectées (valtraduite > 0)
        TO_JSON(MAP(
            LIST(
                cdparametresiseeaux
                ORDER BY cdparametresiseeaux
            ) FILTER (WHERE valtraduite > 0
            ),
            LIST(
                valtraduite
                ORDER BY cdparametresiseeaux
            ) FILTER (WHERE valtraduite > 0
            )
        )) AS parametres_detectes,

        -- JSON parametre -> valeur, molécules interdites qui dépassent 0.1 µg/L
        TO_JSON(MAP(
            LIST(
                cdparametresiseeaux
                ORDER BY cdparametresiseeaux) FILTER (
                WHERE statut = 'Interdit' AND above_individuel
            ),
            LIST(
                valtraduite
                ORDER BY cdparametresiseeaux) FILTER (
                WHERE statut = 'Interdit' AND above_individuel
            )
        )) AS interdits_sup,

        -- JSON parametre -> valeur, molécules autorisées qui dépassent 0.1 µg/L
        TO_JSON(MAP(
            LIST(
                cdparametresiseeaux
                ORDER BY cdparametresiseeaux) FILTER (
                WHERE statut = 'Autorisé' AND above_individuel
            ),
            LIST(
                valtraduite
                ORDER BY cdparametresiseeaux) FILTER (
                WHERE statut = 'Autorisé' AND above_individuel
            )
        )) AS autorises_sup
    FROM flagged
    GROUP BY cdreseau
),

classement AS (
    SELECT
        *,
        CASE
            -- INTERDITES UNIQUEMENT
            WHEN
            -- au moins une molécule interdite > 0.1
                interdit_above
                -- et aucune molécule autorisée > 0.1
                AND NOT autorise_above                           -- aucune molécule autorisée > 0.1
                -- si total > 0.5, aucune autorisée ne rentre dans le calcul
                AND NOT (total_depasse AND autorise_in_total)
                THEN 'interdites_uniquement'

            -- AUTORISÉES UNIQUEMENT
            WHEN
            -- au moins une molécule autorisée > 0.1
                autorise_above
                -- et aucune molécule interdite > 0.1
                AND NOT interdit_above                            -- aucune molécule interdite > 0.1
                -- si total > 0.5, aucune interdite ne rentre dans le calcul
                AND NOT (total_depasse AND interdit_in_total)
                THEN 'autorisees_uniquement'

            -- MÉLANGE
            WHEN
                (interdit_above AND autorise_above)              -- au moins une de chaque > 0.1
                -- et/ou les deux rentrent dans le calcul du total > 0.5
                OR (total_depasse AND interdit_in_total AND autorise_in_total)
                THEN 'melange'

            -- pas de cause limite qualité (peut rester conforme ou non-conf via valeur sanitaire)
            ELSE 'conforme_ou_autre'
        END AS classification
    FROM par_udi
)

-- Décompte final des 3 situations.
-- (Pour inspecter le détail par UDI, remplacer ce SELECT par : SELECT * FROM classement)
SELECT
    classification,
    COUNT(*) AS nb_udi
FROM classement
WHERE classification IN ('interdites_uniquement', 'autorisees_uniquement', 'melange')
GROUP BY classification
ORDER BY nb_udi DESC
