import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";
import { DuckDBResultReader } from "@duckdb/node-api/lib/DuckDBResultReader";
import { Categorie, Data, StatutBloc, UDI } from "@/app/lib/mock-data";
import { getCategoryById } from "@/lib/polluants";

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const udi_id = pathname.split("/").pop();

  if (!udi_id) {
    return NextResponse.json(
      { error: "Paramètre UDI manquant" },
      { status: 400 },
    );
  }
  const RetUDIData = await GetUDIAdministrativeData(udi_id);

  if (RetUDIData) {
    return NextResponse.json(RetUDIData, { status: 200 });
  } else {
    return NextResponse.json({ error: "UDI non trouvée" }, { status: 404 });
  }
}

async function GetUDIAdministrativeData(udi_id: string): Promise<UDI | null> {
  const connection = await db.connect();
  try {
    const retUDI: UDI = {
      id: udi_id,
      communes_desservies: [],
      nom: "",
      data: [],
    };

    const prepared1 = await connection.prepare(`
      SELECT distinct ins_nom, uge_nom , inseecommune, nomcommune
      FROM atlasante_udi 
      join int__lien_commune_cdreseau on cdreseau = code_udi
      WHERE code_udi = $1::VARCHAR      
    `);

    const prepared2 = await connection.prepare(`
      SELECT periode, categorie , resultat , date_dernier_prel, nb_parametres
      FROM web__resultats_udi 
      WHERE cdreseau = $1::VARCHAR
      order by periode, categorie
    `);

    prepared1.bindVarchar(1, udi_id);
    prepared2.bindVarchar(1, udi_id);

    const result = await prepared1.runAndReadAll();
    if (result.currentRowCount > 0) {
      const rows = result.getRowObjects();

      if (rows[0].uge_nom) {
        retUDI.nom = rows[0].uge_nom.toString();
      } else {
        throw new Error("UDI doit avoir un nom !");
      }

      rows.map((row) => {
        if (row.nomcommune && row.inseecommune) {
          retUDI.communes_desservies.push({
            nom: row.nomcommune.toString(),
            code_insee: row.inseecommune.toString(),
          });
        }
      });

      const result2 = await prepared2.runAndReadAll();
      const data = GetUDIData(udi_id, result2);
      retUDI.data = data;
      return retUDI;
    }

    return null;
  } catch (ex) {
    console.log("exception in GetUDIData for UDI", udi_id, ex);
    return null;
  } finally {
    if (connection) connection.close();
  }
}

function GetUDIData(udi_id: string, result: DuckDBResultReader): Data[] {
  const periodes: { [key: string]: Data } = {};

  if (result.currentRowCount > 0) {
    const rows = result.getRowObjects();

    rows.map((row) => {
      if (!row.periode) return;
      const codePeriode: string = row.periode.toString();
      let nomPeriode = codePeriode;
      if (codePeriode?.startsWith("bilan_annuel_")) {
        nomPeriode = codePeriode.substring(13, codePeriode.length);
      }

      //
      if (!periodes[codePeriode]) {
        periodes[codePeriode] = {
          periode: nomPeriode,
          categories: [],
          synthese: [],
        };
      }

      const curPeriode = periodes[codePeriode];
      const dataRecord: Categorie = {
        categorie_id: "",
        categorie: "",
        statut_titre: "",
        statut_description: "",
        statut_couleur: "",
        statut_couleur_background: "",
        statut_picto: null,
        dernier_prelevement_date: "",
        dernier_prelevement_nb_polluants: 0,
        affichage_blocs: false,
        statut_blocs: [],
      };
      let recordDate: Date | null = null;
      if (row.date_dernier_prel) {
        recordDate = new Date(row.date_dernier_prel.toString());
        dataRecord.dernier_prelevement_date = recordDate.toDateString();
      }

      if (row.categorie) {
        dataRecord.categorie_id = row.categorie?.toString();
        dataRecord.categorie = row.categorie.toString();
      }

      if (row.nb_parametres) {
        dataRecord.dernier_prelevement_nb_polluants = Number(row.nb_parametres);
      }

      if (row.resultat) {
        dataRecord.statut_titre = row.resultat.toString();
      }

      PopulateCategoryFields(dataRecord);

      curPeriode.categories.push(dataRecord);
    });
  }

  const retData: Data[] = [];

  for (const x in periodes) {
    retData.push(periodes[x]);
  }
  return retData;
}
function PopulateCategoryFields(dataRecord: Categorie) {
  const infoCategorie = getCategoryById(dataRecord.categorie_id);

  if (infoCategorie) {
    dataRecord.categorie = infoCategorie.nomAffichage;
    dataRecord.statut_description = infoCategorie.description;

    if (infoCategorie.resultats) {
      const infoStatut = infoCategorie.resultats[dataRecord.statut_titre];

      if (infoStatut) {
        dataRecord.statut_titre = infoStatut.label;
        dataRecord.statut_couleur = infoStatut.couleur;

        dataRecord.statut_couleur_background = infoStatut.couleur;

        if (infoStatut.picto) {
          dataRecord.statut_picto = infoStatut.picto;
        }
      }
      dataRecord.affichage_blocs = true;

      for (const key in infoCategorie.resultats) {
        const res = infoCategorie.resultats[key];
        const SB: StatutBloc = {
          bloc_nom: res.label,
          bloc_couleur: res.couleur,
          bloc_couleur_background: "",
          bloc_picto: null,
          bloc_polluants: [],
        };
        SB.bloc_couleur_background = res.couleur;
        if (res.picto) {
          SB.bloc_picto = res.picto;
        }

        dataRecord.statut_blocs.push(SB);
      }
    }
  }
}
