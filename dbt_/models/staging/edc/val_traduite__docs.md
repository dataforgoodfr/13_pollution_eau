{% docs val_traduite_docs %}
Traduction au format numérique du résultat textuel d’une mesure Rqana par application automatisée de règles prédéfinies.

Principe de traduction :

| Résultat | Valeur traduite |                     Commentaire                    |
|:--------:|:---------------:|:--------------------------------------------------:|
|    XXX   |       XXX       |                                                    |
|    XXX   |       -XXX      |                                                    |
|   <XXX   |        0        |                                                    |
|   >XXX   |       XXX       |                                                    |
|  TRACES  |        0        |    Entre seuil de quantification et de détection   |
| INCOMPT. |       1,11      | Valeur trop élevée en microbiologie. Préférer >XXX |
| PRESENCE |        1        |               Présence non quantifiée              |
|    N.D   |        0        |                < seuil de détection                |
| ILLISIBL |       NULL      |         Non interprétable en bactériologie         |
|  <SEUIL  |        0        |                < seuil de détection                |
|   N.M.   |       NULL      |                  Non fait, perdu.                  |
{% enddocs %}
