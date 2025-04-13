-- we make sure that valeur_sanitaire_2 is > valeur_sanitaire_1
-- when they are not null
-- cf int__resultats_sub_indus_udi_dernier.sql why it is required


select *
from {{ ref('int__valeurs_de_reference') }}
where
    valeur_sanitaire_1 is not null
    and valeur_sanitaire_2 is not null
    and valeur_sanitaire_1 >= valeur_sanitaire_2
