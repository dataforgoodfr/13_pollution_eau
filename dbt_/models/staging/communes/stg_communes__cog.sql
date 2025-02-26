SELECT
    TYPECOM::VARCHAR as typecom,
    COM::VARCHAR AS com,
    REG::SMALLINT as reg,
    DEP::VARCHAR as dep,
    CTCD::VARCHAR as ctcd,
    ARR::VARCHAR as arr,
    ARR::VARCHAR as arr,
    TNCC::SMALLINT as tncc,
    NCC::VARCHAR as ncc,
    NCCENR::VARCHAR as nccenr,
    LIBELLE::VARCHAR as libelle,
    CAN::VARCHAR as can,
    COMPARENT::VARCHAR as comparent,
    de_partition::SMALLINT as de_partition
FROM {{ source('communes', 'cog_communes') }}