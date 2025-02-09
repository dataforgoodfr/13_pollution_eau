SELECT
    cddept::VARCHAR(3) as cddept,
    referenceprel::VARCHAR(11) as referenceprel,
    cdparametresiseeaux::VARCHAR(10) as cdparametresiseeaux,
    cdparametre::INT as cdparametre,
    libmajparametre::VARCHAR as libmajparametre,
    libminparametre::VARCHAR as libminparametre,
    libwebparametre::VARCHAR as libwebparametre,
    qualitparam::VARCHAR(1) as qualitparam,
    insituana::VARCHAR(1) as insituana,
    rqana::VARCHAR(8) as rqana,
    cdunitereferencesiseeaux::VARCHAR(7) as cdunitereferencesiseeaux,
    cdunitereference::VARCHAR as cdunitereference,
    limitequal::VARCHAR as limitequal,
    refqual::VARCHAR as refqual,
    valtraduite::NUMERIC as valtraduite,
    casparam::VARCHAR as casparam,
    referenceanl::VARCHAR as referenceanl
FROM {{ source('edc', 'edc_resultats') }}